import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { decodeTiledRegion } from "../client/src/game/world/tiled-region-decoder.ts";
import { calendarAt, playableCalendarAt } from "../domain/calendar/game-calendar.ts";
import { NpcDialogueSystem } from "../domain/dialogue/NpcDialogueSystem.ts";
import { CROP_DEFINITIONS } from "../domain/farming/crops.ts";
import { FarmingSystem } from "../domain/farming/FarmingSystem.ts";
import { FishingSystem } from "../domain/fishing/FishingSystem.ts";
import { eligibleFish, fishingPausesClock } from "../domain/fishing/definitions.ts";
import { ForageSystem } from "../domain/gathering/ForageSystem.ts";
import { GatheringSystem } from "../domain/gathering/GatheringSystem.ts";
import { InventorySystem } from "../domain/inventory/InventorySystem.ts";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { createStoredGame, decodeStoredGame } from "../domain/persistence/SaveRepository.ts";
import { createPetState } from "../domain/pets/definitions.ts";
import { UpgradeSystem } from "../domain/progression/UpgradeSystem.ts";
import { DailyRequestSystem } from "../domain/requests/DailyRequestSystem.ts";
import { DAILY_REQUESTS, createDailyRequestState } from "../domain/requests/definitions.ts";
import { FirstWeekMilestoneSystem, latestFirstWeekMilestoneAt } from "../domain/retention/FirstWeekMilestoneSystem.ts";
import { GameSession } from "../domain/session/GameSession.ts";
import { ShopSystem } from "../domain/shop/ShopSystem.ts";
import { FriendshipSystem } from "../domain/social/FriendshipSystem.ts";
import { GiftSystem } from "../domain/social/GiftSystem.ts";
import { giftWeekIndex } from "../domain/social/definitions.ts";
import { StaminaSystem } from "../domain/stamina/StaminaSystem.ts";
import { staminaAfterSleep } from "../domain/stamina/definitions.ts";
import { createInitialGameState, createTilledFarmTile, farmTileId } from "../domain/state/game-state.ts";
import { DAY_END_MINUTE, DAY_START_MINUTE, formatGameMinute } from "../domain/time/game-time.ts";
import { WeatherSystem, weatherAt } from "../domain/weather/WeatherSystem.ts";
import { activeNpcById, activeNpcSpawns } from "../domain/world/npc-schedules.ts";
import { findNpcPath } from "../domain/world/npc-pathfinding.ts";
import { WorldCatalog } from "../domain/world/regions.ts";

const MAP_NAMES = [
  "farm", "town", "cottage", "seed-shop", "blacksmith", "town-house-west",
  "town-house-north", "town-house", "town-house-southwest", "town-house-east", "foothills", "lakeshore",
];
const catalog = new WorldCatalog(await Promise.all(MAP_NAMES.map(async (name) => decodeTiledRegion(
  JSON.parse(await readFile(new URL("../public/map/" + name + ".tmj", import.meta.url), "utf8")), name,
))));
const inventory = new InventorySystem();
const stamina = new StaminaSystem(inventory);
const farming = new FarmingSystem(inventory, stamina, catalog);

class MemorySaveRepository {
  game = null;
  failWrites = false;
  saveCalls = 0;

  /** Reports whether the isolated slot exists without opening any database. */
  async has() { return this.game !== null; }

  /** Uses the real version decoder and returns a defensive in-memory save. */
  async load() { return this.game ? decodeStoredGame(this.game) : null; }

  /** Validates and stores one snapshot, or simulates an atomic storage rejection. */
  async save(_owner, _slot, game) {
    this.saveCalls += 1;
    if (this.failWrites) throw new Error("Simulated storage failure");
    this.game = decodeStoredGame(game);
  }

  /** Deletes only this isolated in-memory fixture. */
  async delete() { this.game = null; }
}

/** Creates a consistent fixture at the requested day and time using the formal world. */
function stateAt(day = 1, minuteOfDay = DAY_START_MINUTE) {
  const state = createInitialGameState(catalog);
  state.day = day;
  state.minuteOfDay = minuteOfDay;
  state.weather = new WeatherSystem().create(state.worldSeed, day);
  state.dailyForage = { day, collectedIds: [] };
  state.dailyRequest = createDailyRequestState(day);
  return state;
}

