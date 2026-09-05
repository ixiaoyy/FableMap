import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import type { GameState } from "../state/game-state.ts";
import type { WorldCatalog } from "../world/regions.ts";
import { STAMINA_COST } from "../stamina/definitions.ts";
import { StaminaSystem } from "../stamina/StaminaSystem.ts";
import { worldObjectCoversTile } from "../world/world-object-state.ts";

const GATHER_DISTANCE_PIXELS = 42;
const TREE_WOOD_YIELD = 3;
const STUMP_WOOD_YIELD = 1;
const OUTDOOR_TREE_REGROW_DAYS = 7;

export type GatheringResult =
  | "success"
  | "stump-cleared"
  | "no-effect"
  | "missing-target"
  | "depleted"
  | "too-far"
  | "inventory-full"
  | "insufficient-stamina";

export class GatheringSystem {
  /** Creates a pure gathering rule service backed only by the supplied inventory operations. */
  constructor(
    private readonly inventory: InventorySystem,
    private readonly catalog: WorldCatalog,
    private readonly stamina: StaminaSystem,
  ) {}

  /** Uses one selected item on a nearby tree and mutates only for an owned axe. */
  use(state: GameState, targetId: string, itemId: ItemId | ""): GatheringResult {
    const spawn = this.catalog.resource(targetId);
    const resource = state.resources[targetId];
    if (!spawn || !resource || spawn.kind !== "tree" || resource.kind !== "tree") return "missing-target";
    if (resource.phase === "cleared") return "depleted";
    if (state.player.regionId !== spawn.regionId) return "missing-target";
    if (Math.hypot(state.player.x - spawn.x, state.player.y - spawn.y) > GATHER_DISTANCE_PIXELS) {
      return "too-far";
    }
    if (itemId !== ITEM_ID.axe || this.inventory.quantity(state.inventory, ITEM_ID.axe) < 1) {
      return "no-effect";
    }
    const yieldQuantity = resource.phase === "standing" ? TREE_WOOD_YIELD : STUMP_WOOD_YIELD;
    if (!this.inventory.canAdd(state.inventory, ITEM_ID.wood, yieldQuantity)) {
      return "inventory-full";
    }
    if (!this.stamina.spend(state, STAMINA_COST.axe)) return "insufficient-stamina";
    const result: GatheringResult = resource.phase === "standing" ? "success" : "stump-cleared";
    resource.phase = resource.phase === "standing" ? "stump" : "cleared";
    resource.regrowOnDay = resource.phase === "cleared" && spawn.regionId !== "farm"
      ? state.day + OUTDOOR_TREE_REGROW_DAYS
      : null;
    if (!this.inventory.add(state.inventory, ITEM_ID.wood, yieldQuantity)) {
      throw new Error("Validated tree yield could not be added to inventory.");
    }
    return result;
  }

  /** Restores every cleared non-Farm tree whose deterministic regrow day has arrived. */
  settleDay(state: GameState): number {
    let regrown = 0;
    for (const resource of Object.values(state.resources)) {
      if (resource.kind !== "tree" || resource.phase !== "cleared" || resource.regrowOnDay === null) continue;
      if (resource.regrowOnDay > state.day) continue;
      const spawn = this.catalog.resource(resource.id);
      if (spawn && worldObjectCoversTile(state, spawn.regionId, Math.floor(spawn.x / 16), Math.floor(spawn.y / 16))) continue;
      resource.phase = "standing";
      resource.regrowOnDay = null;
      regrown += 1;
    }
    return regrown;
  }
}
