import { InventorySystem } from "../inventory/InventorySystem.ts";
import { getRecipeDefinition } from "../recipes/definitions.ts";
import type { GameState } from "../state/game-state.ts";

export type CraftingResult = "success" | "unknown-recipe" | "requirements-not-met";

export class CraftingSystem {
  /** Creates a pure crafting rule service backed only by the supplied inventory operations. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Resolves an untrusted recipe ID and applies its ingredients and output atomically. */
  craft(state: GameState, recipeId: unknown): CraftingResult {
    const recipe = getRecipeDefinition(recipeId);
    if (!recipe) return "unknown-recipe";
    if (recipe.ingredients.some((item) => (
      this.inventory.quantity(state.inventory, item.itemId) < item.quantity
    ))) {
      return "requirements-not-met";
    }
    const before = state.inventory.map((slot) => ({ ...slot }));
    for (const ingredient of recipe.ingredients) {
      if (!this.inventory.consume(state.inventory, ingredient.itemId, ingredient.quantity)) {
        this.inventory.restore(state.inventory, before);
        return "requirements-not-met";
      }
    }
    if (!this.inventory.add(state.inventory, recipe.output.itemId, recipe.output.quantity)) {
      this.inventory.restore(state.inventory, before);
      return "requirements-not-met";
    }
    return "success";
  }
}
