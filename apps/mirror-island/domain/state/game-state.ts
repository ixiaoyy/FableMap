import {
  INVENTORY_SLOT_COUNT,
  ITEM_ID,
  getItemDefinition,
  type ItemId,
} from "../items/definitions.ts";
import {
  assertStableId,
  type WorldCatalog,
} from "../world/regions.ts";
import {
  FRIENDSHIP_MAX_POINTS,
  createFriendshipState,
  giftWeekIndex as giftWeekForDay,
  type FriendshipState,
} from "../social/definitions.ts";
import {
  DEFAULT_PLAYER_APPEARANCE_ID,
  decodePlayerAppearanceId,
  type PlayerAppearanceId,
} from "../player/appearance.ts";
import { activeNpcSpawnsInRegion } from "../world/npc-schedules.ts";
import {
  cropDefinition,
  type CropId,
} from "../farming/crops.ts";
import {
  DAY_START_MINUTE,
  decodeGameMinute,
} from "../time/game-time.ts";
import {
  BASE_INVENTORY_CAPACITY,
  decodeInventoryCapacity,
  decodeWateringCanWater,
  decodeWateringCanLevel,
  wateringCanCapacity,
  type InventoryCapacity,
  type WateringCanLevel,
} from "../progression/definitions.ts";
import {
  createDailyRequestState,
  dailyRequestForDay,
  dailyRequestMatchesDay,
  getDailyRequest,
  type DailyRequestState,
} from "../requests/definitions.ts";
import {
  createNpcDialogueState,
  isKnownDialogueSelectionId,
  isRetentionEventId,
  type NpcDialogueState,
  type RetentionEventId,
} from "../dialogue/definitions.ts";
import { decodeRelationshipStage } from "../social/relationship-stage.ts";
import {
  decodePetState,
  reconcilePetState,
  type PetState,
} from "../pets/definitions.ts";
import { MAX_STAMINA, decodeStamina } from "../stamina/definitions.ts";
import { WeatherSystem } from "../weather/WeatherSystem.ts";
import { decodeWeatherState, type WeatherState } from "../weather/definitions.ts";
import {
  createStorageWorldState,
  cloneStorageWorldState,
  decodeStorageWorldState,
  reconcileStorageWorldState,
  type StorageWorldState,
} from "../world/world-object-state.ts";
import {
  createShippingState,
  cloneShippingState,
  decodeShippingState,
  type ShippingState,
} from "../shipping/shipping-state.ts";

export const GAME_STATE_VERSION = 13 as const;
export const TREE_ID = "farm-tree-001";
export const FARM_TILE_ID = "farm-plot-001";
const DEFAULT_WORLD_SEED = 0x4d495252;

export interface InventorySlot {
  itemId: ItemId | "";
  quantity: number;
}

export interface PlayerState {
  regionId: string;
  x: number;
  y: number;
  appearanceId: PlayerAppearanceId;
}

export interface ResourceState {
  readonly id: string;
  readonly kind: "tree" | "stone" | "weed";
  phase: "standing" | "stump" | "cleared";
  regrowOnDay: number | null;
}

export type FarmPhase = "untilled" | "tilled" | "growing" | "mature";
export interface FarmTileState {
  readonly id: string;
  readonly column: number;
  readonly row: number;
  phase: FarmPhase;
  cropId: CropId | "";
  growthDays: number;
  watered: boolean;
  plantedDay: number;
  harvestCount: number;
}

export interface DailyForageState {
  day: number;
  collectedIds: string[];
}

export interface GameState extends StorageWorldState, ShippingState {
  readonly version: typeof GAME_STATE_VERSION;
  day: number;
  minuteOfDay: number;
  worldSeed: number;
  lateWarningDay: number;
  stamina: number;
  fishingCastCount: number;
  lastSurfaceStoneRefreshDay: number;
  lastSurfaceWeedRefreshDay: number;
  gold: number;
  player: PlayerState;
  inventory: InventorySlot[];
  inventoryCapacity: InventoryCapacity;
  wateringCanLevel: WateringCanLevel;
  wateringCanWater: number;
  weather: WeatherState;
  resources: Record<string, ResourceState>;
  farmTiles: Record<string, FarmTileState>;
  friendships: Record<string, FriendshipState>;
  dailyForage: DailyForageState;
  dailyRequest: DailyRequestState | null;
  npcDialogue: Record<string, NpcDialogueState>;
  seenEventIds: RetentionEventId[];
  pet: PetState | null;
}

