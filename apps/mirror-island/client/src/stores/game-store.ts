import { reactive, readonly } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
  type ItemId,
} from "../../../domain/items/definitions.ts";
import type { ActionFeedback } from "../../../domain/session/commands.ts";
import type { GameState } from "../../../domain/state/game-state.ts";
import {
  DEFAULT_PLAYER_APPEARANCE_ID,
  type PlayerAppearanceId,
} from "../../../domain/player/appearance.ts";
import { DAY_START_MINUTE } from "../../../domain/time/game-time.ts";

export type GamePhase = "initializing" | "menu" | "character-creation" | "loading" | "playing" | "error";

const SUCCESS_FEEDBACK_DURATION_MS = 1_600;
const ERROR_FEEDBACK_DURATION_MS = 2_400;

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

export interface FriendshipProjection {
  readonly npcId: string;
  readonly points: number;
  readonly lastTalkedDay: number;
}

const mutableState = reactive({
  phase: "initializing" as GamePhase,
  saveAvailable: false,
  day: 0,
  minuteOfDay: DAY_START_MINUTE,
  regionId: "",
  playerX: 0,
  playerY: 0,
  playerAppearanceId: DEFAULT_PLAYER_APPEARANCE_ID as PlayerAppearanceId,
  gold: 0,
  inventory: [] as InventorySlotProjection[],
  friendships: {} as Record<string, FriendshipProjection>,
  selectedHotbarIndex: null as number | null,
  selectedItemId: "" as ItemId | "",
  worldActionBusy: false,
  feedback: null as ActionFeedback | null,
  dialogue: null as DialogueProjection | null,
  shopOpen: false,
  shopWelcome: "",
  sleepConfirmationOpen: false,
  socialOpen: false,
  calendarOpen: false,
});

let confirmSleepAction: (() => void) | null = null;
let feedbackTimer: number | null = null;
let feedbackRevision = 0;

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
  mutableState.regionId = state.player.regionId;
  mutableState.playerX = state.player.x;
  mutableState.playerY = state.player.y;
  mutableState.playerAppearanceId = state.player.appearanceId;
  mutableState.gold = state.gold;
  mutableState.inventory = state.inventory.map((slot, index) => ({
    index,
    itemId: slot.itemId,
    quantity: slot.quantity,
  }));
  mutableState.friendships = Object.fromEntries(
    Object.entries(state.friendships).map(([npcId, friendship]) => [npcId, { ...friendship }]),
  );
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

/** Displays one fixed domain action result and automatically releases stale toast space. */
export function setActionFeedback(feedback: ActionFeedback | null): void {
  feedbackRevision += 1;
  const revision = feedbackRevision;
  if (feedbackTimer !== null) window.clearTimeout(feedbackTimer);
  feedbackTimer = null;
  mutableState.feedback = feedback;
  if (!feedback) return;
  const duration = feedback.tone === "success"
    ? SUCCESS_FEEDBACK_DURATION_MS
    : ERROR_FEEDBACK_DURATION_MS;
  feedbackTimer = window.setTimeout(() => {
    if (feedbackRevision !== revision) return;
    mutableState.feedback = null;
    feedbackTimer = null;
  }, duration);
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
    closeDialogue();
    return;
  }
  mutableState.dialogue = { ...dialogue, lineIndex: dialogue.lineIndex + 1 };
}

/** Closes the transient dialogue without mutating friendship or world state. */
export function closeDialogue(): void {
  mutableState.dialogue = null;
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

/** Opens the transient Social ledger only when no other modal or action owns world input. */
export function openSocial(): boolean {
  if (
    mutableState.worldActionBusy
    || mutableState.shopOpen
    || mutableState.dialogue !== null
    || mutableState.sleepConfirmationOpen
    || mutableState.calendarOpen
  ) return false;
  mutableState.socialOpen = true;
  return true;
}

/** Closes the transient Social ledger without mutating any friendship progress. */
export function closeSocial(): void {
  mutableState.socialOpen = false;
}

/** Opens the transient seasonal calendar while no other modal owns world input. */
export function openCalendar(): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.calendarOpen = true;
  return true;
}

/** Closes the transient calendar without mutating the absolute game day. */
export function closeCalendar(): void { mutableState.calendarOpen = false; }

/** Reports whether a modal Vue panel currently owns Phaser world input. */
export function isWorldInputLocked(): boolean {
  return mutableState.worldActionBusy
    || mutableState.shopOpen
    || mutableState.dialogue !== null
    || mutableState.sleepConfirmationOpen
    || mutableState.socialOpen
    || mutableState.calendarOpen;
}

/** Clears only transient local gameplay projections when the application shell is disposed. */
export function clearGameState(): void {
  mutableState.day = 0;
  mutableState.minuteOfDay = DAY_START_MINUTE;
  mutableState.regionId = "";
  mutableState.playerX = 0;
  mutableState.playerY = 0;
  mutableState.playerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID;
  mutableState.gold = 0;
  mutableState.inventory = [];
  mutableState.friendships = {};
  clearHotbarSelection();
  mutableState.worldActionBusy = false;
  setActionFeedback(null);
  mutableState.dialogue = null;
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
  mutableState.socialOpen = false;
  mutableState.calendarOpen = false;
  cancelSleepConfirmation();
}
