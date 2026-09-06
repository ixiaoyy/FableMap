import {
  FLOOR_FRAMES,
  MEDIA_KEYS,
  VILLAGE_FRAMES,
} from "./media-catalog.ts";
import { CHARACTER_LAYER_KEYS } from "../presentation/LayeredPlayerArtwork.ts";
import { FRAME_WIDTH, FRAME_HEIGHT, FOOT_Y } from "../presentation/character-art.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";
import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import type { CropId } from "../../../../domain/farming/crops.ts";
import { COTTAGE_TEXTURE_KEY, COTTAGE_VIEW_SPAWN } from "../presentation/cottage-art.ts";
import { SHOP_INTERIOR_TEXTURE_KEY } from "../presentation/shop-interiors-art.ts";

const VECTORAITH_MEDIA_BASE = "/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16";

export interface AtlasFrameDefinition {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface EntityMediaProfile {
  readonly tree: {
    readonly textureKey: string;
    readonly frame: AtlasFrameDefinition;
    readonly stumpTextureKey: string;
    readonly stumpFrame: AtlasFrameDefinition;
  };
  readonly rock: { readonly textureKey: string; readonly frame: AtlasFrameDefinition };
  readonly farmSoil: { readonly textureKey: string; readonly frame: AtlasFrameDefinition };
  readonly farmCrops?: Readonly<Partial<Record<CropId, {
    readonly textureKey: string;
    readonly growingFrame: AtlasFrameDefinition;
    readonly matureFrame: AtlasFrameDefinition;
  }>>>;
  readonly forage?: Readonly<Record<"spring-wildflower" | "bamboo-shoot", {
    readonly textureKey: string;
    readonly frame: AtlasFrameDefinition;
  }>>;
  readonly npc: {
    readonly textureKey: string;
    readonly frames: Readonly<Record<string, AtlasFrameDefinition>>;
  };
}

export interface PlayerMediaProfile {
  readonly textureKey: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly scale: number;
  readonly originY: number;
  readonly frames: {
    readonly idle: Readonly<Record<"down" | "up" | "left" | "right", number>>;
    readonly walk: Readonly<Record<"down" | "up" | "left" | "right", readonly number[]>>;
    readonly attack: Readonly<Record<"down" | "up" | "left" | "right", number>>;
  };
}

export interface TilesetBinding {
  readonly tiledName: string;
  readonly textureKey: string;
}

export const VECTORAITH_MEDIA_KEYS = {
  terrain: "vectoraith-terrain",
  buildings: "vectoraith-buildings",
  details: "vectoraith-details",
  orchard: "vectoraith-orchard",
  crops: "vectoraith-crops",
  farmer: "vectoraith-farmer",
  npcs: "vectoraith-npcs",
} as const;

export const VECTORAITH_MEDIA_URLS = {
  terrain: `${VECTORAITH_MEDIA_BASE}/tilesets-compact/vectoraith_tileset_farmingsims_terrain_spring_expanded.png?v=e86e6c9b`,
  buildings: `${VECTORAITH_MEDIA_BASE}/tilesets-compact/vectoraith_tileset_farmingsims_buildings.png?v=cf4670e0`,
  details: `${VECTORAITH_MEDIA_BASE}/tilesets-compact/vectoraith_tileset_farmingsims_details.png?v=d0e32b62`,
  orchard: `${VECTORAITH_MEDIA_BASE}/tilesets-compact/vectoraith_tileset_farmingsims_orchard.png?v=5488f410`,
  crops: `${VECTORAITH_MEDIA_BASE}/tilesets-compact/vectoraith_tileset_farmingsims_crops.png?v=ac174d7c`,
  farmer: `${VECTORAITH_MEDIA_BASE}/sprites/$farmer.png?v=85fe4b73`,
  npcs: "/game-media/v1/assets/vendor/vectoraith/top-down-rpg-npc-v1.6-demo/original/16x16/generic_people.png?v=eb1fe419",
} as const;

const VECTORAITH_NPC_FRAMES: Readonly<Record<string, AtlasFrameDefinition>> = {
  "seed-keeper": { name: "vectoraith-npc-huaqiang", x: 10 * 16, y: 4 * 32, width: 16, height: 32 },
  "town-blacksmith": { name: "vectoraith-npc-haotian", x: 7 * 16, y: 0, width: 16, height: 32 },
  "town-resident-01": { name: "vectoraith-npc-ahe", x: 4 * 16, y: 4 * 32, width: 16, height: 32 },
  "town-resident-mozi": { name: "vectoraith-npc-mozi", x: 2 * 16, y: 5 * 32, width: 16, height: 32 },
  "town-resident-haonan": { name: "vectoraith-npc-haonan", x: 8 * 16, y: 0, width: 16, height: 32 },
  "town-resident-alan": { name: "vectoraith-npc-alan", x: 6 * 16, y: 4 * 32, width: 16, height: 32 },
  "town-resident-haomeili": { name: "vectoraith-npc-haomeili", x: 3 * 16, y: 4 * 32, width: 16, height: 32 },
  "town-resident-xiangzi": { name: "vectoraith-npc-xiangzi", x: 10 * 16, y: 6 * 32, width: 16, height: 32 },
};

const NINJA_ENTITY_MEDIA: EntityMediaProfile = {
  tree: {
    textureKey: MEDIA_KEYS.village,
    frame: VILLAGE_FRAMES.tree,
    stumpTextureKey: MEDIA_KEYS.village,
    stumpFrame: VILLAGE_FRAMES.stump,
  },
  rock: { textureKey: MEDIA_KEYS.village, frame: VILLAGE_FRAMES.rock },
  farmSoil: { textureKey: MEDIA_KEYS.floor, frame: FLOOR_FRAMES.tilled },
  npc: { textureKey: VECTORAITH_MEDIA_KEYS.npcs, frames: VECTORAITH_NPC_FRAMES },
};

const VECTORAITH_ENTITY_MEDIA: EntityMediaProfile = {
  tree: {
    textureKey: VECTORAITH_MEDIA_KEYS.orchard,
    frame: { name: "vectoraith-tree", x: 5 * 16, y: 0, width: 3 * 16, height: 3 * 16 },
    stumpTextureKey: VECTORAITH_MEDIA_KEYS.details,
    stumpFrame: { name: "vectoraith-stump", x: 5 * 16, y: 5 * 16, width: 3 * 16, height: 16 },
  },
  rock: {
    textureKey: VECTORAITH_MEDIA_KEYS.details,
    frame: { name: "vectoraith-rock", x: 1 * 16, y: 4 * 16, width: 3 * 16, height: 2 * 16 },
  },
  farmSoil: {
    textureKey: VECTORAITH_MEDIA_KEYS.terrain,
    frame: { name: "vectoraith-soil", x: 1 * 16, y: 3 * 16, width: 16, height: 16 },
  },
  farmCrops: {
    [ITEM_ID.turnip]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-turnip-growing", x: 9 * 16, y: 7 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-turnip-mature", x: 11 * 16, y: 7 * 16, width: 16, height: 16 } },
    [ITEM_ID.bokChoy]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-bok-choy-growing", x: 5 * 16, y: 3 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-bok-choy-mature", x: 7 * 16, y: 3 * 16, width: 16, height: 16 } },
    [ITEM_ID.cauliflower]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-cauliflower-growing", x: 5 * 16, y: 1 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-cauliflower-mature", x: 7 * 16, y: 1 * 16, width: 16, height: 16 } },
    [ITEM_ID.greenPea]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-green-pea-growing", x: 1 * 16, y: 3 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-green-pea-mature", x: 3 * 16, y: 3 * 16, width: 16, height: 16 } },
    [ITEM_ID.springPotato]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-spring-potato-growing", x: 13 * 16, y: 7 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-spring-potato-mature", x: 15 * 16, y: 7 * 16, width: 16, height: 16 } },
    [ITEM_ID.rapeseedFlower]: { textureKey: VECTORAITH_MEDIA_KEYS.crops, growingFrame: { name: "vectoraith-rapeseed-growing", x: 13 * 16, y: 9 * 16, width: 16, height: 16 }, matureFrame: { name: "vectoraith-rapeseed-mature", x: 14 * 16, y: 9 * 16, width: 16, height: 16 } },
  },
  forage: {
    "spring-wildflower": { textureKey: `item-original-${ITEM_ID.springWildflower}`, frame: { name: "spring-wildflower", x: 0, y: 0, width: 16, height: 16 } },
    "bamboo-shoot": { textureKey: `item-original-${ITEM_ID.bambooShoot}`, frame: { name: "bamboo-shoot", x: 0, y: 0, width: 16, height: 16 } },
  },
  npc: { textureKey: VECTORAITH_MEDIA_KEYS.npcs, frames: VECTORAITH_NPC_FRAMES },
};