/** Creates a deterministic current game state for one validated appearance, seed and Tiled-derived catalog. */
export function createInitialGameState(
  catalog: WorldCatalog,
  appearanceId: PlayerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID,
  worldSeed: number = DEFAULT_WORLD_SEED,
): GameState {
  const inventory: InventorySlot[] = Array.from(
    { length: INVENTORY_SLOT_COUNT },
    () => ({ itemId: "", quantity: 0 }),
  );
  inventory[0] = { itemId: ITEM_ID.hoe, quantity: 1 };
  inventory[1] = { itemId: ITEM_ID.wateringCan, quantity: 1 };
  inventory[2] = { itemId: ITEM_ID.axe, quantity: 1 };
  inventory[3] = { itemId: ITEM_ID.pickaxe, quantity: 1 };
  inventory[4] = { itemId: ITEM_ID.scythe, quantity: 1 };
  const start = catalog.requireDefaultSpawn(catalog.startRegionId);
  const state: GameState = {
    version: GAME_STATE_VERSION,
    day: 1,
    minuteOfDay: DAY_START_MINUTE,
    ...springGameplayDefaults(1, 1, worldSeed),
    gold: 100,
    player: {
      regionId: catalog.startRegionId,
      ...start,
      appearanceId: decodePlayerAppearanceId(appearanceId),
    },
    inventory,
    ...retentionDefaults(1),
    resources: {},
    farmTiles: {},
    friendships: {},
    dailyForage: { day: 1, collectedIds: [] },
    ...createStorageWorldState(catalog),
    ...createShippingState(),
  };
  reconcileGameStateWithCatalog(state, catalog);
  return state;
}

/** Adds missing catalog-owned defaults and rejects saved IDs or kinds that no longer match the world. */
export function reconcileGameStateWithCatalog(state: GameState, catalog: WorldCatalog): boolean {
  catalog.requireRegion(state.player.regionId);
  let changed = false;
  const activeNpcs = activeNpcSpawnsInRegion(catalog, state.player.regionId, state.minuteOfDay, {
    day: state.day, weather: state.weather.current,
  });
  if (catalog.isBlocked(state.player.regionId, state.player.x, state.player.y, 5, 4, activeNpcs)) {
    const safeSpawn = catalog.requireDefaultSpawn(state.player.regionId);
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    changed = true;
  }
  const knownResourceIds = new Set<string>();
  const knownNpcIds = new Set<string>();
  for (const region of catalog.allRegions()) {
    for (const npc of region.npcs) {
      if (knownNpcIds.has(npc.npcId)) throw new Error(`Duplicate NPC identity: ${npc.npcId}.`);
      knownNpcIds.add(npc.npcId);
      const saved = state.friendships[npc.npcId];
      if (!saved) {
        state.friendships[npc.npcId] = createFriendshipState(npc.npcId);
        changed = true;
      } else if (saved.npcId !== npc.npcId) {
        throw new Error(`Saved friendship identity does not match catalog NPC ${npc.npcId}.`);
      }
      if (!state.npcDialogue[npc.npcId]) {
        state.npcDialogue[npc.npcId] = createNpcDialogueState();
        changed = true;
      }
    }
    for (const spawn of region.resources) {
      if (spawn.kind !== "tree" && spawn.kind !== "stone" && spawn.kind !== "weed") continue;
      knownResourceIds.add(spawn.entityId);
      const saved = state.resources[spawn.entityId];
      if (!saved) {
        state.resources[spawn.entityId] = {
          id: spawn.entityId,
          kind: spawn.kind,
          phase: "standing",
          regrowOnDay: null,
        };
        changed = true;
      } else if (saved.kind !== spawn.kind) {
        throw new Error(`Saved resource kind does not match catalog entity ${spawn.entityId}.`);
      }
    }
  }
  if (Object.keys(state.resources).some((id) => !knownResourceIds.has(id))) {
    throw new Error("Save references an unknown resource entity.");
  }
  for (const tile of Object.values(state.farmTiles)) {
    if (tile.id !== farmTileId(tile.column, tile.row) || !catalog.isTillable("farm", tile.column, tile.row)) {
      throw new Error("Save references an unknown farm tile.");
    }
  }
  if (Object.keys(state.friendships).some((npcId) => !knownNpcIds.has(npcId))) {
    throw new Error("Save references an unknown NPC friendship.");
  }
  if (Object.keys(state.npcDialogue).some((npcId) => !knownNpcIds.has(npcId))) {
    throw new Error("Save references an unknown NPC dialogue identity.");
  }
  reconcileStorageWorldState(state, catalog);
  reconcilePetState(state.pet, catalog);
  return changed;
}

