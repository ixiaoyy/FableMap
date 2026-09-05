import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, getItemDefinition } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import { stableHash } from "../weather/WeatherSystem.ts";
import { facingVector, type Facing } from "./facing.ts";
import { WorldDropSystem } from "./WorldDropSystem.ts";
import { WorldOccupancySystem, type OccupancyActor } from "./WorldOccupancySystem.ts";
import { allocateWorldEntityId, CHEST_SLOT_COUNT, type ChestWorldObject, type WorldObjectState } from "./world-object-state.ts";
import type { WorldCatalog, WorldPoint } from "./regions.ts";

export type WorldObjectResult = "placed" | "opened" | "recovered" | "pushed" | "destroyed-with-drops"
  | "missing-object" | "too-far" | "blocked" | "missing-item" | "not-empty" | "inventory-full";

export class WorldObjectSystem {
  private readonly occupancy: WorldOccupancySystem;
  private readonly drops: WorldDropSystem;

  /** Composes placement, inventory and persistent debris over a single candidate state. */
  constructor(private readonly inventory: InventorySystem, private readonly catalog: WorldCatalog) {
    this.occupancy = new WorldOccupancySystem(catalog);
    this.drops = new WorldDropSystem(inventory);
  }

  /** Places one selected chest on an authored nearby legal tile, consuming exactly one item after all validation. */
  placeChest(state: GameState, inventoryIndex: number, regionId: string, column: number, row: number,
    npcs?: readonly OccupancyActor[]): WorldObjectResult {
    const slot = state.inventory[inventoryIndex];
    const item = slot ? getItemDefinition(slot.itemId) : null;
    if (!slot || slot.itemId !== ITEM_ID.chest || slot.quantity < 1 || item?.placement?.kind !== "chest") return "missing-item";
    if (regionId !== state.player.regionId || Math.hypot(state.player.x - (column * 16 + 8), state.player.y - (row * 16 + 8)) > 48) return "too-far";
    if (!item.placement.allowedRegions.includes(regionId)) return "blocked";
    const result = this.occupancy.placement(state, "chest", regionId, column, row, undefined, npcs);
    if (!result.allowed) return "blocked";
    if (state.nextWorldEntitySequence >= Number.MAX_SAFE_INTEGER) return "blocked";
    const chest: ChestWorldObject = { id: allocateWorldEntityId(state), kind: "chest", regionId, column, row,
      colorId: "default", slots: Array.from({ length: CHEST_SLOT_COUNT }, () => ({ itemId: "", quantity: 0 })) };
    if (!this.inventory.consumeAt(state.inventory, inventoryIndex, 1)) throw new Error("Validated chest placement lost its item.");
    state.worldObjects.push(chest);
    return "placed";
  }

  /** Checks reachability for opening without granting the client any mutation authority. */
  interact(state: GameState, id: string): WorldObjectResult {
    const object = state.worldObjects.find((candidate) => candidate.id === id);
    if (!object || object.regionId !== state.player.regionId) return "missing-object";
    return this.isNearby(state, object) ? "opened" : "too-far";
  }

  /** Recovers only an empty nearby chest after the full box item fits in the backpack. */
  recoverChest(state: GameState, id: string): WorldObjectResult {
    const chest = state.worldObjects.find((candidate) => candidate.id === id);
    if (!chest || chest.kind !== "chest" || chest.regionId !== state.player.regionId) return "missing-object";
    if (!this.isNearby(state, chest)) return "too-far";
    if (chest.slots.some((slot) => slot.itemId !== "")) return "not-empty";
    if (!this.inventory.add(state.inventory, ITEM_ID.chest, 1)) return "inventory-full";
    state.worldObjects.splice(state.worldObjects.indexOf(chest), 1);
    return "recovered";
  }

  /** Uses an original bounded DFS implementation of the recorded behavior; failed NPC movement drops contents before deleting the box. */
  pushChest(state: GameState, id: string, actor: "player" | "npc", facing?: Facing,
    npcs?: readonly OccupancyActor[]): WorldObjectResult {
    const chest = state.worldObjects.find((candidate) => candidate.id === id);
    if (!chest || chest.kind !== "chest") return "missing-object";
    if (actor === "player" && (chest.regionId !== state.player.regionId || !this.isNearby(state, chest))) return "too-far";
    const preferred = actor === "player" ? facing ?? "down" : "down";
    let randomState = stableHash(state.worldSeed, state.day, `chest-push:${id}:${chest.column}:${chest.row}:${state.minuteOfDay}`) >>> 0;
    /** Advances a candidate-local generator; no global randomness can change a failed-save retry. */
    const nextRandom = (): number => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
    /** Shuffles independently for each visit, then gives the reviewed preferred and opposite directions precedence. */
    const directions = (): Facing[] => {
      const values: Facing[] = ["right", "left", "up", "down"];
      for (let index = values.length - 1; index > 0; index -= 1) {
        const other = Math.floor(nextRandom() * (index + 1));
        [values[index], values[other]] = [values[other]!, values[index]!];
      }
      const opposite: Record<Facing, Facing> = { left: "right", right: "left", up: "down", down: "up" };
      return [preferred, opposite[preferred], ...values.filter((direction) => direction !== preferred && direction !== opposite[preferred])];
    };
    /** Checks all neighbors before depth-first traversal; depth three still checks neighbors and allows four-step destinations. */
    const search = (column: number, row: number, depth: number): WorldPoint | null => {
      for (const direction of directions()) {
        const delta = facingVector(direction); const targetColumn = column + delta.x; const targetRow = row + delta.y;
        if (targetColumn === chest.column && targetRow === chest.row) continue;
        if (this.occupancy.placement(state, "chest", chest.regionId, targetColumn, targetRow, chest.id, npcs).allowed) {
          return { x: targetColumn, y: targetRow };
        }
      }
      if (depth >= 3) return null;
      for (const direction of directions()) {
        const delta = facingVector(direction); const targetColumn = column + delta.x; const targetRow = row + delta.y;
        if (this.occupancy.isBlocked(state, chest.regionId, targetColumn * 16 + 8, targetRow * 16 + 8, 4, 3, chest.id)) continue;
        const found = search(targetColumn, targetRow, depth + 1);
        if (found) return found;
      }
      return null;
    };
    const target = search(chest.column, chest.row, 0);
    if (target) { chest.column = target.x; chest.row = target.y; return "pushed"; }
    if (actor === "player") return "blocked";
    this.drops.create(state, chest.regionId, chest.column * 16 + 8, chest.row * 16 + 8, chest.slots);
    state.worldObjects.splice(state.worldObjects.indexOf(chest), 1);
    return "destroyed-with-drops";
  }

  /** Measures reach to the closest point of a building footprint, preserving the same distance for either half. */
  private isNearby(state: GameState, object: WorldObjectState): boolean {
    const left = object.column * 16; const top = object.row * 16;
    const right = left + (object.kind === "shipping-bin" ? 32 : 16);
    const nearestX = Math.max(left, Math.min(right, state.player.x));
    const nearestY = Math.max(top, Math.min(top + 16, state.player.y));
    return Math.hypot(state.player.x - nearestX, state.player.y - nearestY) <= 48;
  }
}
