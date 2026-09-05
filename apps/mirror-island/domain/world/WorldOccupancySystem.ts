import type { GameState } from "../state/game-state.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ForageSystem } from "../gathering/ForageSystem.ts";
import { activeNpcSpawnsInRegion } from "./npc-schedules.ts";
import { CHEST_ALLOWED_REGIONS, worldObjectCoversTile, type WorldObjectState } from "./world-object-state.ts";
import type { WorldCatalog, WorldPoint } from "./regions.ts";

export interface OccupancyActor extends WorldPoint { readonly regionId: string; readonly entityId?: string }
export type OccupancyStatus = "blocked" | "clear-on-place" | "relocate-on-place" | "free";
export interface OccupancyCell {
  readonly column: number;
  readonly row: number;
  readonly status: OccupancyStatus;
  readonly affectedIds: readonly string[];
}
export interface PlacementResult {
  readonly allowed: boolean;
  readonly status: OccupancyStatus;
  readonly cells: readonly OccupancyCell[];
  readonly clearFarmTileIds: readonly string[];
  readonly petDestination: ({ readonly regionId: "farm" | "cottage" } & WorldPoint) | null;
}

export class WorldOccupancySystem {
  private readonly forage: ForageSystem;

  /** Shares authored masks and read-only forage rules across placement, movement and resource restoration. */
  constructor(private readonly catalog: WorldCatalog) {
    this.forage = new ForageSystem(new InventorySystem(), catalog);
  }

  /** Evaluates a complete object footprint; an excluded ID is used only while moving that existing object. */
  placement(state: GameState, kind: WorldObjectState["kind"], regionId: string, column: number, row: number,
    ignoreObjectId?: string, npcs?: readonly OccupancyActor[]): PlacementResult {
    const region = this.catalog.requireRegion(regionId);
    const cells: OccupancyCell[] = [];
    const clearFarmTileIds: string[] = [];
    const width = kind === "shipping-bin" ? 2 : 1;
    const allowedRegion = kind === "shipping-bin" ? regionId === "farm" : CHEST_ALLOWED_REGIONS.some((id) => id === regionId);
    const actors = npcs ?? activeNpcSpawnsInRegion(this.catalog, regionId, state.minuteOfDay, { day: state.day, weather: state.weather.current });
    const activeForage = this.forage.activeSpawns(state, regionId);
    let needsPetMove = false;
    for (let offset = 0; offset < width; offset += 1) {
      const x = column + offset;
      const index = row * region.collision.columns + x;
      const ids: string[] = [];
      const mask = kind === "shipping-bin" ? region.buildableTiles : region.placeableTiles;
      let status: OccupancyStatus = "free";
      if (!allowedRegion || !Number.isSafeInteger(x) || !Number.isSafeInteger(row) || x < 0 || row < 0
        || x >= region.collision.columns || row >= region.collision.rows || !mask[index]
        || region.collision.blocked[index] || region.waterTiles[index] || this.catalog.exitAt(regionId, x * 16 + 8, row * 16 + 8)) {
        status = "blocked"; ids.push("terrain");
      }
      for (const object of state.worldObjects) {
        if (object.id !== ignoreObjectId && object.regionId === regionId && object.row === row
          && x >= object.column && x < object.column + (object.kind === "shipping-bin" ? 2 : 1)) {
          status = "blocked"; ids.push(object.id);
        }
      }
      for (const spawn of region.resources) {
        if (Math.floor(spawn.x / 16) !== x || Math.floor(spawn.y / 16) !== row) continue;
        if (state.resources[spawn.entityId]?.phase !== "cleared" && state.resources[spawn.entityId]) {
          status = "blocked"; ids.push(spawn.entityId);
        } else if (activeForage.some((candidate) => candidate.entityId === spawn.entityId)) {
          status = "blocked"; ids.push(spawn.entityId);
        }
      }
      const tile = regionId === "farm" ? state.farmTiles[`farm:${x}:${row}`] : undefined;
      if (tile?.cropId) { status = "blocked"; ids.push(tile.id); }
      else if (tile && kind === "shipping-bin") {
        clearFarmTileIds.push(tile.id); ids.push(tile.id);
        if (status === "free") status = "clear-on-place";
      }
      if (state.player.regionId === regionId && feetOverlapTile(state.player, x, row, 5, 4)) {
        status = "blocked"; ids.push("player");
      }
      for (const actor of actors) {
        if (actor.regionId === regionId && feetOverlapTile(actor, x, row, 5, 3)) {
          status = "blocked"; ids.push(actor.entityId ?? "npc");
        }
      }
      if (state.pet?.regionId === regionId && feetOverlapTile(state.pet, x, row, 4, 3)) {
        ids.push("home-pet");
        if (kind === "chest") status = "blocked";
        else { needsPetMove = true; if (status !== "blocked") status = "relocate-on-place"; }
      }
      cells.push({ column: x, row, status, affectedIds: ids });
    }
    let petDestination: PlacementResult["petDestination"] = null;
    if (needsPetMove && state.pet && !cells.some((cell) => cell.status === "blocked")) {
      petDestination = this.findPetDestination(state, regionId, column, row, width, actors, ignoreObjectId);
      if (!petDestination) return { allowed: false, status: "blocked", cells, clearFarmTileIds: [], petDestination: null };
    }
    const status = cells.some((cell) => cell.status === "blocked") ? "blocked"
      : needsPetMove ? "relocate-on-place" : clearFarmTileIds.length > 0 ? "clear-on-place" : "free";
    return { allowed: status !== "blocked", status, cells, clearFarmTileIds, petDestination };
  }