const LAYERED_PLAYER_MEDIA: PlayerMediaProfile = {
  textureKey: CHARACTER_LAYER_KEYS.top,
  frameWidth: FRAME_WIDTH,
  frameHeight: FRAME_HEIGHT,
  scale: 0.5,
  originY: FOOT_Y / FRAME_HEIGHT,
  frames: {
    idle: { down: 1, left: 4, right: 7, up: 10 },
    walk: { down: [0, 1, 2, 1], left: [3, 4, 5, 4], right: [6, 7, 8, 7], up: [9, 10, 11, 10] },
    attack: { down: 1, left: 4, right: 7, up: 10 },
  },
};

const NINJA_TILESET_BINDINGS: readonly TilesetBinding[] = [
  { tiledName: "floor", textureKey: MEDIA_KEYS.floorTilemap },
  { tiledName: "village", textureKey: MEDIA_KEYS.village },
  { tiledName: "interior-floor", textureKey: MEDIA_KEYS.interiorFloor },
  { tiledName: "wall", textureKey: MEDIA_KEYS.wall },
];

const VECTORAITH_TILESET_BINDINGS: readonly TilesetBinding[] = [
  { tiledName: "vectoraith-terrain", textureKey: VECTORAITH_MEDIA_KEYS.terrain },
  { tiledName: "vectoraith-buildings", textureKey: VECTORAITH_MEDIA_KEYS.buildings },
  { tiledName: "vectoraith-details", textureKey: VECTORAITH_MEDIA_KEYS.details },
];

