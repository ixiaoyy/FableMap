import {
  AUDIO_CUE,
  FOOTSTEP_ASSETS,
  ONE_SHOT_ASSETS,
  ambientGroupForRegion,
  ambientLayersForGroup,
  type AmbientGroup,
  type AudioAssetDefinition,
  type AudioCue,
} from "./audio-catalog.ts";
import { subscribeAudioCues } from "./audio-events.ts";
import type { WeatherKind } from "../../../domain/weather/definitions.ts";
import { WeatherAmbience } from "./WeatherAmbience.ts";
import {
  getAudioSettings,
  subscribeAudioSettings,
  type AudioSettings,
} from "./audio-settings.ts";

const AMBIENT_FADE_MS = 650;

interface ActiveVoice {
  readonly audio: HTMLAudioElement;
  readonly gain: number;
}

interface AmbientVoice extends ActiveVoice {
  readonly group: AmbientGroup;
  mix: number;
  frameId: number | null;
}

export class AudioDirector {
  private readonly bases = new Map<string, HTMLAudioElement>();
  private readonly oneShots = new Set<ActiveVoice>();
  private readonly ambience = new Set<AmbientVoice>();
  private readonly weatherAmbience = new WeatherAmbience();
  private readonly stopCues: () => void;
  private readonly stopSettings: () => void;
  private settings = getAudioSettings();
  private currentGroup: AmbientGroup | null = null;
  private weather: WeatherKind = "sunny";
  private footstepIndex = 0;
  private blockedNoticeShown = false;
  private disposed = false;

  /** Creates the single client audio owner and subscribes to semantic cues and local preferences. */
  constructor(private readonly onPlaybackBlocked: () => void) {
    this.stopCues = subscribeAudioCues((cue) => this.playCue(cue));
    this.stopSettings = subscribeAudioSettings((settings) => this.applySettings(settings));
  }

  /** Crossfades to the ambience group reviewed for one committed world region. */
  setRegion(regionId: string): void {
    if (this.disposed) return;
    const nextGroup = ambientGroupForRegion(regionId);
    if (nextGroup === this.currentGroup && this.hasCurrentAmbience()) return;
    this.currentGroup = nextGroup;
    this.updateWeatherMix();
    for (const voice of [...this.ambience]) this.fadeAmbient(voice, 0, true);
    this.startCurrentAmbience();
  }

  /** Applies saved weather to the original weather bed without loading unreviewed media URLs. */
  setWeather(weather: WeatherKind): void {
    if (this.disposed || this.weather === weather) return;
    this.weather = weather;
    this.updateWeatherMix();
  }

  /** Plays one semantic cue, rotating the three footstep variants without runtime randomness. */
  playCue(cue: AudioCue): void {
    if (this.disposed) return;
    this.weatherAmbience.unlock();
    const definition = cue === AUDIO_CUE.footstep
      ? FOOTSTEP_ASSETS[this.footstepIndex++ % FOOTSTEP_ASSETS.length]!
      : ONE_SHOT_ASSETS[cue];
    this.playOneShot(definition);
  }