/** Places test feet at an authored passable tile within interaction range of the target. */
function placeNear(state, regionId, target) {
  const npcs = activeNpcSpawns(catalog, state.minuteOfDay, { day: state.day, weather: state.weather.current });
  for (const [dx, dy] of [[0, 16], [16, 0], [-16, 0], [0, -16], [0, 32], [32, 0], [-32, 0], [0, -32]]) {
    const x = Math.floor((target.x + dx) / 16) * 16 + 8;
    const y = Math.floor((target.y + dy) / 16) * 16 + 8;
    if (Math.hypot(x - target.x, y - target.y) <= 42
      && !catalog.isBlocked(regionId, x, y, 5, 4, npcs.filter((npc) => npc.regionId === regionId))) {
      state.player = { ...state.player, regionId, x, y };
      return;
    }
  }
  throw new Error("No reachable interaction feet near " + regionId);
}

/** Constructs actual released fixed-ID/resource shapes rather than relabelling a v10 state. */
function releasedSave(version, day = 7) {
  const current = stateAt(day);
  const state = {
    version, day, minuteOfDay: 600, gold: 321, player: current.player,
    inventory: current.inventory, inventoryCapacity: 24, wateringCanLevel: 1,
    resources: { "farm-tree-001": { id: "farm-tree-001", kind: "tree", available: false } },
    friendships: { "seed-keeper": { npcId: "seed-keeper", points: 250, lastTalkedDay: day } },
    dailyForage: { day, collectedIds: [] },
    dailyRequest: { day, requestId: DAILY_REQUESTS[(day - 2) % 8].requestId, completed: false },
    npcDialogue: {}, seenEventIds: ["day-7-mirror-teaser"],
    pet: createPetState("cat", "团子", 2),
    farmTiles: {
      "farm-plot-001": { id: "farm-plot-001", phase: "growing", cropId: ITEM_ID.turnip, growthDays: 1, watered: true },
      "farm-plot-002": { id: "farm-plot-002", phase: "mature", cropId: ITEM_ID.turnip, growthDays: 3, watered: false },
    },
  };
  if (version <= 6) {
    for (const tile of Object.values(state.farmTiles)) {
      tile.growthStage = tile.growthDays;
      delete tile.growthDays;
      if (version <= 2) {
        tile.cropId = "alien-crop";
        tile.growthStage = 1;
        tile.readyAt = tile.phase === "mature" ? 0 : 99999;
      }
    }
  }
  if (version <= 2) {
    state.inventory[3] = { itemId: "alien-seed", quantity: 2 };
    state.inventory[4] = { itemId: "alien-crop", quantity: 1 };
  }
  if (version === 1) {
    state.farmTiles = { "farm-01": { ...state.farmTiles["farm-plot-001"], id: "farm-01" } };
    state.resources = { "tree-01": { id: "tree-01", kind: "tree", available: false } };
  }
  return { version, updatedAt: 123, state };
}

/** Continues a prepared fixture through the real session and save boundary. */
async function sessionFor(state) {
  const repository = new MemorySaveRepository();
  repository.game = createStoredGame(state, 0);
  const session = new GameSession(repository, "spring-contract", catalog, "main", () => 0);
  await session.continueGame();
  return { repository, session };
}

/** Advances eight bounded ticks, collecting visible feedback for one ten-minute clock step. */
function advanceTenMinutes(session, start = 0) {
  const feedback = [];
  for (let index = 1; index <= 8; index += 1) {
    const result = session.tick(start + index * 1000);
    if (result) feedback.push(result);
  }
  return feedback;
}

/** Charges and releases one rod, then waits for the first visible bite before hooking. */
function hookFish(fishing, state) {
  fishing.setHeld(state, true);
  fishing.tick(state, 720);
  fishing.setHeld(state, false);
  for (let index = 0; index < 45 && !fishing.snapshot().bite; index += 1) fishing.tick(state, 100);
  assert.equal(fishing.snapshot().bite, true);
  fishing.setHeld(state, true);
  assert.equal(fishing.snapshot().phase, "reeling");
}

