import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { WorldCatalog } from "../world/regions.ts";

const GATHER_DISTANCE_PIXELS = 42;
const TREE_WOOD_YIELD = 3;

export type GatheringResult =
  | "success"
  | "no-effect"
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

  /** Uses one selected item on a nearby tree and mutates only for an owned axe. */
  use(state: GameState, targetId: string, itemId: ItemId | ""): GatheringResult {
    const spawn = this.catalog.resource(targetId);
    const resource = state.resources[targetId];
    if (!spawn || !resource || spawn.kind !== "tree" || resource.kind !== "tree") return "missing-target";
    if (!resource.available) return "depleted";
    if (state.player.regionId !== spawn.regionId) return "missing-target";
    if (Math.hypot(state.player.x - spawn.x, state.player.y - spawn.y) > GATHER_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (itemId !== ITEM_ID.axe || this.inventory.quantity(state.inventory, ITEM_ID.axe) < 1) {
      return "no-effect";
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
