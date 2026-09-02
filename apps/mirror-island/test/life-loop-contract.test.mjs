import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { InventorySystem } from "../domain/inventory/InventorySystem.ts";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { createStoredGame, decodeStoredGame } from "../domain/persistence/SaveRepository.ts";
import { GameSession } from "../domain/session/GameSession.ts";
import { ShopSystem } from "../domain/shop/ShopSystem.ts";
import { FriendshipSystem } from "../domain/social/FriendshipSystem.ts";
import { FRIENDSHIP_MAX_POINTS } from "../domain/social/definitions.ts";
import { relationshipStageAt } from "../domain/social/relationship-stage.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import {
  DAY_END_MINUTE,
  DAY_START_MINUTE,
  REAL_MILLISECONDS_PER_TIME_STEP,
} from "../domain/time/game-time.ts";
import { activeNpcSpawns } from "../domain/world/npc-schedules.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import { decodeTiledRegion } from "../client/src/game/world/tiled-region-decoder.ts";
import { calendarAt, playableCalendarAt } from "../domain/calendar/game-calendar.ts";
import { CROP_DEFINITIONS } from "../domain/farming/crops.ts";
import { FarmingSystem } from "../domain/farming/FarmingSystem.ts";
import { ForageSystem, forageAppearsOnDay } from "../domain/gathering/ForageSystem.ts";
import { UpgradeSystem } from "../domain/progression/UpgradeSystem.ts";
import { DailyRequestSystem } from "../domain/requests/DailyRequestSystem.ts";
import { createDailyRequestState } from "../domain/requests/definitions.ts";
import { NpcDialogueSystem } from "../domain/dialogue/NpcDialogueSystem.ts";
import {
  FirstWeekMilestoneSystem,
  latestFirstWeekMilestoneAt,
} from "../domain/retention/FirstWeekMilestoneSystem.ts";
import { getDailyRequest } from "../domain/requests/definitions.ts";

const FARM_PLOT_ID = "farm-plot-001";
const FARM_PLOT_2_ID = "farm-plot-002";
const FARM_PLOT_3_ID = "farm-plot-003";
const BED_ID = "cottage-bed";
const TREE_ID = "test-tree-001";
const FORAGE_ID = "test-forage-flower-001";

class MemorySaveRepository {
  game = null;
  saveCalls = 0;

  /** Reports whether the isolated test slot currently contains a snapshot. */
  async has() {
    return this.game !== null;
  }

  /** Returns the isolated test snapshot without touching browser storage. */
  async load() {
    return this.game;
  }

  /** Captures one already-defensive StoredGame snapshot and counts queue commits. */
  async save(_ownerKey, _slotId, game) {
    this.game = game;
    this.saveCalls += 1;
  }

  /** Deletes only the isolated in-memory slot. */
  async delete() {
    this.game = null;
  }
}

/** Builds the smallest catalog containing the real Life Loop interaction contracts. */
function createLifeLoopCatalog() {
  return new WorldCatalog([{
    id: "cottage",
    mapKey: "test-cottage",
    displayName: "测试小屋",
    defaultSpawnId: "entry",
    isStartRegion: true,
    widthPixels: 160,
    heightPixels: 160,
    collision: {
      columns: 10,
      rows: 10,
      tileWidth: 16,
      tileHeight: 16,
      blocked: Array.from({ length: 100 }, () => false),
    },
    spawns: {
      entry: { x: 32, y: 32 },
      "npc-huaqiang-home": { x: 96, y: 96 },
      "npc-huaqiang-counter": { x: 64, y: 32 },
      "npc-huaqiang-shelves": { x: 96, y: 32 },
    },
    exits: [],
    resources: [
      { entityId: TREE_ID, regionId: "cottage", kind: "tree", x: 64, y: 48 },
      { entityId: FORAGE_ID, regionId: "cottage", kind: "spring-wildflower", x: 32, y: 32 },
    ],
    interactions: [
      { entityId: BED_ID, regionId: "cottage", kind: "bed", x: 16, y: 16, width: 32, height: 48 },
      { entityId: FARM_PLOT_ID, regionId: "cottage", kind: "farm-plot", x: 40, y: 32, width: 16, height: 16 },
      { entityId: FARM_PLOT_2_ID, regionId: "cottage", kind: "farm-plot", x: 56, y: 32, width: 16, height: 16 },
      { entityId: FARM_PLOT_3_ID, regionId: "cottage", kind: "farm-plot", x: 72, y: 32, width: 16, height: 16 },
    ],
    npcs: [{
      entityId: "seed-shop-keeper",
      regionId: "cottage",
      npcId: "seed-keeper",
      dialogueId: "seed-keeper-welcome",
      interactionType: "shop",
      x: 64,
      y: 32,
    }],
  }]);
}

