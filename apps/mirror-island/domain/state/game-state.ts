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

export const GAME_STATE_VERSION = 7 as const;
export const TREE_ID = "farm-tree-001";
export const FARM_TILE_ID = "farm-plot-001";
const LEGACY_TREE_ID = "tree-01";
const LEGACY_FARM_TILE_ID = "farm-01";
const LEGACY_ALIEN_SEED_ID = "alien-seed";
const LEGACY_ALIEN_CROP_ID = "alien-crop";

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
  readonly kind: "tree" | "stone";
  available: boolean;
}

export type FarmPhase = "untilled" | "tilled" | "growing" | "mature";
export interface FarmTileState {
  readonly id: string;
  phase: FarmPhase;
  cropId: CropId | "";
  growthDays: number;
  watered: boolean;
}

export interface DailyForageState {
  day: number;
  collectedIds: string[];
}

export interface GameState {
  readonly version: typeof GAME_STATE_VERSION;
  day: number;
  minuteOfDay: number;
  gold: number;
  player: PlayerState;
  inventory: InventorySlot[];
  resources: Record<string, ResourceState>;
  farmTiles: Record<string, FarmTileState>;
  friendships: Record<string, FriendshipState>;
  dailyForage: DailyForageState;
}

/** Creates a deterministic v6 game state for one validated appearance and Tiled-derived catalog. */
export function createInitialGameState(
  catalog: WorldCatalog,
  appearanceId: PlayerAppearanceId = DEFAULT_PLAYER_APPEARANCE_ID,
): GameState {
  const inventory: InventorySlot[] = Array.from(
    { length: INVENTORY_SLOT_COUNT },
    () => ({ itemId: "", quantity: 0 }),
  );
  inventory[0] = { itemId: ITEM_ID.hoe, quantity: 1 };
  inventory[1] = { itemId: ITEM_ID.wateringCan, quantity: 1 };
  inventory[2] = { itemId: ITEM_ID.axe, quantity: 1 };
  const start = catalog.requireDefaultSpawn(catalog.startRegionId);
  const state: GameState = {
    version: GAME_STATE_VERSION,
    day: 1,
    minuteOfDay: DAY_START_MINUTE,
    gold: 100,
    player: {
      regionId: catalog.startRegionId,
      ...start,
      appearanceId: decodePlayerAppearanceId(appearanceId),
    },
    inventory,
    resources: {},
    farmTiles: {},
    friendships: {},
    dailyForage: { day: 1, collectedIds: [] },
  };
  reconcileGameStateWithCatalog(state, catalog);
  return state;
}

/** Adds missing catalog-owned defaults and rejects saved IDs or kinds that no longer match the world. */
export function reconcileGameStateWithCatalog(state: GameState, catalog: WorldCatalog): boolean {
  catalog.requireRegion(state.player.regionId);
  let changed = false;
  const activeNpcs = activeNpcSpawnsInRegion(catalog, state.player.regionId, state.minuteOfDay);
  if (catalog.isBlocked(state.player.regionId, state.player.x, state.player.y, 5, 4, activeNpcs)) {
    const safeSpawn = catalog.requireDefaultSpawn(state.player.regionId);
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    changed = true;
  }
  const knownResourceIds = new Set<string>();
  const knownFarmIds = new Set<string>();
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
    }
    for (const spawn of region.resources) {
      if (spawn.kind !== "tree" && spawn.kind !== "stone") continue;
      knownResourceIds.add(spawn.entityId);
      const saved = state.resources[spawn.entityId];
      if (!saved) {
        state.resources[spawn.entityId] = { id: spawn.entityId, kind: spawn.kind, available: true };
        changed = true;
      } else if (saved.kind !== spawn.kind) {
        throw new Error(`Saved resource kind does not match catalog entity ${spawn.entityId}.`);
      }
    }
    for (const interaction of region.interactions) {
      if (interaction.kind !== "farm-plot") continue;
      knownFarmIds.add(interaction.entityId);
      if (!state.farmTiles[interaction.entityId]) {
        state.farmTiles[interaction.entityId] = createUntilledFarmTile(interaction.entityId);
        changed = true;
      }
    }
  }
  if (Object.keys(state.resources).some((id) => !knownResourceIds.has(id))) {
    throw new Error("Save references an unknown resource entity.");
  }
  if (Object.keys(state.farmTiles).some((id) => !knownFarmIds.has(id))) {
    throw new Error("Save references an unknown farm entity.");
  }
  if (Object.keys(state.friendships).some((npcId) => !knownNpcIds.has(npcId))) {
    throw new Error("Save references an unknown NPC friendship.");
  }
  return changed;
}

