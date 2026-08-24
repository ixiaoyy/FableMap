import {
  INVENTORY_SLOT_COUNT,
  ITEM_ID,
  getItemDefinition,
  type ItemId,
} from "../items/definitions.ts";

export const GAME_STATE_VERSION = 1 as const;
export const TREE_ID = "tree-01";
export const FARM_TILE_ID = "farm-01";

export interface InventorySlot {
  itemId: ItemId | "";
  quantity: number;
}

export interface PlayerState {
  x: number;
  y: number;
}

export interface ResourceState {
  readonly id: string;
  readonly kind: "tree" | "stone";
  readonly x: number;
  readonly y: number;
  available: boolean;
}

export type FarmPhase = "untilled" | "tilled" | "growing" | "mature";

export interface FarmTileState {
  readonly id: string;
  readonly x: number;
  readonly y: number;
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

/** Creates the deterministic code-drawn world used until the fixed farm/town Tiled map replaces it. */
export function createInitialGameState(): GameState {
  const inventory: InventorySlot[] = Array.from(
    { length: INVENTORY_SLOT_COUNT },
    () => ({ itemId: "", quantity: 0 }),
  );
  inventory[0] = { itemId: ITEM_ID.hoe, quantity: 1 };
  inventory[1] = { itemId: ITEM_ID.alienSeed, quantity: 1 };
  inventory[2] = { itemId: ITEM_ID.wateringCan, quantity: 1 };
  return {
    version: GAME_STATE_VERSION,
    player: { x: 256, y: 256 },
    inventory,
    resources: {
      [TREE_ID]: { id: TREE_ID, kind: "tree", x: 320, y: 256, available: true },
    },
    farmTiles: {
      [FARM_TILE_ID]: {
        id: FARM_TILE_ID,
        x: 192,
        y: 256,
        phase: "untilled",
        cropId: "",
        growthStage: 0,
        watered: false,
        readyAt: 0,
      },
    },
  };
}

/** Produces a deep mutable clone so callers cannot mutate GameSession state through a published snapshot. */
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

/** Validates one unknown value as a complete version-1 game state and returns a defensive clone. */
export function decodeGameState(value: unknown): GameState {
  const state = recordFrom(value, "Game state is invalid.");
  if (state.version !== GAME_STATE_VERSION) throw new Error("Game state version is unsupported.");
  const player = recordFrom(state.player, "Player state is invalid.");
  const inventory = Array.isArray(state.inventory) ? state.inventory : null;
  if (!inventory || inventory.length !== INVENTORY_SLOT_COUNT) {
    throw new Error("Inventory state is invalid.");
  }
  const decodedInventory = inventory.map((rawSlot) => decodeInventorySlot(rawSlot));
  return {
    version: GAME_STATE_VERSION,
    player: { x: finiteNumber(player.x, "Player X is invalid."), y: finiteNumber(player.y, "Player Y is invalid.") },
    inventory: decodedInventory,
    resources: decodeResources(state.resources),
    farmTiles: decodeFarmTiles(state.farmTiles),
  };
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

/** Validates the sparse resource record and rejects unknown resource shapes or duplicate internal IDs. */
function decodeResources(value: unknown): Record<string, ResourceState> {
  const source = recordFrom(value, "Resource state is invalid.");
  const result: Record<string, ResourceState> = {};
  for (const [id, rawResource] of Object.entries(source)) {
    const resource = recordFrom(rawResource, "Resource state is invalid.");
    if (resource.id !== id || (resource.kind !== "tree" && resource.kind !== "stone") || typeof resource.available !== "boolean") {
      throw new Error("Resource state is invalid.");
    }
    result[id] = {
      id,
      kind: resource.kind,
      x: finiteNumber(resource.x, "Resource X is invalid."),
      y: finiteNumber(resource.y, "Resource Y is invalid."),
      available: resource.available,
    };
  }
  return result;
}

/** Validates the sparse farm record and its closed phase/crop/timer fields. */
function decodeFarmTiles(value: unknown): Record<string, FarmTileState> {
  const source = recordFrom(value, "Farm state is invalid.");
  const result: Record<string, FarmTileState> = {};
  for (const [id, rawTile] of Object.entries(source)) {
    const tile = recordFrom(rawTile, "Farm state is invalid.");
    if (
      tile.id !== id
      || !isFarmPhase(tile.phase)
      || (tile.cropId !== "" && tile.cropId !== ITEM_ID.alienCrop)
      || typeof tile.watered !== "boolean"
    ) {
      throw new Error("Farm state is invalid.");
    }
    const growthStage = finiteInteger(tile.growthStage, "Farm growth stage is invalid.");
    const readyAt = finiteNumber(tile.readyAt, "Farm ready time is invalid.");
    if (growthStage < 0 || growthStage > 1 || readyAt < 0) throw new Error("Farm state is invalid.");
    const cropId = tile.cropId as FarmTileState["cropId"];
    if ((tile.phase === "growing" || tile.phase === "mature") !== (cropId === ITEM_ID.alienCrop)) {
      throw new Error("Farm state is inconsistent.");
    }
    result[id] = {
      id,
      x: finiteNumber(tile.x, "Farm X is invalid."),
      y: finiteNumber(tile.y, "Farm Y is invalid."),
      phase: tile.phase,
      cropId,
      growthStage,
      watered: tile.watered,
      readyAt,
    };
  }
  return result;
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