/** Advances one session clock in one-second ticks and returns the updated wall-clock timestamp. */
function advanceSessionClock(session, startNow, gameMinutes, paused = false) {
  let now = startNow;
  const ticks = (gameMinutes / 10) * (REAL_MILLISECONDS_PER_TIME_STEP / 1_000);
  for (let index = 0; index < ticks; index += 1) {
    now += 1_000;
    session.tick(now, paused);
  }
  return now;
}

/** Advances bounded runtime ticks until one NPC reaches its current schedule target. */
function advanceNpcToIdle(session, startNow, npcId) {
  let now = startNow;
  for (let index = 0; index < 100 && session.activeNpcById(npcId)?.motion !== "idle"; index += 1) {
    now += 1_000;
    session.tick(now, false);
  }
  return now;
}

/** Creates one valid 24-slot v2 inventory with both retired farming item IDs. */
function createV2Inventory() {
  const inventory = Array.from({ length: 24 }, () => ({ itemId: "", quantity: 0 }));
  inventory[0] = { itemId: "alien-seed", quantity: 2 };
  inventory[1] = { itemId: "alien-crop", quantity: 1 };
  return inventory;
}

/** Creates one released v2 envelope covering growing and mature timer-based crops. */
function createV2StoredGame() {
  return {
    version: 2,
    updatedAt: 123,
    state: {
      version: 2,
      player: { regionId: "cottage", x: 32, y: 32 },
      inventory: createV2Inventory(),
      resources: {},
      farmTiles: {
        "farm-plot-001": {
          id: "farm-plot-001",
          phase: "growing",
          cropId: "alien-crop",
          growthStage: 1,
          watered: true,
          readyAt: 99_999,
        },
        "farm-plot-002": {
          id: "farm-plot-002",
          phase: "mature",
          cropId: "alien-crop",
          growthStage: 1,
          watered: true,
          readyAt: 0,
        },
      },
    },
  };
}

/** Reads and decodes one formal TMJ file through the production Tiled boundary. */
async function decodeFormalMap(name, mapKey) {
  const raw = JSON.parse(await readFile(new URL(`../public/map/${name}`, import.meta.url), "utf8"));
  return decodeTiledRegion(raw, mapKey);
}

test("calendar, spring crop catalog and daily forage use deterministic domain rules", () => {
  assert.deepEqual(calendarAt(1), { absoluteDay: 1, year: 1, season: "spring", dayOfSeason: 1, weekday: "monday" });
  assert.deepEqual(calendarAt(28), { absoluteDay: 28, year: 1, season: "spring", dayOfSeason: 28, weekday: "sunday" });
  assert.equal(calendarAt(29).season, "summer");
  assert.equal(calendarAt(112).season, "winter");
  assert.deepEqual(calendarAt(113), { absoluteDay: 113, year: 2, season: "spring", dayOfSeason: 1, weekday: "monday" });
  assert.deepEqual(playableCalendarAt(29), { absoluteDay: 29, season: "spring", weekday: "monday" });
  assert.deepEqual(CROP_DEFINITIONS.map(({ cropId, growthDays, seedPrice, sellPrice }) => (
    [cropId, growthDays, seedPrice, sellPrice]
  )), [
    [ITEM_ID.turnip, 3, 20, 35],
    [ITEM_ID.bokChoy, 5, 45, 80],
    [ITEM_ID.cauliflower, 8, 80, 170],
  ]);

  const catalog = createLifeLoopCatalog();
  const state = createInitialGameState(catalog);
  const inventory = new InventorySystem();
  const forage = new ForageSystem(inventory, catalog);
  const activeDay = Array.from({ length: 28 }, (_, index) => index + 1)
    .find((day) => forageAppearsOnDay(FORAGE_ID, day));
  assert.ok(activeDay);
  state.day = activeDay;
  state.dailyForage = { day: activeDay, collectedIds: [] };
  assert.equal(forage.collect(state, FORAGE_ID), "collected");
  assert.equal(forage.collect(state, FORAGE_ID), "inactive");
  assert.equal(state.dailyForage.collectedIds.includes(FORAGE_ID), true);
});

