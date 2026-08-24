import { reactive, readonly } from "vue";
import type { ActionFeedback } from "../../../domain/session/commands.ts";
import type { GameState } from "../../../domain/state/game-state.ts";

export type GamePhase = "authenticating" | "menu" | "loading" | "playing" | "error";

export interface InventorySlotProjection {
  readonly index: number;
  readonly itemId: string;
  readonly quantity: number;
}

const mutableState = reactive({
  phase: "authenticating" as GamePhase,
  saveAvailable: false,
  inventory: [] as InventorySlotProjection[],
  feedback: null as ActionFeedback | null,
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

/** Clears only transient local gameplay projections when the application shell is disposed. */
export function clearGameState(): void {
  mutableState.inventory = [];
  mutableState.feedback = null;
}