/** Follows the one-button safe tension feedback until a deterministic terminal result is reached. */
function landFish(fishing, state) {
  let result = null;
  for (let index = 0; index < 150 && fishing.snapshot().phase === "reeling"; index += 1) {
    fishing.setHeld(state, fishing.snapshot().tension < 50);
    result = fishing.tick(state, 50) ?? result;
  }
  return result;
}

test("spring catalog and formal Tiled masks remain finite while Day 29 keeps spring content", () => {
  assert.equal(calendarAt(29).season, "summer");
  assert.deepEqual(playableCalendarAt(29), { absoluteDay: 29, season: "spring", weekday: "monday" });
  assert.equal(CROP_DEFINITIONS.length, 6);
  const farm = catalog.requireRegion("farm");
  assert.equal(farm.tillableTiles.filter(Boolean).length, 492);
  for (const row of [18, 19]) for (const column of [27, 28, 29, 30]) {
    assert.equal(catalog.isTillable("farm", column, row), true);
  }
  assert.equal(catalog.isTillable("farm", -1, 18), false);
  assert.equal(catalog.isTillable("town", 27, 18), false);
  assert.deepEqual(stateAt().farmTiles, {});
  const zone = catalog.requireRegion("lakeshore").fishingZones[0];
  const state = stateAt(7);
  placeNear(state, "lakeshore", { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 });
  assert.ok(Math.hypot(state.player.x - (zone.x + zone.width / 2), state.player.y - (zone.y + zone.height / 2)) <= 52);
  assert.notEqual(findNpcPath(catalog.requireRegion("lakeshore").collision, catalog.requireSpawn("lakeshore", "town-gate"), state.player), null);
});

test("released v1–v9 migrate idempotently to v10, preserving pets, crops and the old current request", async () => {
  for (let version = 1; version <= 9; version += 1) {
    const migrated = decodeStoredGame(releasedSave(version));
    assert.equal(migrated.version, 10);
    assert.equal(migrated.state.version, 10);
    assert.equal(migrated.state.resources["farm-tree-001"].phase, "stump");
    assert.equal(migrated.state.farmTiles["farm:27:18"].cropId, ITEM_ID.turnip);
    assert.equal(migrated.state.stamina, 100);
    assert.equal(migrated.state.wateringCanWater, 20);
    assert.equal(migrated.state.fishingCastCount, 0);
    assert.equal(migrated.state.seenEventIds.includes("day-7-mirror-teaser"), false);
    assert.equal(migrated.state.pet?.name ?? null, version === 9 ? "团子" : null);
    assert.deepEqual(decodeStoredGame(migrated), migrated);
  }
  const migrated = decodeStoredGame(releasedSave(9, 10));
  assert.equal(migrated.state.dailyRequest.requestId, "seed-rack-repair");
  assert.equal(createDailyRequestState(10).requestId, "fresh-catch-supper");
  const stored = createStoredGame(stateAt(), 123);
  for (const fields of [
    { stamina: 101 }, { minuteOfDay: 365 }, { wateringCanWater: 21 }, { fishingCastCount: -1 },
    { weather: { day: 2, current: "rain", next: "sunny" } }, { seenEventIds: ["day-7-mirror-teaser"] },
  ]) assert.throws(() => decodeStoredGame({ ...stored, state: { ...stored.state, ...fields } }));
  assert.throws(() => decodeStoredGame({ ...stored, version: 11 }), /unsupported/i);
  const unknownCrop = { ...createTilledFarmTile(27, 18), cropId: "unknown-crop" };
  assert.throws(() => decodeStoredGame({ ...stored, state: { ...stored.state, farmTiles: { [unknownCrop.id]: unknownCrop } } }), /farm/i);
  const repository = new MemorySaveRepository();
  repository.game = releasedSave(9);
  repository.failWrites = true;
  const session = new GameSession(repository, "migration-retry", catalog, "main", () => 0);
  await assert.rejects(session.continueGame(), /simulated/i);
  assert.equal(repository.game.version, 9);
  repository.failWrites = false;
  await session.newGame();
  assert.equal(session.snapshot().day, 1);
});