test("released saves migrate to v9 and repeated v9 decode is idempotent", () => {
  const migrated = decodeStoredGame(createV2StoredGame());
  assert.equal(migrated.version, 9);
  assert.equal(migrated.state.version, 9);
  assert.equal(migrated.state.day, 1);
  assert.equal(migrated.state.minuteOfDay, DAY_START_MINUTE);
  assert.equal(migrated.state.gold, 100);
  assert.equal(migrated.state.inventory[0].itemId, ITEM_ID.turnipSeed);
  assert.equal(migrated.state.inventory[1].itemId, ITEM_ID.turnip);
  assert.deepEqual(migrated.state.farmTiles["farm-plot-001"], {
    id: "farm-plot-001",
    phase: "growing",
    cropId: ITEM_ID.turnip,
    growthDays: 1,
    watered: true,
  });
  assert.equal(migrated.state.farmTiles["farm-plot-002"].growthDays, 3);
  assert.deepEqual(migrated.state.dailyForage, { day: 1, collectedIds: [] });
  assert.deepEqual(migrated.state.friendships, {});
  assert.equal(migrated.state.inventoryCapacity, 24);
  assert.equal(migrated.state.wateringCanLevel, 1);
  assert.equal(migrated.state.dailyRequest, null);
  assert.deepEqual(migrated.state.npcDialogue, {});
  assert.deepEqual(migrated.state.seenEventIds, []);
  assert.equal(migrated.state.pet, null);
  assert.deepEqual(decodeStoredGame(migrated), migrated);
  const legacyFarmTiles = Object.fromEntries(Object.entries(migrated.state.farmTiles).map(([id, tile]) => [id, {
    ...tile,
    growthStage: tile.growthDays,
  }]));
  for (const tile of Object.values(legacyFarmTiles)) delete tile.growthDays;
  const versionThree = {
    version: 3,
    updatedAt: migrated.updatedAt,
    state: { ...migrated.state, version: 3, farmTiles: legacyFarmTiles },
  };
  delete versionThree.state.minuteOfDay;
  assert.equal(decodeStoredGame(versionThree).state.minuteOfDay, DAY_START_MINUTE);
  const versionFour = {
    version: 4,
    updatedAt: migrated.updatedAt,
    state: { ...migrated.state, version: 4, farmTiles: legacyFarmTiles },
  };
  delete versionFour.state.friendships;
  assert.deepEqual(decodeStoredGame(versionFour).state.friendships, {});
  const versionSix = {
    version: 6,
    updatedAt: migrated.updatedAt,
    state: { ...migrated.state, version: 6, farmTiles: legacyFarmTiles },
  };
  delete versionSix.state.dailyForage;
  assert.deepEqual(decodeStoredGame(versionSix).state.dailyForage, { day: 1, collectedIds: [] });
  const versionSeven = structuredClone(migrated);
  versionSeven.version = 7;
  versionSeven.state.version = 7;
  delete versionSeven.state.inventoryCapacity;
  delete versionSeven.state.wateringCanLevel;
  delete versionSeven.state.dailyRequest;
  delete versionSeven.state.npcDialogue;
  delete versionSeven.state.seenEventIds;
  delete versionSeven.state.pet;
  assert.equal(decodeStoredGame(versionSeven).state.inventoryCapacity, 24);
  const versionEight = structuredClone(migrated);
  versionEight.version = 8;
  versionEight.state.version = 8;
  delete versionEight.state.pet;
  assert.equal(decodeStoredGame(versionEight).state.pet, null);
  assert.throws(
    () => decodeStoredGame({ ...migrated, state: { ...migrated.state, minuteOfDay: 365 } }),
    /time is invalid/i,
  );
  assert.throws(
    () => decodeStoredGame({
      ...migrated,
      state: {
        ...migrated.state,
        friendships: { invalid: { npcId: "invalid", points: 2_501, lastTalkedDay: 0 } },
      },
    }),
    /friendship/i,
  );
  const currentState = createInitialGameState(createLifeLoopCatalog());
  currentState.day = 2;
  currentState.dailyForage = { day: 2, collectedIds: [] };
  currentState.dailyRequest = createDailyRequestState(2);
  const currentStored = createStoredGame(currentState, 456);
  assert.throws(
    () => decodeStoredGame({
      ...currentStored,
      state: { ...currentStored.state, dailyRequest: { day: 2, requestId: "unknown", completed: false } },
    }),
    /daily request/i,
  );
  assert.throws(
    () => decodeStoredGame({
      ...currentStored,
      state: { ...currentStored.state, inventoryCapacity: 32 },
    }),
    /inventory/i,
  );
  assert.throws(
    () => decodeStoredGame({
      ...currentStored,
      state: { ...currentStored.state, seenEventIds: ["unknown-event"] },
    }),
    /event/i,
  );
  assert.throws(() => decodeStoredGame({ ...migrated, version: 10 }), /unsupported/i);
});

