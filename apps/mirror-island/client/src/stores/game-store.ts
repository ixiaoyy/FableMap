import { reactive, readonly } from "vue";
import {
  HOTBAR_SLOT_COUNT,
  getItemDefinition,
  type ItemId,
} from "../../../domain/items/definitions.ts";
import type { ActionFeedback, StorageSaveSnapshot } from "../../../domain/session/commands.ts";
import type { WorldObjectState, WorldDropState } from "../../../domain/world/world-object-state.ts";
import type { GameState } from "../../../domain/state/game-state.ts";
import type { PetState } from "../../../domain/pets/definitions.ts";
import {
  DEFAULT_PLAYER_APPEARANCE_ID,
  DEFAULT_PLAYER_APPEARANCE,
  type PlayerAppearanceId,
  type PlayerAppearance,
} from "../../../domain/player/appearance.ts";
import { DAY_START_MINUTE } from "../../../domain/time/game-time.ts";
import { MAX_STAMINA } from "../../../domain/stamina/definitions.ts";
import { wateringCanCapacity } from "../../../domain/progression/definitions.ts";
import type { WeatherKind } from "../../../domain/weather/definitions.ts";
import {
  IDLE_FISHING_SNAPSHOT,
  fishingPausesClock,
  type FishingSnapshot,
} from "../../../domain/fishing/definitions.ts";
import { IDLE_DAY_SETTLEMENT, type DaySettlementSnapshot } from "../../../domain/session/day-settlement.ts";
import {
  getAudioSettings,
  updateAudioVolume,
  type AudioVolumeChannel,
} from "../audio/audio-settings.ts";

export type GamePhase = "initializing" | "menu" | "character-creation" | "loading" | "playing" | "error";

const SUCCESS_FEEDBACK_DURATION_MS = 1_600;
const ERROR_FEEDBACK_DURATION_MS = 2_400;

export interface InventorySlotProjection {
  readonly index: number;
  readonly itemId: string;
  readonly quantity: number;
}

export interface DialogueProjection {
  readonly wateringServiceAvailable?: boolean;
  readonly dialogueId: string | null;
  readonly npcId: string | null;
  readonly speaker: string;
  readonly lines: readonly string[];
  readonly lineIndex: number;
}

export interface FriendshipProjection {
  readonly npcId: string;
  readonly points: number;
  readonly lastTalkedDay: number;
  readonly lastGiftDay: number;
  readonly giftWeekIndex: number;
  readonly giftsThisWeek: number;
}

export interface DailyRequestProjection {
  readonly day: number;
  readonly requestId: string;
  readonly completed: boolean;
}

export interface GiftConfirmation {
  readonly npcId: string;
  readonly npcName: string;
  readonly itemId: ItemId;
}

export interface WorldPlacementRequest {
  readonly kind: "chest" | "build-shipping-bin" | "move-farm-building";
  readonly inventoryIndex?: number;
  readonly objectId?: string;
  readonly interactionId?: string;
}

export interface WorldPlacementProjection {
  readonly request: WorldPlacementRequest;
  readonly column: number;
  readonly row: number;
  readonly valid: boolean;
  readonly message: string;
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
  playerAppearance: { ...DEFAULT_PLAYER_APPEARANCE } as PlayerAppearance,
  gold: 0,
  stamina: MAX_STAMINA,
  maxStamina: MAX_STAMINA,
  inventory: [] as InventorySlotProjection[],
  inventoryCapacity: 12 as 12 | 24 | 36,
  worldObjects: [] as WorldObjectState[],
  worldDrops: [] as WorldDropState[],
  lastShipment: null as GameState["shippingQueue"][number] | null,
  shippingReport: null as GameState["unacknowledgedShippingReport"],
  storageSave: { phase: "idle", feedback: null } as StorageSaveSnapshot,
  wateringCanLevel: 1 as 1 | 2,
  wateringCanWater: 20,
  wateringCanCapacity: wateringCanCapacity(1),
  weather: "sunny" as WeatherKind,
  nextWeather: "sunny" as WeatherKind,
  friendships: {} as Record<string, FriendshipProjection>,
  dailyRequest: null as DailyRequestProjection | null,
  seenEventIds: [] as string[],
  pet: null as PetState | null,
  fishing: { ...IDLE_FISHING_SNAPSHOT } as FishingSnapshot,
  daySettlement: { ...IDLE_DAY_SETTLEMENT } as DaySettlementSnapshot,
  giftConfirmation: null as GiftConfirmation | null,
  selectedInventoryIndex: null as number | null,
  selectedItemId: "" as ItemId | "",
  worldActionBusy: false,
  feedback: null as ActionFeedback | null,
  dialogue: null as DialogueProjection | null,
  shopOpen: false,
  shopWelcome: "",
  sleepConfirmationOpen: false,
  socialOpen: false,
  calendarOpen: false,
  audioSettingsOpen: false,
  wardrobeOpen: false,
  backpackOpen: false,
  craftingOpen: false,
  containerId: null as string | null,
  shippingBinId: null as string | null,
  buildingServiceId: null as string | null,
  backpackUpgradeId: null as string | null,
  worldPlacement: null as WorldPlacementProjection | null,
  requestBoardOpen: false,
  petAdoptionOpen: false,
  audioSettings: getAudioSettings(),
});

