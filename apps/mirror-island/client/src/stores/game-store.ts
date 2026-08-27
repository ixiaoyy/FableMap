import { reactive, readonly } from "vue";
import type { ActionFeedback } from "../../../domain/session/commands.ts";
import type { GameState } from "../../../domain/state/game-state.ts";

export type GamePhase = "authenticating" | "menu" | "loading" | "playing" | "error";

export interface InventorySlotProjection {
  readonly index: number;
  readonly itemId: string;
  readonly quantity: number;
}

export interface DialogueProjection {
  readonly speaker: string;
  readonly lines: readonly string[];
  readonly lineIndex: number;
}

const mutableState = reactive({
  phase: "authenticating" as GamePhase,
  saveAvailable: false,
  day: 0,
  gold: 0,
  inventory: [] as InventorySlotProjection[],
  feedback: null as ActionFeedback | null,
  dialogue: null as DialogueProjection | null,
  shopOpen: false,
  shopWelcome: "",
});

export const gameUiState = readonly(mutableState);

/** Updates the application shell phase without exposing authentication or persistence objects. */
export function setGamePhase(phase: GamePhase): void {
  mutableState.phase = phase;
}

/** Updates whether the authenticated profile can continue an existing local slot. */
export function setSaveAvailable(available: boolean): void {
  mutableState.saveAvailable = available;
}

/** Projects the session-owned inventory into a serializable Vue read model. */
export function applyGameState(state: GameState): void {
  mutableState.day = state.day;
  mutableState.gold = state.gold;
  mutableState.inventory = state.inventory.map((slot, index) => ({
    index,
    itemId: slot.itemId,
    quantity: slot.quantity,
  }));
}

/** Displays one fixed domain action result without retaining a gameplay event history. */
export function setActionFeedback(feedback: ActionFeedback | null): void {
  mutableState.feedback = feedback;
}

/** Opens one fixed ephemeral dialogue projection above the Phaser world. */
export function setDialogue(dialogue: Pick<DialogueProjection, "speaker" | "lines">): void {
  if (dialogue.lines.length === 0) throw new Error("Dialogue requires at least one line.");
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
  mutableState.dialogue = { speaker: dialogue.speaker, lines: [...dialogue.lines], lineIndex: 0 };
}

/** Advances one fixed linear dialogue line and closes after the final line. */
export function advanceDialogue(): void {
  const dialogue = mutableState.dialogue;
  if (!dialogue) return;
  if (dialogue.lineIndex + 1 >= dialogue.lines.length) {
    mutableState.dialogue = null;
    return;
  }
  mutableState.dialogue = { ...dialogue, lineIndex: dialogue.lineIndex + 1 };
}

/** Opens the transient Seed Keeper shop without storing UI state in GameSession. */
export function openShop(welcomeLine: string): void {
  mutableState.dialogue = null;
  mutableState.shopWelcome = welcomeLine;
  mutableState.shopOpen = true;
}

/** Closes the transient Seed Keeper shop without mutating inventory or gold. */
export function closeShop(): void {
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
}

/** Reports whether a modal Vue panel currently owns Phaser world input. */
export function isWorldInputLocked(): boolean {
  return mutableState.shopOpen || mutableState.dialogue !== null;
}

/** Reports whether E should advance the active linear dialogue instead of reaching the world. */
export function isDialogueOpen(): boolean {
  return mutableState.dialogue !== null;
}

/** Clears only transient local gameplay projections when the application shell is disposed. */
export function clearGameState(): void {
  mutableState.day = 0;
  mutableState.gold = 0;
  mutableState.inventory = [];
  mutableState.feedback = null;
  mutableState.dialogue = null;
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
}