test("friendship records first daily talk, applies light decay and stops decay at max hearts", () => {
  const state = createInitialGameState(createLifeLoopCatalog());
  const friendship = new FriendshipSystem();
  assert.equal(friendship.talk(state, "seed-keeper"), "recorded");
  assert.equal(state.friendships["seed-keeper"].points, 20);
  assert.equal(friendship.talk(state, "seed-keeper"), "already-counted");
  assert.equal(state.friendships["seed-keeper"].points, 20);
  assert.equal(friendship.settleDay(state), false);
  state.day += 1;
  assert.equal(friendship.settleDay(state), true);
  assert.equal(state.friendships["seed-keeper"].points, 18);
  state.day += 1;
  assert.equal(friendship.talk(state, "seed-keeper"), "recorded");
  assert.equal(state.friendships["seed-keeper"].points, 38);
  state.friendships["seed-keeper"].points = FRIENDSHIP_MAX_POINTS;
  state.day += 1;
  assert.equal(friendship.settleDay(state), false);
  assert.equal(state.friendships["seed-keeper"].points, FRIENDSHIP_MAX_POINTS);
});

test("v9 upgrades, three-tile watering and deterministic requests stay atomic", () => {
  const catalog = createLifeLoopCatalog();
  const inventory = new InventorySystem();
  const friendship = new FriendshipSystem();
  const upgrades = new UpgradeSystem(inventory);
  const requests = new DailyRequestSystem(inventory, friendship);

  const wateringState = createInitialGameState(catalog);
  wateringState.day = 3;
  wateringState.gold = 900;
  wateringState.player.regionId = "town";
  assert.equal(inventory.add(wateringState.inventory, ITEM_ID.wood, 15), true);
  const blacksmith = [{
    entityId: "test-blacksmith",
    regionId: wateringState.player.regionId,
    npcId: "town-blacksmith",
    dialogueId: "blacksmith-intro",
    interactionType: "dialogue",
    x: wateringState.player.x,
    y: wateringState.player.y,
  }];
  assert.equal(upgrades.upgradeWateringCan(wateringState, blacksmith), "upgraded-watering-can");
  assert.equal(wateringState.wateringCanLevel, 2);
  assert.equal(wateringState.gold, 0);
  assert.equal(inventory.quantity(wateringState.inventory, ITEM_ID.wood), 0);
  wateringState.player.regionId = "cottage";
  wateringState.player.x = 48;
  assert.equal(inventory.add(wateringState.inventory, ITEM_ID.turnipSeed, 3), true);
  const farming = new FarmingSystem(inventory, catalog);
  for (const plotId of [FARM_PLOT_ID, FARM_PLOT_2_ID, FARM_PLOT_3_ID]) {
    assert.equal(farming.use(wateringState, plotId, ITEM_ID.hoe), "tilled");
    assert.equal(farming.use(wateringState, plotId, ITEM_ID.turnipSeed), "planted");
  }
  assert.equal(farming.use(wateringState, FARM_PLOT_ID, ITEM_ID.wateringCan, "right"), "watered");
  assert.equal(wateringState.farmTiles[FARM_PLOT_ID].watered, true);
  assert.equal(wateringState.farmTiles[FARM_PLOT_2_ID].watered, true);
  assert.equal(wateringState.farmTiles[FARM_PLOT_3_ID].watered, true);

  const backpackState = createInitialGameState(catalog);
  backpackState.day = 5;
  backpackState.gold = 1_500;
  backpackState.player.regionId = "seed-shop";
  const seedKeeper = [{
    entityId: "test-seed-keeper",
    regionId: backpackState.player.regionId,
    npcId: "seed-keeper",
    dialogueId: "seed-keeper-welcome",
    interactionType: "shop",
    x: backpackState.player.x,
    y: backpackState.player.y,
  }];
  const firstTwentyFour = structuredClone(backpackState.inventory);
  assert.equal(upgrades.upgradeBackpack(backpackState, seedKeeper), "upgraded-backpack");
  assert.equal(backpackState.inventoryCapacity, 32);
  assert.deepEqual(backpackState.inventory.slice(0, 24), firstTwentyFour);
  assert.deepEqual(backpackState.inventory.slice(24), Array.from({ length: 8 }, () => ({ itemId: "", quantity: 0 })));
  assert.equal(upgrades.upgradeBackpack(backpackState, seedKeeper), "backpack-already-upgraded");

  const requestState = createInitialGameState(catalog);
  assert.equal(friendship.talk(requestState, "seed-keeper"), "recorded");
  requestState.day = 2;
  requestState.dailyForage = { day: 2, collectedIds: [] };
  requestState.dailyRequest = createDailyRequestState(2);
  assert.equal(inventory.add(requestState.inventory, ITEM_ID.wood, 6), true);
  assert.equal(requests.submitForNpc(requestState, "seed-keeper").result, "request-completed");
  assert.equal(friendship.talk(requestState, "seed-keeper"), "recorded");
  assert.equal(requestState.gold, 200);
  assert.equal(requestState.friendships["seed-keeper"].points, 210);
  assert.equal(requests.submitForNpc(requestState, "seed-keeper").result, "request-already-completed");
  requestState.day = 3;
  assert.equal(friendship.talk(requestState, "seed-keeper"), "recorded");
  requestState.day = 4;
  assert.equal(friendship.talk(requestState, "seed-keeper"), "recorded");
  assert.equal(requestState.friendships["seed-keeper"].points, 250);
  assert.equal(relationshipStageAt(requestState.friendships["seed-keeper"].points), "familiar");
});

