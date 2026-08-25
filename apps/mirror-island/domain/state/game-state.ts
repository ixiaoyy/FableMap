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

export const GAME_STATE_VERSION = 2 as const;
export const TREE_ID = "farm-tree-001";
export const FARM_TILE_ID = "farm-plot-001";
const LEGACY_TREE_ID = "tree-01";
const LEGACY_FARM_TILE_ID = "farm-01";

export interface InventorySlot {
  itemId: ItemId | "";
  quantity: number;
}

export interface PlayerState {
  regionId: string;
  x: number;
  y: number;
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
  cropId: typeof ITEM_ID.alienCrop | "";
  growthStage: number;
  watered: boolean;
  readyAt: number;
}

export interface GameState {
  readonly version: typeof GAME_STATE_VERSION;
  player: PlayerState;
  inventory: InventorySlot[];
  resources: Record<string, ResourceState>;
  farmTiles: Record<string, FarmTileState>;
}

/** Creates a deterministic v2 game state from the validated Tiled-derived world catalog. */
export function createInitialGameState(catalog: WorldCatalog): GameState {
  const inventory: InventorySlot[] = Array.from(
    { length: INVENTORY_SLOT_COUNT },
    () => ({ itemId: "", quantity: 0 }),
  );
  inventory[0] = { itemId: ITEM_ID.hoe, quantity: 1 };
  inventory[1] = { itemId: ITEM_ID.alienSeed, quantity: 1 };
  inventory[2] = { itemId: ITEM_ID.wateringCan, quantity: 1 };
  const start = catalog.requireDefaultSpawn(catalog.startRegionId);
  const state: GameState = {
    version: GAME_STATE_VERSION,
    player: { regionId: catalog.startRegionId, ...start },
    inventory,
    resources: {},
    farmTiles: {},
  };
  reconcileGameStateWithCatalog(state, catalog);
  return state;
}

