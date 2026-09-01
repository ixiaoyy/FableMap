import type { ActionFeedback, GameCommand } from "../../../domain/session/commands.ts";
import { AUDIO_CUE, type AudioCue } from "./audio-catalog.ts";

export type AudioCueListener = (cue: AudioCue) => void;

const listeners = new Set<AudioCueListener>();

/** Emits one semantic client audio cue without exposing sound instances to Vue or domain code. */
export function emitAudioCue(cue: AudioCue): void {
  for (const listener of listeners) listener(cue);
}

/** Subscribes one runtime audio owner and returns an explicit disposer. */
export function subscribeAudioCues(listener: AudioCueListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Maps one typed command result into a successful semantic audio cue or null for silent outcomes. */
export function audioCueForCommandResult(
  command: GameCommand,
  feedback: ActionFeedback | null,
): AudioCue | null {
  if (feedback?.tone === "error") return null;
  switch (command.type) {
    case "buy-item": return feedback?.code === "bought" ? AUDIO_CUE.buy : null;
    case "sell-item": return feedback?.code === "sold" ? AUDIO_CUE.sell : null;
    case "sleep": return feedback?.code === "slept" ? AUDIO_CUE.sleep : null;
    case "transition-region": return null;
    case "use-item-on-target": {
      if (feedback?.code === "tilled") return AUDIO_CUE.hoe;
      if (feedback?.code === "watered") return AUDIO_CUE.watering;
      if (feedback?.code === "harvested") return AUDIO_CUE.harvest;
      if (feedback?.code === "collected") return AUDIO_CUE.pickup;
      if (feedback?.code === "success") return AUDIO_CUE.axe;
      return null;
    }
    case "move":
    case "craft":
    case "talk-to-npc":
    case "upgrade-watering-can":
    case "upgrade-backpack":
    case "acknowledge-retention-event": return null;
  }
}
