export const PLAYER_APPEARANCE_IDS = [
  "farmer-original",
  "islander-spring",
  "islander-rain",
  "islander-stone",
  "islander-sunset",
  "islander-pine",
  "islander-lake",
  "islander-lantern",
  "islander-camellia",
] as const;

export type PlayerAppearanceId = typeof PLAYER_APPEARANCE_IDS[number];

export const DEFAULT_PLAYER_APPEARANCE_ID: PlayerAppearanceId = "farmer-original";

const PLAYER_APPEARANCE_ID_SET = new Set<string>(PLAYER_APPEARANCE_IDS);

/** Validates one stable player appearance ID without exposing client texture or frame metadata. */
export function decodePlayerAppearanceId(value: unknown): PlayerAppearanceId {
  if (typeof value !== "string" || !PLAYER_APPEARANCE_ID_SET.has(value)) {
    throw new Error("Player appearance is invalid.");
  }
  return value as PlayerAppearanceId;
}
