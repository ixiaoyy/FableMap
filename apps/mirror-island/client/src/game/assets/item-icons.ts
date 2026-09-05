import { cropForSeed } from "../../../../domain/farming/crops.ts";
import { ITEM_ID, type ItemId } from "../../../../domain/items/definitions.ts";
import { ITEM_PIXEL_ART } from "./item-pixel-art.ts";
import type { PixelArt } from "./pixel-art.ts";
import { VECTORAITH_MEDIA_URLS } from "./visual-profile.ts";

export const GARDENS_ICON_URL = "/game-media/v1/assets/vendor/ivoryred/gardens-2026-08-27/original/all-the-icons-gardens.png?v=de4dbbb5";

export interface AtlasItemIcon {
  readonly kind: "atlas";
  readonly url: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly x: number;
  readonly y: number;
  readonly width: 16 | 32;
  readonly height: 16 | 32;
}

export type ItemIconDefinition = AtlasItemIcon | { readonly kind: "pixels"; readonly art: PixelArt };

const GARDENS_SOURCE = { url: GARDENS_ICON_URL, width: 160, height: 176 } as const;
const VECTORAITH_CROPS_SOURCE = { url: VECTORAITH_MEDIA_URLS.crops, width: 256, height: 256 } as const;
const VECTORAITH_BUILDINGS_SOURCE = { url: VECTORAITH_MEDIA_URLS.buildings, width: 256, height: 256 } as const;

const ITEM_ICONS: Readonly<Partial<Record<ItemId, ItemIconDefinition>>> = {
  [ITEM_ID.chest]: icon(VECTORAITH_BUILDINGS_SOURCE, 5, 0, 32),
  [ITEM_ID.axe]: icon(GARDENS_SOURCE, 0, 10),
  [ITEM_ID.hoe]: icon(GARDENS_SOURCE, 0, 2),
  [ITEM_ID.pickaxe]: icon(GARDENS_SOURCE, 6, 1),
  [ITEM_ID.wateringCan]: icon(GARDENS_SOURCE, 0, 5),
  [ITEM_ID.turnipSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.turnip]: icon(VECTORAITH_CROPS_SOURCE, 11, 7),
  [ITEM_ID.bokChoySeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.bokChoy]: icon(VECTORAITH_CROPS_SOURCE, 7, 3),
  [ITEM_ID.cauliflowerSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.cauliflower]: icon(VECTORAITH_CROPS_SOURCE, 7, 1),
  [ITEM_ID.greenPeaSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.greenPea]: icon(VECTORAITH_CROPS_SOURCE, 3, 3),
  [ITEM_ID.springPotatoSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.springPotato]: icon(VECTORAITH_CROPS_SOURCE, 15, 7),
  [ITEM_ID.rapeseedSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.rapeseedFlower]: icon(VECTORAITH_CROPS_SOURCE, 14, 9),
  ...Object.fromEntries(Object.entries(ITEM_PIXEL_ART).map(([itemId, art]) => [itemId, { kind: "pixels" as const, art }])),
};

/** Resolves one production Hotbar icon without adding media fields to item definitions or saves. */
export function itemIconForItem(itemId: string): ItemIconDefinition | null {
  return ITEM_ICONS[itemId as ItemId] ?? null;
}

/** Fits a reviewed square source frame into the 16px UI cell; 32px originals stay native at the default 2x UI size. */
export function itemIconStyle(iconDefinition: AtlasItemIcon, scale = 2): Record<string, string> {
  const sourceScale = (16 * scale) / iconDefinition.width;
  return {
    backgroundImage: `url("${iconDefinition.url}")`,
    backgroundPosition: `${-iconDefinition.x * sourceScale}px ${-iconDefinition.y * sourceScale}px`,
    backgroundSize: `${iconDefinition.sourceWidth * sourceScale}px ${iconDefinition.sourceHeight * sourceScale}px`,
  };
}

/** Returns the harvested crop badge for a seed bag, reusing the domain's seed-to-crop identity only. */
export function seedBadgeForItem(itemId: string): ItemIconDefinition | null {
  const crop = cropForSeed(itemId);
  return crop ? itemIconForItem(crop.cropId) : null;
}

/** References an unchanged square source frame on the 16px atlas grid; larger props retain their complete source frame. */
function icon(
  source: { readonly url: string; readonly width: number; readonly height: number },
  column: number,
  row: number,
  frameSize: 16 | 32 = 16,
): AtlasItemIcon {
  return {
    kind: "atlas",
    url: source.url,
    sourceWidth: source.width,
    sourceHeight: source.height,
    x: column * 16,
    y: row * 16,
    width: frameSize,
    height: frameSize,
  };
}
