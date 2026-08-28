import { ITEM_ID } from "../../../../domain/items/definitions.ts";
import { GARDENS_ICON_URL } from "./item-icons.ts";

export const TOOL_ART_CANDIDATE_KEYS = {
  plowing: "tool-art-vectoraith-plowing",
  helloTools: "tool-art-hello-rumin-tools",
  gardensIcons: "tool-art-ivoryred-gardens-icons",
} as const;

export const TOOL_ART_CANDIDATE_URLS = {
  plowing: "/tool-art-candidate/vectoraith-farmer-plowing.png",
  helloTools: "/tool-art-candidate/hello-rumin-tool-animation.png",
  gardensIcons: GARDENS_ICON_URL,
} as const;

export type CandidateToolAction = "axe" | "plow" | "plant" | "water" | "harvest";

export const HELLO_RUMIN_TOOL_FRAMES = {
  watering: 6,
  hoe: 13,
  axe: 27,
} as const;

export const GARDENS_ICON_FRAMES = {
  seedBag: 56,
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

/** Maps the transient held item to its player-side animation without inspecting target state. */
export function candidateActionForItem(itemId: string): CandidateToolAction {
  switch (itemId) {
    case ITEM_ID.axe: return "axe";
    case ITEM_ID.hoe: return "plow";
    case ITEM_ID.wateringCan: return "water";
    case ITEM_ID.turnipSeed: return "plant";
    default: return "harvest";
  }
}
