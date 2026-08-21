import { ITEM_ID } from "../../shared/items/definitions.ts";
import type { PlayerState, WorldState } from "../../shared/schemas/world-state.ts";
import { InventorySystem } from "./InventorySystem.ts";

const GATHER_DISTANCE_PIXELS = 42;
const TREE_WOOD_YIELD = 3;

export type GatheringResult =
  | "success"
  | "missing-target"
  | "depleted"
  | "too-far"
  | "inventory-full";

export class GatheringSystem {
  constructor(
    private readonly world: WorldState,
    private readonly inventory: InventorySystem,
  ) {}

  /** Atomically depletes one nearby tree before awarding its unique wood yield. */
  gather(player: PlayerState, targetId: string): GatheringResult {
    const resource = this.world.resources.get(targetId);
    if (!resource) return "missing-target";
    if (!resource.available) return "depleted";
    if (Math.hypot(player.x - resource.x, player.y - resource.y) > GATHER_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (!this.inventory.canAdd(player, ITEM_ID.wood, TREE_WOOD_YIELD)) {
      return "inventory-full";
    }

    resource.available = false;
    resource.revision += 1;
    if (!this.inventory.add(player, ITEM_ID.wood, TREE_WOOD_YIELD)) {
      throw new Error("Validated tree yield could not be added to inventory.");
    }
    return "success";
  }
}