let confirmSleepAction: (() => void) | null = null;
let feedbackTimer: number | null = null;
let feedbackRevision = 0;
let petAdoptionDeferredDay: number | null = null;

export const gameUiState = readonly(mutableState);

/** Updates the application shell phase without exposing persistence objects. */
export function setGamePhase(phase: GamePhase): void {
  mutableState.phase = phase;
  if (phase === "playing") refreshPetAdoptionPrompt();
}

/** Updates whether this browser can continue its anonymous local slot. */
export function setSaveAvailable(available: boolean): void {
  mutableState.saveAvailable = available;
}

/** Projects the session-owned inventory into a serializable Vue read model. */
export function applyGameState(state: GameState): void {
  const previousDay = mutableState.day;
  mutableState.day = state.day;
  mutableState.minuteOfDay = state.minuteOfDay;
  mutableState.regionId = state.player.regionId;
  mutableState.playerX = state.player.x;
  mutableState.playerY = state.player.y;
  mutableState.playerAppearanceId = state.player.appearanceId;
  mutableState.playerAppearance = { ...state.player.appearance };
  mutableState.gold = state.gold;
  mutableState.stamina = state.stamina;
  mutableState.inventory = state.inventory.map((slot, index) => ({
    index,
    itemId: slot.itemId,
    quantity: slot.quantity,
  }));
  mutableState.inventoryCapacity = state.inventoryCapacity;
  mutableState.worldObjects = state.worldObjects.map((object) => object.kind === "chest"
    ? { ...object, slots: object.slots.map((slot) => ({ ...slot })) }
    : { ...object });
  mutableState.worldDrops = state.worldDrops.map((drop) => ({ ...drop, stack: { ...drop.stack } }));
  mutableState.lastShipment = state.shippingQueue.length > 0
    ? { ...state.shippingQueue[state.shippingQueue.length - 1]! }
    : null;
  mutableState.shippingReport = state.unacknowledgedShippingReport
    ? structuredClone(state.unacknowledgedShippingReport)
    : null;
  if (mutableState.containerId && !state.worldObjects.some((object) => object.id === mutableState.containerId)) {
    mutableState.containerId = null;
  }
  if (mutableState.shippingBinId && !state.worldObjects.some((object) => object.id === mutableState.shippingBinId)) {
    mutableState.shippingBinId = null;
  }
  mutableState.wateringCanLevel = state.wateringCanLevel;
  mutableState.wateringCanWater = state.wateringCanWater;
  mutableState.wateringCanCapacity = wateringCanCapacity(state.wateringCanLevel);
  mutableState.weather = state.weather.current;
  mutableState.nextWeather = state.weather.next;
  mutableState.friendships = Object.fromEntries(
    Object.entries(state.friendships).map(([npcId, friendship]) => [npcId, { ...friendship }]),
  );
  mutableState.dailyRequest = state.dailyRequest ? { ...state.dailyRequest } : null;
  mutableState.seenEventIds = [...state.seenEventIds];
  mutableState.pet = state.pet ? { ...state.pet } : null;
  if (previousDay !== state.day) petAdoptionDeferredDay = null;
  refreshPetAdoptionPrompt();
  const selectedIndex = mutableState.selectedInventoryIndex;
  if (selectedIndex !== null) {
    const selectedSlot = mutableState.inventory[selectedIndex];
    if (!selectedSlot || selectedSlot.itemId === "" || selectedSlot.itemId !== mutableState.selectedItemId) {
      clearHotbarSelection();
    }
  }
}

