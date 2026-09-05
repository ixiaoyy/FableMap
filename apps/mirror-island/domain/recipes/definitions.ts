import { ITEM_ID, type ItemId } from "../items/definitions.ts";

export const RECIPE_ID = {
  woodenAxe: "wooden-axe",
  chest: "chest",
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
  readonly knownByDefault: boolean;
}

export const RECIPE_DEFINITIONS: Readonly<Record<RecipeId, RecipeDefinition>> = {
  [RECIPE_ID.woodenAxe]: {
    id: RECIPE_ID.woodenAxe,
    name: "制作木斧",
    ingredients: [{ itemId: ITEM_ID.wood, quantity: 3 }],
    output: { itemId: ITEM_ID.axe, quantity: 1 },
    knownByDefault: true,
  },
  [RECIPE_ID.chest]: {
    id: RECIPE_ID.chest,
    name: "普通箱",
    ingredients: [{ itemId: ITEM_ID.wood, quantity: 50 }],
    output: { itemId: ITEM_ID.chest, quantity: 1 },
    knownByDefault: true,
  },
};

/** Returns one reviewed recipe definition, or null when an unknown value is not a registered recipe ID. */
export function getRecipeDefinition(recipeId: unknown): RecipeDefinition | null {
  if (typeof recipeId !== "string" || !Object.hasOwn(RECIPE_DEFINITIONS, recipeId)) return null;
  return RECIPE_DEFINITIONS[recipeId as RecipeId] ?? null;
}
