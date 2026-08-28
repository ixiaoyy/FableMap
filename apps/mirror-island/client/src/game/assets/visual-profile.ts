import {
  FLOOR_FRAMES,
  MEDIA_KEYS,
  VILLAGE_FRAMES,
} from "./media-catalog.ts";

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
  readonly farmCrop?: {
    readonly textureKey: string;
    readonly growingFrame: AtlasFrameDefinition;
    readonly matureFrame: AtlasFrameDefinition;
  };
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
  farmCrop: {
    textureKey: VECTORAITH_MEDIA_KEYS.crops,
    growingFrame: { name: "vectoraith-crop-growing", x: 5 * 16, y: 1 * 16, width: 16, height: 16 },
    matureFrame: { name: "vectoraith-crop-mature", x: 7 * 16, y: 1 * 16, width: 16, height: 16 },
  },
  npc: { textureKey: VECTORAITH_MEDIA_KEYS.npcs, frames: VECTORAITH_NPC_FRAMES },
};

const VECTORAITH_PLAYER_MEDIA: PlayerMediaProfile = {
  textureKey: VECTORAITH_MEDIA_KEYS.farmer,
  frameWidth: 16,
  frameHeight: 32,
  scale: 1,
  originY: 0.82,
  frames: {
    idle: { down: 1, left: 4, right: 7, up: 10 },
    walk: {
      down: [0, 1, 2, 1],
      left: [3, 4, 5, 4],
      right: [6, 7, 8, 7],
      up: [9, 10, 11, 10],
    },
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
  "blacksmith",
  "town-house-west",
  "town-house-north",
  "town-house",
  "town-house-southwest",
  "town-house-east",
]);

/** Reports whether one outdoor region uses the formal VectoRaith visual profile. */
function usesVectoRaithOutdoorProfile(regionId: string): boolean {
  return regionId === "farm"
    || regionId === "town"
    || regionId === "foothills"
    || regionId === "lakeshore";
}

/** Reports whether one fixed indoor region mixes Ninja floors with VectoRaith props. */
function usesMixedInteriorProfile(regionId: string): boolean {
  return MIXED_INTERIOR_REGION_IDS.has(regionId);
}

/** Resolves direct Original/16×16 VectoRaith tilemap bindings for formal outdoor regions. */
export function tilesetBindingsForRegion(regionId: string): readonly TilesetBinding[] {
  if (usesMixedInteriorProfile(regionId)) return MIXED_INTERIOR_TILESET_BINDINGS;
  return usesVectoRaithOutdoorProfile(regionId)
    ? VECTORAITH_TILESET_BINDINGS
    : NINJA_TILESET_BINDINGS;
}

/** Resolves entity atlas frames for one region without changing EntityFactory behavior or domain state. */
export function entityMediaForRegion(regionId: string): EntityMediaProfile {
  return usesVectoRaithOutdoorProfile(regionId)
    ? VECTORAITH_ENTITY_MEDIA
    : NINJA_ENTITY_MEDIA;
}

/** Resolves the formal VectoRaith player sheet while keeping movement and commands unchanged. */
export function playerMediaProfile(): PlayerMediaProfile {
  return VECTORAITH_PLAYER_MEDIA;
}

/** Returns every atlas-frame profile that the active client must register before entities render. */
export function activeEntityMediaProfiles(): readonly EntityMediaProfile[] {
  return [NINJA_ENTITY_MEDIA, VECTORAITH_ENTITY_MEDIA];
}