  /** Stops all voices, animation frames and subscriptions owned by this director. */
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopCues();
    this.stopSettings();
    this.weatherAmbience.destroy();
    for (const voice of this.oneShots) voice.audio.pause();
    this.oneShots.clear();
    for (const voice of this.ambience) {
      if (voice.frameId !== null) window.cancelAnimationFrame(voice.frameId);
      voice.audio.pause();
    }
    this.ambience.clear();
    this.bases.clear();
  }

  /** Starts one isolated one-shot clone and removes it after completion or load failure. */
  private playOneShot(definition: AudioAssetDefinition): void {
    const base = this.baseAudio(definition);
    const voice: ActiveVoice = { audio: base.cloneNode(true) as HTMLAudioElement, gain: definition.gain };
    voice.audio.volume = this.effectiveVolume(voice.gain);
    this.oneShots.add(voice);
    const release = (): void => { this.oneShots.delete(voice); };
    voice.audio.addEventListener("ended", release, { once: true });
    voice.audio.addEventListener("error", release, { once: true });
    void voice.audio.play().then(() => {
      this.blockedNoticeShown = false;
      this.ensureCurrentAmbience();
    }).catch(() => {
      release();
      this.reportPlaybackBlocked();
    });
  }

  /** Starts every layer for the current region at zero mix before fading it in. */
  private startCurrentAmbience(): void {
    if (!this.currentGroup || this.disposed) return;
    for (const definition of ambientLayersForGroup(this.currentGroup)) {
      const base = this.baseAudio(definition);
      const voice: AmbientVoice = {
        audio: base.cloneNode(true) as HTMLAudioElement,
        gain: definition.gain,
        group: this.currentGroup,
        mix: 0,
        frameId: null,
      };
      voice.audio.loop = true;
      voice.audio.volume = 0;
      this.ambience.add(voice);
      void voice.audio.play().then(() => {
        if (!this.ambience.has(voice) || voice.group !== this.currentGroup || this.disposed) {
          voice.audio.pause();
          this.ambience.delete(voice);
          return;
        }
        this.blockedNoticeShown = false;
        this.fadeAmbient(voice, 1, false);
      }).catch(() => {
        this.ambience.delete(voice);
        this.reportPlaybackBlocked();
      });
    }
  }

  /** 首次播放某个已登记音效时才创建模板；仅当前区域的环境音会被请求。 */
  private baseAudio(definition: AudioAssetDefinition): HTMLAudioElement {
    let base = this.bases.get(definition.id);
    if (!base) {
      base = createBaseAudio(definition);
      this.bases.set(definition.id, base);
    }
    return base;
  }

  /** Restarts a blocked or ended ambience group after a successful direct-user one-shot. */
  private ensureCurrentAmbience(): void {
    if (this.currentGroup && !this.hasCurrentAmbience()) this.startCurrentAmbience();
  }

  /** Reports whether at least one active layer belongs to the current committed region group. */
  private hasCurrentAmbience(): boolean {
    return [...this.ambience].some((voice) => voice.group === this.currentGroup);
  }

  /** Animates one ambience mix scalar and optionally releases the voice after fade-out. */
  private fadeAmbient(voice: AmbientVoice, target: number, release: boolean): void {
    if (voice.frameId !== null) window.cancelAnimationFrame(voice.frameId);
    const startedAt = performance.now();
    const initial = voice.mix;
    const step = (now: number): void => {
      const progress = Math.min(1, Math.max(0, (now - startedAt) / AMBIENT_FADE_MS));
      voice.mix = initial + (target - initial) * progress;
      voice.audio.volume = this.effectiveVolume(voice.gain * voice.mix);
      if (progress < 1 && !this.disposed) {
        voice.frameId = window.requestAnimationFrame(step);
        return;
      }
      voice.frameId = null;
      if (release) {
        voice.audio.pause();
        this.ambience.delete(voice);
      }
    };
    voice.frameId = window.requestAnimationFrame(step);
  }

  /** Applies one immutable settings snapshot to every active one-shot and ambience layer. */
  private applySettings(settings: AudioSettings): void {
    this.settings = settings;
    for (const voice of this.oneShots) voice.audio.volume = this.effectiveVolume(voice.gain);
    for (const voice of this.ambience) voice.audio.volume = this.effectiveVolume(voice.gain * voice.mix);
    this.updateWeatherMix();
  }

  /** Routes the existing SFX bus and committed region into the private weather-audio projection. */
  private updateWeatherMix(): void {
    this.weatherAmbience.setMix(
      this.weather, this.currentGroup !== null && this.currentGroup !== "interior", this.effectiveVolume(1),
    );
  }

  /** Calculates the current SFX-bus volume while Music remains a saved future-only channel. */
  private effectiveVolume(gain: number): number {
    return Math.min(1, Math.max(0, gain * this.settings.master * this.settings.sfx));
  }

  /** Reports the first autoplay/load rejection without spamming repeated world feedback. */
  private reportPlaybackBlocked(): void {
    if (this.blockedNoticeShown || this.disposed) return;
    this.blockedNoticeShown = true;
    this.onPlaybackBlocked();
  }
}

/** 创建不预取数据的音频模板；克隆实例播放时才下载实际音频。 */
function createBaseAudio(definition: AudioAssetDefinition): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = definition.url;
  return audio;
}