/** Produces a deep mutable clone so callers cannot mutate GameSession state through snapshots. */
export function cloneGameState(state: GameState): GameState {
  return {
    version: GAME_STATE_VERSION,
    day: state.day,
    minuteOfDay: state.minuteOfDay,
    gold: state.gold,
    player: { ...state.player },
    inventory: state.inventory.map((slot) => ({ ...slot })),
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
  };
}

/** Validates one unknown value as a complete version-7 game state and returns a defensive clone. */
export function decodeGameState(value: unknown): GameState {
  const state = recordFrom(value, "Game state is invalid.");
  if (state.version !== GAME_STATE_VERSION) throw new Error("Game state version is unsupported.");
  const day = positiveSafeInteger(state.day, "Game day is invalid.");
  return {
    version: GAME_STATE_VERSION,
    day,
    minuteOfDay: decodeGameMinute(state.minuteOfDay),
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: decodePlayerState(state.player),
    inventory: decodeInventory(state.inventory, false),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV7(state.farmTiles),
    friendships: decodeFriendships(state.friendships, day),
    dailyForage: decodeDailyForage(state.dailyForage, day),
  };
}

/** Explicitly migrates a released v6 state into generic crop progress and daily forage state. */
export function migrateGameStateV6(value: unknown): GameState {
  const state = recordFrom(value, "Version-6 game state is invalid.");
  if (state.version !== 6) throw new Error("Version-6 game state is unsupported.");
  const day = positiveSafeInteger(state.day, "Game day is invalid.");
  return {
    version: GAME_STATE_VERSION,
    day,
    minuteOfDay: decodeGameMinute(state.minuteOfDay),
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: decodePlayerState(state.player),
    inventory: decodeInventory(state.inventory, false),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV6(state.farmTiles),
    friendships: decodeFriendships(state.friendships, day),
    dailyForage: { day, collectedIds: [] },
  };
}

/** Explicitly migrates a released v5 state into the v6 player-appearance contract. */
export function migrateGameStateV5(value: unknown): GameState {
  const state = recordFrom(value, "Version-5 game state is invalid.");
  if (state.version !== 5) throw new Error("Version-5 game state is unsupported.");
  const day = positiveSafeInteger(state.day, "Game day is invalid.");
  return {
    version: GAME_STATE_VERSION,
    day,
    minuteOfDay: decodeGameMinute(state.minuteOfDay),
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: migratePlayerState(state.player),
    inventory: decodeInventory(state.inventory, false),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV6(state.farmTiles),
    friendships: decodeFriendships(state.friendships, day),
    dailyForage: { day, collectedIds: [] },
  };
}

/** Explicitly migrates a released v4 state into the v5 friendship contract with catalog-filled defaults. */
export function migrateGameStateV4(value: unknown): GameState {
  const state = recordFrom(value, "Version-4 game state is invalid.");
  if (state.version !== 4) throw new Error("Version-4 game state is unsupported.");
  return {
    version: GAME_STATE_VERSION,
    day: positiveSafeInteger(state.day, "Game day is invalid."),
    minuteOfDay: decodeGameMinute(state.minuteOfDay),
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: migratePlayerState(state.player),
    inventory: decodeInventory(state.inventory, false),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV6(state.farmTiles),
    friendships: {},
    dailyForage: { day: positiveSafeInteger(state.day, "Game day is invalid."), collectedIds: [] },
  };
}