test("free tilling, actual watered-cell costs and replenishment are atomic", () => {
  const state = stateAt();
  inventory.add(state.inventory, ITEM_ID.turnipSeed, 3);
  for (const column of [27, 28, 29]) {
    state.player = { ...state.player, regionId: "farm", x: column * 16 + 8, y: 18 * 16 + 8 };
    assert.equal(farming.use(state, column, 18, ITEM_ID.hoe), "tilled");
    assert.equal(farming.use(state, column, 18, ITEM_ID.turnipSeed), "planted");
  }
  state.player.x = 27 * 16 + 8;
  state.wateringCanLevel = 2;
  state.wateringCanWater = 2;
  state.stamina = 1;
  assert.equal(farming.use(state, 27, 18, ITEM_ID.wateringCan, "right"), "watered");
  assert.deepEqual([27, 28, 29].map((column) => state.farmTiles[farmTileId(column, 18)].watered), [true, false, false]);
  assert.deepEqual([state.stamina, state.wateringCanWater], [0, 1]);
  const before = structuredClone(state);
  assert.equal(farming.use(state, 28, 18, ITEM_ID.wateringCan), "insufficient-stamina");
  assert.deepEqual(state, before);
  state.stamina = 20;
  assert.equal(farming.use(state, 27, 18, ITEM_ID.wateringCan, "right"), "watered");
  assert.equal(state.wateringCanWater, 0);
  assert.equal(farming.use(state, 29, 18, ITEM_ID.hoe), "too-far");
  const region = catalog.requireRegion("farm");
  const waterIndex = region.waterTiles.findIndex((water, index) => {
    if (!water) return false;
    const column = index % region.collision.columns;
    const row = Math.floor(index / region.collision.columns);
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (
      !catalog.isBlocked("farm", (column + dx) * 16 + 8, (row + dy) * 16 + 8, 5, 4, [])
    ));
  });
  assert.ok(waterIndex >= 0);
  const column = waterIndex % region.collision.columns;
  const row = Math.floor(waterIndex / region.collision.columns);
  placeNear(state, "farm", { x: column * 16 + 8, y: row * 16 + 8 });
  assert.equal(farming.refill(state, column, row), "refilled");
  assert.equal(state.wateringCanWater, 40);
  assert.equal(state.stamina, 19);
});

test("rain waters prepared soil, pea regrows and potato yield cannot be rerolled by delaying harvest", () => {
  const state = stateAt(12);
  state.weather.current = "rain";
  state.player = { ...state.player, regionId: "farm", x: 440, y: 296 };
  inventory.add(state.inventory, ITEM_ID.greenPeaSeed, 1);
  assert.equal(farming.use(state, 27, 18, ITEM_ID.hoe), "tilled");
  assert.equal(state.farmTiles["farm:27:18"].watered, true);
  assert.equal(farming.use(state, 27, 18, ITEM_ID.wateringCan), "waiting");
  const water = state.wateringCanWater;
  const energy = state.stamina;
  farming.applyRain(state);
  assert.equal(farming.use(state, 27, 18, ITEM_ID.greenPeaSeed), "planted");
  const pea = state.farmTiles["farm:27:18"];
  assert.equal(pea.watered, true);
  assert.deepEqual([state.wateringCanWater, state.stamina], [water, energy]);
  pea.growthDays = 7; pea.phase = "mature";
  assert.equal(farming.use(state, 27, 18, ""), "harvested");
  assert.deepEqual([pea.phase, pea.growthDays, pea.harvestCount], ["growing", 4, 1]);
  for (let index = 0; index < 3; index += 1) { farming.applyRain(state); farming.settleDay(state); }
  assert.equal(pea.phase, "mature");
  const potato = { ...createTilledFarmTile(28, 18), phase: "mature", cropId: ITEM_ID.springPotato, growthDays: 5, plantedDay: 7 };
  state.farmTiles[potato.id] = potato;
  const delayed = structuredClone(state);
  delayed.day += 1;
  assert.equal(farming.use(state, 28, 18, ""), "harvested");
  assert.equal(farming.use(delayed, 28, 18, ""), "harvested");
  const quantity = inventory.quantity(state.inventory, ITEM_ID.springPotato);
  assert.ok(quantity >= 1 && quantity <= 3);
  assert.equal(inventory.quantity(delayed.inventory, ITEM_ID.springPotato), quantity);
  assert.equal(decodeStoredGame(createStoredGame(state, 0)).state.farmTiles[potato.id].phase, "tilled");
});

