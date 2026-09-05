export const ITEM_ID = {
  wood: "wood",
  axe: "axe",
  hoe: "hoe",
  pickaxe: "pickaxe",
  scythe: "scythe",
  stone: "stone",
  fiber: "fiber",
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
  chest: "chest",
} as const;

export type ItemId = (typeof ITEM_ID)[keyof typeof ITEM_ID];

export const HOTBAR_SLOT_COUNT = 12;
export const INVENTORY_SLOT_COUNT = 12;

export type ShippingCategory = "farming" | "foraging" | "fishing" | "mining" | "other";

export interface ItemPlacementDefinition {
  readonly kind: "chest";
  readonly footprint: { readonly width: number; readonly height: number };
  readonly allowedRegions: readonly string[];
}

export interface ItemDefinition {
  readonly id: ItemId;
  readonly name: string;
  readonly category: "resource" | "tool" | "seed" | "crop" | "fish" | "placeable";
  readonly maxStack: number;
  readonly inventorySortOrder: number;
  readonly canShip: boolean;
  readonly shippingCategory: ShippingCategory | null;
  readonly placement?: ItemPlacementDefinition;
  readonly hotbarMark: string;
  readonly staminaRestore?: number;
}

export const ITEM_DEFINITIONS: Readonly<Record<ItemId, ItemDefinition>> = {
  [ITEM_ID.wood]: { id: ITEM_ID.wood, name: "异星木材", category: "resource", maxStack: 999, inventorySortOrder: 0, canShip: false, shippingCategory: null, hotbarMark: "木" },
  [ITEM_ID.axe]: { id: ITEM_ID.axe, name: "木斧", category: "tool", maxStack: 1, inventorySortOrder: 1, canShip: false, shippingCategory: null, hotbarMark: "斧" },
  [ITEM_ID.hoe]: { id: ITEM_ID.hoe, name: "锄头", category: "tool", maxStack: 1, inventorySortOrder: 2, canShip: false, shippingCategory: null, hotbarMark: "锄" },
  [ITEM_ID.pickaxe]: { id: ITEM_ID.pickaxe, name: "基础镐", category: "tool", maxStack: 1, inventorySortOrder: 3, canShip: false, shippingCategory: null, hotbarMark: "镐" },
  [ITEM_ID.scythe]: { id: ITEM_ID.scythe, name: "基础镰刀", category: "tool", maxStack: 1, inventorySortOrder: 4, canShip: false, shippingCategory: null, hotbarMark: "镰" },
  [ITEM_ID.stone]: { id: ITEM_ID.stone, name: "石料", category: "resource", maxStack: 999, inventorySortOrder: 5, canShip: true, shippingCategory: "mining", hotbarMark: "石" },
  [ITEM_ID.fiber]: { id: ITEM_ID.fiber, name: "植物纤维", category: "resource", maxStack: 999, inventorySortOrder: 6, canShip: true, shippingCategory: "foraging", hotbarMark: "纤" },
  [ITEM_ID.turnipSeed]: { id: ITEM_ID.turnipSeed, name: "萝卜种子", category: "seed", maxStack: 999, inventorySortOrder: 7, canShip: false, shippingCategory: null, hotbarMark: "种" },
  [ITEM_ID.wateringCan]: { id: ITEM_ID.wateringCan, name: "浇水壶", category: "tool", maxStack: 1, inventorySortOrder: 8, canShip: false, shippingCategory: null, hotbarMark: "水" },
  [ITEM_ID.turnip]: { id: ITEM_ID.turnip, name: "萝卜", category: "crop", maxStack: 999, inventorySortOrder: 9, canShip: true, shippingCategory: "farming", hotbarMark: "萝", staminaRestore: 12 },
  [ITEM_ID.bokChoySeed]: { id: ITEM_ID.bokChoySeed, name: "小白菜种子", category: "seed", maxStack: 999, inventorySortOrder: 10, canShip: false, shippingCategory: null, hotbarMark: "菜" },
  [ITEM_ID.bokChoy]: { id: ITEM_ID.bokChoy, name: "小白菜", category: "crop", maxStack: 999, inventorySortOrder: 11, canShip: true, shippingCategory: "farming", hotbarMark: "青", staminaRestore: 16 },
  [ITEM_ID.cauliflowerSeed]: { id: ITEM_ID.cauliflowerSeed, name: "花椰菜种子", category: "seed", maxStack: 999, inventorySortOrder: 12, canShip: false, shippingCategory: null, hotbarMark: "花" },
  [ITEM_ID.cauliflower]: { id: ITEM_ID.cauliflower, name: "花椰菜", category: "crop", maxStack: 999, inventorySortOrder: 13, canShip: true, shippingCategory: "farming", hotbarMark: "椰", staminaRestore: 24 },
  [ITEM_ID.springWildflower]: { id: ITEM_ID.springWildflower, name: "春日野花", category: "resource", maxStack: 999, inventorySortOrder: 14, canShip: true, shippingCategory: "foraging", hotbarMark: "花", staminaRestore: 6 },
  [ITEM_ID.bambooShoot]: { id: ITEM_ID.bambooShoot, name: "春笋", category: "resource", maxStack: 999, inventorySortOrder: 15, canShip: true, shippingCategory: "foraging", hotbarMark: "笋", staminaRestore: 10 },
  [ITEM_ID.greenPeaSeed]: { id: ITEM_ID.greenPeaSeed, name: "青豌豆种子", category: "seed", maxStack: 999, inventorySortOrder: 16, canShip: false, shippingCategory: null, hotbarMark: "豆" },
  [ITEM_ID.greenPea]: { id: ITEM_ID.greenPea, name: "青豌豆", category: "crop", maxStack: 999, inventorySortOrder: 17, canShip: true, shippingCategory: "farming", hotbarMark: "豆", staminaRestore: 14 },
  [ITEM_ID.springPotatoSeed]: { id: ITEM_ID.springPotatoSeed, name: "春土豆种子", category: "seed", maxStack: 999, inventorySortOrder: 18, canShip: false, shippingCategory: null, hotbarMark: "薯" },
  [ITEM_ID.springPotato]: { id: ITEM_ID.springPotato, name: "春土豆", category: "crop", maxStack: 999, inventorySortOrder: 19, canShip: true, shippingCategory: "farming", hotbarMark: "薯", staminaRestore: 18 },
  [ITEM_ID.rapeseedSeed]: { id: ITEM_ID.rapeseedSeed, name: "油菜花种子", category: "seed", maxStack: 999, inventorySortOrder: 20, canShip: false, shippingCategory: null, hotbarMark: "籽" },
  [ITEM_ID.rapeseedFlower]: { id: ITEM_ID.rapeseedFlower, name: "油菜花", category: "crop", maxStack: 999, inventorySortOrder: 21, canShip: true, shippingCategory: "farming", hotbarMark: "油", staminaRestore: 8 },
  [ITEM_ID.fishingRod]: { id: ITEM_ID.fishingRod, name: "竹制鱼竿", category: "tool", maxStack: 1, inventorySortOrder: 22, canShip: false, shippingCategory: null, hotbarMark: "竿" },
  [ITEM_ID.lakeCarp]: { id: ITEM_ID.lakeCarp, name: "湖鲫", category: "fish", maxStack: 999, inventorySortOrder: 23, canShip: true, shippingCategory: "fishing", hotbarMark: "鲫", staminaRestore: 16 },
  [ITEM_ID.silverMinnow]: { id: ITEM_ID.silverMinnow, name: "银鲦", category: "fish", maxStack: 999, inventorySortOrder: 24, canShip: true, shippingCategory: "fishing", hotbarMark: "鲦", staminaRestore: 12 },
  [ITEM_ID.rainLoach]: { id: ITEM_ID.rainLoach, name: "雨鳅", category: "fish", maxStack: 999, inventorySortOrder: 25, canShip: true, shippingCategory: "fishing", hotbarMark: "鳅", staminaRestore: 18 },
  [ITEM_ID.windDace]: { id: ITEM_ID.windDace, name: "风鲌", category: "fish", maxStack: 999, inventorySortOrder: 26, canShip: true, shippingCategory: "fishing", hotbarMark: "鲌", staminaRestore: 17 },
  [ITEM_ID.duskPerch]: { id: ITEM_ID.duskPerch, name: "暮鲈", category: "fish", maxStack: 999, inventorySortOrder: 27, canShip: true, shippingCategory: "fishing", hotbarMark: "鲈", staminaRestore: 22 },
  [ITEM_ID.jadeBream]: { id: ITEM_ID.jadeBream, name: "青鳞鱼", category: "fish", maxStack: 999, inventorySortOrder: 28, canShip: true, shippingCategory: "fishing", hotbarMark: "鳞", staminaRestore: 28 },
  [ITEM_ID.chest]: { id: ITEM_ID.chest, name: "普通箱", category: "placeable", maxStack: 999, inventorySortOrder: 29, canShip: false, shippingCategory: null, hotbarMark: "箱", placement: {
    kind: "chest", footprint: { width: 1, height: 1 },
    allowedRegions: ["farm", "town", "cottage", "seed-shop", "blacksmith", "town-house-west", "town-house-north", "town-house", "town-house-southwest", "town-house-east", "foothills", "lakeshore"],
  } },
};

/** Returns one reviewed item definition, or null when an unknown value is not a registered item ID. */
export function getItemDefinition(itemId: unknown): ItemDefinition | null {
  if (typeof itemId !== "string" || !Object.hasOwn(ITEM_DEFINITIONS, itemId)) return null;
  return ITEM_DEFINITIONS[itemId as ItemId] ?? null;
}