const MIXED_INTERIOR_TILESET_BINDINGS: readonly TilesetBinding[] = [
  ...NINJA_TILESET_BINDINGS,
  ...VECTORAITH_TILESET_BINDINGS,
];

const MIXED_INTERIOR_REGION_IDS = new Set([
  "town-house-west",
  "town-house-north",
  "town-house",
  "town-house-southwest",
  "town-house-east",
]);

const FIXED_INTERIOR_VIEW_ANCHORS: Readonly<Record<string, string>> = {
  cottage: COTTAGE_VIEW_SPAWN,
  "seed-shop": "seed-shop-room-view",
  blacksmith: "blacksmith-room-view",
};

/** Returns a refined interior's Tiled-owned camera anchor, or null for regions that follow the player. */
export function fixedInteriorViewAnchorForRegion(regionId: string): string | null {
  return FIXED_INTERIOR_VIEW_ANCHORS[regionId] ?? null;
}

/** Reports whether one fixed indoor region mixes Ninja floors with VectoRaith props. */
function usesMixedInteriorProfile(regionId: string): boolean {
  return MIXED_INTERIOR_REGION_IDS.has(regionId);
}

/** Resolves the region's approved original or source-authored atlas without changing gameplay state. */
export function tilesetBindingsForRegion(regionId: string): readonly TilesetBinding[] {
  if (regionId === "cottage") return [{ tiledName: "cottage-woodwork", textureKey: COTTAGE_TEXTURE_KEY }];
  if (regionId === "seed-shop" || regionId === "blacksmith") {
    return [{ tiledName: "shop-interiors", textureKey: SHOP_INTERIOR_TEXTURE_KEY }];
  }
  if (usesMixedInteriorProfile(regionId)) return MIXED_INTERIOR_TILESET_BINDINGS;
  return isOutdoorRegion(regionId)
    ? VECTORAITH_TILESET_BINDINGS
    : NINJA_TILESET_BINDINGS;
}

/** Resolves entity atlas frames for one region without changing EntityFactory behavior or domain state. */
export function entityMediaForRegion(regionId: string): EntityMediaProfile {
  return isOutdoorRegion(regionId)
    ? VECTORAITH_ENTITY_MEDIA
    : NINJA_ENTITY_MEDIA;
}

/** Returns the fixed four-direction frame contract shared by all independently painted player layers. */
export function playerMediaProfile(): PlayerMediaProfile {
  return LAYERED_PLAYER_MEDIA;
}

/** Returns every atlas-frame profile that the active client must register before entities render. */
export function activeEntityMediaProfiles(): readonly EntityMediaProfile[] {
  return [NINJA_ENTITY_MEDIA, VECTORAITH_ENTITY_MEDIA];
}