test("trees leave harvestable stumps, outdoor trees regrow after seven days and wind branches respect farmland", () => {
  const state = stateAt(4);
  const gathering = new GatheringSystem(inventory, catalog, stamina);
  for (const regionId of ["farm", "foothills"]) {
    const tree = catalog.requireRegion(regionId).resources.find((resource) => resource.kind === "tree");
    placeNear(state, regionId, tree);
    assert.equal(gathering.use(state, tree.entityId, ITEM_ID.axe), "success");
    assert.equal(state.resources[tree.entityId].phase, "stump");
    assert.equal(gathering.use(state, tree.entityId, ITEM_ID.axe), "stump-cleared");
    assert.equal(state.resources[tree.entityId].regrowOnDay, regionId === "farm" ? null : 11);
  }
  assert.equal(inventory.quantity(state.inventory, ITEM_ID.wood), 8);
  state.day = 10;
  assert.equal(gathering.settleDay(state), 0);
  state.day = 11;
  assert.equal(gathering.settleDay(state), 1);
  state.dailyForage = { day: 11, collectedIds: [] };
  state.weather.current = "wind";
  const forage = new ForageSystem(inventory, catalog);
  const branches = forage.activeSpawns(state, "farm").filter((spawn) => spawn.kind === "fallen-branch");
  assert.equal(branches.length, 3);
  const branch = branches[0];
  placeNear(state, "farm", branch);
  assert.equal(forage.collect(state, branch.entityId), "collected");
  assert.equal(forage.collect(state, branch.entityId), "inactive");
  const covered = branches[1];
  const tile = createTilledFarmTile(Math.floor(covered.x / 16), Math.floor(covered.y / 16));
  state.farmTiles[tile.id] = tile;
  assert.equal(forage.activeSpawns(state, "farm").some((spawn) => spawn.entityId === covered.entityId), false);
  assert.equal(forage.activeSpawns(stateAt(15), "foothills").some((spawn) => spawn.kind === "bamboo-shoot"), false);
  assert.ok(Array.from({ length: 11 }, (_, offset) => stateAt(offset + 4)).some((day) => (
    forage.activeSpawns(day, "foothills").some((spawn) => spawn.kind === "bamboo-shoot")
  )));
});

test("midnight warns once, hidden time is discarded and 02:00 settlement retries the same candidate", async () => {
  const state = stateAt(6, 1430);
  state.gold = 15000;
  const { repository, session } = await sessionFor(state);
  const phases = [];
  session.subscribeDaySettlement((snapshot) => phases.push(snapshot.phase));
  assert.equal(advanceTenMinutes(session).filter((result) => result.code === "late-night-warning").length, 1);
  assert.equal(session.snapshot().lateWarningDay, 6);
  await session.flush();
  assert.equal(formatGameMinute(session.snapshot().minuteOfDay), "00:00");
  const reload = new GameSession(repository, "spring-contract", catalog, "main", () => 0);
  await reload.continueGame();
  assert.equal(advanceTenMinutes(reload).some((result) => result.code === "late-night-warning"), false);
  await reload.flush();
  session.tick(100000, true, true);
  assert.equal(session.snapshot().minuteOfDay, 1440);
  repository.failWrites = true;
  for (let step = 0; step < 12; step += 1) advanceTenMinutes(session, 100000 + step * 8000);
  assert.equal(session.snapshot().minuteOfDay, DAY_END_MINUTE);
  assert.equal(session.snapshot().day, 6);
  assert.equal(session.snapshot().gold, 15000);
  await assert.rejects(session.flush(), /save failed/i);
  assert.equal(phases.at(-1), "failed");
  assert.equal(session.dispatch({ type: "eat-item", itemId: ITEM_ID.turnip }).code, "day-settlement-pending");
  repository.failWrites = false;
  assert.equal(session.dispatch({ type: "retry-day-settlement" }).code, "day-saving");
  await session.flush();
  assert.deepEqual([session.snapshot().day, session.snapshot().gold, session.snapshot().stamina], [7, 14000, 50]);
  assert.equal(session.snapshot().player.regionId, "cottage");
  assert.equal(phases.at(-1), "idle");
  session.tick(1);
  assert.equal(session.snapshot().day, 7);
});

