import {
  FLOOR_FRAMES,
  MEDIA_KEYS,
  VILLAGE_FRAMES,
} from "./media-catalog.ts";

const VECTORAITH_MEDIA_BASE = "/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08";

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
  readonly npcTextureKey: string;
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
  entities: "vectoraith-entities",
  farmer: "vectoraith-farmer",
} as const;

export const VECTORAITH_MEDIA_URLS = {
  terrain: `${VECTORAITH_MEDIA_BASE}/farm-terrain.png?v=7eb50c65`,
  buildings: `${VECTORAITH_MEDIA_BASE}/farm-buildings.png?v=3f3c1219`,
  details: `${VECTORAITH_MEDIA_BASE}/farm-details.png?v=40f48f1e`,
  entities: `${VECTORAITH_MEDIA_BASE}/farm-entities.png?v=0a0d2a6c`,
  farmer: `${VECTORAITH_MEDIA_BASE}/farmer.png?v=864bd89b`,
} as const;

const NINJA_ENTITY_MEDIA: EntityMediaProfile = {
  tree: {
    textureKey: MEDIA_KEYS.village,
    frame: VILLAGE_FRAMES.tree,
    stumpTextureKey: MEDIA_KEYS.village,
    stumpFrame: VILLAGE_FRAMES.stump,
  },
  rock: { textureKey: MEDIA_KEYS.village, frame: VILLAGE_FRAMES.rock },
  farmSoil: { textureKey: MEDIA_KEYS.floor, frame: FLOOR_FRAMES.tilled },
  npcTextureKey: MEDIA_KEYS.shopkeeper,
};

const VECTORAITH_ENTITY_MEDIA: EntityMediaProfile = {
  tree: {
    textureKey: VECTORAITH_MEDIA_KEYS.entities,
    frame: { name: "vectoraith-tree", x: 0, y: 0, width: 3 * 16, height: 3 * 16 },
    stumpTextureKey: VECTORAITH_MEDIA_KEYS.entities,
    stumpFrame: { name: "vectoraith-stump", x: 0, y: 3 * 16, width: 3 * 16, height: 16 },
  },
  rock: {
    textureKey: VECTORAITH_MEDIA_KEYS.entities,
    frame: { name: "vectoraith-rock", x: 0, y: 4 * 16, width: 3 * 16, height: 2 * 16 },
  },
  farmSoil: {
    textureKey: VECTORAITH_MEDIA_KEYS.terrain,
    frame: { name: "vectoraith-soil", x: 7 * 16, y: 0, width: 16, height: 16 },
  },
  farmCrop: {
    textureKey: VECTORAITH_MEDIA_KEYS.entities,
    growingFrame: { name: "vectoraith-crop-growing", x: 3 * 16, y: 0, width: 16, height: 16 },
    matureFrame: { name: "vectoraith-crop-mature", x: 3 * 16, y: 1 * 16, width: 16, height: 16 },
  },
  npcTextureKey: MEDIA_KEYS.shopkeeper,
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

/** Resolves the formal VectoRaith Farm bindings while non-Farm regions remain technical placeholders. */
export function tilesetBindingsForRegion(regionId: string): readonly TilesetBinding[] {
  return regionId === "farm"
    ? VECTORAITH_TILESET_BINDINGS
    : NINJA_TILESET_BINDINGS;
}

/** Resolves entity atlas frames for one region without changing EntityFactory behavior or domain state. */
export function entityMediaForRegion(regionId: string): EntityMediaProfile {
  return regionId === "farm"
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
