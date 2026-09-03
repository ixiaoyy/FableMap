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
  greenPeaSeed: "green-pea-seed",
  greenPea: "green-pea",
  springPotatoSeed: "spring-potato-seed",
  springPotato: "spring-potato",
  rapeseedSeed: "rapeseed-seed",
  rapeseedFlower: "rapeseed-flower",
  fishingRod: "fishing-rod",
  lakeCarp: "lake-carp",
  silverMinnow: "silver-minnow",
  rainLoach: "rain-loach",
  windDace: "wind-dace",
  duskPerch: "dusk-perch",
  jadeBream: "jade-bream",
} as const;

export type ItemId = (typeof ITEM_ID)[keyof typeof ITEM_ID];

export const HOTBAR_SLOT_COUNT = 8;
export const INVENTORY_SLOT_COUNT = 24;

export interface ItemDefinition {
  readonly id: ItemId;
  readonly name: string;
  readonly category: "resource" | "tool" | "seed" | "crop" | "fish";
  readonly maxStack: number;
  readonly hotbarMark: string;
  readonly staminaRestore?: number;
}

export const ITEM_DEFINITIONS: Readonly<Record<ItemId, ItemDefinition>> = {
  [ITEM_ID.wood]: { id: ITEM_ID.wood, name: "异星木材", category: "resource", maxStack: 99, hotbarMark: "木" },
  [ITEM_ID.axe]: { id: ITEM_ID.axe, name: "木斧", category: "tool", maxStack: 1, hotbarMark: "斧" },
  [ITEM_ID.hoe]: { id: ITEM_ID.hoe, name: "锄头", category: "tool", maxStack: 1, hotbarMark: "锄" },
  [ITEM_ID.turnipSeed]: { id: ITEM_ID.turnipSeed, name: "萝卜种子", category: "seed", maxStack: 99, hotbarMark: "种" },
  [ITEM_ID.wateringCan]: { id: ITEM_ID.wateringCan, name: "浇水壶", category: "tool", maxStack: 1, hotbarMark: "水" },
  [ITEM_ID.turnip]: { id: ITEM_ID.turnip, name: "萝卜", category: "crop", maxStack: 99, hotbarMark: "萝", staminaRestore: 12 },
  [ITEM_ID.bokChoySeed]: { id: ITEM_ID.bokChoySeed, name: "小白菜种子", category: "seed", maxStack: 99, hotbarMark: "菜" },
  [ITEM_ID.bokChoy]: { id: ITEM_ID.bokChoy, name: "小白菜", category: "crop", maxStack: 99, hotbarMark: "青", staminaRestore: 16 },
  [ITEM_ID.cauliflowerSeed]: { id: ITEM_ID.cauliflowerSeed, name: "花椰菜种子", category: "seed", maxStack: 99, hotbarMark: "花" },
  [ITEM_ID.cauliflower]: { id: ITEM_ID.cauliflower, name: "花椰菜", category: "crop", maxStack: 99, hotbarMark: "椰", staminaRestore: 24 },
  [ITEM_ID.springWildflower]: { id: ITEM_ID.springWildflower, name: "春日野花", category: "resource", maxStack: 99, hotbarMark: "花", staminaRestore: 6 },
  [ITEM_ID.bambooShoot]: { id: ITEM_ID.bambooShoot, name: "春笋", category: "resource", maxStack: 99, hotbarMark: "笋", staminaRestore: 10 },
  [ITEM_ID.greenPeaSeed]: { id: ITEM_ID.greenPeaSeed, name: "青豌豆种子", category: "seed", maxStack: 99, hotbarMark: "豆" },
  [ITEM_ID.greenPea]: { id: ITEM_ID.greenPea, name: "青豌豆", category: "crop", maxStack: 99, hotbarMark: "豆", staminaRestore: 14 },
  [ITEM_ID.springPotatoSeed]: { id: ITEM_ID.springPotatoSeed, name: "春土豆种子", category: "seed", maxStack: 99, hotbarMark: "薯" },
  [ITEM_ID.springPotato]: { id: ITEM_ID.springPotato, name: "春土豆", category: "crop", maxStack: 99, hotbarMark: "薯", staminaRestore: 18 },
  [ITEM_ID.rapeseedSeed]: { id: ITEM_ID.rapeseedSeed, name: "油菜花种子", category: "seed", maxStack: 99, hotbarMark: "籽" },
  [ITEM_ID.rapeseedFlower]: { id: ITEM_ID.rapeseedFlower, name: "油菜花", category: "crop", maxStack: 99, hotbarMark: "油", staminaRestore: 8 },
  [ITEM_ID.fishingRod]: { id: ITEM_ID.fishingRod, name: "竹制鱼竿", category: "tool", maxStack: 1, hotbarMark: "竿" },
  [ITEM_ID.lakeCarp]: { id: ITEM_ID.lakeCarp, name: "湖鲫", category: "fish", maxStack: 99, hotbarMark: "鲫", staminaRestore: 16 },
  [ITEM_ID.silverMinnow]: { id: ITEM_ID.silverMinnow, name: "银鲦", category: "fish", maxStack: 99, hotbarMark: "鲦", staminaRestore: 12 },
  [ITEM_ID.rainLoach]: { id: ITEM_ID.rainLoach, name: "雨鳅", category: "fish", maxStack: 99, hotbarMark: "鳅", staminaRestore: 18 },
  [ITEM_ID.windDace]: { id: ITEM_ID.windDace, name: "风鲌", category: "fish", maxStack: 99, hotbarMark: "鲌", staminaRestore: 17 },
  [ITEM_ID.duskPerch]: { id: ITEM_ID.duskPerch, name: "暮鲈", category: "fish", maxStack: 99, hotbarMark: "鲈", staminaRestore: 22 },
  [ITEM_ID.jadeBream]: { id: ITEM_ID.jadeBream, name: "青鳞鱼", category: "fish", maxStack: 99, hotbarMark: "鳞", staminaRestore: 28 },
};

/** Returns one reviewed item definition, or null when an unknown value is not a registered item ID. */
export function getItemDefinition(itemId: unknown): ItemDefinition | null {
  if (typeof itemId !== "string") return null;
  return ITEM_DEFINITIONS[itemId as ItemId] ?? null;
}
