import { InventorySystem } from "../inventory/InventorySystem.ts";
import { getRecipeDefinition, type ItemQuantity, type RecipeId } from "../recipes/definitions.ts";
import { getItemDefinition } from "../items/definitions.ts";
import type { GameState, InventorySlot } from "../state/game-state.ts";

export type CraftingQuantity = 1 | 5 | 25;
export type CraftingResult = "success" | "unknown-recipe" | "requirements-not-met" | "invalid-quantity" | "target-full";

export interface CraftingIngredientPreview extends ItemQuantity {
  readonly available: number;
  readonly missing: number;
}

export interface CraftingPreview {
  readonly recipeId: RecipeId;
  readonly known: boolean;
  readonly quantity: CraftingQuantity;
  readonly output: ItemQuantity;
  readonly ingredients: readonly CraftingIngredientPreview[];
  readonly canCraft: boolean;
}

export class CraftingSystem {
  /** Creates a pure crafting rule service backed only by the supplied inventory operations. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Projects a known recipe's multiplied materials and missing amounts without reserving or consuming gameplay items. */
  preview(state: Pick<GameState, "inventory">, recipeId: unknown, quantity: CraftingQuantity = 1): CraftingPreview | null {
    const recipe = getRecipeDefinition(recipeId);
    if (!recipe || !isCraftingQuantity(quantity)) return null;
    const ingredients = recipe.ingredients.map((ingredient) => {
      const available = this.inventory.quantity(state.inventory, ingredient.itemId);
      const required = ingredient.quantity * quantity;
      return { itemId: ingredient.itemId, quantity: required, available, missing: Math.max(0, required - available) };
    });
    return {
      recipeId: recipe.id, known: recipe.knownByDefault, quantity,
      output: { itemId: recipe.output.itemId, quantity: recipe.output.quantity * quantity },
      ingredients, canCraft: recipe.knownByDefault && ingredients.every((ingredient) => ingredient.missing === 0),
    };
  }

  /** Crafts one reviewed batch into an exact target slot after a complete candidate preflight; no cursor item is ever persisted. */
  craft(state: GameState, recipeId: unknown, quantity: CraftingQuantity = 1, targetSlot?: number): CraftingResult {
    if (!isCraftingQuantity(quantity)) return "invalid-quantity";
    const preview = this.preview(state, recipeId, quantity);
    if (!preview || !preview.known) return "unknown-recipe";
    if (!preview.canCraft) return "requirements-not-met";
    const candidate = state.inventory.map((slot) => ({ ...slot }));
    for (const ingredient of preview.ingredients) {
      if (!this.inventory.consume(candidate, ingredient.itemId, ingredient.quantity)) return "requirements-not-met";
    }
    const output = preview.output;
    const added = targetSlot === undefined
      ? this.inventory.add(candidate, output.itemId, output.quantity)
      : this.placeOutput(candidate, targetSlot, output);
    if (!added) return "target-full";
    this.inventory.restore(state.inventory, candidate);
    return "success";
  }

  /** Places a stackable batch into its exact slot, or starts a non-stackable tool batch there and preflights all remaining empty slots. */
  private placeOutput(candidate: InventorySlot[], targetSlot: number, output: ItemQuantity): boolean {
    const item = getItemDefinition(output.itemId);
    if (item?.maxStack !== 1 || output.quantity === 1) {
      return this.inventory.addAt(candidate, targetSlot, output.itemId, output.quantity);
    }
    if (!this.inventory.addAt(candidate, targetSlot, output.itemId, 1)) return false;
    return this.inventory.add(candidate, output.itemId, output.quantity - 1);
  }
}

/** Narrows untrusted batch sizes to the three released craft menu quantities. */
export function isCraftingQuantity(value: unknown): value is CraftingQuantity {
  return value === 1 || value === 5 || value === 25;
}
