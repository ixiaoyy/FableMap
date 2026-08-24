import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { WorldCatalog } from "../world/regions.ts";

const GATHER_DISTANCE_PIXELS = 42;
const TREE_WOOD_YIELD = 3;

export type GatheringResult =
  | "success"
  | "missing-target"
  | "depleted"
  | "too-far"
  | "inventory-full";

export class GatheringSystem {
  /** Creates a pure gathering rule service backed only by the supplied inventory operations. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly catalog: WorldCatalog,
  ) {}

  /** Atomically depletes one nearby tree before awarding its unique wood yield. */
  gather(state: GameState, targetId: string): GatheringResult {
    const spawn = this.catalog.resource(targetId);
    const resource = state.resources[targetId];
    if (!spawn || !resource || spawn.kind !== "tree" || resource.kind !== "tree") return "missing-target";
    if (!resource.available) return "depleted";
    if (state.player.regionId !== spawn.regionId) return "missing-target";
    if (Math.hypot(state.player.x - spawn.x, state.player.y - spawn.y) > GATHER_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (!this.inventory.canAdd(state.inventory, ITEM_ID.wood, TREE_WOOD_YIELD)) {
      return "inventory-full";
    }
    resource.available = false;
    if (!this.inventory.add(state.inventory, ITEM_ID.wood, TREE_WOOD_YIELD)) {
      throw new Error("Validated tree yield could not be added to inventory.");
    }
    return "success";
  }
}
