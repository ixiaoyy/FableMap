/** Legacy whole-character IDs remain readable only to preserve existing local farms. */
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

export interface PlayerAppearance {
  gender: "male" | "female";
  head: "short" | "bob" | "ponytail";
  top: "shirt" | "overalls" | "jacket";
  bottom: "trousers" | "shorts" | "skirt";
  skinTone: "peach" | "tan" | "umber";
  hairColor: "chestnut" | "black" | "gold";
  topColor: "mint" | "cream" | "coral" | "sky";
  bottomColor: "denim" | "sand" | "forest";
}

export const DEFAULT_PLAYER_APPEARANCE: PlayerAppearance = Object.freeze({
  gender: "female",
  head: "bob",
  top: "overalls",
  bottom: "trousers",
  skinTone: "peach",
  hairColor: "chestnut",
  topColor: "mint",
  bottomColor: "denim",
});

const LEGACY_APPEARANCES: Readonly<Record<PlayerAppearanceId, PlayerAppearance>> = {
  "farmer-original": { ...DEFAULT_PLAYER_APPEARANCE, gender: "male", head: "short" },
  "islander-spring": { ...DEFAULT_PLAYER_APPEARANCE, head: "ponytail", top: "shirt" },
  "islander-rain": { ...DEFAULT_PLAYER_APPEARANCE, gender: "male", head: "short", top: "jacket", topColor: "sky" },
  "islander-stone": { ...DEFAULT_PLAYER_APPEARANCE, gender: "male", head: "short", skinTone: "tan", topColor: "cream" },
  "islander-sunset": { ...DEFAULT_PLAYER_APPEARANCE, top: "shirt", bottom: "skirt", topColor: "coral" },
  "islander-pine": { ...DEFAULT_PLAYER_APPEARANCE, gender: "male", head: "short", hairColor: "black", bottomColor: "forest" },
  "islander-lake": { ...DEFAULT_PLAYER_APPEARANCE, head: "ponytail", top: "jacket", topColor: "sky", bottom: "shorts" },
  "islander-lantern": { ...DEFAULT_PLAYER_APPEARANCE, gender: "male", head: "short", skinTone: "umber", top: "shirt", topColor: "cream", bottomColor: "sand" },
  "islander-camellia": { ...DEFAULT_PLAYER_APPEARANCE, head: "ponytail", hairColor: "gold", top: "shirt", topColor: "coral", bottom: "skirt" },
};

/** Validates unknown composition data and returns a fresh value; clothing and hair are independent of gender. */
export function decodePlayerAppearance(value: unknown): PlayerAppearance {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Player appearance is invalid.");
  }
  const source = value as Record<string, unknown>;
  return {
    gender: appearanceOption(source.gender, ["male", "female"], "gender"),
    head: appearanceOption(source.head, ["short", "bob", "ponytail"], "head"),
    top: appearanceOption(source.top, ["shirt", "overalls", "jacket"], "top"),
    bottom: appearanceOption(source.bottom, ["trousers", "shorts", "skirt"], "bottom"),
    skinTone: appearanceOption(source.skinTone, ["peach", "tan", "umber"], "skin tone"),
    hairColor: appearanceOption(source.hairColor, ["chestnut", "black", "gold"], "hair color"),
    topColor: appearanceOption(source.topColor, ["mint", "cream", "coral", "sky"], "top color"),
    bottomColor: appearanceOption(source.bottomColor, ["denim", "sand", "forest"], "bottom color"),
  };
}

/** Maps one validated historical preset to a fresh composition without changing any non-appearance save data. */
export function legacyPlayerAppearance(appearanceId: PlayerAppearanceId): PlayerAppearance {
  return { ...LEGACY_APPEARANCES[decodePlayerAppearanceId(appearanceId)] };
}

/** Narrows one unknown field to its allowed string choices and reports the field when validation fails. */
function appearanceOption<const T extends string>(value: unknown, choices: readonly T[], field: string): T {
  if (typeof value !== "string" || !choices.includes(value as T)) {
    throw new Error(`Player appearance ${field} is invalid.`);
  }
  return value as T;
}

/** Validates one stable player appearance ID without exposing client texture or frame metadata. */
export function decodePlayerAppearanceId(value: unknown): PlayerAppearanceId {
  if (typeof value !== "string" || !PLAYER_APPEARANCE_ID_SET.has(value)) {
    throw new Error("Player appearance is invalid.");
  }
  return value as PlayerAppearanceId;
}