test("NPC dialogue selection excludes the prior three days and records two-heart events once", () => {
  const state = createInitialGameState(createLifeLoopCatalog());
  const npc = createLifeLoopCatalog().requireRegion("cottage").npcs[0];
  const dialogue = new NpcDialogueSystem();
  const selections = [];
  for (let day = 1; day <= 5; day += 1) {
    state.day = day;
    state.dailyForage = { day, collectedIds: [] };
    state.dailyRequest = createDailyRequestState(day);
    const selection = dialogue.select(
      state,
      npc,
      { result: "request-not-target", request: null },
    );
    assert.equal(selections.slice(-3).includes(selection.dialogueId), false);
    selections.push(selection.dialogueId);
  }
  state.day = 6;
  state.dailyRequest = createDailyRequestState(6);
  state.friendships["seed-keeper"].points = 500;
  const awayFromWork = dialogue.select(state, npc, { result: "request-not-target", request: null });
  assert.notEqual(awayFromWork.dialogueId, "event:seed-keeper-two-heart");
  const eventNpc = { ...npc, regionId: "seed-shop" };
  const event = dialogue.select(state, eventNpc, { result: "request-not-target", request: null });
  assert.equal(event.dialogueId, "event:seed-keeper-two-heart");
  assert.deepEqual(state.seenEventIds, ["seed-keeper-two-heart"]);
  const next = dialogue.select(state, eventNpc, { result: "request-not-target", request: null });
  assert.notEqual(next.dialogueId, event.dialogueId);
});

