export const AUDIO_SETTINGS_STORAGE_KEY = "mirror-island.audio-settings.v1";

export interface AudioSettings {
  readonly version: 1;
  readonly master: number;
  readonly music: number;
  readonly sfx: number;
}

export type AudioVolumeChannel = "master" | "music" | "sfx";
export type AudioSettingsListener = (settings: AudioSettings) => void;

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  version: 1,
  master: 0.8,
  music: 0.7,
  sfx: 0.8,
};

const listeners = new Set<AudioSettingsListener>();
let currentSettings = loadAudioSettings();

/** Decodes one unknown local preference payload and falls back safely for invalid versions or values. */
export function decodeAudioSettings(value: unknown): AudioSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return DEFAULT_AUDIO_SETTINGS;
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return DEFAULT_AUDIO_SETTINGS;
  return {
    version: 1,
    master: decodeVolume(record.master, DEFAULT_AUDIO_SETTINGS.master),
    music: decodeVolume(record.music, DEFAULT_AUDIO_SETTINGS.music),
    sfx: decodeVolume(record.sfx, DEFAULT_AUDIO_SETTINGS.sfx),
  };
}

/** Returns the current immutable audio preference snapshot. */
export function getAudioSettings(): AudioSettings {
  return { ...currentSettings };
}

/** Updates one audio channel, persists the versioned preference and notifies runtime listeners. */
export function updateAudioVolume(channel: AudioVolumeChannel, value: number): AudioSettings {
  const next = { ...currentSettings, [channel]: decodeVolume(value, currentSettings[channel]) };
  currentSettings = next;
  persistAudioSettings(next);
  for (const listener of listeners) listener({ ...next });
  return { ...next };
}

/** Publishes current and future audio settings and returns an explicit disposer. */
export function subscribeAudioSettings(listener: AudioSettingsListener): () => void {
  listeners.add(listener);
  listener(getAudioSettings());
  return () => listeners.delete(listener);
}

/** Loads the versioned local preference without allowing storage errors to block gameplay startup. */
function loadAudioSettings(): AudioSettings {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
    return raw === null ? DEFAULT_AUDIO_SETTINGS : decodeAudioSettings(JSON.parse(raw) as unknown);
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

/** Persists only non-sensitive volume preferences and tolerates unavailable browser storage. */
function persistAudioSettings(settings: AudioSettings): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
    // Preference persistence failure must not block local gameplay.
  }
}

/** Clamps one finite volume into the Web Audio range or returns its reviewed fallback. */
function decodeVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}
