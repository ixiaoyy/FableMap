export const ITEM_ID = {
  wood: "wood",
  axe: "axe",
  hoe: "hoe",
  turnipSeed: "turnip-seed",
  wateringCan: "watering-can",
  turnip: "turnip",
  bokChoySeed: "bok-choy-seed",
  bokChoy: "bok-choy",
  cauliflowerSeed: "cauliflower-seed",
  cauliflower: "cauliflower",
  springWildflower: "spring-wildflower",
  bambooShoot: "bamboo-shoot",
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
  [ITEM_ID.turnipSeed]: { id: ITEM_ID.turnipSeed, name: "萝卜种子", category: "seed", maxStack: 99, hotbarMark: "种" },
  [ITEM_ID.wateringCan]: { id: ITEM_ID.wateringCan, name: "浇水壶", category: "tool", maxStack: 1, hotbarMark: "水" },
  [ITEM_ID.turnip]: { id: ITEM_ID.turnip, name: "萝卜", category: "crop", maxStack: 99, hotbarMark: "萝" },
  [ITEM_ID.bokChoySeed]: { id: ITEM_ID.bokChoySeed, name: "小白菜种子", category: "seed", maxStack: 99, hotbarMark: "菜" },
  [ITEM_ID.bokChoy]: { id: ITEM_ID.bokChoy, name: "小白菜", category: "crop", maxStack: 99, hotbarMark: "青" },
  [ITEM_ID.cauliflowerSeed]: { id: ITEM_ID.cauliflowerSeed, name: "花椰菜种子", category: "seed", maxStack: 99, hotbarMark: "花" },
  [ITEM_ID.cauliflower]: { id: ITEM_ID.cauliflower, name: "花椰菜", category: "crop", maxStack: 99, hotbarMark: "椰" },
  [ITEM_ID.springWildflower]: { id: ITEM_ID.springWildflower, name: "春日野花", category: "resource", maxStack: 99, hotbarMark: "花" },
  [ITEM_ID.bambooShoot]: { id: ITEM_ID.bambooShoot, name: "春笋", category: "resource", maxStack: 99, hotbarMark: "笋" },
};

/** Returns one reviewed item definition, or null when an unknown value is not a registered item ID. */
export function getItemDefinition(itemId: unknown): ItemDefinition | null {
  if (typeof itemId !== "string") return null;
  return ITEM_DEFINITIONS[itemId as ItemId] ?? null;
}
