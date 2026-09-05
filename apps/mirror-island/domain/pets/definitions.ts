import { decodeGameMinute } from "../time/game-time.ts";
import type { Facing } from "../world/facing.ts";
import type { WorldCatalog, WorldPoint } from "../world/regions.ts";

export const PET_SPECIES = {
  cat: "cat",
  dog: "dog",
} as const;

export type PetSpecies = typeof PET_SPECIES[keyof typeof PET_SPECIES];
export type PetHomeRegionId = "farm" | "cottage";

export const PET_DEFAULT_NAMES: Readonly<Record<PetSpecies, string>> = {
  cat: "团子",
  dog: "来福",
};

export const PET_MAX_BOND = 100;
export const PET_NAME_MAX_CODE_POINTS = 12;
const PET_ADOPTION_MIN_DAY = 2;
const PET_COTTAGE_START_MINUTE = 18 * 60;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;

export interface PetState {
  readonly species: PetSpecies;
  readonly name: string;
  readonly adoptedDay: number;
  bond: number;
  lastPettedDay: number;
  regionId: PetHomeRegionId;
  x: number;
  y: number;
  facing: Facing;
  motion: "idle" | "walking" | "resting";
  anchorIndex: number;
  pauseRemainingMs: number;
}

export const PET_ANCHOR_IDS: Readonly<Record<PetHomeRegionId, readonly string[]>> = {
  farm: ["pet-farm-yard-west", "pet-farm-yard-east", "pet-farm-yard-rest"],
  cottage: ["pet-cottage-hearth", "pet-cottage-window", "pet-cottage-rug"],
};

/** Reports whether an unknown value is one of the two reviewed pet species. */
export function isPetSpecies(value: unknown): value is PetSpecies {
  return value === PET_SPECIES.cat || value === PET_SPECIES.dog;
}

/** Trims and validates one display name by Unicode code points without mutating caller input. */
export function normalizePetName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  const length = Array.from(name).length;
  if (length < 1 || length > PET_NAME_MAX_CODE_POINTS || CONTROL_CHARACTER_PATTERN.test(name)) {
    return null;
  }
  return name;
}

/** Decodes one persisted or command species and rejects unknown animal identities. */
export function decodePetSpecies(value: unknown): PetSpecies {
  if (!isPetSpecies(value)) throw new Error("Pet species is invalid.");
  return value;
}

/** Decodes one persisted pet name using the same Unicode rules as adoption commands. */
export function decodePetName(value: unknown): string {
  const name = normalizePetName(value);
  if (!name) throw new Error("Pet name is invalid.");
  return name;
}

/** Creates the irreversible initial pet record for one Day 2+ adoption. */
export function createPetState(species: PetSpecies, name: string, adoptedDay: number): PetState {
  const day = petDayFrom(adoptedDay, "Pet adoption day is invalid.");
  if (day < PET_ADOPTION_MIN_DAY) throw new Error("Pet adoption day is invalid.");
  return {
    species: decodePetSpecies(species),
    name: decodePetName(name),
    adoptedDay: day,
    bond: 0,
    lastPettedDay: 0,
    regionId: "farm",
    x: 352,
    y: 272,
    facing: "down",
    motion: "idle",
    anchorIndex: 0,
    pauseRemainingMs: 1_400,
  };
}

/** Decodes a nullable persisted pet while validating day and hidden bond invariants. */
export function decodePetState(value: unknown, currentDay: number): PetState | null {
  if (value === null) return null;
  const pet = petRecordFrom(value);
  const day = petDayFrom(currentDay, "Game day is invalid.");
  const adoptedDay = petDayFrom(pet.adoptedDay, "Pet adoption day is invalid.");
  const bond = petNonNegativeIntegerFrom(pet.bond, "Pet bond is invalid.");
  const lastPettedDay = petNonNegativeIntegerFrom(pet.lastPettedDay, "Pet interaction day is invalid.");
  if (
    adoptedDay < PET_ADOPTION_MIN_DAY
    || adoptedDay > day
    || bond > PET_MAX_BOND
    || lastPettedDay > day
    || (lastPettedDay !== 0 && lastPettedDay < adoptedDay)
    || (pet.regionId !== "farm" && pet.regionId !== "cottage")
    || typeof pet.x !== "number" || !Number.isFinite(pet.x) || pet.x < 0
    || typeof pet.y !== "number" || !Number.isFinite(pet.y) || pet.y < 0
    || !["left", "right", "up", "down"].includes(String(pet.facing))
    || !["idle", "walking", "resting"].includes(String(pet.motion))
    || !Number.isSafeInteger(pet.anchorIndex) || Number(pet.anchorIndex) < 0 || Number(pet.anchorIndex) > 2
    || typeof pet.pauseRemainingMs !== "number" || !Number.isFinite(pet.pauseRemainingMs)
    || pet.pauseRemainingMs < 0 || pet.pauseRemainingMs > 2_600
  ) {
    throw new Error("Pet state is invalid.");
  }
  return {
    species: decodePetSpecies(pet.species),
    name: decodePetName(pet.name),
    adoptedDay,
    bond,
    lastPettedDay,
    regionId: pet.regionId,
    x: pet.x,
    y: pet.y,
    facing: pet.facing as Facing,
    motion: pet.motion as PetState["motion"],
    anchorIndex: Number(pet.anchorIndex),
    pauseRemainingMs: pet.pauseRemainingMs,
  };
}

/** Resolves the original three authored home anchors now consumed by domain motion rather than mutable client animation. */
export function petDomainAnchors(catalog: WorldCatalog, regionId: PetHomeRegionId): readonly WorldPoint[] {
  return PET_ANCHOR_IDS[regionId].map((spawnId) => catalog.requireSpawn(regionId, spawnId));
}

/** Rejects persisted pet positions outside the finite authored home world without silently migrating coordinates. */
export function reconcilePetState(pet: PetState | null, catalog: WorldCatalog): void {
  if (!pet) return;
  const region = catalog.requireRegion(pet.regionId);
  if (pet.x >= region.widthPixels || pet.y >= region.heightPixels || catalog.isBlocked(pet.regionId, pet.x, pet.y, 4, 3, [])) {
    throw new Error("Pet position is invalid.");
  }
}

/** Derives the only region where the adopted pet is present at a validated game minute. */
export function homePetRegionAt(minuteOfDay: number): PetHomeRegionId {
  return decodeGameMinute(minuteOfDay) < PET_COTTAGE_START_MINUTE ? "farm" : "cottage";
}

/** Requires one positive safe integer for adoption and current-day validation. */
function petDayFrom(value: unknown, message: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error(message);
  return Number(value);
}

/** Requires one non-negative safe integer for hidden pet progression fields. */
function petNonNegativeIntegerFrom(value: unknown, message: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(message);
  return Number(value);
}

/** Requires one non-array object before persisted pet fields are inspected. */
function petRecordFrom(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Pet state is invalid.");
  }
  return value as Record<string, unknown>;
}
