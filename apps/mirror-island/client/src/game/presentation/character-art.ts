import type { PlayerAppearance } from "../../../../domain/player/appearance.ts";
import { getCharacterArtSources } from "../assets/character-media.ts";

export const FRAME_WIDTH = 48;
export const FRAME_HEIGHT = 64;
export const FOOT_Y = 60;
export const CHARACTER_LAYER_KEYS = { head: "islander-head", top: "islander-top", bottom: "islander-bottom" } as const;
export type CharacterFacing = "down" | "left" | "right" | "up";
export type CharacterLayer = "head" | "top" | "bottom";

const PART_ATLAS_WIDTH = FRAME_WIDTH * 3;
const PART_ATLAS_HEIGHT = FRAME_HEIGHT * 4;
const PART_COLUMNS: Readonly<Record<CharacterLayer, number>> = { head: 0, top: 1, bottom: 2 };
const FACING_ROWS: Readonly<Record<CharacterFacing, number>> = { down: 0, left: 1, right: 2, up: 3 };
const PAINT_ORDER: readonly CharacterLayer[] = ["bottom", "top", "head"];

const HEAD_ROWS: Readonly<Record<PlayerAppearance["gender"], Readonly<Record<PlayerAppearance["head"], number>>>> = {
  male: { short: 0, bob: 1, ponytail: 2 },
  female: { short: 5, bob: 4, ponytail: 3 },
};
const TOP_ROWS: Readonly<Record<PlayerAppearance["gender"], Readonly<Record<PlayerAppearance["top"], number>>>> = {
  male: { overalls: 0, shirt: 1, jacket: 2 },
  female: { overalls: 3, shirt: 4, jacket: 5 },
};
const BOTTOM_ROWS: Readonly<Record<PlayerAppearance["gender"], Readonly<Record<PlayerAppearance["bottom"], number>>>> = {
  male: { trousers: 0, shorts: 1, skirt: 2 },
  female: { trousers: 3, shorts: 4, skirt: 5 },
};

type Rgb = readonly [number, number, number];
type MaterialRatios = readonly [null, Rgb | null, Rgb | null, Rgb | null, Rgb | null];
type CharacterAtlases = Readonly<Record<CharacterLayer, HTMLCanvasElement>>;

const SKIN_COLORS: Readonly<Record<PlayerAppearance["skinTone"], Rgb>> = {
  peach: [246, 190, 132], tan: [205, 143, 91], umber: [142, 96, 69],
};
const HAIR_COLORS: Readonly<Record<PlayerAppearance["hairColor"], Rgb>> = {
  chestnut: [133, 89, 44], black: [48, 50, 56], gold: [204, 168, 80],
};
const TOP_COLORS: Readonly<Record<PlayerAppearance["topColor"], Rgb>> = {
  cream: [240, 228, 198], mint: [148, 195, 164], coral: [237, 170, 134], sky: [160, 203, 210],
};
const BOTTOM_COLORS: Readonly<Record<PlayerAppearance["bottomColor"], Rgb>> = {
  denim: [42, 104, 129], sand: [186, 157, 111], forest: [90, 120, 65],
};

let cachedAppearanceKey = "";
let cachedAtlases: CharacterAtlases | null = null;

/** Returns multiplicative RGB ratios relative to a material's approved base color; source shading and texture remain pixel-derived. */
function colorRatio(base: Rgb, target: Rgb): Rgb {
  return [target[0] / base[0], target[1] / base[1], target[2] / base[2]];
}

/** Maps material codes to selected color ratios; null preserves the source RGB exactly, including every default material. */
function materialRatios(appearance: PlayerAppearance): MaterialRatios {
  return [
    null,
    appearance.skinTone === "peach" ? null : colorRatio(SKIN_COLORS.peach, SKIN_COLORS[appearance.skinTone]),
    appearance.hairColor === "chestnut" ? null : colorRatio(HAIR_COLORS.chestnut, HAIR_COLORS[appearance.hairColor]),
    appearance.topColor === "cream" ? null : colorRatio(TOP_COLORS.cream, TOP_COLORS[appearance.topColor]),
    appearance.bottomColor === "denim" ? null : colorRatio(BOTTOM_COLORS.denim, BOTTOM_COLORS[appearance.bottomColor]),
  ];
}

/** Selects a source variant independently for one part; changing a hairstyle never selects a different shirt or lower garment. */
function variantRow(appearance: PlayerAppearance, layer: CharacterLayer): number {
  if (layer === "head") return HEAD_ROWS[appearance.gender][appearance.head];
  if (layer === "top") return TOP_ROWS[appearance.gender][appearance.top];
  return BOTTOM_ROWS[appearance.gender][appearance.bottom];
}

