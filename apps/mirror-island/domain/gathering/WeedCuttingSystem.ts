import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { farmTileId, type GameState } from "../state/game-state.ts";
import { stableHash } from "../weather/WeatherSystem.ts";
import { isPointInFacingSector, type Facing } from "../world/facing.ts";
import type { WorldCatalog, WorldPoint } from "../world/regions.ts";

const WEED_INTERACTION_DISTANCE_PIXELS = 42;
const MAX_WEEDS_PER_SWING = 3;
const SURFACE_WEED_REGIONS = ["farm", "foothills", "lakeshore"] as const;
const WEEDS_RESTORED_PER_DAY: Readonly<Record<(typeof SURFACE_WEED_REGIONS)[number], number>> = {
  farm: 1,
  foothills: 2,
  lakeshore: 1,
};

type WeedCuttingFailure = "missing-target" | "depleted" | "too-far" | "wrong-tool" | "wrong-direction" | "inventory-full";

export type WeedCuttingResult =
  | { readonly code: "cut"; readonly cutCount: number; readonly fiberCount: number }
  | { readonly code: WeedCuttingFailure; readonly cutCount: 0; readonly fiberCount: 0 };

export class WeedCuttingSystem {
  /** Creates deterministic surface-weed rules over the shared inventory and authored world catalog. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Cuts up to three facing-sector weeds around one valid target and grants the complete deterministic fiber yield atomically. */
  use(
    state: GameState,
    targetId: string,
    itemId: ItemId | "",
    facing?: Facing,
  ): WeedCuttingResult {
    const spawn = this.catalog.resource(targetId);
    const resource = state.resources[targetId];
    if (!spawn || !resource || spawn.kind !== "weed" || resource.kind !== "weed") {
      return failed("missing-target");
    }
    if (state.player.regionId !== spawn.regionId) return failed("missing-target");
    if (resource.phase !== "standing") return failed("depleted");
    if (distanceBetween(state.player, spawn) > WEED_INTERACTION_DISTANCE_PIXELS) return failed("too-far");
    if (itemId !== ITEM_ID.scythe || this.inventory.quantity(state.inventory, ITEM_ID.scythe) < 1) {
      return failed("wrong-tool");
    }
    if (!facing || !isPointInFacingSector(state.player, spawn, facing)) return failed("wrong-direction");

    const targets = this.catalog.requireRegion(spawn.regionId).resources
      .filter((candidate) => candidate.kind === "weed")
      .filter((candidate) => state.resources[candidate.entityId]?.phase === "standing")
      .filter((candidate) => distanceBetween(state.player, candidate) <= WEED_INTERACTION_DISTANCE_PIXELS)
      .filter((candidate) => isPointInFacingSector(state.player, candidate, facing))
      .sort((left, right) => {
        const distanceDelta = squaredDistance(state.player, left) - squaredDistance(state.player, right);
        return distanceDelta || compareStableIds(left.entityId, right.entityId);
      })
      .slice(0, MAX_WEEDS_PER_SWING);
    const fiberCount = targets.filter((candidate) => (
      stableHash(state.worldSeed, state.day, `weed-fiber:${candidate.entityId}`) % 2 === 0
    )).length;
    if (fiberCount > 0 && !this.inventory.canAdd(state.inventory, ITEM_ID.fiber, fiberCount)) {
      return failed("inventory-full");
    }
    for (const candidate of targets) state.resources[candidate.entityId]!.phase = "cleared";
    if (fiberCount > 0 && !this.inventory.add(state.inventory, ITEM_ID.fiber, fiberCount)) {
      throw new Error("Validated weed fiber yield could not be added atomically.");
    }
    return { code: "cut", cutCount: targets.length, fiberCount };
  }

  /** Restores a stable bounded set of cleared weeds for the incremented day while never covering cultivated Farm tiles. */
  settleDay(state: GameState): number {
    if (state.lastSurfaceWeedRefreshDay === state.day) return 0;
    if (state.lastSurfaceWeedRefreshDay > state.day) {
      throw new Error("Surface-weed refresh day is inconsistent.");
    }
    let restored = 0;
    for (const regionId of SURFACE_WEED_REGIONS) {
      const candidates = this.catalog.requireRegion(regionId).resources
        .filter((spawn) => spawn.kind === "weed" && state.resources[spawn.entityId]?.phase === "cleared")
        .filter((spawn) => regionId !== "farm" || !state.farmTiles[farmTileId(
          Math.floor(spawn.x / 16),
          Math.floor(spawn.y / 16),
        )])
        .sort((left, right) => {
          const leftHash = stableHash(state.worldSeed, state.day, `surface-weed:${left.entityId}`);
          const rightHash = stableHash(state.worldSeed, state.day, `surface-weed:${right.entityId}`);
          return leftHash - rightHash || compareStableIds(left.entityId, right.entityId);
        })
        .slice(0, WEEDS_RESTORED_PER_DAY[regionId]);
      for (const spawn of candidates) state.resources[spawn.entityId]!.phase = "standing";
      restored += candidates.length;
    }
    state.lastSurfaceWeedRefreshDay = state.day;
    return restored;
  }
}

/** Returns a closed zero-mutation result for one rejected weed-cutting command. */
function failed(code: WeedCuttingFailure): WeedCuttingResult {
  return { code, cutCount: 0, fiberCount: 0 };
}

/** Reports Euclidean distance between two world points for the shared interaction boundary. */
function distanceBetween(left: WorldPoint, right: WorldPoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

/** Returns squared point distance for deterministic nearest-first ordering without a square root. */
function squaredDistance(left: WorldPoint, right: WorldPoint): number {
  const x = left.x - right.x;
  const y = left.y - right.y;
  return x * x + y * y;
}

/** Compares stable entity IDs without locale-dependent ordering. */
function compareStableIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
