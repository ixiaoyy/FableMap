export const BASE_INVENTORY_CAPACITY = 24 as const;
export const EXPANDED_INVENTORY_CAPACITY = 32 as const;
export const WATERING_CAN_MAX_LEVEL = 2 as const;
export const WATERING_CAN_UPGRADE_DAY = 3;
export const WATERING_CAN_UPGRADE_GOLD = 900;
export const WATERING_CAN_UPGRADE_WOOD = 15;
export const BACKPACK_UPGRADE_DAY = 5;
export const BACKPACK_UPGRADE_GOLD = 1_500;

export type InventoryCapacity = typeof BASE_INVENTORY_CAPACITY | typeof EXPANDED_INVENTORY_CAPACITY;
export type WateringCanLevel = 1 | typeof WATERING_CAN_MAX_LEVEL;

export const WATERING_CAN_CAPACITY: Readonly<Record<WateringCanLevel, number>> = {
  1: 20,
  2: 40,
};

/** Narrows one unknown value to the two released inventory capacities. */
export function decodeInventoryCapacity(value: unknown): InventoryCapacity {
  if (value === BASE_INVENTORY_CAPACITY || value === EXPANDED_INVENTORY_CAPACITY) return value;
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