/** Creates one native 144 × 256 canvas for twelve source frames; failures remain explicit instead of substituting old artwork. */
function createPartCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PART_ATLAS_WIDTH;
  canvas.height = PART_ATLAS_HEIGHT;
  return canvas;
}

/** Returns a readable 2D context with nearest-pixel drawing; the supplied canvas owns the resulting source-derived atlas. */
function partContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("浏览器无法准备角色分层画布。");
  context.imageSmoothingEnabled = false;
  return context;
}

/**
 * Crops one approved part variant and recolors only pixels named by its material mask.
 * Both images use the same 432 × 1536 coordinates; mask R is a material code and source alpha is never changed.
 * This function copies source shapes only: it does not synthesize bodies, clothing, edges or facial details.
 */
function preparePartAtlas(
  appearance: PlayerAppearance,
  layer: CharacterLayer,
  layersSource: HTMLImageElement,
  materialsSource: HTMLImageElement,
  ratios: MaterialRatios,
  maskContext: CanvasRenderingContext2D,
): HTMLCanvasElement {
  const canvas = createPartCanvas();
  const context = partContext(canvas);
  const sourceX = PART_COLUMNS[layer] * PART_ATLAS_WIDTH;
  const sourceY = variantRow(appearance, layer) * PART_ATLAS_HEIGHT;
  context.drawImage(layersSource, sourceX, sourceY, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT,
    0, 0, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT);
  if (ratios.every((ratio) => ratio === null)) return canvas;

  maskContext.clearRect(0, 0, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT);
  maskContext.drawImage(materialsSource, sourceX, sourceY, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT,
    0, 0, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT);
  const pixels = context.getImageData(0, 0, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT);
  const mask = maskContext.getImageData(0, 0, PART_ATLAS_WIDTH, PART_ATLAS_HEIGHT).data;
  let changed = false;
  for (let index = 0; index < pixels.data.length; index += 4) {
    if (pixels.data[index + 3] === 0 || mask[index + 3] === 0) continue;
    const material = mask[index]!;
    if (material > 4) throw new Error("角色材质遮罩包含未知颜色编号。");
    const ratio = ratios[material];
    if (!ratio) continue;
    for (let channel = 0; channel < 3; channel += 1) {
      pixels.data[index + channel] = Math.min(255, Math.round(pixels.data[index + channel]! * ratio[channel]!));
    }
    changed = true;
  }
  if (changed) context.putImageData(pixels, 0, 0);
  return canvas;
}

/**
 * Returns three synchronous part atlases for the supplied validated appearance.
 * Only the most recent appearance is retained, so repeated wardrobe changes cannot grow an unbounded texture cache.
 * New atlases replace the cache atomically after all three source crops and color transformations succeed.
 */
function appearanceAtlases(appearance: PlayerAppearance): CharacterAtlases {
  const sources = getCharacterArtSources();
  const key = [appearance.gender, appearance.head, appearance.top, appearance.bottom,
    appearance.skinTone, appearance.hairColor, appearance.topColor, appearance.bottomColor].join(":");
  if (cachedAtlases && key === cachedAppearanceKey) return cachedAtlases;
  const ratios = materialRatios(appearance);
  const maskContext = partContext(createPartCanvas());
  const nextAtlases = {
    head: preparePartAtlas(appearance, "head", sources.layers, sources.materials, ratios, maskContext),
    top: preparePartAtlas(appearance, "top", sources.layers, sources.materials, ratios, maskContext),
    bottom: preparePartAtlas(appearance, "bottom", sources.layers, sources.materials, ratios, maskContext),
  };
  cachedAtlases = Object.freeze(nextAtlases);
  cachedAppearanceKey = key;
  return cachedAtlases;
}

/**
 * Draws one approved 48 × 64 PNG frame or one transparent head/top/bottom layer for Vue and Phaser.
 * Appearance is domain-validated; directions are down/left/right/up, step 1 is idle and 0/2 are contact poses.
 * Only this native frame is cleared under the caller's existing transform, which is restored along with other canvas state.
 * Sources must already be loaded by ensureCharacterArtReady; every part shares neck y28, waist y40 and feet y60.
 */
export function paintCharacterFrame(
  context: CanvasRenderingContext2D,
  appearance: PlayerAppearance,
  facing: CharacterFacing,
  walkStep: number,
  layer?: CharacterLayer,
): void {
  const atlases = appearanceAtlases(appearance);
  const step = Number.isFinite(walkStep) ? ((Math.round(walkStep) % 3) + 3) % 3 : 1;
  const sourceX = step * FRAME_WIDTH;
  const sourceY = FACING_ROWS[facing] * FRAME_HEIGHT;
  context.save();
  try {
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    for (const part of layer ? [layer] : PAINT_ORDER) {
      context.drawImage(atlases[part], sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
        0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    }
  } finally {
    context.restore();
  }
}
