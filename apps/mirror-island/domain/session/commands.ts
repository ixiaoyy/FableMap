import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { RecipeId } from "../recipes/definitions.ts";

export type GameCommand =
  | { readonly type: "move"; readonly xAxis: -1 | 0 | 1; readonly yAxis: -1 | 0 | 1; readonly deltaMs: number }
  | { readonly type: "use-item-on-target"; readonly itemId: ItemId | ""; readonly targetId: string }
  | { readonly type: "craft"; readonly recipeId: RecipeId }
  | { readonly type: "sleep"; readonly bedId: string }
  | { readonly type: "talk-to-npc"; readonly npcId: string }
  | { readonly type: "buy-item"; readonly itemId: typeof ITEM_ID.turnipSeed; readonly quantity: 1 }
  | { readonly type: "sell-item"; readonly itemId: typeof ITEM_ID.turnip; readonly quantity: 1 }
  | { readonly type: "transition-region"; readonly exitId: string };

export interface ActionFeedback {
  readonly tone: "success" | "error";
  readonly code: string;
  readonly message: string;
}
