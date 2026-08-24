import {
  getItemDefinition,
  type ItemId,
} from "../items/definitions.ts";
import type { InventorySlot } from "../state/game-state.ts";

export class InventorySystem {
  /** Returns the total positive quantity of one registered item across all inventory slots. */
  quantity(inventory: readonly InventorySlot[], itemId: ItemId): number {
    return inventory.reduce(
      (total, slot) => total + (slot.itemId === itemId ? slot.quantity : 0),
      0,
    );
  }

  /** Reports whether existing stacks and empty slots can hold the complete requested quantity. */
  canAdd(inventory: readonly InventorySlot[], itemId: ItemId, quantity: number): boolean {
    const definition = getItemDefinition(itemId);
    if (!definition || !Number.isInteger(quantity) || quantity <= 0) return false;
    let capacity = 0;
    for (const slot of inventory) {
      if (slot.itemId === itemId) capacity += definition.maxStack - slot.quantity;
      else if (slot.itemId === "") capacity += definition.maxStack;
      if (capacity >= quantity) return true;
    }
    return false;
  }

  /** Adds a complete quantity across partial stacks and empty slots without partial success. */
  add(inventory: InventorySlot[], itemId: ItemId, quantity: number): boolean {
    const definition = getItemDefinition(itemId);
    if (!definition || !this.canAdd(inventory, itemId, quantity)) return false;
    let remaining = quantity;
    for (const slot of inventory) {
      if (slot.itemId !== itemId || slot.quantity >= definition.maxStack) continue;
      const moved = Math.min(remaining, definition.maxStack - slot.quantity);
      slot.quantity += moved;
      remaining -= moved;
      if (remaining === 0) return true;
    }
    for (const slot of inventory) {
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
  consume(inventory: InventorySlot[], itemId: ItemId, quantity: number): boolean {
    if (!Number.isInteger(quantity) || quantity <= 0 || this.quantity(inventory, itemId) < quantity) {
      return false;
    }
    let remaining = quantity;
    for (const slot of inventory) {
      if (slot.itemId !== itemId) continue;
      const moved = Math.min(remaining, slot.quantity);
      slot.quantity -= moved;
      remaining -= moved;
      if (slot.quantity === 0) slot.itemId = "";
      if (remaining === 0) return true;
    }
    return false;
  }

  /** Restores a complete inventory snapshot after an atomic domain operation cannot finish. */
  restore(inventory: InventorySlot[], snapshot: readonly InventorySlot[]): void {
    inventory.splice(0, inventory.length, ...snapshot.map((slot) => ({ ...slot })));
  }
}
