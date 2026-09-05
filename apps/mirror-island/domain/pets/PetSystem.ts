import type { GameState } from "../state/game-state.ts";
import {
  PET_MAX_BOND,
  createPetState,
  homePetRegionAt,
  isPetSpecies,
  normalizePetName,
  type PetSpecies,
} from "./definitions.ts";

export type PetAdoptionResult =
  | "adopted"
  | "not-ready"
  | "already-adopted"
  | "invalid-species"
  | "invalid-name";

export type PetInteractionResult =
  | "petted"
  | "already-petted"
  | "missing-pet"
  | "pet-not-present";

export class PetSystem {
  /** Adopts exactly one cat or dog on Day 2+ after normalizing its permanent display name. */
  adopt(state: GameState, species: PetSpecies, name: string): PetAdoptionResult {
    if (state.day < 2) return "not-ready";
    if (state.pet) return "already-adopted";
    if (!isPetSpecies(species)) return "invalid-species";
    const normalizedName = normalizePetName(name);
    if (!normalizedName) return "invalid-name";
    state.pet = createPetState(species, normalizedName, state.day);
    return "adopted";
  }

  /** Applies the once-per-day home interaction and caps hidden bond without exposing its value. */
  pet(state: GameState): PetInteractionResult {
    const pet = state.pet;
    if (!pet) return "missing-pet";
    if (state.player.regionId !== homePetRegionAt(state.minuteOfDay)) return "pet-not-present";
    if (pet.lastPettedDay === state.day) return "already-petted";
    pet.lastPettedDay = state.day;
    pet.bond = Math.min(PET_MAX_BOND, pet.bond + 1);
    return "petted";
  }
}