/** Produces a deep mutable clone so callers cannot mutate GameSession state through snapshots. */
export function cloneGameState(state: GameState): GameState {
  return {
    version: GAME_STATE_VERSION,
    day: state.day,
    minuteOfDay: state.minuteOfDay,
    worldSeed: state.worldSeed,
    lateWarningDay: state.lateWarningDay,
    stamina: state.stamina,
    fishingCastCount: state.fishingCastCount,
    lastSurfaceStoneRefreshDay: state.lastSurfaceStoneRefreshDay,
    lastSurfaceWeedRefreshDay: state.lastSurfaceWeedRefreshDay,
    gold: state.gold,
    player: { ...state.player },
    inventory: state.inventory.map((slot) => ({ ...slot })),
    inventoryCapacity: state.inventoryCapacity,
    wateringCanLevel: state.wateringCanLevel,
    wateringCanWater: state.wateringCanWater,
    weather: { ...state.weather },
    resources: Object.fromEntries(
      Object.entries(state.resources).map(([id, resource]) => [id, { ...resource }]),
    ),
    farmTiles: Object.fromEntries(
      Object.entries(state.farmTiles).map(([id, tile]) => [id, { ...tile }]),
    ),
    friendships: Object.fromEntries(
      Object.entries(state.friendships).map(([npcId, friendship]) => [npcId, { ...friendship }]),
    ),
    dailyForage: { day: state.dailyForage.day, collectedIds: [...state.dailyForage.collectedIds] },
    dailyRequest: state.dailyRequest ? { ...state.dailyRequest } : null,
    npcDialogue: Object.fromEntries(Object.entries(state.npcDialogue).map(([npcId, memory]) => [npcId, {
      recent: memory.recent.map((entry) => ({ ...entry })),
      acknowledgedStage: memory.acknowledgedStage,
    }])),
    seenEventIds: [...state.seenEventIds],
    pet: state.pet ? structuredClone(state.pet) : null,
    ...cloneStorageWorldState(state),
    ...cloneShippingState(state),
  };
}

/** Validates one unknown value as a complete current game state and returns a defensive clone. */
export function decodeGameState(value: unknown): GameState {
  const state = recordFrom(value, "Game state is invalid.");
  if (state.version !== GAME_STATE_VERSION) throw new Error("Game state version is unsupported.");
  const day = positiveSafeInteger(state.day, "Game day is invalid.");
  const inventoryCapacity = decodeInventoryCapacity(state.inventoryCapacity);
  const wateringCanLevel = decodeWateringCanLevel(state.wateringCanLevel);
  return {
    version: GAME_STATE_VERSION,
    day,
    minuteOfDay: decodeGameMinute(state.minuteOfDay),
    worldSeed: uint32From(state.worldSeed, "World seed is invalid."),
    lateWarningDay: boundedPastDay(state.lateWarningDay, day, "Late-warning day is invalid."),
    stamina: decodeStamina(state.stamina),
    fishingCastCount: nonNegativeSafeInteger(state.fishingCastCount, "Fishing cast count is invalid."),
    lastSurfaceStoneRefreshDay: decodeSurfaceRefreshDay(state.lastSurfaceStoneRefreshDay, day, "stone"),
    lastSurfaceWeedRefreshDay: decodeSurfaceRefreshDay(state.lastSurfaceWeedRefreshDay, day, "weed"),
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: decodePlayerState(state.player),
    inventory: decodeInventory(state.inventory, inventoryCapacity),
    inventoryCapacity,
    wateringCanLevel,
    wateringCanWater: decodeWateringCanWater(state.wateringCanWater, wateringCanLevel),
    weather: decodeWeatherState(state.weather, day),
    resources: decodeResources(state.resources, day),
    farmTiles: decodeFarmTiles(state.farmTiles, day),
    friendships: decodeFriendships(state.friendships, day),
    dailyForage: decodeDailyForage(state.dailyForage, day),
    dailyRequest: decodeDailyRequest(state.dailyRequest, day),
    npcDialogue: decodeNpcDialogue(state.npcDialogue, day),
    seenEventIds: decodeSeenEventIds(state.seenEventIds),
    pet: decodePetState(state.pet, day),
    ...decodeStorageWorldState(state, day),
    ...decodeShippingState(state, day),
  };
}

