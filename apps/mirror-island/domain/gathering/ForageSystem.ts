import { DAYS_PER_SEASON, playableCalendarAt } from "../calendar/game-calendar.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import type { ResourceSpawnDefinition, WorldCatalog } from "../world/regions.ts";
import { worldObjectCoversTile } from "../world/world-object-state.ts";

const FORAGE_INTERACTION_DISTANCE_PIXELS = 42;

export type ForageResult = "collected" | "missing-forage" | "inactive" | "too-far" | "inventory-full";

export class ForageSystem {
  /** Creates deterministic seasonal forage collection over catalog candidate points. */
  constructor(private readonly inventory: InventorySystem, private readonly catalog: WorldCatalog) {}

  /** Returns active uncollected spring forage candidates for one region and game day. */
  activeSpawns(state: GameState, regionId: string): readonly ResourceSpawnDefinition[] {
    if (playableCalendarAt(state.day).season !== "spring") return [];
    const dayOfCycle = (state.day - 1) % DAYS_PER_SEASON + 1;
    const collected = new Set(state.dailyForage.day === state.day ? state.dailyForage.collectedIds : []);
    return this.catalog.requireRegion(regionId).resources.filter((spawn) => {
      if (worldObjectCoversTile(state, regionId, Math.floor(spawn.x / 16), Math.floor(spawn.y / 16))) return false;
      if (spawn.kind === "bamboo-shoot" && regionId === "foothills" && (dayOfCycle < 4 || dayOfCycle > 14)) return false;
      const farmTile = regionId === "farm"
        ? state.farmTiles[`farm:${Math.floor(spawn.x / 16)}:${Math.floor(spawn.y / 16)}`]
        : null;
      if (farmTile) return false;
      const appears = spawn.kind === "fallen-branch"
        ? state.weather.current === "wind" || forageAppearsOnDay(`${spawn.entityId}:branch`, state.day)
        : forageAppearsOnDay(spawn.entityId, state.day);
      return forageItemId(spawn.kind) !== null && appears && !collected.has(spawn.entityId);
    });
  }

  /** Atomically collects one active nearby forage point into inventory and marks it for this day. */
  collect(state: GameState, entityId: string): ForageResult {
    const spawn = this.catalog.resource(entityId);
    const itemId = spawn ? forageItemId(spawn.kind) : null;
    if (!spawn || !itemId || spawn.regionId !== state.player.regionId) return "missing-forage";
    if (!this.activeSpawns(state, spawn.regionId).some((candidate) => candidate.entityId === entityId)) return "inactive";
    if (Math.hypot(state.player.x - spawn.x, state.player.y - spawn.y) > FORAGE_INTERACTION_DISTANCE_PIXELS) return "too-far";
    if (!this.inventory.add(state.inventory, itemId, 1)) return "inventory-full";
    if (state.dailyForage.day !== state.day) state.dailyForage = { day: state.day, collectedIds: [] };
    state.dailyForage.collectedIds.push(entityId);
    return "collected";
  }
}

/** Maps only seasonal forage resource kinds into their inventory item IDs. */
export function forageItemId(kind: ResourceSpawnDefinition["kind"]): ItemId | null {
  if (kind === "spring-wildflower") return ITEM_ID.springWildflower;
  if (kind === "bamboo-shoot") return ITEM_ID.bambooShoot;
  if (kind === "fallen-branch") return ITEM_ID.wood;
  return null;
}

/** Selects a stable two-thirds daily subset without runtime randomness or saved coordinates. */
export function forageAppearsOnDay(entityId: string, absoluteDay: number): boolean {
  let hash = 2166136261;
  for (const character of entityId) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return Math.abs(hash + absoluteDay) % 3 !== 0;
}