test("Cottage fainting is free and normal sleep commits Day 28→29 only after persistence", async () => {
  const cottage = stateAt(28, 1550);
  const bed = catalog.interaction("cottage-bed");
  placeNear(cottage, "cottage", { x: bed.x + bed.width / 2, y: bed.y + bed.height / 2 });
  const { session } = await sessionFor(cottage);
  assert.equal(session.dispatch({ type: "sleep", bedId: bed.entityId }).code, "day-saving");
  assert.equal(session.snapshot().day, 28);
  await session.flush();
  assert.deepEqual([session.snapshot().day, session.snapshot().minuteOfDay, session.snapshot().stamina], [29, 360, 63]);
  assert.equal(playableCalendarAt(session.snapshot().day).season, "spring");
  const faintState = stateAt(8, 1560);
  faintState.player.regionId = "cottage";
  Object.assign(faintState.player, catalog.requireDefaultSpawn("cottage"));
  const { session: faint } = await sessionFor(faintState);
  faint.tick(1);
  await faint.flush();
  assert.deepEqual([faint.snapshot().day, faint.snapshot().gold, faint.snapshot().stamina], [9, 100, 50]);
  assert.deepEqual([staminaAfterSleep(1440), staminaAfterSleep(1500), staminaAfterSleep(1560)], [100, 75, 50]);
});

test("gifts are per resident, one daily and two weekly with a Sunday reset and no global limit", () => {
  const state = stateAt();
  const gifts = new GiftSystem(inventory);
  inventory.add(state.inventory, ITEM_ID.springWildflower, 12);
  const npcs = activeNpcSpawns(catalog, 600, { day: 1, weather: "sunny" });
  for (const npc of npcs) {
    state.player = { ...state.player, regionId: npc.regionId, x: npc.x, y: npc.y };
    assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.springWildflower).kind, "given");
  }
  const npc = npcs.find((candidate) => candidate.npcId === "seed-keeper");
  state.player = { ...state.player, regionId: npc.regionId, x: npc.x, y: npc.y };
  const before = inventory.quantity(state.inventory, ITEM_ID.springWildflower);
  assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.springWildflower).kind, "daily-limit");
  assert.equal(inventory.quantity(state.inventory, ITEM_ID.springWildflower), before);
  state.day = 2;
  assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.springWildflower).kind, "given");
  state.day = 3;
  assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.springWildflower).kind, "weekly-limit");
  state.day = 7;
  assert.notEqual(giftWeekIndex(6), giftWeekIndex(7));
  assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.springWildflower).kind, "given");
  assert.equal(gifts.give(state, npcs, npc.npcId, ITEM_ID.hoe).kind, "not-giftable");
});

test("fishing is one-button, time/weather/distance filtered and commits catch or full-bag failure once", () => {
  const state = stateAt(7, 600);
  const zone = catalog.requireRegion("lakeshore").fishingZones[0];
  placeNear(state, "lakeshore", { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 });
  inventory.add(state.inventory, ITEM_ID.fishingRod, 1);
  const fishing = new FishingSystem(inventory, stamina, catalog);
  assert.equal(fishing.start(state, zone.id), "started");
  assert.deepEqual([state.stamina, state.fishingCastCount], [94, 1]);
  hookFish(fishing, state);
  const caught = landFish(fishing, state);
  assert.equal(caught.kind, "caught");
  assert.equal(inventory.quantity(state.inventory, caught.itemId), 1);
  assert.equal(fishing.tick(state, 1000), null);
  fishing.reset();
  assert.equal(fishing.start(state, zone.id), "started");
  hookFish(fishing, state);
  state.inventory = state.inventory.map(() => ({ itemId: ITEM_ID.wood, quantity: 99 }));
  assert.equal(landFish(fishing, state).kind, "inventory-full");
  assert.equal(fishing.snapshot().phase, "inventory-full");
  assert.equal(fishing.start(state, zone.id), "already-fishing");
  fishing.reset();
  state.inventory[0] = { itemId: ITEM_ID.fishingRod, quantity: 1 };
  assert.equal(fishing.start(state, zone.id), "started");
  fishing.setHeld(state, true); fishing.tick(state, 600); fishing.setHeld(state, false);
  for (let index = 0; index < 5; index += 1) fishing.tick(state, 1000);
  assert.equal(fishing.snapshot().failureReason, "missed-bite");
  assert.equal(fishing.snapshot().resultItemId, null);
  assert.equal(eligibleFish(600, "rain", 100).some((fish) => fish.itemId === ITEM_ID.rainLoach), true);
  assert.equal(eligibleFish(600, "sunny", 100).some((fish) => fish.itemId === ITEM_ID.rainLoach), false);
  assert.equal(eligibleFish(1080, "wind", 100).some((fish) => fish.itemId === ITEM_ID.windDace), true);
  assert.equal(eligibleFish(1080, "sunny", 74).some((fish) => fish.itemId === ITEM_ID.jadeBream), false);
  assert.equal(eligibleFish(1080, "sunny", 100).some((fish) => fish.itemId === ITEM_ID.duskPerch), true);
  assert.equal(fishingPausesClock("casting"), false);
  assert.equal(fishingPausesClock("reeling"), true);
});