/** Validates sparse friendship state while preserving catalog reconciliation as the identity owner. */
function decodeFriendships(
  value: unknown,
  currentDay: number,
): Record<string, FriendshipState> {
  const source = recordFrom(value, "Friendship state is invalid.");
  const result: Record<string, FriendshipState> = {};
  for (const [npcId, rawFriendship] of Object.entries(source)) {
    assertStableId(npcId, "Friendship NPC ID");
    const friendship = recordFrom(rawFriendship, "Friendship state is invalid.");
    const points = nonNegativeSafeInteger(friendship.points, "Friendship points are invalid.");
    const lastTalkedDay = nonNegativeSafeInteger(
      friendship.lastTalkedDay,
      "Friendship last-talked day is invalid.",
    );
    const lastGiftDay = nonNegativeSafeInteger(friendship.lastGiftDay, "Friendship last-gift day is invalid.");
    const giftWeekIndex = nonNegativeSafeInteger(friendship.giftWeekIndex, "Friendship gift week is invalid.");
    const giftsThisWeek = nonNegativeSafeInteger(friendship.giftsThisWeek, "Friendship weekly gifts are invalid.");
    if (
      friendship.npcId !== npcId
      || points > FRIENDSHIP_MAX_POINTS
      || lastTalkedDay > currentDay
      || lastGiftDay > currentDay
      || giftsThisWeek > 2
      || giftWeekIndex > giftWeekForDay(currentDay)
      || (lastGiftDay === 0 && (giftsThisWeek !== 0 || giftWeekIndex !== 0))
      || (lastGiftDay > 0 && (giftsThisWeek < 1 || giftWeekIndex !== giftWeekForDay(lastGiftDay)))
    ) {
      throw new Error("Friendship state is inconsistent.");
    }
    result[npcId] = {
      npcId,
      points,
      lastTalkedDay,
      lastGiftDay,
      giftWeekIndex,
      giftsThisWeek,
    };
  }
  return result;
}

/** Validates the current deterministic request state and rejects rerolled request IDs. */
function decodeDailyRequest(value: unknown, currentDay: number): DailyRequestState | null {
  const expected = dailyRequestForDay(currentDay);
  if (!expected) {
    if (value !== null) throw new Error("Daily request state is invalid before Day 2.");
    return null;
  }
  const request = recordFrom(value, "Daily request state is invalid.");
  const definition = getDailyRequest(request.requestId);
  if (
    request.day !== currentDay
    || !dailyRequestMatchesDay(request.requestId, currentDay)
    || !definition
    || typeof request.completed !== "boolean"
  ) {
    throw new Error("Daily request state is inconsistent.");
  }
  return { day: currentDay, requestId: definition.requestId, completed: request.completed };
}

