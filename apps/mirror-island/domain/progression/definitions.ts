export const BASE_INVENTORY_CAPACITY = 12 as const;
export const EXPANDED_INVENTORY_CAPACITY = 24 as const;
export const MAX_INVENTORY_CAPACITY = 36 as const;
export const WATERING_CAN_MAX_LEVEL = 2 as const;
export const WATERING_CAN_UPGRADE_DAY = 3;
export const WATERING_CAN_UPGRADE_GOLD = 900;
export const WATERING_CAN_UPGRADE_WOOD = 15;
export const BACKPACK_UPGRADE_DAY = 1;
export const BACKPACK_UPGRADE_GOLD = 2_000;
export const SECOND_BACKPACK_UPGRADE_GOLD = 10_000;
export const BACKPACK_DISPLAY_ID = "seed-shop-backpack-display";

export type InventoryCapacity = typeof BASE_INVENTORY_CAPACITY | typeof EXPANDED_INVENTORY_CAPACITY | typeof MAX_INVENTORY_CAPACITY;
export type WateringCanLevel = 1 | typeof WATERING_CAN_MAX_LEVEL;

export interface BackpackUpgradeOffer {
  readonly capacity: typeof EXPANDED_INVENTORY_CAPACITY | typeof MAX_INVENTORY_CAPACITY;
  readonly gold: number;
}

/** Returns only the next purchasable row expansion for the current saved capacity, or null when the display is exhausted. */
export function nextBackpackUpgrade(capacity: InventoryCapacity): BackpackUpgradeOffer | null {
  if (capacity === BASE_INVENTORY_CAPACITY) return { capacity: EXPANDED_INVENTORY_CAPACITY, gold: BACKPACK_UPGRADE_GOLD };
  if (capacity === EXPANDED_INVENTORY_CAPACITY) return { capacity: MAX_INVENTORY_CAPACITY, gold: SECOND_BACKPACK_UPGRADE_GOLD };
  return null;
}

export const WATERING_CAN_CAPACITY: Readonly<Record<WateringCanLevel, number>> = {
  1: 20,
  2: 40,
};

/** Narrows one unknown value to the three released twelve-slot-row inventory capacities. */
export function decodeInventoryCapacity(value: unknown): InventoryCapacity {
  if (value === BASE_INVENTORY_CAPACITY || value === EXPANDED_INVENTORY_CAPACITY || value === MAX_INVENTORY_CAPACITY) return value;
  throw new Error("Inventory capacity is invalid.");
}

/** Narrows one unknown value to the two reviewed watering-can levels. */
export function decodeWateringCanLevel(value: unknown): WateringCanLevel {
  if (value === 1 || value === WATERING_CAN_MAX_LEVEL) return value;
  throw new Error("Watering-can level is invalid.");
}

/** Returns the fixed water capacity owned by one reviewed watering-can level. */
export function wateringCanCapacity(level: WateringCanLevel): number {
  return WATERING_CAN_CAPACITY[level];
}

/** Validates one saved water amount against its current watering-can level. */
export function decodeWateringCanWater(value: unknown, level: WateringCanLevel): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > wateringCanCapacity(level)) {
    throw new Error("Watering-can water is invalid.");
  }
  return Number(value);
}
