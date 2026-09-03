import { ITEM_ID, type ItemId } from "../../../../domain/items/definitions.ts";
import { VECTORAITH_MEDIA_URLS } from "./visual-profile.ts";

export const GARDENS_ICON_URL = "/game-media/v1/assets/vendor/ivoryred/gardens-2026-08-27/original/all-the-icons-gardens.png?v=de4dbbb5";

export interface ItemIconDefinition {
  readonly url: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly x: number;
  readonly y: number;
  readonly width: 16;
  readonly height: 16;
}

const GARDENS_SOURCE = { url: GARDENS_ICON_URL, width: 160, height: 176 } as const;
const VECTORAITH_CROPS_SOURCE = { url: VECTORAITH_MEDIA_URLS.crops, width: 256, height: 256 } as const;
const VECTORAITH_DETAILS_SOURCE = { url: VECTORAITH_MEDIA_URLS.details, width: 256, height: 256 } as const;

const ITEM_ICONS: Readonly<Partial<Record<ItemId, ItemIconDefinition>>> = {
  [ITEM_ID.axe]: icon(GARDENS_SOURCE, 0, 9),
  [ITEM_ID.hoe]: icon(GARDENS_SOURCE, 0, 1),
  [ITEM_ID.wateringCan]: icon(GARDENS_SOURCE, 0, 4),
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
  [ITEM_ID.wood]: icon(VECTORAITH_DETAILS_SOURCE, 6, 5),
};

/** Resolves one production Hotbar icon without adding media fields to item definitions or saves. */
export function itemIconForItem(itemId: string): ItemIconDefinition | null {
  return ITEM_ICONS[itemId as ItemId] ?? null;
}

/** Converts one reviewed source-sheet frame into a crisp integer-scale CSS sprite. */
export function itemIconStyle(iconDefinition: ItemIconDefinition, scale = 2): Record<string, string> {
  return {
    backgroundImage: `url("${iconDefinition.url}")`,
    backgroundPosition: `${-iconDefinition.x * scale}px ${-iconDefinition.y * scale}px`,
    backgroundSize: `${iconDefinition.sourceWidth * scale}px ${iconDefinition.sourceHeight * scale}px`,
  };
}

/** Creates one immutable 16×16 frame reference into an unchanged reviewed source sheet. */
function icon(
  source: { readonly url: string; readonly width: number; readonly height: number },
  column: number,
  row: number,
): ItemIconDefinition {
  return {
    url: source.url,
    sourceWidth: source.width,
    sourceHeight: source.height,
    x: column * 16,
    y: row * 16,
    width: 16,
    height: 16,
  };
}
