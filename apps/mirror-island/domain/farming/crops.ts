import type { Season } from "../calendar/game-calendar.ts";
import { ITEM_ID, type ItemId } from "../items/definitions.ts";

export const CROP_IDS = [ITEM_ID.turnip, ITEM_ID.bokChoy, ITEM_ID.cauliflower] as const;
export type CropId = typeof CROP_IDS[number];

export interface CropDefinition {
  readonly cropId: CropId;
  readonly seedId: ItemId;
  readonly seasons: readonly Season[];
  readonly growthDays: number;
  readonly seedPrice: number;
  readonly sellPrice: number;
}

export const CROP_DEFINITIONS: readonly CropDefinition[] = [
  { cropId: ITEM_ID.turnip, seedId: ITEM_ID.turnipSeed, seasons: ["spring"], growthDays: 3, seedPrice: 20, sellPrice: 35 },
  { cropId: ITEM_ID.bokChoy, seedId: ITEM_ID.bokChoySeed, seasons: ["spring"], growthDays: 5, seedPrice: 45, sellPrice: 80 },
  { cropId: ITEM_ID.cauliflower, seedId: ITEM_ID.cauliflowerSeed, seasons: ["spring"], growthDays: 8, seedPrice: 80, sellPrice: 170 },
];

/** Resolves one registered crop from its harvested item ID. */
export function cropDefinition(cropId: unknown): CropDefinition | null {
  return CROP_DEFINITIONS.find((definition) => definition.cropId === cropId) ?? null;
}

/** Resolves one registered crop from its seed item ID. */
export function cropForSeed(seedId: unknown): CropDefinition | null {
  return CROP_DEFINITIONS.find((definition) => definition.seedId === seedId) ?? null;
}

/** Returns every seed definition that can be planted in one season. */
export function cropsForSeason(season: Season): readonly CropDefinition[] {
  return CROP_DEFINITIONS.filter((definition) => definition.seasons.includes(season));
}

/** Resolves the fixed sell price for crops and spring forage, or null for unsellable items. */
export function sellPriceForItem(itemId: unknown): number | null {
  const crop = cropDefinition(itemId);
  if (crop) return crop.sellPrice;
  if (itemId === ITEM_ID.springWildflower) return 25;
  if (itemId === ITEM_ID.bambooShoot) return 40;
  return null;
}