test("first-week milestones acknowledge only unlocked presentation IDs and persist through GameSession", async () => {
  const catalog = createLifeLoopCatalog();
  const state = createInitialGameState(catalog);
  const milestones = new FirstWeekMilestoneSystem();
  assert.equal(latestFirstWeekMilestoneAt(2), null);
  assert.equal(latestFirstWeekMilestoneAt(6)?.eventId, "day-5-backpack-intro");
  assert.equal(milestones.acknowledge(state, "day-3-watering-intro"), "milestone-not-yet-available");
  assert.equal(milestones.acknowledge(state, "seed-keeper-two-heart"), "milestone-unsupported");
  assert.deepEqual(state.seenEventIds, []);

  state.day = 3;
  state.dailyForage = { day: 3, collectedIds: [] };
  state.dailyRequest = createDailyRequestState(3);
  const repository = new MemorySaveRepository();
  repository.game = createStoredGame(state, 0);
  const session = new GameSession(repository, "milestone-owner", catalog);
  await session.continueGame();
  assert.equal(
    session.dispatch({ type: "acknowledge-retention-event", eventId: "day-3-watering-intro" })?.code,
    "milestone-acknowledged",
  );
  assert.equal(
    session.dispatch({ type: "acknowledge-retention-event", eventId: "day-3-watering-intro" })?.code,
    "milestone-already-seen",
  );
  await session.flush();
  assert.deepEqual(repository.game.state.seenEventIds, ["day-3-watering-intro"]);
  const daySixRequest = getDailyRequest(createDailyRequestState(6)?.requestId);
  assert.equal(daySixRequest?.itemId, ITEM_ID.wood);
  assert.equal(daySixRequest?.quantity, 15);
  assert.equal(daySixRequest?.goldReward, 320);
  assert.equal(daySixRequest?.friendshipReward, 100);
});

test("clock advances in ten-minute steps, pauses without catch-up and sleep resets 06:00", async () => {
  const repository = new MemorySaveRepository();
  let wallClock = 0;
  const session = new GameSession(repository, "clock-owner", createLifeLoopCatalog(), "main", () => wallClock);
  await session.newGame();

  wallClock = advanceSessionClock(session, wallClock, 0);
  for (let index = 0; index < 7; index += 1) {
    wallClock += 1_000;
    session.tick(wallClock, false);
  }
  assert.equal(session.snapshot().minuteOfDay, DAY_START_MINUTE);
  wallClock += 60_000;
  session.tick(wallClock, true);
  wallClock += 1_000;
  session.tick(wallClock, false);
  assert.equal(session.snapshot().minuteOfDay, DAY_START_MINUTE + 10);

  wallClock = advanceSessionClock(
    session,
    wallClock,
    DAY_END_MINUTE - (DAY_START_MINUTE + 10),
  );
  assert.equal(session.snapshot().minuteOfDay, DAY_END_MINUTE);
  wallClock = advanceSessionClock(session, wallClock, 20);
  assert.equal(session.snapshot().minuteOfDay, DAY_END_MINUTE);

  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  assert.equal(session.snapshot().day, 2);
  assert.equal(session.snapshot().minuteOfDay, DAY_START_MINUTE);
  await session.flush();
});

test("a released Day-28 v7 save migrates and sleeps into an unbounded Day 29", async () => {
  const catalog = createLifeLoopCatalog();
  const current = createInitialGameState(catalog);
  current.day = 28;
  current.dailyForage = { day: 28, collectedIds: [] };
  current.friendships["seed-keeper"].points = 250;
  const {
    inventoryCapacity: _inventoryCapacity,
    wateringCanLevel: _wateringCanLevel,
    dailyRequest: _dailyRequest,
    npcDialogue: _npcDialogue,
    seenEventIds: _seenEventIds,
    pet: _pet,
    ...releasedFields
  } = current;
  const repository = new MemorySaveRepository();
  repository.game = decodeStoredGame({
    version: 7,
    updatedAt: 700,
    state: { ...releasedFields, version: 7 },
  });
  const session = new GameSession(repository, "day-29-owner", catalog, "main", () => 701);
  await session.continueGame();
  assert.equal(session.snapshot().inventoryCapacity, 24);
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  const day29 = session.snapshot();
  assert.equal(day29.day, 29);
  assert.equal(day29.friendships["seed-keeper"].points, 248);
  assert.equal(day29.dailyRequest?.day, 29);
  assert.equal(playableCalendarAt(day29.day).season, "spring");
  await session.flush();
});