/** Selects or toggles one Hotbar slot while modal UI does not own gameplay input. */
export function selectHotbarSlot(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= HOTBAR_SLOT_COUNT) {
    throw new Error("Hotbar selection index is invalid.");
  }
  selectInventorySlot(index);
}

/** Selects any inventory slot for world use without moving or rewriting its durable item stack. */
export function selectInventorySlot(index: number): void {
  if (isWorldInputLocked()) return;
  if (!Number.isInteger(index) || index < 0 || index >= mutableState.inventory.length) return;
  if (mutableState.selectedInventoryIndex === index) {
    clearHotbarSelection();
    return;
  }
  const definition = getItemDefinition(mutableState.inventory[index]?.itemId);
  if (!definition) {
    clearHotbarSelection();
    return;
  }
  mutableState.selectedInventoryIndex = index;
  mutableState.selectedItemId = definition.id;
}

/** Clears the transient selected slot and returns the player to empty hand. */
export function clearHotbarSelection(): void {
  mutableState.selectedInventoryIndex = null;
  mutableState.selectedItemId = "";
}

/** Locks shared keyboard, touch and HUD input during a client-owned action or camera transition. */
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

/** Projects one transient fishing snapshot without writing it into durable GameState. */
export function applyFishingState(state: FishingSnapshot): void {
  mutableState.fishing = { ...state };
}

/** Opens one fixed ephemeral dialogue projection above the Phaser world. */
export function setDialogue(
  dialogue: Pick<DialogueProjection, "speaker" | "lines"> & {
    readonly dialogueId?: string | null;
    readonly npcId?: string | null;
    readonly wateringServiceAvailable?: boolean;
  },
): void {
  if (dialogue.lines.length === 0) throw new Error("Dialogue requires at least one line.");
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
  mutableState.dialogue = {
    dialogueId: dialogue.dialogueId ?? null,
    npcId: dialogue.npcId ?? null,
    wateringServiceAvailable: dialogue.wateringServiceAvailable ?? false,
    speaker: dialogue.speaker,
    lines: [...dialogue.lines],
    lineIndex: 0,
  };
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
  if (isWorldInputLocked()) return false;
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

/** Opens audio preferences only when no gameplay action or modal already owns input. */
export function openAudioSettings(): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.audioSettingsOpen = true;
  return true;
}

/** Closes audio preferences without changing gameplay or IndexedDB state. */
export function closeAudioSettings(): void { mutableState.audioSettingsOpen = false; }

/** Opens the clothing editor only when no other modal or action owns world input; returns whether it opened. */
export function openWardrobe(): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.wardrobeOpen = true;
  return true;
}

/** Closes the transient clothing editor; its unsaved appearance draft is owned by the panel, never GameState. */
export function closeWardrobe(): void { mutableState.wardrobeOpen = false; }

/** Persists one normalized audio channel and projects the resulting immutable preference snapshot. */
export function setAudioVolume(channel: AudioVolumeChannel, value: number): void {
  mutableState.audioSettings = updateAudioVolume(channel, value);
}

/** Opens the complete inventory projection while no other modal owns world input. */
export function openBackpack(): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.backpackOpen = true;
  return true;
}

/** Closes the complete inventory projection without moving or mutating item slots. */
export function closeBackpack(): void { mutableState.backpackOpen = false; }

/** Opens the anywhere crafting page, replacing the backpack tab without changing inventory. */
export function openCrafting(): boolean {
  if (!mutableState.backpackOpen && isWorldInputLocked()) return false;
  if (isStorageMutationLocked()) return false;
  mutableState.backpackOpen = false;
  mutableState.craftingOpen = true;
  return true;
}

/** Closes crafting previews; unconfirmed recipes have consumed no materials. */
export function closeCrafting(): void { mutableState.craftingOpen = false; }

/** Opens a nearby container already authorized by the session/world interaction query. */
export function openContainer(id: string): boolean {
  if (isWorldInputLocked()) return false;
  if (!mutableState.worldObjects.some((object) => object.id === id && object.kind === "chest")) return false;
  mutableState.containerId = id;
  return true;
}

/** Closes the container view without holding or altering a durable stack. */
export function closeContainer(): void { mutableState.containerId = null; }

/** Opens an existing shipping building; only the latest global shipment is projected to its panel. */
export function openShippingBin(id: string): boolean {
  if (isWorldInputLocked()) return false;
  if (!mutableState.worldObjects.some((object) => object.id === id && object.kind === "shipping-bin")) return false;
  mutableState.shippingBinId = id;
  return true;
}

