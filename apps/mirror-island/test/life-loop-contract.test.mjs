import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { InventorySystem } from "../domain/inventory/InventorySystem.ts";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { decodeStoredGame } from "../domain/persistence/SaveRepository.ts";
import { GameSession } from "../domain/session/GameSession.ts";
import { ShopSystem } from "../domain/shop/ShopSystem.ts";
import { FriendshipSystem } from "../domain/social/FriendshipSystem.ts";
import { FRIENDSHIP_MAX_POINTS } from "../domain/social/definitions.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import {
  DAY_END_MINUTE,
  DAY_START_MINUTE,
  REAL_MILLISECONDS_PER_TIME_STEP,
} from "../domain/time/game-time.ts";
import { activeNpcSpawns } from "../domain/world/npc-schedules.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import { decodeTiledRegion } from "../client/src/game/world/tiled-region-decoder.ts";

const FARM_PLOT_ID = "farm-plot-001";
const BED_ID = "cottage-bed";
const TREE_ID = "test-tree-001";

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
    resources: [{ entityId: TREE_ID, regionId: "cottage", kind: "tree", x: 64, y: 48 }],
    interactions: [
      { entityId: BED_ID, regionId: "cottage", kind: "bed", x: 16, y: 16, width: 32, height: 48 },
      { entityId: FARM_PLOT_ID, regionId: "cottage", kind: "farm-plot", x: 40, y: 32, width: 16, height: 16 },
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

test("v2, v3 and v4 saves migrate to v5 and repeated v5 decode is idempotent", () => {
  const migrated = decodeStoredGame(createV2StoredGame());
  assert.equal(migrated.version, 5);
  assert.equal(migrated.state.version, 5);
  assert.equal(migrated.state.day, 1);
  assert.equal(migrated.state.minuteOfDay, DAY_START_MINUTE);
  assert.equal(migrated.state.gold, 100);
  assert.equal(migrated.state.inventory[0].itemId, ITEM_ID.turnipSeed);
  assert.equal(migrated.state.inventory[1].itemId, ITEM_ID.turnip);
  assert.deepEqual(migrated.state.farmTiles["farm-plot-001"], {
    id: "farm-plot-001",
    phase: "growing",
    cropId: ITEM_ID.turnip,
    growthStage: 1,
    watered: true,
  });
  assert.equal(migrated.state.farmTiles["farm-plot-002"].growthStage, 3);
  assert.deepEqual(migrated.state.friendships, {});
  assert.deepEqual(decodeStoredGame(migrated), migrated);
  const versionThree = {
    version: 3,
    updatedAt: migrated.updatedAt,
    state: { ...migrated.state, version: 3 },
  };
  delete versionThree.state.minuteOfDay;
  assert.equal(decodeStoredGame(versionThree).state.minuteOfDay, DAY_START_MINUTE);
  const versionFour = {
    version: 4,
    updatedAt: migrated.updatedAt,
    state: { ...migrated.state, version: 4 },
  };
  delete versionFour.state.friendships;
  assert.deepEqual(decodeStoredGame(versionFour).state.friendships, {});
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
  assert.throws(() => decodeStoredGame({ ...migrated, version: 6 }), /unsupported/i);
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
  assert.equal(session.dispatch({ type: "talk-to-npc", npcId: "seed-keeper" }), null);
  assert.equal(session.snapshot().friendships["seed-keeper"].points, 20);
  assert.equal(session.dispatch({ type: "talk-to-npc", npcId: "seed-keeper" }), null);
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
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthStage, 0);
  await session.flush();
  const savesBeforeSleep = repository.saveCalls;

  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "already-saving");
  state = session.snapshot();
  assert.equal(state.day, 2);
  assert.equal(state.minuteOfDay, DAY_START_MINUTE);
  assert.equal(state.farmTiles[FARM_PLOT_ID].growthStage, 1);
  assert.equal(state.farmTiles[FARM_PLOT_ID].watered, false);
  assert.equal(state.friendships["seed-keeper"].points, 20);
  await session.flush();
  assert.equal(repository.saveCalls, savesBeforeSleep + 1);

  assert.equal(session.dispatch({ type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: FARM_PLOT_ID })?.code, "watered");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  await session.flush();
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthStage, 2);
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
  assert.equal(shop.buyTurnipSeed(state, activeNpcSpawns(catalog, state.minuteOfDay)), "not-at-shop");
  state.minuteOfDay = 9 * 60;
  const activeNpcs = activeNpcSpawns(catalog, state.minuteOfDay);
  const baseline = structuredClone(state);
  assert.equal(shop.sellTurnip(state, activeNpcs), "missing-item");
  assert.deepEqual(state, baseline);

  state.inventory = state.inventory.map(() => ({ itemId: ITEM_ID.wood, quantity: 99 }));
  const fullInventory = structuredClone(state.inventory);
  assert.equal(shop.buyTurnipSeed(state, activeNpcs), "inventory-full");
  assert.equal(state.gold, 100);
  assert.deepEqual(state.inventory, fullInventory);

  state.inventory = structuredClone(baseline.inventory);
  state.gold = 0;
  const emptyGoldInventory = structuredClone(state.inventory);
  assert.equal(shop.buyTurnipSeed(state, activeNpcs), "insufficient-gold");
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
