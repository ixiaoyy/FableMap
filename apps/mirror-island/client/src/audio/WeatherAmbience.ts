import type { WeatherKind } from "../../../domain/weather/definitions.ts";

/** Owns a quiet, original noise bed for weather; no downloaded media or gameplay state is involved. */
export class WeatherAmbience {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;
  private weather: WeatherKind = "sunny";
  private outdoors = false;
  private volume = 0;
  private disposed = false;

  /** Fades weather audio out when the document becomes hidden, without changing simulation time. */
  private readonly onVisibility = (): void => this.applyMix();

  /** Registers the visibility listener; the audio context is created only after a user cue. */
  constructor() {
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  /** Projects committed weather, indoor/outdoor status and the existing master/SFX volume. */
  setMix(weather: WeatherKind, outdoors: boolean, volume: number): void {
    if (this.disposed || (weather === this.weather && outdoors === this.outdoors && volume === this.volume)) return;
    this.weather = weather;
    this.outdoors = outdoors;
    this.volume = volume;
    this.applyMix();
  }

  /** Lazily starts the native audio graph from a user cue and tolerates browser autoplay rejection. */
  unlock(): void {
    if (this.disposed || typeof AudioContext === "undefined") return;
    if (!this.context) {
      const context = new AudioContext();
      const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let seed = 0x57494e44;
      for (let index = 0; index < samples.length; index += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const envelope = 0.75 + 0.25 * Math.sin(index / samples.length * Math.PI * 2);
        samples[index] = (seed / 0xffffffff * 2 - 1) * envelope;
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.Q.value = 0.7;
      gain.gain.value = 0;
      source.connect(filter).connect(gain).connect(context.destination);
      source.start();
      this.context = context;
      this.source = source;
      this.filter = filter;
      this.gain = gain;
      this.applyMix();
    }
    if (this.context.state === "suspended") void this.context.resume().catch(() => undefined);
  }

  /** Releases the noise source, native audio graph and visibility listener when its scene ends. */
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.source?.stop();
    this.source?.disconnect();
    this.filter?.disconnect();
    this.gain?.disconnect();
    if (this.context) void this.context.close().catch(() => undefined);
  }

  /** Smoothly changes the rain hiss or low wind bed while indoor, hidden and sunny states stay silent. */
  private applyMix(): void {
    if (!this.context || !this.filter || !this.gain || this.disposed) return;
    const audible = this.outdoors && !document.hidden && this.weather !== "sunny";
    const gain = audible ? this.volume * (this.weather === "rain" ? 0.1 : 0.3) : 0;
    this.filter.frequency.setTargetAtTime(this.weather === "rain" ? 4_500 : 240, this.context.currentTime, 0.2);
    this.gain.gain.setTargetAtTime(gain, this.context.currentTime, 0.2);
  }
}
