import { ITEM_ID, getItemDefinition, type ItemId } from "../items/definitions.ts";
import type { GameState, InventorySlot } from "../state/game-state.ts";
import { assertStableId, type WorldCatalog } from "./regions.ts";

export const CHEST_SLOT_COUNT = 36;
export const DEFAULT_SHIPPING_BIN_ID = "farm-shipping-bin-default";
export const CHEST_COLOR_IDS = ["default", "red", "orange", "yellow", "lime", "green", "teal", "cyan", "sky", "blue", "indigo", "purple", "violet", "magenta", "pink", "rose", "tan", "brown", "gray", "black", "white"] as const;
export type ChestColorId = typeof CHEST_COLOR_IDS[number];
export const CHEST_ALLOWED_REGIONS: readonly string[] = getItemDefinition(ITEM_ID.chest)?.placement?.allowedRegions ?? [];

export interface ChestWorldObject {
  readonly id: string;
  readonly kind: "chest";
  regionId: string;
  column: number;
  row: number;
  colorId: ChestColorId;
  slots: InventorySlot[];
}

export interface ShippingBinWorldObject {
  readonly id: string;
  readonly kind: "shipping-bin";
  regionId: "farm";
  column: number;
  row: number;
}

export type WorldObjectState = ChestWorldObject | ShippingBinWorldObject;
export interface WorldDropState {
  readonly id: string;
  readonly regionId: string;
  readonly originX: number;
  readonly originY: number;
  readonly stack: InventorySlot;
}

export interface StorageWorldState {
  worldObjects: WorldObjectState[];
  worldDrops: WorldDropState[];
  nextWorldEntitySequence: number;
}

/** Creates only the authored initial shipping building and an empty monotonic entity sequence. */
export function createStorageWorldState(catalog: WorldCatalog): StorageWorldState {
  const point = catalog.requireSpawn("farm", DEFAULT_SHIPPING_BIN_ID);
  return {
    worldObjects: [{ id: DEFAULT_SHIPPING_BIN_ID, kind: "shipping-bin", regionId: "farm", column: Math.floor(point.x / 16), row: Math.floor(point.y / 16) }],
    worldDrops: [],
    nextWorldEntitySequence: 1,
  };
}

/** Deep-clones every mutable container/drop stack so a save candidate never shares inventory arrays. */
export function cloneStorageWorldState(state: StorageWorldState): StorageWorldState {
  return {
    worldObjects: state.worldObjects.map((object) => object.kind === "chest"
      ? { ...object, slots: object.slots.map((slot) => ({ ...slot })) } : { ...object }),
    worldDrops: state.worldDrops.map((drop) => ({ ...drop, stack: { ...drop.stack } })),
    nextWorldEntitySequence: state.nextWorldEntitySequence,
  };
}

/** Decodes the current world fields without backfilling retired saves; optional day is caller compatibility only. */
export function decodeStorageWorldState(value: unknown, _day?: number): StorageWorldState {
  const record = objectRecord(value);
  if (!Array.isArray(record.worldObjects) || !Array.isArray(record.worldDrops)) throw new Error("World collections are invalid.");
  const nextWorldEntitySequence = nonNegativeInteger(record.nextWorldEntitySequence);
  if (nextWorldEntitySequence < 1) throw new Error("World entity sequence is invalid.");
  const worldObjects = record.worldObjects.map((raw): WorldObjectState => {
    const object = objectRecord(raw);
    const id = stableString(object.id);
    const regionId = stableString(object.regionId);
    const column = nonNegativeInteger(object.column);
    const row = nonNegativeInteger(object.row);
    if (object.kind === "shipping-bin" && regionId === "farm") return { id, kind: "shipping-bin", regionId, column, row };
    if (object.kind !== "chest" || !CHEST_ALLOWED_REGIONS.some((allowed) => allowed === regionId)
      || !isChestColorId(object.colorId) || !Array.isArray(object.slots) || object.slots.length !== CHEST_SLOT_COUNT) {
      throw new Error("Chest state is invalid.");
    }
    return { id, kind: "chest", regionId, column, row, colorId: object.colorId, slots: object.slots.map(decodeWorldStack) };
  });
  const worldDrops = record.worldDrops.map((raw): WorldDropState => {
    const drop = objectRecord(raw);
    const originX = finiteCoordinate(drop.originX);
    const originY = finiteCoordinate(drop.originY);
    const stack = decodeWorldStack(drop.stack);
    if (!stack.itemId) throw new Error("World drop is empty.");
    return { id: stableString(drop.id), regionId: stableString(drop.regionId), originX, originY, stack };
  });
  const ids = new Set<string>();
  for (const entity of [...worldObjects, ...worldDrops]) {
    if (ids.has(entity.id)) throw new Error("World entity IDs overlap.");
    ids.add(entity.id);
    if (entity.id === DEFAULT_SHIPPING_BIN_ID) {
      if (!("kind" in entity) || entity.kind !== "shipping-bin") throw new Error("Default shipping identity is invalid.");
      continue;
    }
    const match = /^world-([1-9][0-9]*)$/u.exec(entity.id);
    if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) >= nextWorldEntitySequence) {
      throw new Error("World entity sequence moved backwards.");
    }
  }
  if (!worldObjects.some((object) => object.kind === "shipping-bin")) throw new Error("A farm must retain a shipping bin.");
  return { worldObjects, worldDrops, nextWorldEntitySequence };
}

