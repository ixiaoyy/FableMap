import type { PlayerState } from "../../shared/schemas/world-state.ts";
import { getRecipeDefinition } from "../../shared/recipes/definitions.ts";
import { InventorySystem } from "./InventorySystem.ts";

export type CraftingResult = "success" | "unknown-recipe" | "requirements-not-met";

export class CraftingSystem {
  constructor(private readonly inventory: InventorySystem) {}

  /** Resolves an untrusted recipe ID through shared definitions and delegates one atomic craft. */
  craft(player: PlayerState, recipeId: string): CraftingResult {
    if (!getRecipeDefinition(recipeId)) return "unknown-recipe";
    return this.inventory.craft(player, recipeId) ? "success" : "requirements-not-met";
  }
}
