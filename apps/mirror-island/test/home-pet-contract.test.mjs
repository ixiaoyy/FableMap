import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PET_MAX_BOND,
  createPetState,
  homePetRegionAt,
  normalizePetName,
} from "../domain/pets/definitions.ts";
import { PetSystem } from "../domain/pets/PetSystem.ts";
import {
  createStoredGame,
  decodeStoredGame,
} from "../domain/persistence/SaveRepository.ts";
import { createDailyRequestState } from "../domain/requests/definitions.ts";
import { GameSession } from "../domain/session/GameSession.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import { WeatherSystem } from "../domain/weather/WeatherSystem.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import { petAnchorsForRegion, validatePetAnchors } from "../client/src/game/pets/pet-presentation.ts";
import { decodeTiledRegion } from "../client/src/game/world/tiled-region-decoder.ts";

class MemorySaveRepository {
  game = null;
  saveCalls = 0;

  /** Reports whether the isolated pet test slot contains one current snapshot. */
  async has() { return this.game !== null; }

  /** Returns the already-validated isolated snapshot without browser storage. */
  async load() { return this.game; }

  /** Captures one defensive current save and counts critical persistence calls. */
  async save(_ownerKey, _slotId, game) {
    this.game = game;
    this.saveCalls += 1;
  }

  /** Clears only the isolated pet test slot. */
  async delete() { this.game = null; }
}

/** Builds a two-region home catalog with reviewed pet anchors and no NPC collision owners. */
function createPetCatalog() {
  const collision = {
    columns: 10,
    rows: 10,
    tileWidth: 16,
    tileHeight: 16,
    blocked: Array.from({ length: 100 }, () => false),
  };
  return new WorldCatalog([
    {
      id: "farm",
      mapKey: "test-farm",
      displayName: "测试农场",
      defaultSpawnId: "home-yard",
      isStartRegion: true,
      widthPixels: 160,
      heightPixels: 160,
      collision,
      spawns: {
        "home-yard": { x: 24, y: 24 },
        "pet-farm-yard-west": { x: 48, y: 48 },
        "pet-farm-yard-east": { x: 96, y: 48 },
        "pet-farm-yard-rest": { x: 72, y: 88 },
      },
      exits: [],
      resources: [],
      interactions: [],
      npcs: [],
    },
    {
      id: "cottage",
      mapKey: "test-cottage",
      displayName: "测试小屋",
      defaultSpawnId: "entry",
      isStartRegion: false,
      widthPixels: 160,
      heightPixels: 160,
      collision,
      spawns: {
        entry: { x: 32, y: 32 },
        "pet-cottage-hearth": { x: 48, y: 48 },
        "pet-cottage-window": { x: 96, y: 48 },
        "pet-cottage-rug": { x: 72, y: 88 },
      },
      exits: [],
      resources: [],
      interactions: [{
        entityId: "cottage-bed",
        regionId: "cottage",
        kind: "bed",
        x: 16,
        y: 16,
        width: 32,
        height: 48,
      }],
      npcs: [],
    },
  ]);
}

/** Creates one complete current Day-2 state without relying on retired save migrations. */
function createDayTwoState(catalog) {
  const state = createInitialGameState(catalog);
  state.day = 2;
  state.lastSurfaceStoneRefreshDay = 2;
  state.lastSurfaceWeedRefreshDay = 2;
  state.weather = new WeatherSystem().create(state.worldSeed, 2);
  state.dailyForage = { day: 2, collectedIds: [] };
  state.dailyRequest = createDailyRequestState(2);
  return state;
}

test("current pet state round-trips and corrupt pet fields fail closed", () => {
  const catalog = createPetCatalog();
  const current = decodeStoredGame(createStoredGame(createDayTwoState(catalog), 800));
  assert.equal(current.version, 12);
  assert.equal(current.state.version, 12);
  assert.equal(current.state.pet, null);

  const state = current.state;
  state.pet = createPetState("cat", "团子", 2);
  const stored = createStoredGame(state, 900);
  assert.deepEqual(decodeStoredGame(stored), stored);
  assert.throws(
    () => decodeStoredGame({ ...stored, state: { ...stored.state, pet: { ...stored.state.pet, species: "fox" } } }),
    /species/i,
  );
  assert.throws(
    () => decodeStoredGame({ ...stored, state: { ...stored.state, pet: { ...stored.state.pet, name: "坏\n名字" } } }),
    /name/i,
  );
  assert.throws(
    () => decodeStoredGame({ ...stored, state: { ...stored.state, pet: { ...stored.state.pet, bond: PET_MAX_BOND + 1 } } }),
    /pet state/i,
  );
  assert.throws(
    () => decodeStoredGame({ ...stored, state: { ...stored.state, pet: { ...stored.state.pet, lastPettedDay: 3 } } }),
    /pet state/i,
  );
  assert.throws(() => decodeStoredGame({ ...stored, version: 10 }), /unsupported/i);
});

