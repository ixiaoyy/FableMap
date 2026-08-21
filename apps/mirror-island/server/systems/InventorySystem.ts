import {
  INVENTORY_SLOT_COUNT,
  ITEM_ID,
  getItemDefinition,
  type ItemId,
} from "../../shared/items/definitions.ts";
import { getRecipeDefinition } from "../../shared/recipes/definitions.ts";
import { InventorySlotState, type PlayerState } from "../../shared/schemas/world-state.ts";

export interface InventorySlotSnapshot {
  readonly itemId: string;
  readonly quantity: number;
}

export class InventorySystem {
  /** Creates a fixed 24-slot inventory from a validated checkpoint or the reviewed starter loadout. */
  initialize(player: PlayerState, savedSlots?: readonly InventorySlotSnapshot[]): void {
    player.inventory.splice(0, player.inventory.length);
    for (let index = 0; index < INVENTORY_SLOT_COUNT; index += 1) {
      const slot = new InventorySlotState();
      const saved = savedSlots?.[index];
      const definition = getItemDefinition(saved?.itemId);
      if (
        definition
        && Number.isInteger(saved?.quantity)
        && Number(saved?.quantity) > 0
        && Number(saved?.quantity) <= definition.maxStack
      ) {
        slot.itemId = definition.id;
        slot.quantity = Number(saved?.quantity);
      }
      player.inventory.push(slot);
    }
    if (!savedSlots) {
      this.add(player, ITEM_ID.hoe, 1);
      this.add(player, ITEM_ID.alienSeed, 1);
      this.add(player, ITEM_ID.wateringCan, 1);
    }
  }

  /** Returns the total positive quantity of one reviewed item across all slots. */
  quantity(player: PlayerState, itemId: ItemId): number {
    return player.inventory.reduce(
      (total, slot) => total + (slot.itemId === itemId ? slot.quantity : 0),
      0,
    );
  }

  /** Reports whether existing stacks and empty slots can hold the complete requested quantity. */
  canAdd(player: PlayerState, itemId: ItemId, quantity: number): boolean {
    const definition = getItemDefinition(itemId);
    if (!definition || !Number.isInteger(quantity) || quantity <= 0) return false;
    let capacity = 0;
    for (const slot of player.inventory) {
      if (slot.itemId === itemId) capacity += definition.maxStack - slot.quantity;
      else if (slot.itemId === "") capacity += definition.maxStack;
      if (capacity >= quantity) return true;
    }
    return false;
  }

  /** Adds a complete quantity across partial stacks and empty slots without leaving partial success. */
  add(player: PlayerState, itemId: ItemId, quantity: number): boolean {
    const definition = getItemDefinition(itemId);
    if (!definition || !this.canAdd(player, itemId, quantity)) return false;
    let remaining = quantity;
    for (const slot of player.inventory) {
      if (slot.itemId !== itemId || slot.quantity >= definition.maxStack) continue;
      const moved = Math.min(remaining, definition.maxStack - slot.quantity);
      slot.quantity += moved;
      remaining -= moved;
      if (remaining === 0) return true;
    }
    for (const slot of player.inventory) {
      if (slot.itemId !== "") continue;
      const moved = Math.min(remaining, definition.maxStack);
      slot.itemId = itemId;
      slot.quantity = moved;
      remaining -= moved;
      if (remaining === 0) return true;
    }
    return remaining === 0;
  }

  /** Removes a complete quantity across slots only after verifying the full amount is present. */
  consume(player: PlayerState, itemId: ItemId, quantity: number): boolean {
    if (!Number.isInteger(quantity) || quantity <= 0 || this.quantity(player, itemId) < quantity) {
      return false;
    }
    let remaining = quantity;
    for (const slot of player.inventory) {
      if (slot.itemId !== itemId) continue;
      const moved = Math.min(remaining, slot.quantity);
      slot.quantity -= moved;
      remaining -= moved;
      if (slot.quantity === 0) slot.itemId = "";
      if (remaining === 0) return true;
    }
    return false;
  }

  /** Applies one shared recipe atomically, restoring the exact inventory snapshot on output failure. */
  craft(player: PlayerState, recipeId: unknown): boolean {
    const recipe = getRecipeDefinition(recipeId);
    if (!recipe) return false;
    if (recipe.ingredients.some((item) => this.quantity(player, item.itemId) < item.quantity)) {
      return false;
    }
    const before = this.snapshot(player);
    for (const ingredient of recipe.ingredients) {
      if (!this.consume(player, ingredient.itemId, ingredient.quantity)) {
        this.initialize(player, before);
        return false;
      }
    }
    if (!this.add(player, recipe.output.itemId, recipe.output.quantity)) {
      this.initialize(player, before);
      return false;
    }
    return true;
  }

  /** Serializes only bounded item IDs and quantities for process-local checkpoint storage. */
  snapshot(player: PlayerState): readonly InventorySlotSnapshot[] {
    return player.inventory.map((slot) => ({ itemId: slot.itemId, quantity: slot.quantity }));
  }
}