/** Adds missing catalog-owned defaults and rejects saved IDs or kinds that no longer match the world. */
export function reconcileGameStateWithCatalog(state: GameState, catalog: WorldCatalog): boolean {
  catalog.requireRegion(state.player.regionId);
  let changed = false;
  if (catalog.isBlocked(state.player.regionId, state.player.x, state.player.y)) {
    const safeSpawn = catalog.requireDefaultSpawn(state.player.regionId);
    state.player.x = safeSpawn.x;
    state.player.y = safeSpawn.y;
    changed = true;
  }
  const knownResourceIds = new Set<string>();
  const knownFarmIds = new Set<string>();
  for (const region of catalog.allRegions()) {
    for (const spawn of region.resources) {
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
  return changed;
}

/** Produces a deep mutable clone so callers cannot mutate GameSession state through snapshots. */
export function cloneGameState(state: GameState): GameState {
  return {
    version: GAME_STATE_VERSION,
    player: { ...state.player },
    inventory: state.inventory.map((slot) => ({ ...slot })),
    resources: Object.fromEntries(
      Object.entries(state.resources).map(([id, resource]) => [id, { ...resource }]),
    ),
    farmTiles: Object.fromEntries(
      Object.entries(state.farmTiles).map(([id, tile]) => [id, { ...tile }]),
    ),
  };
}

/** Validates one unknown value as a complete version-2 game state and returns a defensive clone. */
export function decodeGameState(value: unknown): GameState {
  const state = recordFrom(value, "Game state is invalid.");
  if (state.version !== GAME_STATE_VERSION) throw new Error("Game state version is unsupported.");
  const player = recordFrom(state.player, "Player state is invalid.");
  const regionId = stringFrom(player.regionId, "Player region is invalid.");
  assertStableId(regionId, "Player region ID");
  return {
    version: GAME_STATE_VERSION,
    player: {
      regionId,
      x: finiteNumber(player.x, "Player X is invalid."),
      y: finiteNumber(player.y, "Player Y is invalid."),
    },
    inventory: decodeInventory(state.inventory),
    resources: decodeResourcesV2(state.resources),
    farmTiles: decodeFarmTilesV2(state.farmTiles),
  };
}

/** Explicitly decodes and migrates the only released v1 LOCAL/grid save into v2 world IDs. */
export function migrateLegacyGameStateV1(value: unknown): GameState {
  const state = recordFrom(value, "Legacy game state is invalid.");
  if (state.version !== 1) throw new Error("Legacy game state version is unsupported.");
  const player = recordFrom(state.player, "Legacy player state is invalid.");
  const legacyResources = recordFrom(state.resources, "Legacy resource state is invalid.");
  const legacyFarmTiles = recordFrom(state.farmTiles, "Legacy farm state is invalid.");
  const resources: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(legacyResources)) {
    const resource = recordFrom(rawResource, "Legacy resource state is invalid.");
    if (
      resource.id !== id
      || (resource.kind !== "tree" && resource.kind !== "stone")
      || typeof resource.available !== "boolean"
    ) {
      throw new Error("Legacy resource state is invalid.");
    }
    const migratedId = id === LEGACY_TREE_ID ? TREE_ID : id;
    assertStableId(migratedId, "Migrated resource ID");
    resources[migratedId] = { id: migratedId, kind: resource.kind, available: resource.available };
  }
  const farmTiles: Record<string, FarmTileState> = {};
  for (const [id, rawTile] of Object.entries(legacyFarmTiles)) {
    const migratedId = id === LEGACY_FARM_TILE_ID ? FARM_TILE_ID : id;
    farmTiles[migratedId] = decodeFarmTile(rawTile, migratedId, true);
  }
  return {
    version: GAME_STATE_VERSION,
    player: {
      regionId: "farm",
      x: finiteNumber(player.x, "Legacy player X is invalid."),
      y: finiteNumber(player.y, "Legacy player Y is invalid."),
    },
    inventory: decodeInventory(state.inventory),
    resources,
    farmTiles,
  };
}

/** Creates the reviewed default state for one catalog-owned farm plot. */
function createUntilledFarmTile(id: string): FarmTileState {
  return { id, phase: "untilled", cropId: "", growthStage: 0, watered: false, readyAt: 0 };
}

/** Validates the fixed-length inventory and every registered item stack. */
function decodeInventory(value: unknown): InventorySlot[] {
  const inventory = Array.isArray(value) ? value : null;
  if (!inventory || inventory.length !== INVENTORY_SLOT_COUNT) throw new Error("Inventory state is invalid.");
  return inventory.map((rawSlot) => decodeInventorySlot(rawSlot));
}

/** Validates one unknown inventory slot against registered items and bounded stack quantities. */
function decodeInventorySlot(value: unknown): InventorySlot {
  const slot = recordFrom(value, "Inventory slot is invalid.");
  if (slot.itemId === "" && slot.quantity === 0) return { itemId: "", quantity: 0 };
  const definition = getItemDefinition(slot.itemId);
  if (!definition || !Number.isInteger(slot.quantity) || Number(slot.quantity) < 1 || Number(slot.quantity) > definition.maxStack) {
    throw new Error("Inventory slot is invalid.");
  }
  return { itemId: definition.id, quantity: Number(slot.quantity) };
}

/** Validates sparse v2 resource state without duplicating catalog-owned positions. */
function decodeResourcesV2(value: unknown): Record<string, ResourceState> {
  const source = recordFrom(value, "Resource state is invalid.");
  const result: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(source)) {
    const resource = recordFrom(rawResource, "Resource state is invalid.");
    if (resource.id !== id || (resource.kind !== "tree" && resource.kind !== "stone") || typeof resource.available !== "boolean") {
      throw new Error("Resource state is invalid.");
    }
    assertStableId(id, "Saved resource ID");
    result[id] = { id, kind: resource.kind, available: resource.available };
  }
  return result;
}

/** Validates sparse v2 farm state without duplicating catalog-owned positions. */
function decodeFarmTilesV2(value: unknown): Record<string, FarmTileState> {
  const source = recordFrom(value, "Farm state is invalid.");
  return Object.fromEntries(Object.entries(source).map(([id, rawTile]) => [id, decodeFarmTile(rawTile, id, false)]));
}

/** Validates one farm state and its closed phase/crop/timer invariants. */
function decodeFarmTile(value: unknown, id: string, legacy: boolean): FarmTileState {
  const tile = recordFrom(value, legacy ? "Legacy farm state is invalid." : "Farm state is invalid.");
  if ((!legacy && tile.id !== id) || !isFarmPhase(tile.phase) || (tile.cropId !== "" && tile.cropId !== ITEM_ID.alienCrop) || typeof tile.watered !== "boolean") {
    throw new Error("Farm state is invalid.");
  }
  assertStableId(id, "Saved farm ID");
  const growthStage = finiteInteger(tile.growthStage, "Farm growth stage is invalid.");
  const readyAt = finiteNumber(tile.readyAt, "Farm ready time is invalid.");
  if (growthStage < 0 || growthStage > 1 || readyAt < 0) throw new Error("Farm state is invalid.");
  const cropId = tile.cropId as FarmTileState["cropId"];
  if ((tile.phase === "growing" || tile.phase === "mature") !== (cropId === ITEM_ID.alienCrop)) {
    throw new Error("Farm state is inconsistent.");
  }
  return { id, phase: tile.phase, cropId, growthStage, watered: tile.watered, readyAt };
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

/** Requires one finite integer and returns it without coercion. */
function finiteInteger(value: unknown, message: string): number {
  const number = finiteNumber(value, message);
  if (!Number.isInteger(number)) throw new Error(message);
  return number;
}