/** Validates sparse NPC dialogue memory while catalog reconciliation owns the complete identity set. */
function decodeNpcDialogue(value: unknown, currentDay: number): Record<string, NpcDialogueState> {
  const source = recordFrom(value, "NPC dialogue state is invalid.");
  const result: Record<string, NpcDialogueState> = {};
  for (const [npcId, rawMemory] of Object.entries(source)) {
    assertStableId(npcId, "Dialogue NPC ID");
    const memory = recordFrom(rawMemory, "NPC dialogue state is invalid.");
    if (!Array.isArray(memory.recent) || memory.recent.length > 12) {
      throw new Error("NPC dialogue history is invalid.");
    }
    const recent = memory.recent.map((rawEntry) => {
      const entry = recordFrom(rawEntry, "NPC dialogue history entry is invalid.");
      const day = positiveSafeInteger(entry.day, "NPC dialogue history day is invalid.");
      if (
        day > currentDay
        || day < currentDay - 3
        || !isKnownDialogueSelectionId(entry.dialogueId)
      ) {
        throw new Error("NPC dialogue history entry is inconsistent.");
      }
      return { dialogueId: String(entry.dialogueId), day };
    });
    if (new Set(recent.map(({ dialogueId }) => dialogueId)).size !== recent.length) {
      throw new Error("NPC dialogue history repeats a recent dialogue ID.");
    }
    result[npcId] = {
      recent,
      acknowledgedStage: decodeRelationshipStage(memory.acknowledgedStage),
    };
  }
  return result;
}

/** Validates unique once-only event IDs against the closed retention event catalog. */
function decodeSeenEventIds(value: unknown): RetentionEventId[] {
  if (!Array.isArray(value)) throw new Error("Seen event state is invalid.");
  const eventIds = value.map((eventId) => {
    if (!isRetentionEventId(eventId)) throw new Error("Seen event state references an unknown event.");
    return eventId;
  });
  if (new Set(eventIds).size !== eventIds.length) throw new Error("Seen event state contains duplicates.");
  return eventIds;
}

/** Creates current gameplay defaults for one new game or inactive historical decoder. */
function springGameplayDefaults(
  day: number,
  wateringCanLevel: WateringCanLevel,
  worldSeed: number,
): Pick<GameState, "worldSeed" | "lateWarningDay" | "stamina" | "fishingCastCount" | "lastSurfaceStoneRefreshDay" | "lastSurfaceWeedRefreshDay" | "wateringCanWater" | "weather"> {
  const seed = uint32From(worldSeed, "World seed is invalid.");
  return {
    worldSeed: seed,
    lateWarningDay: 0,
    stamina: MAX_STAMINA,
    fishingCastCount: 0,
    lastSurfaceStoneRefreshDay: day,
    lastSurfaceWeedRefreshDay: day,
    wateringCanWater: wateringCanCapacity(wateringCanLevel),
    weather: new WeatherSystem().create(seed, day),
  };
}

/** Creates current retention and pet defaults for a fresh local game. */
function retentionDefaults(
  day: number,
): Pick<
  GameState,
  "inventoryCapacity" | "wateringCanLevel" | "dailyRequest" | "npcDialogue" | "seenEventIds" | "pet"
> {
  return {
    inventoryCapacity: BASE_INVENTORY_CAPACITY,
    wateringCanLevel: 1,
    dailyRequest: createDailyRequestState(day),
    npcDialogue: {},
    seenEventIds: [],
    pet: null,
  };
}

/** Builds the stable sparse farm-state key for one validated tile coordinate. */
export function farmTileId(column: number, row: number): string {
  if (!Number.isSafeInteger(column) || !Number.isSafeInteger(row) || column < 0 || row < 0) {
    throw new Error("Farm tile coordinate is invalid.");
  }
  return `farm:${column}:${row}`;
}

/** Creates one newly tilled sparse farm tile at an already validated Farm coordinate. */
export function createTilledFarmTile(column: number, row: number): FarmTileState {
  return {
    id: farmTileId(column, row),
    column,
    row,
    phase: "tilled",
    cropId: "",
    growthDays: 0,
    watered: false,
    plantedDay: 0,
    harvestCount: 0,
  };
}

/** Validates one player position and stable region identifier. */
function decodePlayerState(value: unknown): PlayerState {
  const player = recordFrom(value, "Player state is invalid.");
  const regionId = stringFrom(player.regionId, "Player region is invalid.");
  assertStableId(regionId, "Player region ID");
  return {
    regionId,
    x: finiteNumber(player.x, "Player X is invalid."),
    y: finiteNumber(player.y, "Player Y is invalid."),
    appearanceId: decodePlayerAppearanceId(player.appearanceId),
  };
}

