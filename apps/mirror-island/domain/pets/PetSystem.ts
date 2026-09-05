import type { GameState } from "../state/game-state.ts";
import {
  PET_MAX_BOND,
  createPetState,
  homePetRegionAt,
  isPetSpecies,
  normalizePetName,
  petDomainAnchors,
  type PetSpecies,
} from "./definitions.ts";
import { facingFromVector } from "../world/facing.ts";
import type { WorldCatalog, WorldPoint } from "../world/regions.ts";
import { WorldOccupancySystem } from "../world/WorldOccupancySystem.ts";

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
  private readonly occupancy: WorldOccupancySystem;

  /** Owns the adopted pet's motion using the same authored catalog and object occupancy as farm placement. */
  constructor(private readonly catalog: WorldCatalog) {
    this.occupancy = new WorldOccupancySystem(catalog);
  }

  /** Adopts exactly one cat or dog on Day 2+ after normalizing its permanent display name. */
  adopt(state: GameState, species: PetSpecies, name: string): PetAdoptionResult {
    if (state.day < 2) return "not-ready";
    if (state.pet) return "already-adopted";
    if (!isPetSpecies(species)) return "invalid-species";
    const normalizedName = normalizePetName(name);
    if (!normalizedName) return "invalid-name";
    state.pet = createPetState(species, normalizedName, state.day);
    this.enterHomeRegion(state);
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
    pet.motion = "resting";
    pet.pauseRemainingMs = 1_800;
    return "petted";
  }

  /** Advances one bounded realtime motion tick; the caller freezes this method whenever world time/input are paused. */
  advance(state: GameState, deltaMs: number): boolean {
    const pet = state.pet;
    if (!pet || !Number.isFinite(deltaMs) || deltaMs <= 0) return false;
    if (pet.regionId !== homePetRegionAt(state.minuteOfDay)) { this.enterHomeRegion(state); return true; }
    const elapsed = Math.min(deltaMs, 100);
    if (pet.motion !== "walking") {
      pet.pauseRemainingMs = Math.max(0, pet.pauseRemainingMs - elapsed);
      if (pet.pauseRemainingMs === 0) pet.motion = "walking";
      return true;
    }
    const anchors = petDomainAnchors(this.catalog, pet.regionId);
    const targetIndex = (pet.anchorIndex + 1) % anchors.length;
    const target = anchors[targetIndex]!;
    const dx = target.x - pet.x; const dy = target.y - pet.y;
    const distance = Math.hypot(dx, dy); const step = 18 * elapsed / 1_000;
    const position = distance <= step ? target : { x: pet.x + dx / distance * step, y: pet.y + dy / distance * step };
    if (this.occupancy.isBlocked(state, pet.regionId, position.x, position.y, 4, 3)) {
      pet.anchorIndex = targetIndex;
      pet.motion = "idle"; pet.pauseRemainingMs = 1_400;
      return true;
    }
    pet.facing = facingFromVector(dx, dy, pet.facing);
    pet.x = position.x; pet.y = position.y;
    if (distance <= step) {
      pet.anchorIndex = targetIndex;
      pet.motion = (state.day + targetIndex + (pet.species === "dog" ? 1 : 0)) % 3 === 0 ? "resting" : "idle";
      pet.pauseRemainingMs = pet.motion === "resting" ? 2_600 : 1_400;
    }
    return true;
  }

  /** Chooses the reviewed daily home anchor and a safe nearby tile if a persistent player object occupies it. */
  private enterHomeRegion(state: GameState): void {
    const pet = state.pet;
    if (!pet) return;
    pet.regionId = homePetRegionAt(state.minuteOfDay);
    const anchors = petDomainAnchors(this.catalog, pet.regionId);
    pet.anchorIndex = (pet.adoptedDay + state.day + (pet.species === "dog" ? 1 : 0)) % anchors.length;
    const anchor = anchors[pet.anchorIndex]!;
    const safe = this.safeHomePoint(state, anchor);
    pet.x = safe.x; pet.y = safe.y;
    pet.motion = "idle"; pet.pauseRemainingMs = 1_400; pet.facing = "down";
  }

  /** Returns the nearest finite free home tile when a saved object occupies an anchor; fails before creating an overlap. */
  private safeHomePoint(state: GameState, anchor: WorldPoint): WorldPoint {
    const pet = state.pet!;
    if (!this.occupancy.isBlocked(state, pet.regionId, anchor.x, anchor.y, 4, 3)) return anchor;
    const region = this.catalog.requireRegion(pet.regionId);
    let nearest: WorldPoint | null = null; let distance = Infinity;
    for (let row = 0; row < region.collision.rows; row += 1) {
      for (let column = 0; column < region.collision.columns; column += 1) {
        const x = column * 16 + 8; const y = row * 16 + 8; const delta = Math.hypot(x - anchor.x, y - anchor.y);
        if (delta >= distance || this.occupancy.isBlocked(state, pet.regionId, x, y, 4, 3) || this.catalog.exitAt(pet.regionId, x, y)) continue;
        nearest = { x, y }; distance = delta;
      }
    }
    if (!nearest) throw new Error("Pet home has no safe position.");
    return nearest;
  }
}