test("pet names count Unicode code points and adoption persists exactly once", async () => {
  assert.equal(normalizePetName("  小🐱  "), "小🐱");
  assert.equal(normalizePetName("一二三四五六七八九十甲乙丙"), null);
  assert.equal(normalizePetName("坏\u0000名字"), null);

  const catalog = createPetCatalog();
  const directState = createDayTwoState(catalog);
  const directPets = new PetSystem();
  directState.day = 1;
  assert.equal(directPets.adopt(directState, "cat", "团子"), "not-ready");
  directState.day = 2;
  assert.equal(directPets.adopt(directState, "fox", "小狐"), "invalid-species");
  const repository = new MemorySaveRepository();
  repository.game = createStoredGame(createDayTwoState(catalog), 800);
  const session = new GameSession(repository, "pet-owner", catalog, "main", () => 901);
  await session.continueGame();
  assert.equal(session.dispatch({ type: "adopt-pet", species: "cat", name: "坏\n名字" })?.code, "invalid-name");
  assert.equal(session.snapshot().pet, null);
  assert.equal(session.dispatch({ type: "adopt-pet", species: "cat", name: "  团子  " })?.code, "pet-adopted");
  assert.deepEqual(session.snapshot().pet, {
    species: "cat",
    name: "团子",
    adoptedDay: 2,
    bond: 0,
    lastPettedDay: 0,
  });
  assert.equal(session.dispatch({ type: "adopt-pet", species: "dog", name: "来福" })?.code, "already-adopted");
  await session.flush();

  const restored = new GameSession(repository, "pet-owner", catalog, "main", () => 902);
  await restored.continueGame();
  assert.deepEqual(restored.snapshot().pet, session.snapshot().pet);
});

test("daily petting increments hidden bond once and follows the home time projection", () => {
  const state = createInitialGameState(createPetCatalog());
  state.day = 2;
  state.dailyForage = { day: 2, collectedIds: [] };
  state.dailyRequest = createDailyRequestState(2);
  state.pet = createPetState("dog", "来福", 2);
  const pets = new PetSystem();

  assert.equal(homePetRegionAt(6 * 60), "farm");
  assert.equal(homePetRegionAt(18 * 60), "cottage");
  assert.equal(pets.pet(state), "petted");
  assert.equal(state.pet.bond, 1);
  assert.equal(state.pet.lastPettedDay, 2);
  assert.equal(pets.pet(state), "already-petted");
  assert.equal(state.pet.bond, 1);

  state.day = 3;
  assert.equal(pets.pet(state), "petted");
  assert.equal(state.pet.bond, 2);
  state.minuteOfDay = 18 * 60;
  assert.equal(pets.pet(state), "pet-not-present");
  state.player.regionId = "cottage";
  assert.equal(pets.pet(state), "already-petted");
  state.day = 4;
  state.minuteOfDay = 6 * 60;
  state.player.regionId = "farm";
  state.pet.bond = PET_MAX_BOND;
  assert.equal(pets.pet(state), "petted");
  assert.equal(state.pet.bond, PET_MAX_BOND);
});

test("formal Farm and Cottage maps retain three short collision-free pet anchors", async () => {
  const [farmRaw, cottageRaw] = await Promise.all([
    readFile(new URL("../public/map/farm.tmj", import.meta.url), "utf8"),
    readFile(new URL("../public/map/cottage.tmj", import.meta.url), "utf8"),
  ]);
  const farm = decodeTiledRegion(JSON.parse(farmRaw), "farm-map");
  const cottage = decodeTiledRegion(JSON.parse(cottageRaw), "cottage-map");
  const catalog = new WorldCatalog([
    { ...farm, exits: [] },
    { ...cottage, exits: [] },
  ]);
  validatePetAnchors(catalog);
  assert.equal(petAnchorsForRegion(catalog, "farm").length, 3);
  assert.equal(petAnchorsForRegion(catalog, "cottage").length, 3);
});