test("one real session completes buy, three watered sleeps, harvest, sale and repeat purchase", async () => {
  const repository = new MemorySaveRepository();
  let wallClock = 1_000;
  const session = new GameSession(repository, "test-owner", createLifeLoopCatalog(), "main", () => wallClock);
  let state = await session.newGame();
  assert.equal(state.day, 1);
  assert.equal(state.minuteOfDay, DAY_START_MINUTE);
  assert.equal(state.gold, 100);
  assert.equal(state.friendships["seed-keeper"].points, 0);
  assert.equal(session.dispatch({ type: "talk-to-npc", npcId: "seed-keeper" }), null);
  assert.equal(session.snapshot().friendships["seed-keeper"].points, 0);
  assert.deepEqual(state.inventory.slice(0, 3), [
    { itemId: ITEM_ID.hoe, quantity: 1 },
    { itemId: ITEM_ID.wateringCan, quantity: 1 },
    { itemId: ITEM_ID.axe, quantity: 1 },
  ]);
  assert.equal(state.inventory.some((slot) => slot.itemId === ITEM_ID.turnipSeed), false);

  wallClock = advanceSessionClock(session, wallClock, 180);
  assert.equal(session.snapshot().minuteOfDay, 9 * 60);
  const walkingKeeper = session.activeNpcById("seed-keeper");
  assert.equal(walkingKeeper?.motion, "walking");
  assert.equal(walkingKeeper?.interactionType, "dialogue");
  assert.equal(session.dispatch({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 })?.code, "not-at-shop");
  const pausedKeeper = structuredClone(walkingKeeper);
  wallClock += 1_000;
  session.tick(wallClock, true);
  assert.deepEqual(session.activeNpcById("seed-keeper"), pausedKeeper);
  wallClock = advanceNpcToIdle(session, wallClock, "seed-keeper");
  assert.equal(session.activeNpcById("seed-keeper")?.interactionType, "shop");
  const firstInteraction = session.dispatch({ type: "talk-to-npc", npcId: "seed-keeper" });
  assert.equal(firstInteraction?.kind, "npc-interaction");
  assert.equal(firstInteraction?.firstTalkToday, true);
  assert.equal(session.snapshot().friendships["seed-keeper"].points, 20);
  const repeatInteraction = session.dispatch({ type: "talk-to-npc", npcId: "seed-keeper" });
  assert.equal(repeatInteraction?.kind, "npc-interaction");
  assert.equal(repeatInteraction?.firstTalkToday, false);
  assert.equal(session.snapshot().friendships["seed-keeper"].points, 20);
  assert.equal(session.dispatch({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 })?.code, "bought");
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.hoe, targetId: FARM_PLOT_ID })?.code, "tilled");
  const tilled = session.snapshot();
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.axe, targetId: FARM_PLOT_ID }), null);
  assert.deepEqual(session.snapshot(), tilled);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.turnipSeed, targetId: FARM_PLOT_ID })?.code, "planted");
  const planted = session.snapshot();
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.hoe, targetId: FARM_PLOT_ID }), null);
  assert.deepEqual(session.snapshot(), planted);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: FARM_PLOT_ID })?.code, "watered");
  wallClock += 1_000;
  session.tick(wallClock, true);
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthDays, 0);
  await session.flush();
  const savesBeforeSleep = repository.saveCalls;

  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "already-saving");
  state = session.snapshot();
  assert.equal(state.day, 2);
  assert.equal(state.minuteOfDay, DAY_START_MINUTE);
  assert.equal(state.farmTiles[FARM_PLOT_ID].growthDays, 1);
  assert.equal(state.farmTiles[FARM_PLOT_ID].watered, false);
  assert.equal(state.friendships["seed-keeper"].points, 20);
  await session.flush();
  assert.equal(repository.saveCalls, savesBeforeSleep + 1);

  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: FARM_PLOT_ID })?.code, "watered");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  await session.flush();
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthDays, 2);
  assert.equal(session.snapshot().friendships["seed-keeper"].points, 18);

  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: FARM_PLOT_ID })?.code, "watered");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  await session.flush();
  state = session.snapshot();
  assert.equal(state.day, 4);
  assert.equal(state.farmTiles[FARM_PLOT_ID].phase, "mature");
  const mature = structuredClone(state);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.axe, targetId: FARM_PLOT_ID }), null);
  assert.deepEqual(session.snapshot(), mature);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: "", targetId: FARM_PLOT_ID })?.code, "harvested");
  wallClock = advanceSessionClock(session, wallClock, 180);
  wallClock = advanceNpcToIdle(session, wallClock, "seed-keeper");
  assert.equal(session.dispatch({ type: "sell-item", itemId: ITEM_ID.turnip, quantity: 1 })?.code, "sold");
  assert.equal(session.snapshot().gold, 115);
  assert.equal(session.dispatch({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 })?.code, "bought");
  assert.equal(session.snapshot().gold, 95);
  await session.flush();
  assert.ok(repository.saveCalls >= 10);
});

