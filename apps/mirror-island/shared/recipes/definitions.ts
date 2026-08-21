import { ITEM_ID, type ItemId } from "../items/definitions.ts";

export const RECIPE_ID = {
  woodenAxe: "wooden-axe",
} as const;

export type RecipeId = (typeof RECIPE_ID)[keyof typeof RECIPE_ID];

export interface ItemQuantity {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface RecipeDefinition {
  readonly id: RecipeId;
  readonly name: string;
  readonly ingredients: readonly ItemQuantity[];
  readonly output: ItemQuantity;
}

export const RECIPE_DEFINITIONS: Readonly<Record<RecipeId, RecipeDefinition>> = {
  [RECIPE_ID.woodenAxe]: {
    id: RECIPE_ID.woodenAxe,
    name: "制作木斧",
    ingredients: [{ itemId: ITEM_ID.wood, quantity: 3 }],
    output: { itemId: ITEM_ID.axe, quantity: 1 },
  },
};

/** Returns one reviewed recipe definition, or null when an untrusted ID is unknown. */
export function getRecipeDefinition(recipeId: unknown): RecipeDefinition | null {
  if (typeof recipeId !== "string") return null;
  return RECIPE_DEFINITIONS[recipeId as RecipeId] ?? null;
}