/** Explicitly migrates a released v3 state into the v5 clock/friendship contract at 06:00. */
export function migrateGameStateV3(value: unknown): GameState {
  const state = recordFrom(value, "Version-3 game state is invalid.");
  if (state.version !== 3) throw new Error("Version-3 game state is unsupported.");
  return {
    version: GAME_STATE_VERSION,
    day: positiveSafeInteger(state.day, "Game day is invalid."),
    minuteOfDay: DAY_START_MINUTE,
    gold: nonNegativeSafeInteger(state.gold, "Game gold is invalid."),
    player: migratePlayerState(state.player),
    inventory: decodeInventory(state.inventory, false),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV6(state.farmTiles),
    friendships: {},
    dailyForage: { day: positiveSafeInteger(state.day, "Game day is invalid."), collectedIds: [] },
  };
}

/** Explicitly migrates a released v2 state into the day-based v5 life-loop contract. */
export function migrateGameStateV2(value: unknown): GameState {
  const state = recordFrom(value, "Version-2 game state is invalid.");
  if (state.version !== 2) throw new Error("Version-2 game state is unsupported.");
  return {
    version: GAME_STATE_VERSION,
    day: 1,
    minuteOfDay: DAY_START_MINUTE,
    gold: 100,
    player: migratePlayerState(state.player),
    inventory: decodeInventory(state.inventory, true),
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTilesV2(state.farmTiles, true),
    friendships: {},
    dailyForage: { day: 1, collectedIds: [] },
  };
}

/** Explicitly decodes and migrates the only released v1 LOCAL/grid save into v5 world IDs. */
export function migrateLegacyGameStateV1(value: unknown): GameState {
  const state = recordFrom(value, "Legacy game state is invalid.");
  if (state.version !== 1) throw new Error("Legacy game state version is unsupported.");
  const player = recordFrom(state.player, "Legacy player state is invalid.");
  const legacyResources = recordFrom(state.resources, "Legacy resource state is invalid.");
  const legacyFarmTiles = recordFrom(state.farmTiles, "Legacy farm state is invalid.");
  const resources: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(legacyResources)) {
    const resource = decodeResource(rawResource, id);
    const migratedId = id === LEGACY_TREE_ID ? TREE_ID : id;
    assertStableId(migratedId, "Migrated resource ID");
    resources[migratedId] = { ...resource, id: migratedId };
  }
  const farmTiles: Record<string, FarmTileState> = {};
  for (const [id, rawTile] of Object.entries(legacyFarmTiles)) {
    const migratedId = id === LEGACY_FARM_TILE_ID ? FARM_TILE_ID : id;
    farmTiles[migratedId] = decodeFarmTileV2(rawTile, migratedId, false);
  }
  return {
    version: GAME_STATE_VERSION,
    day: 1,
    minuteOfDay: DAY_START_MINUTE,
    gold: 100,
    player: {
      regionId: "farm",
      x: finiteNumber(player.x, "Legacy player X is invalid."),
      y: finiteNumber(player.y, "Legacy player Y is invalid."),
      appearanceId: DEFAULT_PLAYER_APPEARANCE_ID,
    },
    inventory: decodeInventory(state.inventory, true),
    resources,
    farmTiles,
    friendships: {},
    dailyForage: { day: 1, collectedIds: [] },
  };
}

/** Validates sparse friendship state while preserving catalog reconciliation as the identity owner. */
function decodeFriendships(value: unknown, currentDay: number): Record<string, FriendshipState> {
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
    if (
      friendship.npcId !== npcId
      || points > FRIENDSHIP_MAX_POINTS
      || lastTalkedDay > currentDay
    ) {
      throw new Error("Friendship state is inconsistent.");
    }
    result[npcId] = { npcId, points, lastTalkedDay };
  }
  return result;
}

