import { sellPriceForItem } from "../farming/crops.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { getItemDefinition } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import { SHIPPING_CATEGORIES, type ShippingReport, type ShippingReportEntry } from "./shipping-state.ts";

export type ShippingResult = "shipped" | "reclaimed" | "empty" | "not-shippable" | "inventory-full" | "invalid-slot";

export class ShippingSystem {
  /** Uses the sole inventory owner; the session validates distance and saves the resulting candidate atomically. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Deposits one item or its complete selected stack, retaining insertion order for last-deposit-only recovery. */
  deposit(state: GameState, sourceIndex: number, quantity: "one" | "stack"): ShippingResult {
    if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= state.inventory.length) return "invalid-slot";
    const slot = state.inventory[sourceIndex]!;
    const item = getItemDefinition(slot.itemId);
    if (!item?.canShip || (quantity !== "one" && quantity !== "stack")) return "not-shippable";
    const amount = quantity === "one" ? 1 : slot.quantity;
    if (amount < 1) return "empty";
    state.shippingQueue.push({ itemId: item.id, quantity: amount });
    slot.quantity -= amount;
    if (slot.quantity === 0) slot.itemId = "";
    return "shipped";
  }

  /** Restores only the final complete deposit when the inventory can accept all of it; earlier deposits stay hidden. */
  reclaim(state: GameState): ShippingResult {
    const last = state.shippingQueue.at(-1);
    if (!last) return "empty";
    if (!this.inventory.add(state.inventory, last.itemId, last.quantity)) return "inventory-full";
    state.shippingQueue.pop();
    return "reclaimed";
  }

  /** Settles the pre-increment day once on an isolated overnight candidate, preserving the income report until acknowledged. */
  settle(state: GameState): ShippingReport {
    if (state.unacknowledgedShippingReport) throw new Error("Previous shipping report must be acknowledged.");
    const grouped = new Map<string, ShippingReportEntry>();
    for (const entry of state.shippingQueue) {
      const definition = getItemDefinition(entry.itemId);
      const unitPrice = sellPriceForItem(entry.itemId);
      if (!definition?.canShip || unitPrice === null) throw new Error("Shipping price is unavailable.");
      const previous = grouped.get(entry.itemId);
      const quantity = (previous?.quantity ?? 0) + entry.quantity;
      const totalGold = quantity * unitPrice;
      if (!Number.isSafeInteger(quantity) || !Number.isSafeInteger(totalGold)) throw new Error("Shipping income exceeds the supported limit.");
      grouped.set(entry.itemId, { itemId: entry.itemId, quantity, unitPrice, totalGold });
    }
    const categories = SHIPPING_CATEGORIES.flatMap((category) => {
      const entries = [...grouped.values()].filter((entry) => getItemDefinition(entry.itemId)!.shippingCategory === category)
        .sort((left, right) => getItemDefinition(left.itemId)!.inventorySortOrder - getItemDefinition(right.itemId)!.inventorySortOrder);
      return entries.length ? [{ category, entries, totalGold: entries.reduce((sum, entry) => sum + entry.totalGold, 0) }] : [];
    });
    const totalGold = categories.reduce((sum, category) => sum + category.totalGold, 0);
    if (!Number.isSafeInteger(state.gold + totalGold)) throw new Error("Gold exceeds the supported limit.");
    const report = { settledDay: state.day, categories, totalGold };
    state.gold += totalGold;
    state.shippingQueue = [];
    state.unacknowledgedShippingReport = report;
    return report;
  }
}
