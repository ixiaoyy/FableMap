import { ITEM_ID, type ItemId } from "../../../../domain/items/definitions.ts";
import { VECTORAITH_MEDIA_URLS } from "./visual-profile.ts";

export const TOOL_ART_CANDIDATE_KEYS = {
  plowing: "tool-art-vectoraith-plowing",
  helloTools: "tool-art-hello-rumin-tools",
} as const;

export const TOOL_ART_CANDIDATE_URLS = {
  plowing: "/tool-art-candidate/vectoraith-farmer-plowing.png",
  helloTools: "/tool-art-candidate/hello-rumin-tool-animation.png",
  gardensIcons: "/tool-art-candidate/ivoryred-gardens-icons.png",
} as const;

export type CandidateToolAction = "axe" | "plow" | "plant" | "water" | "harvest";

export interface CandidateIconDefinition {
  readonly url: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly x: number;
  readonly y: number;
  readonly width: 16;
  readonly height: 16;
}

const GARDENS_SOURCE = { url: TOOL_ART_CANDIDATE_URLS.gardensIcons, width: 160, height: 176 } as const;
const VECTORAITH_CROPS_SOURCE = { url: VECTORAITH_MEDIA_URLS.crops, width: 256, height: 256 } as const;
const VECTORAITH_DETAILS_SOURCE = { url: VECTORAITH_MEDIA_URLS.details, width: 256, height: 256 } as const;

const CANDIDATE_ICONS: Readonly<Partial<Record<ItemId, CandidateIconDefinition>>> = {
  [ITEM_ID.axe]: icon(GARDENS_SOURCE, 0, 9),
  [ITEM_ID.hoe]: icon(GARDENS_SOURCE, 0, 1),
  [ITEM_ID.wateringCan]: icon(GARDENS_SOURCE, 0, 4),
  [ITEM_ID.turnipSeed]: icon(GARDENS_SOURCE, 6, 5),
  [ITEM_ID.turnip]: icon(VECTORAITH_CROPS_SOURCE, 7, 1),
  [ITEM_ID.wood]: icon(VECTORAITH_DETAILS_SOURCE, 6, 5),
};

export const HELLO_RUMIN_TOOL_FRAMES = {
  watering: 6,
  axe: 27,
} as const;

export const VECTORAITH_PLOWING_FRAMES = {
  down: [0, 1, 2],
  left: [3, 4, 5],
  right: [6, 7, 8],
  up: [9, 10, 11],
} as const;

/** Enables ignored local tool-art assets only in Vite development mode with an explicit query flag. */
export function isToolArtCandidateEnabled(search = window.location.search): boolean {
  const mode = new URLSearchParams(search).get("toolArt");
  return import.meta.env.DEV && (mode === "free" || mode === "preview");
}

/** Enables an isolated no-Keycloak Farm session only for local visual review of the tool-art candidate. */
export function isToolArtPreviewEnabled(search = window.location.search): boolean {
  const parameters = new URLSearchParams(search);
  return isToolArtCandidateEnabled(search)
    && (parameters.get("toolArt") === "preview" || parameters.get("toolArtPreview") === "1");
}

/** Resolves one presentation-only Hotbar icon without adding media fields to item definitions or saves. */
export function candidateIconForItem(itemId: string): CandidateIconDefinition | null {
  return CANDIDATE_ICONS[itemId as ItemId] ?? null;
}

/** Creates one reviewed 16×16 frame reference into an unchanged full source image. */
function icon(
  source: { readonly url: string; readonly width: number; readonly height: number },
  column: number,
  row: number,
): CandidateIconDefinition {
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
