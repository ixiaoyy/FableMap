import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import { isToolArtPreviewEnabled } from "./tool-art-candidate.ts";

/** Keeps unpublished art inside the existing isolated development farm; production has no candidate URLs. */
export const PASTORAL_PREVIEW = import.meta.env?.DEV && isToolArtPreviewEnabled() ? {
  tools: { key: "pastoral-tools-preview", url: "/__dev-art/fresh-pastoral-tools-v1.png" },
  cottage: { key: "pastoral-cottage-preview", url: "/__dev-art/fresh-pastoral-cottage-v1.png" },
  interior: { key: "pastoral-interior-preview", url: "/__dev-art/fresh-pastoral-interior-v1.png" },
} : null;

const TOOL_CELLS: Readonly<Record<string, readonly [number, number]>> = {
  [ITEM_ID.hoe]: [0, 0],
  [ITEM_ID.wateringCan]: [1, 0],
  [ITEM_ID.axe]: [2, 0],
  [ITEM_ID.pickaxe]: [0, 1],
  [ITEM_ID.scythe]: [1, 1],
};

/** Resolves an original 512px sprite cell for one known tool; null keeps all ordinary play on published art. */
export function pastoralToolCell(itemId: string): readonly [number, number] | null {
  return PASTORAL_PREVIEW ? TOOL_CELLS[itemId] ?? null : null;
}

/** Fits the padded candidate to the existing avatar's hand; non-candidate item sizes are unchanged. */
export function pastoralToolScale(itemId: string): number {
  return pastoralToolCell(itemId) ? (itemId === ITEM_ID.wateringCan ? 22 : 26) / 512 : 1;
}

/** Returns a solid handle grip in normalized 512px cell coordinates before mirroring; ordinary items return null. */
export function pastoralToolGrip(itemId: string): { x: number; y: number } | null {
  if (!pastoralToolCell(itemId)) return null;
  if (itemId === ITEM_ID.wateringCan) return { x: 0.60, y: 0.18 };
  if (itemId === ITEM_ID.scythe) return { x: 0.20, y: 0.79 };
  return { x: 0.23, y: 0.79 };
}
