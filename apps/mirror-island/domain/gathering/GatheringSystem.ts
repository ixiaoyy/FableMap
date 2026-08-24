import { ITEM_ID } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";

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
  constructor(private readonly inventory: InventorySystem) {}

  /** Atomically depletes one nearby tree before awarding its unique wood yield. */
  gather(state: GameState, targetId: string): GatheringResult {
    const resource = state.resources[targetId];
    if (!resource) return "missing-target";
    if (!resource.available) return "depleted";
    if (Math.hypot(state.player.x - resource.x, state.player.y - resource.y) > GATHER_DISTANCE_PIXELS) {
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