/** Rejects current objects outside authored masks, exits, static terrain or another object's footprint. */
export function reconcileStorageWorldState(state: StorageWorldState & Partial<Pick<GameState, "resources" | "farmTiles" | "pet" | "player">>, catalog: WorldCatalog): void {
  const occupied = new Set<string>();
  for (const object of state.worldObjects) {
    const region = catalog.requireRegion(object.regionId);
    const width = object.kind === "shipping-bin" ? 2 : 1;
    const mask = object.kind === "shipping-bin" ? region.buildableTiles : region.placeableTiles;
    for (let offset = 0; offset < width; offset += 1) {
      const column = object.column + offset;
      const key = `${object.regionId}:${column}:${object.row}`;
      const index = object.row * region.collision.columns + column;
      const x = column * 16 + 8;
      const y = object.row * 16 + 8;
      if (column >= region.collision.columns || object.row >= region.collision.rows || !mask[index]
        || region.collision.blocked[index] || region.waterTiles[index] || catalog.exitAt(object.regionId, x, y)
        || occupied.has(key)) throw new Error("World object footprint is invalid.");
      occupied.add(key);
      if (state.resources && region.resources.some((spawn) => Math.floor(spawn.x / 16) === column
        && Math.floor(spawn.y / 16) === object.row && state.resources![spawn.entityId]
        && state.resources![spawn.entityId]!.phase !== "cleared")) throw new Error("World object overlaps a resource.");
      const tile = object.regionId === "farm" ? state.farmTiles?.[`farm:${column}:${object.row}`] : null;
      if (tile?.cropId || (tile && object.kind === "shipping-bin")) throw new Error("World object overlaps cultivated state.");
      if (state.pet?.regionId === object.regionId && state.pet.x + 4 > column * 16 && state.pet.x - 4 < (column + 1) * 16
        && state.pet.y + 3 > object.row * 16 && state.pet.y - 3 < (object.row + 1) * 16) throw new Error("World object overlaps the pet.");
      if (state.player?.regionId === object.regionId && state.player.x + 5 > column * 16 && state.player.x - 5 < (column + 1) * 16
        && state.player.y + 4 > object.row * 16 && state.player.y - 4 < (object.row + 1) * 16) throw new Error("World object overlaps the player.");
    }
  }
  for (const drop of state.worldDrops) {
    const region = catalog.requireRegion(drop.regionId);
    if (drop.originX >= region.widthPixels || drop.originY >= region.heightPixels) throw new Error("World drop lies outside its region.");
  }
}

/** Allocates one unique object/drop ID; callers preflight the mutation and save the containing candidate once. */
export function allocateWorldEntityId(state: StorageWorldState): string {
  if (!Number.isSafeInteger(state.nextWorldEntitySequence) || state.nextWorldEntitySequence < 1
    || state.nextWorldEntitySequence >= Number.MAX_SAFE_INTEGER) throw new Error("World entity sequence is exhausted.");
  const id = `world-${state.nextWorldEntitySequence}`;
  state.nextWorldEntitySequence += 1;
  return id;
}

/** Reports whether a tile is covered by an object/building, with an optional moving identity excluded. */
export function worldObjectCoversTile(state: StorageWorldState, regionId: string, column: number, row: number, ignoreObjectId?: string): boolean {
  return state.worldObjects.some((object) => object.id !== ignoreObjectId && object.regionId === regionId
    && object.row === row && column >= object.column && column < object.column + (object.kind === "shipping-bin" ? 2 : 1));
}

/** Narrows one client/save color token to the closed palette; hex styling is presentation-owned. */
export function isChestColorId(value: unknown): value is ChestColorId {
  return typeof value === "string" && CHEST_COLOR_IDS.some((color) => color === value);
}

/** Decodes a single owned stack using the item catalog's unique quantity ceiling. */
function decodeWorldStack(value: unknown): InventorySlot {
  const record = objectRecord(value);
  const quantity = nonNegativeInteger(record.quantity);
  if (record.itemId === "" && quantity === 0) return { itemId: "", quantity: 0 };
  if (typeof record.itemId !== "string") throw new Error("World stack item is invalid.");
  const definition = getItemDefinition(record.itemId as ItemId);
  if (!definition || definition.id !== record.itemId || quantity < 1 || quantity > definition.maxStack) throw new Error("World stack quantity is invalid.");
  return { itemId: definition.id, quantity };
}

/** Requires one plain record before decoding finite world data. */
function objectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("World state is invalid.");
  return value as Record<string, unknown>;
}

/** Requires a catalog-style stable ID rather than coercing arbitrary values. */
function stableString(value: unknown): string {
  if (typeof value !== "string") throw new Error("World identity is invalid.");
  assertStableId(value, "World identity");
  return value;
}

/** Requires a non-negative safe integer for tiles, amounts and monotonic counters. */
function nonNegativeInteger(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error("World integer is invalid.");
  return Number(value);
}

/** Requires a finite non-negative world coordinate without rounding away corruption. */
function finiteCoordinate(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error("World coordinate is invalid.");
  return value;
}