/** Closes the shipping panel without withdrawing any queued goods. */
export function closeShippingBin(): void { mutableState.shippingBinId = null; }

/** Opens one scene-validated carpenter counter; domain commands recheck its availability. */
export function openBuildingService(interactionId: string): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.buildingServiceId = interactionId;
  return true;
}

/** Closes the carpenter service without purchasing, moving, or demolishing a building. */
export function closeBuildingService(): void { mutableState.buildingServiceId = null; }

/** Opens the independent backpack display after the world has validated its interaction. */
export function openBackpackUpgrade(interactionId: string): boolean {
  if (isWorldInputLocked() || mutableState.inventoryCapacity === 36) return false;
  mutableState.backpackUpgradeId = interactionId;
  return true;
}

/** Closes the backpack display without spending Gold or changing unlocked rows. */
export function closeBackpackUpgrade(): void { mutableState.backpackUpgradeId = null; }

/** Begins a read-only world placement preview; the world scene owns pointer and map coordinates. */
export function beginWorldPlacement(request: WorldPlacementRequest): boolean {
  if (isStorageMutationLocked()) return false;
  mutableState.backpackOpen = false;
  mutableState.buildingServiceId = null;
  mutableState.worldPlacement = {
    request: { ...request },
    column: Math.floor(mutableState.playerX / 16),
    row: Math.floor(mutableState.playerY / 16),
    valid: false,
    message: "请选择一块空地。",
  };
  return true;
}

/** Cancels or finishes a temporary placement preview without mutating world objects. */
export function closeWorldPlacement(): void { mutableState.worldPlacement = null; }

/** Projects the domain's current tile verdict; the renderer cannot commit placement through this helper. */
export function setPlacementPreview(column: number, row: number, valid: boolean, message: string): void {
  const placement = mutableState.worldPlacement;
  if (!placement) return;
  mutableState.worldPlacement = { ...placement, column, row, valid, message };
}

/** Projects atomic storage save status without stealing focus while an ordinary save is in flight. */
export function applyStorageSave(snapshot: StorageSaveSnapshot): void {
  mutableState.storageSave = { ...snapshot, feedback: snapshot.feedback ? { ...snapshot.feedback } : null };
}

/** Reports whether mutations must wait for the outstanding durable transaction or day transition. */
export function isStorageMutationLocked(): boolean {
  return mutableState.storageSave.phase !== "idle"
    || mutableState.daySettlement.phase === "saving"
    || mutableState.daySettlement.phase === "failed";
}

/** Closes all storage-related temporary views on day transitions and application cleanup. */
function closeStoragePanels(): void {
  mutableState.craftingOpen = false;
  mutableState.containerId = null;
  mutableState.shippingBinId = null;
  mutableState.buildingServiceId = null;
  mutableState.backpackUpgradeId = null;
  mutableState.worldPlacement = null;
}

/** Opens the deterministic daily-request board while no other modal owns world input. */
export function openRequestBoard(): boolean {
  if (isWorldInputLocked()) return false;
  mutableState.requestBoardOpen = true;
  return true;
}

/** Closes the request-board projection without accepting, rerolling or completing a request. */
export function closeRequestBoard(): void { mutableState.requestBoardOpen = false; }

/** Opens the pending Day 2 adoption folio when no other modal or action owns input. */
export function openPetAdoption(): boolean {
  if (
    mutableState.day < 2
    || mutableState.regionId !== "farm"
    || mutableState.pet
    || isWorldInputLocked()
  ) return false;
  petAdoptionDeferredDay = null;
  mutableState.petAdoptionOpen = true;
  return true;
}

/** Defers the nullable adoption without writing a seen event or permanently dismissing the choice. */
export function deferPetAdoption(): void {
  if (!mutableState.pet && mutableState.day >= 2) petAdoptionDeferredDay = mutableState.day;
  mutableState.petAdoptionOpen = false;
}

/** Reconciles Day 2+ durable pet state into the transient modal projection. */
function refreshPetAdoptionPrompt(): void {
  if (mutableState.pet || mutableState.day < 2) {
    mutableState.petAdoptionOpen = false;
    petAdoptionDeferredDay = null;
    return;
  }
  if (mutableState.regionId !== "farm") {
    mutableState.petAdoptionOpen = false;
    return;
  }
  if (petAdoptionDeferredDay !== mutableState.day) mutableState.petAdoptionOpen = true;
}

