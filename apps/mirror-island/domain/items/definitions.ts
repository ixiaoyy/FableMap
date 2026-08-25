export const ITEM_ID = {
  wood: "wood",
  axe: "axe",
  hoe: "hoe",
  alienSeed: "alien-seed",
  wateringCan: "watering-can",
  alienCrop: "alien-crop",
} as const;

export type ItemId = (typeof ITEM_ID)[keyof typeof ITEM_ID];

export const HOTBAR_SLOT_COUNT = 8;
export const INVENTORY_SLOT_COUNT = 24;

export interface ItemDefinition {
  readonly id: ItemId;
  readonly name: string;
  readonly category: "resource" | "tool" | "seed" | "crop";
  readonly maxStack: number;
  readonly hotbarMark: string;
}

export const ITEM_DEFINITIONS: Readonly<Record<ItemId, ItemDefinition>> = {
  [ITEM_ID.wood]: { id: ITEM_ID.wood, name: "异星木材", category: "resource", maxStack: 99, hotbarMark: "木" },
  [ITEM_ID.axe]: { id: ITEM_ID.axe, name: "木斧", category: "tool", maxStack: 1, hotbarMark: "斧" },
  [ITEM_ID.hoe]: { id: ITEM_ID.hoe, name: "锄头", category: "tool", maxStack: 1, hotbarMark: "锄" },
  [ITEM_ID.alienSeed]: { id: ITEM_ID.alienSeed, name: "荧光种子", category: "seed", maxStack: 99, hotbarMark: "种" },
  [ITEM_ID.wateringCan]: { id: ITEM_ID.wateringCan, name: "浇水壶", category: "tool", maxStack: 1, hotbarMark: "水" },
  [ITEM_ID.alienCrop]: { id: ITEM_ID.alienCrop, name: "荧光果", category: "crop", maxStack: 99, hotbarMark: "果" },
};

/** Returns one reviewed item definition, or null when an unknown value is not a registered item ID. */
export function getItemDefinition(itemId: unknown): ItemDefinition | null {
  if (typeof itemId !== "string") return null;
  return ITEM_DEFINITIONS[itemId as ItemId] ?? null;
}
