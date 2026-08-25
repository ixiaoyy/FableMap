import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { InventorySystem } from "../domain/inventory/InventorySystem.ts";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { decodeStoredGame } from "../domain/persistence/SaveRepository.ts";
import { GameSession } from "../domain/session/GameSession.ts";
import { ShopSystem } from "../domain/shop/ShopSystem.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import { decodeTiledRegion } from "../client/src/game/world/tiled-region-decoder.ts";

const FARM_PLOT_ID = "farm-plot-001";
const BED_ID = "cottage-bed";

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
    spawns: { entry: { x: 32, y: 32 } },
    exits: [],
    resources: [],
    interactions: [
      { entityId: BED_ID, regionId: "cottage", kind: "bed", x: 16, y: 16, width: 32, height: 48 },
      { entityId: FARM_PLOT_ID, regionId: "cottage", kind: "farm-plot", x: 40, y: 32, width: 16, height: 16 },
    ],
    npcs: [{
      entityId: "seed-shop-keeper",
      regionId: "cottage",
      npcId: "seed-keeper",
      dialogueId: "seed-keeper-welcome",
      x: 32,
      y: 32,
    }],
  }]);
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

test("v2 saves migrate once to v3 and repeated v3 decode is idempotent", () => {
  const migrated = decodeStoredGame(createV2StoredGame());
  assert.equal(migrated.version, 3);
  assert.equal(migrated.state.version, 3);
  assert.equal(migrated.state.day, 1);
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
  assert.deepEqual(decodeStoredGame(migrated), migrated);
  assert.throws(() => decodeStoredGame({ ...migrated, version: 4 }), /unsupported/i);
});

test("one real session completes buy, three watered sleeps, harvest, sale and repeat purchase", async () => {
  const repository = new MemorySaveRepository();
  const session = new GameSession(repository, "test-owner", createLifeLoopCatalog(), "main", () => 1_000);
  let state = await session.newGame();
  assert.equal(state.day, 1);
  assert.equal(state.gold, 100);
  assert.equal(state.inventory.some((slot) => slot.itemId === ITEM_ID.turnipSeed), false);

  assert.equal(session.dispatch({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 })?.code, "bought");
  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "tilled");
  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "planted");
  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "watered");
  session.tick(Number.MAX_SAFE_INTEGER);
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthStage, 0);
  await session.flush();
  const savesBeforeSleep = repository.saveCalls;

  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "already-saving");
  state = session.snapshot();
  assert.equal(state.day, 2);
  assert.equal(state.farmTiles[FARM_PLOT_ID].growthStage, 1);
  assert.equal(state.farmTiles[FARM_PLOT_ID].watered, false);
  await session.flush();
  assert.equal(repository.saveCalls, savesBeforeSleep + 1);

  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "watered");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  await session.flush();
  assert.equal(session.snapshot().farmTiles[FARM_PLOT_ID].growthStage, 2);

  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "watered");
  assert.equal(session.dispatch({ type: "sleep", bedId: BED_ID })?.code, "slept");
  await session.flush();
  state = session.snapshot();
  assert.equal(state.day, 4);
  assert.equal(state.farmTiles[FARM_PLOT_ID].phase, "mature");
  assert.equal(session.dispatch({ type: "farm-primary", tileId: FARM_PLOT_ID })?.code, "harvested");
  assert.equal(session.dispatch({ type: "sell-item", itemId: ITEM_ID.turnip, quantity: 1 })?.code, "sold");
  assert.equal(session.snapshot().gold, 115);
  assert.equal(session.dispatch({ type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 })?.code, "bought");
  assert.equal(session.snapshot().gold, 95);
  await session.flush();
  assert.ok(repository.saveCalls >= 10);
});

test("shop failure paths leave gold and inventory unchanged", () => {
  const catalog = createLifeLoopCatalog();
  const inventory = new InventorySystem();
  const shop = new ShopSystem(inventory, catalog);
  const state = createInitialGameState(catalog);
  const baseline = structuredClone(state);
  assert.equal(shop.sellTurnip(state), "missing-item");
  assert.deepEqual(state, baseline);

  state.inventory = state.inventory.map(() => ({ itemId: ITEM_ID.wood, quantity: 99 }));
  const fullInventory = structuredClone(state.inventory);
  assert.equal(shop.buyTurnipSeed(state), "inventory-full");
  assert.equal(state.gold, 100);
  assert.deepEqual(state.inventory, fullInventory);

  state.inventory = structuredClone(baseline.inventory);
  state.gold = 0;
  const emptyGoldInventory = structuredClone(state.inventory);
  assert.equal(shop.buyTurnipSeed(state), "insufficient-gold");
  assert.equal(state.gold, 0);
  assert.deepEqual(state.inventory, emptyGoldInventory);
});

test("formal world catalog decodes with the single stable Cottage bed interaction", async () => {
  const regions = await Promise.all([
    decodeFormalMap("farm.tmj", "region-farm"),
    decodeFormalMap("town.tmj", "region-town"),
    decodeFormalMap("cottage.tmj", "region-cottage"),
    decodeFormalMap("seed-shop.tmj", "region-seed-shop"),
  ]);
  const catalog = new WorldCatalog(regions);
  const cottage = catalog.requireRegion("cottage");
  const beds = cottage.interactions.filter((interaction) => interaction.kind === "bed");
  assert.equal(beds.length, 1);
  assert.equal(beds[0].entityId, BED_ID);
});