/** Validates one capacity-owned current inventory without accepting retired item aliases. */
function decodeInventory(
  value: unknown,
  expectedCapacity: InventoryCapacity = BASE_INVENTORY_CAPACITY,
): InventorySlot[] {
  const inventory = Array.isArray(value) ? value : null;
  if (!inventory || inventory.length !== expectedCapacity) throw new Error("Inventory state is invalid.");
  return inventory.map((rawSlot) => decodeInventorySlot(rawSlot));
}

/** Validates one current inventory slot against the closed item catalog and stack limit. */
export function decodeInventorySlot(value: unknown): InventorySlot {
  const slot = recordFrom(value, "Inventory slot is invalid.");
  if (slot.itemId === "" && slot.quantity === 0) return { itemId: "", quantity: 0 };
  const definition = getItemDefinition(slot.itemId);
  if (
    !definition
    || !Number.isInteger(slot.quantity)
    || Number(slot.quantity) < 1
    || Number(slot.quantity) > definition.maxStack
  ) {
    throw new Error("Inventory slot is invalid.");
  }
  return { itemId: definition.id, quantity: Number(slot.quantity) };
}

/** Validates sparse resource state without duplicating catalog-owned positions. */
function decodeResources(value: unknown, currentDay: number): Record<string, ResourceState> {
  const source = recordFrom(value, "Resource state is invalid.");
  const result: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(source)) {
    const resource = decodeResource(rawResource, id, currentDay);
    assertStableId(id, "Saved resource ID");
    result[id] = resource;
  }
  return result;
}

/** Validates one resource entry against its record key and closed resource kinds. */
function decodeResource(value: unknown, id: string, currentDay: number): ResourceState {
  const resource = recordFrom(value, "Resource state is invalid.");
  const phase = resource.phase;
  const regrowOnDay = resource.regrowOnDay === null
    ? null
    : positiveSafeInteger(resource.regrowOnDay, "Resource regrow day is invalid.");
  if (
    resource.id !== id
    || (resource.kind !== "tree" && resource.kind !== "stone" && resource.kind !== "weed")
    || (phase !== "standing" && phase !== "stump" && phase !== "cleared")
    || (resource.kind !== "tree" && (phase === "stump" || regrowOnDay !== null))
    || (phase !== "cleared" && regrowOnDay !== null)
    || (regrowOnDay !== null && regrowOnDay <= currentDay)
  ) {
    throw new Error("Resource state is invalid.");
  }
  return { id, kind: resource.kind, phase, regrowOnDay };
}

/** Narrows one unknown phase to the complete local farming state machine. */
function isFarmPhase(value: unknown): value is FarmPhase {
  return value === "untilled" || value === "tilled" || value === "growing" || value === "mature";
}

/** Requires one non-array object before field-level decoding. */
function recordFrom(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(message);
  return value as Record<string, unknown>;
}

/** Requires one non-empty string without coercion. */
function stringFrom(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(message);
  return value;
}

/** Requires one finite number and returns it without coercing strings or null. */
function finiteNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(message);
  return value;
}

/** Requires one finite safe integer without coercion. */
function finiteSafeInteger(value: unknown, message: string): number {
  const number = finiteNumber(value, message);
  if (!Number.isSafeInteger(number)) throw new Error(message);
  return number;
}

/** Requires one positive safe integer used by the 1-based life-loop day. */
function positiveSafeInteger(value: unknown, message: string): number {
  const number = finiteSafeInteger(value, message);
  if (number < 1) throw new Error(message);
  return number;
}

/** Requires one non-negative safe integer used by local gold balances. */
function nonNegativeSafeInteger(value: unknown, message: string): number {
  const number = finiteSafeInteger(value, message);
  if (number < 0) throw new Error(message);
  return number;
}

/** Requires one unsigned 32-bit integer used by deterministic Spring content. */
function uint32From(value: unknown, message: string): number {
  const number = nonNegativeSafeInteger(value, message);
  if (number > 0xffffffff) throw new Error(message);
  return number;
}

