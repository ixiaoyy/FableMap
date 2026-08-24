import type { RecipeId } from "../recipes/definitions.ts";

export type GameCommand =
  | { readonly type: "move"; readonly xAxis: -1 | 0 | 1; readonly yAxis: -1 | 0 | 1; readonly deltaMs: number }
  | { readonly type: "gather"; readonly targetId: string }
  | { readonly type: "craft"; readonly recipeId: RecipeId }
  | { readonly type: "farm-primary"; readonly tileId: string };

export interface ActionFeedback {
  readonly tone: "success" | "error";
  readonly code: string;
  readonly message: string;
}
