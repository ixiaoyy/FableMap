const DEFAULT_MEDIA_BASE_URL = "/game-media/v1";
const VENDOR_PATH = "assets/vendor/ninja-adventure/2024-04-19";
const HOME_ART_PATH = "assets/original/mirror-island-home/2026-08-31";

/** Resolves the reviewed same-origin media namespace or one explicit development override. */
function mediaUrl(relativePath: string, version: string): string {
  const baseUrl = String(import.meta.env.VITE_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL).replace(/\/+$/u, "");
  return `${baseUrl}/${relativePath}?v=${version}`;
}

export const HOME_HERO_URL = mediaUrl(
  `${HOME_ART_PATH}/mirror-island-home-hero.png`,
  "f1182c1e",
);

export const MEDIA_KEYS = {
  floor: "ninja-floor",
  floorTilemap: "ninja-floor-tilemap",
  village: "ninja-village",
  interiorFloor: "ninja-interior-floor",
  wall: "ninja-wall",
  hero: "ninja-hero",
} as const;

export const MEDIA_URLS = {
  floor: mediaUrl(`${VENDOR_PATH}/floor.png`, "e1110650"),
  village: mediaUrl(`${VENDOR_PATH}/village.png`, "6787c6e2"),
  interiorFloor: mediaUrl(`${VENDOR_PATH}/interior-floor.png`, "e281598e"),
  wall: mediaUrl(`${VENDOR_PATH}/wall.png`, "ad5eb80a"),
  hero: mediaUrl(`${VENDOR_PATH}/player.png`, "f2dd61a2"),
} as const;

export const VILLAGE_FRAMES = {
  tree: { name: "tree", x: 4 * 16, y: 6 * 16, width: 2 * 16, height: 3 * 16 },
  stump: { name: "stump", x: 4 * 16, y: 8 * 16, width: 16, height: 16 },
  rock: { name: "rock", x: 7 * 16, y: 5 * 16, width: 2 * 16, height: 2 * 16 },
} as const;

export const FLOOR_FRAMES = {
  tilled: { name: "tilled", x: 0, y: 11 * 16, width: 16, height: 16 },
} as const;

export const PLAYER_FRAMES = {
  idle: { down: 0, up: 1, left: 2, right: 3 },
  walk: {
    down: [0, 4, 8, 12],
    up: [1, 5, 9, 13],
    left: [2, 6, 10, 14],
    right: [3, 7, 11, 15],
  },
  attack: { down: 16, up: 17, left: 18, right: 19 },
} as const;
