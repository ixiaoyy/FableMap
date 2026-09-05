import { getItemDefinition, type ItemId, type ShippingCategory } from "../items/definitions.ts";

export interface ShippingEntry {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface ShippingReportEntry extends ShippingEntry {
  readonly unitPrice: number;
  readonly totalGold: number;
}

export interface ShippingCategoryReport {
  readonly category: ShippingCategory;
  readonly entries: readonly ShippingReportEntry[];
  readonly totalGold: number;
}

export interface ShippingReport {
  readonly settledDay: number;
  readonly categories: readonly ShippingCategoryReport[];
  readonly totalGold: number;
}

export interface ShippingState {
  shippingQueue: ShippingEntry[];
  unacknowledgedShippingReport: ShippingReport | null;
}

export const SHIPPING_CATEGORIES: readonly ShippingCategory[] = ["farming", "foraging", "fishing", "mining", "other"];

/** Creates an empty current-day queue and no pending report for a fresh farm. */
export function createShippingState(): ShippingState {
  return { shippingQueue: [], unacknowledgedShippingReport: null };
}

/** Defensively clones only durable shipping fields from a state without sharing queue or report arrays. */
export function cloneShippingState(state: ShippingState): ShippingState {
  return structuredClone({ shippingQueue: state.shippingQueue, unacknowledgedShippingReport: state.unacknowledgedShippingReport });
}

/** Decodes current shipping fields at the supplied absolute day; rejects corrupt quantities, categories and totals. */
export function decodeShippingState(raw: Record<string, unknown>, day: number): ShippingState {
  if (!Array.isArray(raw.shippingQueue)) throw new Error("Shipping queue is invalid.");
  const shippingQueue = raw.shippingQueue.map((value) => decodeEntry(value));
  if (raw.unacknowledgedShippingReport === null) return { shippingQueue, unacknowledgedShippingReport: null };
  const report = objectRecord(raw.unacknowledgedShippingReport);
  if (report.settledDay !== day - 1 || day < 2 || shippingQueue.length !== 0 || !Array.isArray(report.categories)) {
    throw new Error("Shipping report day is inconsistent.");
  }
  const seenCategories = new Set<ShippingCategory>();
  const seenItems = new Set<ItemId>();
  const categories = report.categories.map((value): ShippingCategoryReport => {
    const category = objectRecord(value);
    if (!SHIPPING_CATEGORIES.includes(category.category as ShippingCategory)
      || seenCategories.has(category.category as ShippingCategory) || !Array.isArray(category.entries)) {
      throw new Error("Shipping report category is invalid.");
    }
    const categoryId = category.category as ShippingCategory;
    seenCategories.add(categoryId);
    const entries = category.entries.map((entry): ShippingReportEntry => {
      const data = objectRecord(entry);
      const item = getItemDefinition(data.itemId);
      if (!item?.canShip || item.shippingCategory !== categoryId || seenItems.has(item.id)) {
        throw new Error("Shipping report item is invalid.");
      }
      seenItems.add(item.id);
      const quantity = safeInteger(data.quantity, 1);
      const unitPrice = safeInteger(data.unitPrice, 0);
      const totalGold = safeInteger(data.totalGold, 0);
      if (!Number.isSafeInteger(quantity * unitPrice) || totalGold !== quantity * unitPrice) {
        throw new Error("Shipping report line total is inconsistent.");
      }
      return { itemId: item.id, quantity, unitPrice, totalGold };
    });
    const totalGold = safeInteger(category.totalGold, 0);
    if (entries.length === 0 || totalGold !== entries.reduce((sum, entry) => sum + entry.totalGold, 0)) {
      throw new Error("Shipping category total is inconsistent.");
    }
    return { category: categoryId, entries, totalGold };
  });
  const totalGold = safeInteger(report.totalGold, 0);
  if (totalGold !== categories.reduce((sum, category) => sum + category.totalGold, 0)) {
    throw new Error("Shipping total is inconsistent.");
  }
  return { shippingQueue, unacknowledgedShippingReport: { settledDay: day - 1, categories, totalGold } };
}

/** Validates one individual deposit against the item's closed shipping eligibility and stack limit. */
function decodeEntry(value: unknown): ShippingEntry {
  const entry = objectRecord(value);
  const item = getItemDefinition(entry.itemId);
  const quantity = safeInteger(entry.quantity, 1);
  if (!item?.canShip || quantity > item.maxStack) throw new Error("Shipping deposit is invalid.");
  return { itemId: item.id, quantity };
}

/** Requires a plain persistence record before accessing any report or deposit field. */
function objectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Shipping payload is invalid.");
  return value as Record<string, unknown>;
}

/** Requires an exact safe integer at or above the supplied lower bound without coercion. */
function safeInteger(value: unknown, minimum: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Shipping number is invalid.");
  return value;
}
