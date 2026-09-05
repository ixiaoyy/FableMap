import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { RecipeId } from "../recipes/definitions.ts";
import type { RetentionEventId } from "../dialogue/definitions.ts";
import type { Facing } from "../world/facing.ts";
import type { PetSpecies } from "../pets/definitions.ts";

export type GameCommand =
  | { readonly type: "move"; readonly xAxis: -1 | 0 | 1; readonly yAxis: -1 | 0 | 1; readonly deltaMs: number }
  | { readonly type: "use-item-on-target"; readonly itemId: ItemId | ""; readonly targetId: string; readonly facing?: Facing }
  | { readonly type: "use-item-on-tile"; readonly itemId: ItemId | ""; readonly column: number; readonly row: number; readonly facing?: Facing }
  | { readonly type: "refill-watering-can"; readonly column: number; readonly row: number }
  | { readonly type: "eat-item"; readonly itemId: ItemId }
  | { readonly type: "craft"; readonly recipeId: RecipeId }
  | { readonly type: "sleep"; readonly bedId: string }
  | { readonly type: "retry-day-settlement" }
  | { readonly type: "claim-fishing-rod"; readonly npcId: string }
  | { readonly type: "talk-to-npc"; readonly npcId: string }
  | { readonly type: "gift-item-to-npc"; readonly npcId: string; readonly itemId: ItemId }
  | { readonly type: "buy-item"; readonly itemId: ItemId; readonly quantity: 1 }
  | { readonly type: "sell-item"; readonly itemId: ItemId; readonly quantity: 1 }
  | { readonly type: "upgrade-watering-can" }
  | { readonly type: "upgrade-backpack" }
  | { readonly type: "acknowledge-retention-event"; readonly eventId: RetentionEventId }
  | { readonly type: "adopt-pet"; readonly species: PetSpecies; readonly name: string }
  | { readonly type: "pet-home-pet" }
  | { readonly type: "start-fishing"; readonly zoneId: string }
  | { readonly type: "set-fishing-input"; readonly held: boolean }
  | { readonly type: "dismiss-fishing" }
  | { readonly type: "retry-fishing-save" }
  | { readonly type: "transition-region"; readonly exitId: string };

export interface ActionFeedback {
  readonly tone: "success" | "error";
  readonly code: string;
  readonly message: string;
}

export interface NpcInteractionResult {
  readonly kind: "npc-interaction";
  readonly npcId: string;
  readonly dialogueId: string;
  readonly baseDialogueId: string;
  readonly shopAvailable: boolean;
  readonly wateringServiceAvailable: boolean;
  readonly firstTalkToday: boolean;
  readonly feedback: ActionFeedback | null;
}

export type GameCommandResult = ActionFeedback | NpcInteractionResult | null;