/** Reports whether a modal Vue panel currently owns Phaser world input. */
export function isWorldInputLocked(): boolean {
  return isGameClockPaused() || mutableState.fishing.phase !== "idle";
}

/** Reports clock pause independently of cast/wait input focus, which still allows time to advance. */
export function isGameClockPaused(): boolean {
  return mutableState.worldActionBusy
    || mutableState.shopOpen
    || mutableState.dialogue !== null
    || mutableState.sleepConfirmationOpen
    || mutableState.socialOpen
    || mutableState.calendarOpen
    || mutableState.audioSettingsOpen
    || mutableState.wardrobeOpen
    || mutableState.backpackOpen
    || mutableState.craftingOpen
    || mutableState.containerId !== null
    || mutableState.shippingBinId !== null
    || mutableState.buildingServiceId !== null
    || mutableState.backpackUpgradeId !== null
    || mutableState.worldPlacement !== null
    || mutableState.storageSave.phase !== "idle"
    || mutableState.requestBoardOpen
    || mutableState.petAdoptionOpen
    || mutableState.daySettlement.phase !== "idle"
    || mutableState.giftConfirmation !== null
    || fishingPausesClock(mutableState.fishing.phase);
}

/** Opens a small confirmation for a nearby NPC/item selected by the world interaction layer. */
export function openGiftConfirmation(gift: GiftConfirmation): void {
  if (isWorldInputLocked()) return;
  mutableState.giftConfirmation = { ...gift };
}

/** Cancels a gift confirmation without consuming inventory or changing friendship. */
export function closeGiftConfirmation(): void {
  mutableState.giftConfirmation = null;
}

/** Projects day-save status and closes other transient controls before forced overnight settlement. */
export function applyDaySettlement(state: DaySettlementSnapshot): void {
  mutableState.daySettlement = { ...state };
  if (state.phase === "idle") return;
  closeDialogue();
  closeShop();
  cancelSleepConfirmation();
  closeGiftConfirmation();
  mutableState.socialOpen = false;
  mutableState.calendarOpen = false;
  mutableState.audioSettingsOpen = false;
  mutableState.wardrobeOpen = false;
  mutableState.backpackOpen = false;
  closeStoragePanels();
  mutableState.requestBoardOpen = false;
  mutableState.petAdoptionOpen = false;
  mutableState.worldActionBusy = false;
}

/** Clears only transient local gameplay projections when the application shell is disposed. */
export function clearGameState(): void {
  mutableState.day = 0;
  mutableState.minuteOfDay = DAY_START_MINUTE;
  mutableState.regionId = "";
  mutableState.playerX = 0;
  mutableState.playerY = 0;
  mutableState.playerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID;
  mutableState.playerAppearance = { ...DEFAULT_PLAYER_APPEARANCE };
  mutableState.gold = 0;
  mutableState.stamina = MAX_STAMINA;
  mutableState.inventory = [];
  mutableState.inventoryCapacity = 12;
  mutableState.worldObjects = [];
  mutableState.worldDrops = [];
  mutableState.lastShipment = null;
  mutableState.shippingReport = null;
  mutableState.storageSave = { phase: "idle", feedback: null };
  mutableState.wateringCanLevel = 1;
  mutableState.wateringCanWater = wateringCanCapacity(1);
  mutableState.wateringCanCapacity = wateringCanCapacity(1);
  mutableState.weather = "sunny";
  mutableState.nextWeather = "sunny";
  mutableState.friendships = {};
  mutableState.dailyRequest = null;
  mutableState.seenEventIds = [];
  mutableState.pet = null;
  mutableState.fishing = { ...IDLE_FISHING_SNAPSHOT };
  mutableState.daySettlement = { ...IDLE_DAY_SETTLEMENT };
  mutableState.giftConfirmation = null;
  clearHotbarSelection();
  mutableState.worldActionBusy = false;
  setActionFeedback(null);
  mutableState.dialogue = null;
  mutableState.shopOpen = false;
  mutableState.shopWelcome = "";
  mutableState.socialOpen = false;
  mutableState.calendarOpen = false;
  mutableState.audioSettingsOpen = false;
  mutableState.wardrobeOpen = false;
  mutableState.backpackOpen = false;
  closeStoragePanels();
  mutableState.requestBoardOpen = false;
  mutableState.petAdoptionOpen = false;
  petAdoptionDeferredDay = null;
  mutableState.audioSettings = getAudioSettings();
  cancelSleepConfirmation();
}
