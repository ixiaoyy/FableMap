import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { STAMINA_COST } from "../stamina/definitions.ts";
import { StaminaSystem } from "../stamina/StaminaSystem.ts";
import type { GameState } from "../state/game-state.ts";
import { stableHash } from "../weather/WeatherSystem.ts";
import type { WorldCatalog } from "../world/regions.ts";

const MINING_INTERACTION_DISTANCE_PIXELS = 42;
const STONE_YIELD = 1;
const FOOTHILLS_STONES_PER_DAY = 2;

export type MiningResult =
  | "mined"
  | "missing-target"
  | "depleted"
  | "too-far"
  | "wrong-tool"
  | "inventory-full"
  | "insufficient-stamina";

export class MiningSystem {
  /** Creates the surface-stone rules over shared inventory, stamina and authored world owners. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly stamina: StaminaSystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Mines one nearby standing stone with the selected pickaxe and atomically grants one stone item. */
  use(state: GameState, targetId: string, itemId: ItemId | ""): MiningResult {
    const spawn = this.catalog.resource(targetId);
    const resource = state.resources[targetId];
    if (!spawn || !resource || spawn.kind !== "stone" || resource.kind !== "stone") {
      return "missing-target";
    }
    if (state.player.regionId !== spawn.regionId) return "missing-target";
    if (resource.phase !== "standing") return "depleted";
    if (Math.hypot(state.player.x - spawn.x, state.player.y - spawn.y) > MINING_INTERACTION_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (itemId !== ITEM_ID.pickaxe || this.inventory.quantity(state.inventory, ITEM_ID.pickaxe) < 1) {
      return "wrong-tool";
    }
    if (!this.inventory.canAdd(state.inventory, ITEM_ID.stone, STONE_YIELD)) return "inventory-full";
    if (!this.stamina.spend(state, STAMINA_COST.pickaxe)) return "insufficient-stamina";
    resource.phase = "cleared";
    if (!this.inventory.add(state.inventory, ITEM_ID.stone, STONE_YIELD)) {
      throw new Error("Validated stone yield could not be added atomically.");
    }
    return "mined";
  }

  /** Restores at most two cleared Foothills stone points for the already-incremented deterministic day. */
  settleDay(state: GameState): number {
    if (state.lastSurfaceStoneRefreshDay === state.day) return 0;
    if (state.lastSurfaceStoneRefreshDay > state.day) {
      throw new Error("Surface-stone refresh day is inconsistent.");
    }
    const candidates = this.catalog.requireRegion("foothills").resources
      .filter((spawn) => spawn.kind === "stone" && state.resources[spawn.entityId]?.phase === "cleared")
      .sort((left, right) => {
        const leftHash = stableHash(state.worldSeed, state.day, `surface-stone:${left.entityId}`);
        const rightHash = stableHash(state.worldSeed, state.day, `surface-stone:${right.entityId}`);
        return leftHash - rightHash || (left.entityId < right.entityId ? -1 : left.entityId > right.entityId ? 1 : 0);
      })
      .slice(0, FOOTHILLS_STONES_PER_DAY);
    for (const spawn of candidates) state.resources[spawn.entityId]!.phase = "standing";
    state.lastSurfaceStoneRefreshDay = state.day;
    return candidates.length;
  }
}