test("fishing projection advances without save spam, freezes when hidden and refresh cancels only runtime", async () => {
  const state = stateAt(7, 600);
  inventory.add(state.inventory, ITEM_ID.fishingRod, 1);
  const zone = catalog.requireRegion("lakeshore").fishingZones[0];
  placeNear(state, "lakeshore", { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 });
  const { repository, session } = await sessionFor(state);
  const projections = [];
  session.subscribeFishing((snapshot) => projections.push(snapshot));
  session.dispatch({ type: "start-fishing", zoneId: zone.id });
  await session.flush();
  const writes = repository.saveCalls;
  session.dispatch({ type: "set-fishing-input", held: true });
  session.tick(300);
  assert.ok(projections.at(-1).castPower > 0);
  const power = projections.at(-1).castPower;
  session.tick(100000, true, true);
  assert.equal(projections.at(-1).castPower, power);
  assert.equal(repository.saveCalls, writes);
  const reload = new GameSession(repository, "spring-contract", catalog, "main", () => 0);
  let reloadedFishing;
  reload.subscribeFishing((snapshot) => { reloadedFishing = snapshot; });
  await reload.continueGame();
  assert.equal(reloadedFishing.phase, "idle");
  assert.equal(reload.snapshot().stamina, 94);
});

test("a caught fish exposes durable-save failure and retries without granting a second fish", async () => {
  const state = stateAt(7, 600);
  inventory.add(state.inventory, ITEM_ID.fishingRod, 1);
  const zone = catalog.requireRegion("lakeshore").fishingZones[0];
  placeNear(state, "lakeshore", { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 });
  const { repository, session } = await sessionFor(state);
  let fishing;
  session.subscribeFishing((snapshot) => { fishing = snapshot; });
  session.dispatch({ type: "start-fishing", zoneId: zone.id });
  await session.flush();
  session.dispatch({ type: "set-fishing-input", held: true });
  let now = 500;
  session.tick(now);
  session.dispatch({ type: "set-fishing-input", held: false });
  for (let index = 0; index < 45 && !fishing.bite; index += 1) { now += 100; session.tick(now); }
  assert.equal(fishing.bite, true);
  session.dispatch({ type: "set-fishing-input", held: true });
  repository.failWrites = true;
  for (let index = 0; index < 150 && fishing.phase === "reeling"; index += 1) {
    session.dispatch({ type: "set-fishing-input", held: fishing.tension < 50 });
    now += 50;
    session.tick(now, true);
  }
  assert.equal(fishing.phase, "caught");
  await assert.rejects(session.flush(), /save failed/i);
  assert.equal(fishing.saveStatus, "failed");
  assert.equal(session.dispatch({ type: "dismiss-fishing" }).code, "fishing-save-pending");
  const itemId = fishing.resultItemId;
  assert.equal(inventory.quantity(session.snapshot().inventory, itemId), 1);
  repository.failWrites = false;
  session.dispatch({ type: "retry-fishing-save" });
  await session.flush();
  assert.equal(fishing.saveStatus, "saved");
  session.dispatch({ type: "dismiss-fishing" });
  assert.equal(fishing.phase, "idle");
  assert.equal(inventory.quantity(repository.game.state.inventory, itemId), 1);
  assert.equal(session.snapshot().stamina, 94);
});