test("selected item and target phase own every tree and farm mutation", async () => {
  const repository = new MemorySaveRepository();
  const session = new GameSession(repository, "tool-owner", createLifeLoopCatalog(), "main", () => 2_000);
  await session.newGame();

  const initial = session.snapshot();
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.hoe, targetId: TREE_ID }), null);
  assert.deepEqual(session.snapshot(), initial);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: FARM_PLOT_ID }), null);
  assert.deepEqual(session.snapshot(), initial);

  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.axe, targetId: TREE_ID })?.code, "success");
  assert.equal(session.snapshot().resources[TREE_ID].available, false);
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: "", targetId: FARM_PLOT_ID }), null);
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].phase, "untilled");
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.hoe, targetId: FARM_PLOT_ID })?.code, "tilled");
  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.axe, targetId: FARM_PLOT_ID }), null);
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].phase, "tilled");
});

test("shop failure paths leave gold and inventory unchanged", () => {
  const catalog = createLifeLoopCatalog();
  const inventory = new InventorySystem();
  const shop = new ShopSystem(inventory);
  const state = createInitialGameState(catalog);
  state.player.x = 64;
  state.player.y = 32;
  assert.equal(shop.buySeed(state, activeNpcSpawns(catalog, state.minuteOfDay), ITEM_ID.turnipSeed), "not-at-shop");
  state.minuteOfDay = 9 * 60;
  const activeNpcs = activeNpcSpawns(catalog, state.minuteOfDay);
  const baseline = structuredClone(state);
  assert.equal(shop.sellItem(state, activeNpcs, ITEM_ID.turnip), "missing-item");
  assert.deepEqual(state, baseline);

  state.inventory = state.inventory.map(() => ({ itemId: ITEM_ID.wood, quantity: 99 }));
  const fullInventory = structuredClone(state.inventory);
  assert.equal(shop.buySeed(state, activeNpcs, ITEM_ID.turnipSeed), "inventory-full");
  assert.equal(state.gold, 100);
  assert.deepEqual(state.inventory, fullInventory);

  state.inventory = structuredClone(baseline.inventory);
  state.gold = 0;
  const emptyGoldInventory = structuredClone(state.inventory);
  assert.equal(shop.buySeed(state, activeNpcs, ITEM_ID.turnipSeed), "insufficient-gold");
  assert.equal(state.gold, 0);
  assert.deepEqual(state.inventory, emptyGoldInventory);
});

test("formal world catalog decodes with the single stable Cottage bed interaction", async () => {
  const regions = await Promise.all([
    decodeFormalMap("farm.tmj", "region-farm"),
    decodeFormalMap("town.tmj", "region-town"),
    decodeFormalMap("cottage.tmj", "region-cottage"),
    decodeFormalMap("seed-shop.tmj", "region-seed-shop"),
    decodeFormalMap("blacksmith.tmj", "region-blacksmith"),
    decodeFormalMap("town-house-west.tmj", "region-town-house-west"),
    decodeFormalMap("town-house-north.tmj", "region-town-house-north"),
    decodeFormalMap("town-house.tmj", "region-town-house"),
    decodeFormalMap("town-house-southwest.tmj", "region-town-house-southwest"),
    decodeFormalMap("town-house-east.tmj", "region-town-house-east"),
    decodeFormalMap("foothills.tmj", "region-foothills"),
    decodeFormalMap("lakeshore.tmj", "region-lakeshore"),
  ]);
  const catalog = new WorldCatalog(regions);
  const cottage = catalog.requireRegion("cottage");
  const beds = cottage.interactions.filter((interaction) => interaction.kind === "bed");
  assert.equal(beds.length, 1);
  assert.equal(beds[0].entityId, BED_ID);
});
