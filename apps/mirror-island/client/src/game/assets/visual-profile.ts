import {
  FLOOR_FRAMES,
  MEDIA_KEYS,
  VILLAGE_FRAMES,
} from "./media-catalog.ts";
import {
  DEFAULT_PLAYER_APPEARANCE_ID,
  PLAYER_APPEARANCE_IDS,
  type PlayerAppearanceId,
} from "../../../../domain/player/appearance.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";
import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import type { CropId } from "../../../../domain/farming/crops.ts";

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
  readonly appearanceId: PlayerAppearanceId;
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

export interface PlayerAppearanceOption {
  readonly id: PlayerAppearanceId;
  readonly label: string;
  readonly note: string;
  readonly preview: {
    readonly url: string;
    readonly sheetWidth: number;
    readonly sheetHeight: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
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
    "spring-wildflower": { textureKey: VECTORAITH_MEDIA_KEYS.crops, frame: { name: "vectoraith-spring-wildflower", x: 2 * 16, y: 9 * 16, width: 16, height: 16 } },
    "bamboo-shoot": { textureKey: VECTORAITH_MEDIA_KEYS.crops, frame: { name: "vectoraith-bamboo-shoot", x: 2 * 16, y: 15 * 16, width: 16, height: 16 } },
  },
  npc: { textureKey: VECTORAITH_MEDIA_KEYS.npcs, frames: VECTORAITH_NPC_FRAMES },
};

const VECTORAITH_PLAYER_MEDIA: PlayerMediaProfile = {
  appearanceId: DEFAULT_PLAYER_APPEARANCE_ID,
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

const NPC_APPEARANCE_LABELS = [
  ["春芽", "轻快明亮"],
  ["听雨", "沉静柔和"],
  ["青石", "朴素利落"],
  ["晚霞", "温暖醒目"],
  ["松风", "自然清爽"],
  ["湖光", "安静自在"],
  ["灯火", "活泼亲切"],
  ["山茶", "从容明快"],
] as const;

/** Resolves one RPG Maker-style demo character block into the shared four-direction player contract. */
function createNpcPlayerMediaProfile(
  appearanceId: PlayerAppearanceId,
  characterIndex: number,
): PlayerMediaProfile {
  const blockColumn = characterIndex % 4;
  const blockRow = Math.floor(characterIndex / 4);
  const baseColumn = blockColumn * 3;
  const baseRow = blockRow * 4;
  const frame = (directionRow: number, offset: number) => (
    (baseRow + directionRow) * 12 + baseColumn + offset
  );
  return {
    appearanceId,
    textureKey: VECTORAITH_MEDIA_KEYS.npcs,
    frameWidth: 16,
    frameHeight: 32,
    scale: 1,
    originY: 0.82,
    frames: {
      idle: {
        down: frame(0, 1),
        left: frame(1, 1),
        right: frame(2, 1),
        up: frame(3, 1),
      },
      walk: {
        down: [frame(0, 0), frame(0, 1), frame(0, 2), frame(0, 1)],
        left: [frame(1, 0), frame(1, 1), frame(1, 2), frame(1, 1)],
        right: [frame(2, 0), frame(2, 1), frame(2, 2), frame(2, 1)],
        up: [frame(3, 0), frame(3, 1), frame(3, 2), frame(3, 1)],
      },
      attack: {
        down: frame(0, 1),
        left: frame(1, 1),
        right: frame(2, 1),
        up: frame(3, 1),
      },
    },
  };
}

const PLAYER_MEDIA_BY_APPEARANCE = new Map<PlayerAppearanceId, PlayerMediaProfile>([
  [DEFAULT_PLAYER_APPEARANCE_ID, VECTORAITH_PLAYER_MEDIA],
  ...PLAYER_APPEARANCE_IDS.slice(1).map((appearanceId, index) => [
    appearanceId,
    createNpcPlayerMediaProfile(appearanceId, index),
  ] as const),
]);

export const PLAYER_APPEARANCE_OPTIONS: readonly PlayerAppearanceOption[] = [
  {
    id: DEFAULT_PLAYER_APPEARANCE_ID,
    label: "田野旅人",
    note: "熟悉的农场装束",
    preview: {
      url: VECTORAITH_MEDIA_URLS.farmer,
      sheetWidth: 48,
      sheetHeight: 128,
      x: 0,
      y: 0,
      width: 16,
      height: 32,
    },
  },
  ...PLAYER_APPEARANCE_IDS.slice(1).map((id, index) => {
    const blockColumn = index % 4;
    const blockRow = Math.floor(index / 4);
    const copy = NPC_APPEARANCE_LABELS[index]!;
    return {
      id,
      label: copy[0],
      note: copy[1],
      preview: {
        url: VECTORAITH_MEDIA_URLS.npcs,
        sheetWidth: 192,
        sheetHeight: 256,
        x: blockColumn * 3 * 16,
        y: blockRow * 4 * 32,
        width: 16,
        height: 32,
      },
    };
  }),
];

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

/** Reports whether one fixed indoor region mixes Ninja floors with VectoRaith props. */
function usesMixedInteriorProfile(regionId: string): boolean {
  return MIXED_INTERIOR_REGION_IDS.has(regionId);
}

/** Resolves direct Original/16×16 VectoRaith tilemap bindings for formal outdoor regions. */
export function tilesetBindingsForRegion(regionId: string): readonly TilesetBinding[] {
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

/** Resolves one saved appearance ID into its formal VectoRaith texture and animation frames. */
export function playerMediaProfile(appearanceId: PlayerAppearanceId): PlayerMediaProfile {
  const profile = PLAYER_MEDIA_BY_APPEARANCE.get(appearanceId);
  if (!profile) throw new Error(`Player appearance media is missing: ${appearanceId}.`);
  return profile;
}

/** Returns every atlas-frame profile that the active client must register before entities render. */
export function activeEntityMediaProfiles(): readonly EntityMediaProfile[] {
  return [NINJA_ENTITY_MEDIA, VECTORAITH_ENTITY_MEDIA];
}