test("weather/rest schedules share shop and upgrade availability; Day 7 rod and fish requests are usable", async () => {
  assert.equal(weatherAt(123, 1), "sunny");
  assert.equal(weatherAt(123, 3), "rain");
  assert.equal(weatherAt(123, 19), weatherAt(123, 19));
  const rain = activeNpcSpawns(catalog, 600, { day: 3, weather: "rain" });
  const blacksmith = rain.find((npc) => npc.npcId === "town-blacksmith");
  assert.equal(blacksmith.regionId, "blacksmith");
  assert.equal(blacksmith.routine, "rain");
  const rested = activeNpcById(catalog, "seed-keeper", 600, { day: 3, weather: "rain" });
  assert.equal(rested.routine, "rest");
  assert.equal(rested.interactionType, "dialogue");
  const state = stateAt(3, 600);
  placeNear(state, blacksmith.regionId, blacksmith);
  state.gold = 900;
  inventory.add(state.inventory, ITEM_ID.wood, 15);
  const upgrades = new UpgradeSystem(inventory);
  assert.equal(upgrades.upgradeWateringCan(state, rain), "upgraded-watering-can");
  assert.deepEqual([state.wateringCanLevel, state.wateringCanWater, state.gold], [2, 40, 0]);
  const sunday = activeNpcSpawns(catalog, 600, { day: 7, weather: "sunny" });
  state.day = 7; state.wateringCanLevel = 1;
  assert.equal(upgrades.wateringServiceAvailable(state, sunday), false);

  const rodState = stateAt(7, 600);
  const xiangzi = activeNpcById(catalog, "town-resident-xiangzi", 600, { day: 7, weather: rodState.weather.current });
  placeNear(rodState, xiangzi.regionId, xiangzi);
  const { session } = await sessionFor(rodState);
  assert.equal(session.dispatch({ type: "claim-fishing-rod", npcId: xiangzi.npcId }).code, "fishing-rod-received");
  assert.equal(session.dispatch({ type: "claim-fishing-rod", npcId: xiangzi.npcId }).code, "fishing-rod-owned");
  await session.flush();
  const requests = new DailyRequestSystem(inventory, new FriendshipSystem());
  const requestState = stateAt(10, 600);
  inventory.add(requestState.inventory, ITEM_ID.lakeCarp, 2);
  assert.equal(requests.submitForNpc(requestState, xiangzi.npcId).result, "request-completed");
  assert.equal(requests.submitForNpc(requestState, xiangzi.npcId).result, "request-already-completed");
  const seedKeeper = activeNpcById(catalog, "seed-keeper", 600, { day: 10, weather: "sunny" });
  state.player = { ...state.player, regionId: seedKeeper.regionId, x: seedKeeper.x, y: seedKeeper.y };
  assert.equal(new ShopSystem(inventory).buySeed(state, [rested], ITEM_ID.turnipSeed), "not-at-shop");
});

test("dialogue histories prune untouched residents and first-week hints no longer unlock mirror story", async () => {
  const state = stateAt(2, 600);
  const dialogue = new NpcDialogueSystem();
  const npc = activeNpcById(catalog, "seed-keeper", 600, { day: 2, weather: "sunny" });
  dialogue.select(state, npc, { result: "request-not-target", request: null });
  const bedtime = stateAt(10, 1320);
  bedtime.npcDialogue = state.npcDialogue;
  const bed = catalog.interaction("cottage-bed");
  placeNear(bedtime, "cottage", { x: bed.x + bed.width / 2, y: bed.y + bed.height / 2 });
  dialogue.settleDay(bedtime);
  assert.doesNotThrow(() => decodeStoredGame(createStoredGame(bedtime, 0)));
  const { session } = await sessionFor(bedtime);
  session.dispatch({ type: "sleep", bedId: bed.entityId });
  await session.flush();
  assert.equal(session.snapshot().day, 11);
  assert.equal(latestFirstWeekMilestoneAt(7).eventId, "day-7-fishing-intro");
  const milestones = new FirstWeekMilestoneSystem();
  assert.equal(milestones.acknowledge(state, "day-7-fishing-intro"), "milestone-not-yet-available");
  assert.equal(milestones.acknowledge(state, "day-7-mirror-teaser"), "milestone-unsupported");
});
