import { nextTick } from "vue";

/** Restores keyboard focus to the Phaser host after one transient modal closes. */
export function restoreWorldFocus(): void {
  void nextTick(() => document.querySelector<HTMLElement>(".game-canvas")?.focus());
}
