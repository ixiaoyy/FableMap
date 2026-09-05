import type { ItemId } from "../items/definitions.ts";
import type { RecipeId } from "../recipes/definitions.ts";
import type { RetentionEventId } from "../dialogue/definitions.ts";
import type { Facing } from "../world/facing.ts";
import type { PetSpecies } from "../pets/definitions.ts";

export type GameCommand =
  | StorageCommand
  | { readonly type: "move"; readonly xAxis: -1 | 0 | 1; readonly yAxis: -1 | 0 | 1; readonly deltaMs: number }
  | { readonly type: "use-item-on-target"; readonly itemId: ItemId | ""; readonly targetId: string; readonly facing?: Facing }
  | { readonly type: "use-item-on-tile"; readonly itemId: ItemId | ""; readonly column: number; readonly row: number; readonly facing?: Facing }
  | { readonly type: "refill-watering-can"; readonly column: number; readonly row: number }
  | { readonly type: "eat-item"; readonly itemId: ItemId }
  | { readonly type: "sleep"; readonly bedId: string }
  | { readonly type: "retry-day-settlement" }
  | { readonly type: "claim-fishing-rod"; readonly npcId: string }
  | { readonly type: "talk-to-npc"; readonly npcId: string }
  | { readonly type: "gift-item-to-npc"; readonly npcId: string; readonly itemId: ItemId }
  | { readonly type: "buy-item"; readonly itemId: ItemId; readonly quantity: 1 }
  | { readonly type: "sell-item"; readonly itemId: ItemId; readonly quantity: 1 }
  | { readonly type: "upgrade-watering-can" }
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

export type SlotTransferAmount = "stack" | "one" | "half";

export type StorageCommand =
  | { readonly type: "move-inventory"; readonly sourceIndex: number; readonly targetIndex: number; readonly amount: SlotTransferAmount }
  | { readonly type: "sort-inventory" }
  | { readonly type: "rotate-hotbar-row"; readonly direction: 1 | -1 }
  | { readonly type: "craft-item"; readonly recipeId: RecipeId; readonly quantity: 1 | 5 | 25; readonly targetIndex: number }
  | { readonly type: "buy-backpack-upgrade"; readonly interactionId: string }
  | { readonly type: "place-world-object"; readonly inventoryIndex: number; readonly column: number; readonly row: number }
  | { readonly type: "transfer-container-item"; readonly objectId: string; readonly direction: "to-chest" | "from-chest"; readonly sourceIndex: number; readonly targetIndex: number; readonly amount: SlotTransferAmount }
  | { readonly type: "add-to-existing-stacks"; readonly objectId: string }
  | { readonly type: "move-container-item"; readonly objectId: string; readonly sourceIndex: number; readonly targetIndex: number; readonly amount: SlotTransferAmount }
  | { readonly type: "sort-container"; readonly objectId: string }
  | { readonly type: "set-chest-color"; readonly objectId: string; readonly colorId: string }
  | { readonly type: "recover-empty-chest"; readonly objectId: string; readonly itemId: ItemId | "" }
  | { readonly type: "push-chest"; readonly objectId: string; readonly itemId: ItemId | ""; readonly facing: Facing }
  | { readonly type: "collect-world-drop"; readonly dropId: string }
  | { readonly type: "ship-item"; readonly objectId: string; readonly sourceIndex: number; readonly quantity: "one" | "stack" }
  | { readonly type: "reclaim-last-shipment"; readonly objectId: string }
  | { readonly type: "build-shipping-bin"; readonly interactionId: string; readonly column: number; readonly row: number }
  | { readonly type: "move-farm-building"; readonly interactionId: string; readonly objectId: string; readonly column: number; readonly row: number }
  | { readonly type: "demolish-farm-building"; readonly interactionId: string; readonly objectId: string }
  | { readonly type: "dismiss-day-settlement" }
  | { readonly type: "retry-storage-save" };

export interface StorageSaveSnapshot {
  readonly phase: "idle" | "saving" | "failed";
  readonly feedback: ActionFeedback | null;
}