/** Creates the reviewed default state for one catalog-owned farm plot. */
function createUntilledFarmTile(id: string): FarmTileState {
  return { id, phase: "untilled", cropId: "", growthDays: 0, watered: false };
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

/** Migrates a pre-v6 player position while preserving the released farmer as its appearance. */
function migratePlayerState(value: unknown): PlayerState {
  const player = recordFrom(value, "Player state is invalid.");
  const regionId = stringFrom(player.regionId, "Player region is invalid.");
  assertStableId(regionId, "Player region ID");
  return {
    regionId,
    x: finiteNumber(player.x, "Player X is invalid."),
    y: finiteNumber(player.y, "Player Y is invalid."),
    appearanceId: DEFAULT_PLAYER_APPEARANCE_ID,
  };
}

/** Validates the fixed-length inventory and optionally maps the two released placeholder item IDs. */
function decodeInventory(value: unknown, migrateLegacyItems: boolean): InventorySlot[] {
  const inventory = Array.isArray(value) ? value : null;
  if (!inventory || inventory.length !== INVENTORY_SLOT_COUNT) throw new Error("Inventory state is invalid.");
  return inventory.map((rawSlot) => decodeInventorySlot(rawSlot, migrateLegacyItems));
}

/** Validates one inventory slot after applying only the explicit v1/v2 item aliases. */
function decodeInventorySlot(value: unknown, migrateLegacyItems: boolean): InventorySlot {
  const slot = recordFrom(value, "Inventory slot is invalid.");
  if (slot.itemId === "" && slot.quantity === 0) return { itemId: "", quantity: 0 };
  const itemId = migrateLegacyItems ? migrateLegacyItemId(slot.itemId) : slot.itemId;
  const definition = getItemDefinition(itemId);
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

/** Maps only the two retired farming placeholders without accepting other unknown item IDs. */
function migrateLegacyItemId(value: unknown): unknown {
  if (value === LEGACY_ALIEN_SEED_ID) return ITEM_ID.turnipSeed;
  if (value === LEGACY_ALIEN_CROP_ID) return ITEM_ID.turnip;
  return value;
}

/** Validates sparse resource state without duplicating catalog-owned positions. */
function decodeResources(value: unknown): Record<string, ResourceState> {
  const source = recordFrom(value, "Resource state is invalid.");
  const result: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(source)) {
    const resource = decodeResource(rawResource, id);
    assertStableId(id, "Saved resource ID");
    result[id] = resource;
  }
  return result;
}

/** Validates one resource entry against its record key and closed resource kinds. */
function decodeResource(value: unknown, id: string): ResourceState {
  const resource = recordFrom(value, "Resource state is invalid.");
  if (
    resource.id !== id
    || (resource.kind !== "tree" && resource.kind !== "stone")
    || typeof resource.available !== "boolean"
  ) {
    throw new Error("Resource state is invalid.");
  }
  return { id, kind: resource.kind, available: resource.available };
}

/** Migrates sparse v3-v6 farm state with fixed turnip growth stages. */
function decodeFarmTilesV6(value: unknown): Record<string, FarmTileState> {
  const source = recordFrom(value, "Farm state is invalid.");
  return Object.fromEntries(
    Object.entries(source).map(([id, rawTile]) => [id, decodeFarmTileV6(rawTile, id)]),
  );
}

/** Migrates one fixed-turnip farm tile into generic watered-day progress. */
function decodeFarmTileV6(value: unknown, id: string): FarmTileState {
  const tile = recordFrom(value, "Farm state is invalid.");
  if (tile.id !== id || !isFarmPhase(tile.phase) || typeof tile.watered !== "boolean") {
    throw new Error("Farm state is invalid.");
  }
  assertStableId(id, "Saved farm ID");
  const growthDays = legacyCropGrowthStage(tile.growthStage, "Farm growth stage is invalid.");
  const hasCrop = tile.cropId === ITEM_ID.turnip;
  const shouldHaveCrop = tile.phase === "growing" || tile.phase === "mature";
  if (
    (tile.cropId !== "" && !hasCrop)
    || hasCrop !== shouldHaveCrop
    || ((tile.phase === "untilled" || tile.phase === "tilled") && growthDays !== 0)
    || (tile.phase === "growing" && growthDays === 3)
    || (tile.phase === "mature" && growthDays !== 3)
  ) {
    throw new Error("Farm state is inconsistent.");
  }
  return {
    id,
    phase: tile.phase,
    cropId: hasCrop ? ITEM_ID.turnip : "",
    growthDays,
    watered: tile.watered,
  };
}

/** Migrates sparse v1/v2 farm state while validating the retired timer contract. */
function decodeFarmTilesV2(value: unknown, requireMatchingId: boolean): Record<string, FarmTileState> {
  const source = recordFrom(value, "Version-2 farm state is invalid.");
  return Object.fromEntries(
    Object.entries(source).map(([id, rawTile]) => [
      id,
      decodeFarmTileV2(rawTile, id, requireMatchingId),
    ]),
  );
}

/** Converts one valid timer-based farm tile into the equivalent day-growth v3 state. */
function decodeFarmTileV2(value: unknown, id: string, requireMatchingId: boolean): FarmTileState {
  const tile = recordFrom(value, "Version-2 farm state is invalid.");
  if (
    (requireMatchingId && tile.id !== id)
    || !isFarmPhase(tile.phase)
    || (tile.cropId !== "" && tile.cropId !== LEGACY_ALIEN_CROP_ID)
    || typeof tile.watered !== "boolean"
  ) {
    throw new Error("Version-2 farm state is invalid.");
  }
  assertStableId(id, "Saved farm ID");
  const legacyGrowthStage = finiteSafeInteger(tile.growthStage, "Farm growth stage is invalid.");
  const readyAt = finiteNumber(tile.readyAt, "Farm ready time is invalid.");
  if (legacyGrowthStage < 0 || legacyGrowthStage > 1 || readyAt < 0) {
    throw new Error("Version-2 farm state is invalid.");
  }
  const hasCrop = tile.cropId === LEGACY_ALIEN_CROP_ID;
  if ((tile.phase === "growing" || tile.phase === "mature") !== hasCrop) {
    throw new Error("Version-2 farm state is inconsistent.");
  }
  return {
    id,
    phase: tile.phase,
    cropId: hasCrop ? ITEM_ID.turnip : "",
    growthDays: tile.phase === "mature"
      ? 3
      : tile.phase === "growing"
        ? legacyGrowthStage as 0 | 1
        : 0,
    watered: tile.watered,
  };
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

/** Narrows one decoded integer to the four released turnip growth stages. */
function legacyCropGrowthStage(value: unknown, message: string): 0 | 1 | 2 | 3 {
  const stage = finiteSafeInteger(value, message);
  if (stage < 0 || stage > 3) throw new Error(message);
  return stage as 0 | 1 | 2 | 3;
}

/** Validates sparse v7 farm state against the single crop catalog. */
function decodeFarmTilesV7(value: unknown): Record<string, FarmTileState> {
  const source = recordFrom(value, "Farm state is invalid.");
  return Object.fromEntries(Object.entries(source).map(([id, rawTile]) => {
    const tile = recordFrom(rawTile, "Farm state is invalid.");
    if (tile.id !== id || !isFarmPhase(tile.phase) || typeof tile.watered !== "boolean") {
      throw new Error("Farm state is invalid.");
    }
    assertStableId(id, "Saved farm ID");
    const growthDays = nonNegativeSafeInteger(tile.growthDays, "Farm growth days are invalid.");
    const crop = tile.cropId === "" ? null : cropDefinition(tile.cropId);
    const shouldHaveCrop = tile.phase === "growing" || tile.phase === "mature";
    if (
      Boolean(crop) !== shouldHaveCrop
      || (!shouldHaveCrop && growthDays !== 0)
      || (crop && growthDays > crop.growthDays)
      || (tile.phase === "growing" && crop && growthDays >= crop.growthDays)
      || (tile.phase === "mature" && crop && growthDays !== crop.growthDays)
    ) throw new Error("Farm state is inconsistent.");
    return [id, {
      id,
      phase: tile.phase,
      cropId: crop?.cropId ?? "",
      growthDays,
      watered: tile.watered,
    }];
  }));
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
