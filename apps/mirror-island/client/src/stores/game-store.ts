import { reactive, readonly } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
  type ItemId,
} from "../../../domain/items/definitions.ts";
import type { ActionFeedback } from "../../../domain/session/commands.ts";
import type { GameState } from "../../../domain/state/game-state.ts";
import { DAY_START_MINUTE } from "../../../domain/time/game-time.ts";

export type GamePhase = "initializing" | "menu" | "loading" | "playing" | "error";

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
  phase: "initializing" as GamePhase,
  saveAvailable: false,
  day: 0,
  minuteOfDay: DAY_START_MINUTE,
  gold: 0,
  inventory: [] as InventorySlotProjection[],
  selectedHotbarIndex: null as number | null,
  selectedItemId: "" as ItemId | "",
  worldActionBusy: false,
  feedback: null as ActionFeedback | null,
  dialogue: null as DialogueProjection | null,
  shopOpen: false,
  shopWelcome: "",
  sleepConfirmationOpen: false,
});

let confirmSleepAction: (() => void) | null = null;

export const gameUiState = readonly(mutableState);

/** Updates the application shell phase without exposing persistence objects. */
export function setGamePhase(phase: GamePhase): void {
  mutableState.phase = phase;
}

/** Updates whether this browser can continue its anonymous local slot. */
export function setSaveAvailable(available: boolean): void {
  mutableState.saveAvailable = available;
}

/** Projects the session-owned inventory into a serializable Vue read model. */
export function applyGameState(state: GameState): void {
  mutableState.day = state.day;
  mutableState.minuteOfDay = state.minuteOfDay;
  mutableState.gold = state.gold;
  mutableState.inventory = state.inventory.map((slot, index) => ({
    index,
    itemId: slot.itemId,
    quantity: slot.quantity,
  }));
  const selectedIndex = mutableState.selectedHotbarIndex;
  if (selectedIndex !== null) {
    const selectedSlot = mutableState.inventory[selectedIndex];
    if (!selectedSlot || selectedSlot.itemId === "" || selectedSlot.itemId !== mutableState.selectedItemId) {
      clearHotbarSelection();
    }
  }
}

/** Selects or toggles one Hotbar slot while modal UI does not own gameplay input. */
export function selectHotbarSlot(index: number): void {
  if (isWorldInputLocked()) return;
  if (!Number.isInteger(index) || index < 0 || index >= HOTBAR_SLOT_COUNT) {
    throw new Error("Hotbar selection index is invalid.");
  }
  if (mutableState.selectedHotbarIndex === index) {
    clearHotbarSelection();
    return;
  }
  const definition = getItemDefinition(mutableState.inventory[index]?.itemId);
  if (!definition) {
    clearHotbarSelection();
    return;
  }
  mutableState.selectedHotbarIndex = index;
  mutableState.selectedItemId = definition.id;
}

/** Clears the transient selected slot and returns the player to empty hand. */
export function clearHotbarSelection(): void {
  mutableState.selectedHotbarIndex = null;
  mutableState.selectedItemId = "";
}

/** Locks or unlocks transient Hotbar selection while Phaser owns one action timeline. */
export function setWorldActionBusy(busy: boolean): void {
  mutableState.worldActionBusy = busy;
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

/** Opens one transient rest confirmation and retains exactly one scene-owned sleep callback. */
export function openSleepConfirmation(onConfirm: () => void): boolean {
  if (isWorldInputLocked()) return false;
  confirmSleepAction = onConfirm;
  mutableState.sleepConfirmationOpen = true;
  return true;
}

/** Closes the rest confirmation without dispatching sleep or changing the current day. */
export function cancelSleepConfirmation(): void {
  mutableState.sleepConfirmationOpen = false;
  confirmSleepAction = null;
}

/** Closes the rest confirmation before invoking its scene-owned atomic sleep transition once. */
export function confirmSleep(): void {
  if (!mutableState.sleepConfirmationOpen) return;
  const action = confirmSleepAction;
  mutableState.sleepConfirmationOpen = false;
  confirmSleepAction = null;
  action?.();
}

/** Reports whether a modal Vue panel currently owns Phaser world input. */
export function isWorldInputLocked(): boolean {
  return mutableState.worldActionBusy
    || mutableState.shopOpen
    || mutableState.dialogue !== null
    || mutableState.sleepConfirmationOpen;
}

/** Clears only transient local gameplay projections when the application shell is disposed. */
export function clearGameState(): void {
  mutableState.day = 0;
  mutableState.minuteOfDay = DAY_START_MINUTE;
  mutableState.gold = 0;
  mutableState.inventory = [];
  clearHotbarSelection();
  mutableState.worldActionBusy = false;
  mutableState.feedback = null;
  mutableState.dialogue = null;
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
  cancelSleepConfirmation();
}