  /** Applies an immediately preceding candidate evaluation; callers then charge and create/move before one save. */
  applyPlacement(state: GameState, result: PlacementResult): boolean {
    if (!result.allowed) return false;
    for (const id of result.clearFarmTileIds) {
      if (state.farmTiles[id]?.cropId) return false;
    }
    if (result.petDestination && !state.pet) return false;
    for (const id of result.clearFarmTileIds) delete state.farmTiles[id];
    if (result.petDestination && state.pet) {
      Object.assign(state.pet, result.petDestination, { motion: "idle", pauseRemainingMs: 1_400 });
    }
    return true;
  }

  /** Tests actor feet against static collision and the same persistent object/resource footprint used by placement. */
  isBlocked(state: GameState, regionId: string, x: number, y: number, halfWidth = 5, halfHeight = 4,
    ignoreObjectId?: string, npcs: readonly OccupancyActor[] = []): boolean {
    if (this.catalog.isBlocked(regionId, x, y, halfWidth, halfHeight, [])) return true;
    const region = this.catalog.requireRegion(regionId);
    for (let row = Math.floor((y - halfHeight) / 16); row <= Math.floor((y + halfHeight) / 16); row += 1) {
      for (let column = Math.floor((x - halfWidth) / 16); column <= Math.floor((x + halfWidth) / 16); column += 1) {
        if (worldObjectCoversTile(state, regionId, column, row, ignoreObjectId)) return true;
        if (region.resources.some((spawn) => Math.floor(spawn.x / 16) === column && Math.floor(spawn.y / 16) === row
          && state.resources[spawn.entityId] && state.resources[spawn.entityId]!.phase !== "cleared")) return true;
      }
    }
    return npcs.some((npc) => npc.regionId === regionId && Math.abs(npc.x - x) < halfWidth + 5 && Math.abs(npc.y - y) < halfHeight + 3);
  }

  /** Finds a finite nearest safe pet tile outside the proposed building; this never moves the player or existing objects. */
  private findPetDestination(state: GameState, regionId: string, column: number, row: number, width: number,
    npcs: readonly OccupancyActor[], ignoreObjectId?: string): PlacementResult["petDestination"] {
    if (regionId !== "farm" && regionId !== "cottage") return null;
    const region = this.catalog.requireRegion(regionId);
    const candidates: { x: number; y: number; distance: number }[] = [];
    for (let targetRow = 0; targetRow < region.collision.rows; targetRow += 1) {
      for (let targetColumn = 0; targetColumn < region.collision.columns; targetColumn += 1) {
        if (targetRow === row && targetColumn >= column && targetColumn < column + width) continue;
        const x = targetColumn * 16 + 8; const y = targetRow * 16 + 8;
        if (this.isBlocked(state, regionId, x, y, 4, 3, ignoreObjectId, npcs) || this.catalog.exitAt(regionId, x, y)) continue;
        if (state.player.regionId === regionId && Math.hypot(state.player.x - x, state.player.y - y) < 16) continue;
        candidates.push({ x, y, distance: Math.hypot(x - state.pet!.x, y - state.pet!.y) });
      }
    }
    candidates.sort((left, right) => left.distance - right.distance || left.y - right.y || left.x - right.x);
    const target = candidates[0];
    return target ? { regionId, x: target.x, y: target.y } : null;
  }
}

/** Tests a foot rectangle against one tile without rounding boundary contacts into overlap. */
function feetOverlapTile(point: WorldPoint, column: number, row: number, halfWidth: number, halfHeight: number): boolean {
  return point.x + halfWidth > column * 16 && point.x - halfWidth < (column + 1) * 16
    && point.y + halfHeight > row * 16 && point.y - halfHeight < (row + 1) * 16;
}
