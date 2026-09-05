import {
  getItemDefinition,
  HOTBAR_SLOT_COUNT,
  type ItemId,
} from "../items/definitions.ts";
import type { InventorySlot } from "../state/game-state.ts";

export type InventoryTransferAmount = "stack" | "one" | "half";
export interface InventoryStackExpectation {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export class InventorySystem {
  /** Moves the complete selected amount between explicit slots; only whole-stack intents may swap unlike items. */
  transfer(
    source: InventorySlot[], sourceIndex: number,
    destination: InventorySlot[], destinationIndex: number,
    amount: InventoryTransferAmount = "stack", expected?: InventoryStackExpectation,
  ): boolean {
    if (!validSlotIndex(source, sourceIndex) || !validSlotIndex(destination, destinationIndex)
      || (source === destination && sourceIndex === destinationIndex)
      || !["stack", "one", "half"].includes(amount)) return false;
    const from = source[sourceIndex]!;
    const to = destination[destinationIndex]!;
    const definition = getItemDefinition(from.itemId);
    if (!definition || from.quantity < 1 || (expected
      && (from.itemId !== expected.itemId || from.quantity !== expected.quantity))) return false;
    const quantity = amount === "one" ? 1 : amount === "half" ? Math.ceil(from.quantity / 2) : from.quantity;
    if (to.itemId !== "" && to.itemId !== from.itemId) {
      if (amount !== "stack") return false;
      source[sourceIndex] = { ...to };
      destination[destinationIndex] = { ...from };
      return true;
    }
    if (to.quantity + quantity > definition.maxStack) return false;
    to.itemId = from.itemId;
    to.quantity += quantity;
    from.quantity -= quantity;
    if (from.quantity === 0) from.itemId = "";
    return true;
  }

  /** Adds the entire registered output to one exact compatible slot, returning false without mutation on overflow. */
  addAt(slots: InventorySlot[], index: number, itemId: ItemId, quantity: number): boolean {
    if (!validSlotIndex(slots, index)) return false;
    const item = getItemDefinition(itemId);
    const slot = slots[index]!;
    if (!item || !Number.isSafeInteger(quantity) || quantity < 1
      || (slot.itemId !== "" && slot.itemId !== itemId) || slot.quantity + quantity > item.maxStack) return false;
    slot.itemId = itemId;
    slot.quantity += quantity;
    return true;
  }

  /** Consumes exactly one selected slot only when it contains the complete positive quantity. */
  consumeAt(slots: InventorySlot[], index: number, quantity: number): boolean {
    if (!validSlotIndex(slots, index) || !Number.isSafeInteger(quantity) || quantity < 1) return false;
    const slot = slots[index]!;
    if (!getItemDefinition(slot.itemId) || slot.quantity < quantity) return false;
    slot.quantity -= quantity;
    if (slot.quantity === 0) slot.itemId = "";
    return true;
  }

  /** Merges and orders stackable items using item-owned sort keys while preserving every tool's exact original slot. */
  sort(slots: InventorySlot[], preserveTools = true): boolean {
    const candidate = slots.map((slot) => ({ ...slot }));
    const totals = new Map<ItemId, number>();
    const available: number[] = [];
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index]!;
      const item = getItemDefinition(slot.itemId);
      if (preserveTools && item?.category === "tool") continue;
      available.push(index);
      candidate[index] = { itemId: "", quantity: 0 };
      if (item) totals.set(item.id, (totals.get(item.id) ?? 0) + slot.quantity);
    }
    const items = [...totals.keys()].sort((left, right) => (
      getItemDefinition(left)!.inventorySortOrder - getItemDefinition(right)!.inventorySortOrder
    ));
    let nextIndex = 0;
    for (const itemId of items) {
      let remaining = totals.get(itemId)!;
      const maxStack = getItemDefinition(itemId)!.maxStack;
      while (remaining > 0) {
        const index = available[nextIndex++];
        if (index === undefined) return false;
        const quantity = Math.min(maxStack, remaining);
        candidate[index] = { itemId, quantity };
        remaining -= quantity;
      }
    }
    if (candidate.every((slot, index) => slot.itemId === slots[index]!.itemId
      && slot.quantity === slots[index]!.quantity)) return false;
    this.restore(slots, candidate);
    return true;
  }

  /** Rotates complete twelve-slot rows so the persisted first row is the active hotbar; a single row is unchanged. */
  rotateHotbarRow(slots: InventorySlot[], direction: 1 | -1): boolean {
    if (![1, -1].includes(direction) || ![24, 36].includes(slots.length)) return false;
    if (direction === 1) slots.push(...slots.splice(0, HOTBAR_SLOT_COUNT));
    else slots.unshift(...slots.splice(slots.length - HOTBAR_SLOT_COUNT, HOTBAR_SLOT_COUNT));
    return true;
  }

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
    if (!definition || !Number.isSafeInteger(quantity) || quantity <= 0) return false;
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
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || this.quantity(inventory, itemId) < quantity) {
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

/** Requires one integer slot index that belongs to the supplied inventory or container array. */
function validSlotIndex(slots: readonly InventorySlot[], index: number): boolean {
  return Number.isSafeInteger(index) && index >= 0 && index < slots.length;
}