/** Requires one non-negative day marker that cannot point beyond the current day. */
function boundedPastDay(value: unknown, currentDay: number, message: string): number {
  const day = nonNegativeSafeInteger(value, message);
  if (day > currentDay) throw new Error(message);
  return day;
}

/** Validates one positive current-or-past marker used by a deterministic surface-resource refresh. */
function decodeSurfaceRefreshDay(value: unknown, currentDay: number, resource: "stone" | "weed"): number {
  const message = `Surface-${resource} refresh day is invalid.`;
  const day = positiveSafeInteger(value, message);
  if (day > currentDay) throw new Error(message);
  return day;
}

/** Validates current sparse coordinate-keyed farm state and crop invariants. */
function decodeFarmTiles(value: unknown, currentDay: number): Record<string, FarmTileState> {
  const source = recordFrom(value, "Farm state is invalid.");
  return Object.fromEntries(Object.entries(source).map(([id, rawTile]) => {
    const tile = recordFrom(rawTile, "Farm state is invalid.");
    const coordinates = farmCoordinatesFromId(id);
    const column = nonNegativeSafeInteger(tile.column, "Farm column is invalid.");
    const row = nonNegativeSafeInteger(tile.row, "Farm row is invalid.");
    const phase = tile.phase;
    if (
      tile.id !== id
      || coordinates[0] !== column
      || coordinates[1] !== row
      || (phase !== "tilled" && phase !== "growing" && phase !== "mature")
      || typeof tile.watered !== "boolean"
    ) throw new Error("Farm state is invalid.");
    const growthDays = nonNegativeSafeInteger(tile.growthDays, "Farm growth days are invalid.");
    const plantedDay = nonNegativeSafeInteger(tile.plantedDay, "Farm planted day is invalid.");
    const harvestCount = nonNegativeSafeInteger(tile.harvestCount, "Farm harvest count is invalid.");
    const crop = tile.cropId === "" ? null : cropDefinition(tile.cropId);
    const shouldHaveCrop = phase === "growing" || phase === "mature";
    if (
      Boolean(crop) !== shouldHaveCrop
      || (tile.cropId !== "" && !crop)
      || (!shouldHaveCrop && (growthDays !== 0 || plantedDay !== 0 || harvestCount !== 0))
      || (shouldHaveCrop && (plantedDay < 1 || plantedDay > currentDay))
      || (crop && growthDays > crop.growthDays)
      || (crop && !crop.regrowDays && harvestCount !== 0)
      || (phase === "growing" && crop && growthDays >= crop.growthDays)
      || (phase === "mature" && crop && growthDays !== crop.growthDays)
    ) throw new Error("Farm state is inconsistent.");
    return [id, {
      id,
      column,
      row,
      phase,
      cropId: crop?.cropId ?? "",
      growthDays,
      watered: tile.watered,
      plantedDay,
      harvestCount,
    }];
  }));
}

/** Parses one current farm:column:row key without accepting legacy entity IDs. */
function farmCoordinatesFromId(id: string): readonly [number, number] {
  const match = /^farm:(\d+):(\d+)$/u.exec(id);
  if (!match) throw new Error("Farm tile ID is invalid.");
  const column = Number(match[1]);
  const row = Number(match[2]);
  if (!Number.isSafeInteger(column) || !Number.isSafeInteger(row)) throw new Error("Farm tile ID is invalid.");
  if (id !== farmTileId(column, row)) throw new Error("Farm tile ID is not canonical.");
  return [column, row];
}

/** Validates one current-day collected-forage set with unique stable point IDs. */
function decodeDailyForage(value: unknown, currentDay: number): DailyForageState {
  const forage = recordFrom(value, "Daily forage state is invalid.");
  if (forage.day !== currentDay || !Array.isArray(forage.collectedIds)) {
    throw new Error("Daily forage state is invalid.");
  }
  const collectedIds = forage.collectedIds.map((id) => {
    assertStableId(id, "Collected forage ID");
    return id;
  });
  if (new Set(collectedIds).size !== collectedIds.length) {
    throw new Error("Daily forage state is inconsistent.");
  }
  return { day: currentDay, collectedIds };
}
