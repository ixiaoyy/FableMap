import assert from "node:assert/strict";
import test from "node:test";
import { createStoredGame } from "../domain/persistence/SaveRepository.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import {
  indexedDbSlotKeys,
  planIndexedDbSave,
  v2BackupKey,
} from "../client/src/persistence/v2-migration-backup.ts";

/** Builds the smallest valid catalog needed to produce one current v4 save. */
function createCatalog() {
  return new WorldCatalog([{
    id: "farm",
    mapKey: "test-farm",
    displayName: "测试农场",
    defaultSpawnId: "home-yard",
    isStartRegion: true,
    widthPixels: 64,
    heightPixels: 64,
    collision: {
      columns: 4,
      rows: 4,
      tileWidth: 16,
      tileHeight: 16,
      blocked: Array.from({ length: 16 }, () => false),
    },
    spawns: { "home-yard": { x: 24, y: 24 } },
    exits: [],
    resources: [],
    interactions: [],
    npcs: [],
  }]);
}

/** Creates one representative released v2 envelope whose identity must be preserved exactly. */
function createRawV2() {
  return {
    version: 2,
    updatedAt: 123,
    state: { version: 2, marker: "exact-original-v2" },
  };
}

test("first v4 write over v2 plans one exact owner-scoped backup", () => {
  const mainKey = "owner-hash:main";
  const rawV2 = createRawV2();
  const v4 = createStoredGame(createInitialGameState(createCatalog()), 456);
  const plan = planIndexedDbSave(mainKey, { key: mainKey, game: rawV2 }, undefined, v4);
  assert.deepEqual(plan.main, { key: mainKey, game: v4 });
  assert.deepEqual(plan.backup, { key: `${mainKey}:backup:v2`, game: rawV2 });
  assert.strictEqual(plan.backup.game, rawV2);
});

test("existing backup, current v4 and new slots never create another v2 backup", () => {
  const mainKey = "owner-hash:main";
  const rawV2 = createRawV2();
  const v4 = createStoredGame(createInitialGameState(createCatalog()), 456);
  const existingBackup = { key: v2BackupKey(mainKey), game: rawV2 };
  assert.equal(
    planIndexedDbSave(mainKey, { key: mainKey, game: rawV2 }, existingBackup, v4).backup,
    null,
  );
  assert.equal(planIndexedDbSave(mainKey, { key: mainKey, game: v4 }, undefined, v4).backup, null);
  assert.equal(planIndexedDbSave(mainKey, undefined, undefined, v4).backup, null);
});

test("explicit slot deletion owns only its main and v2 backup keys", () => {
  assert.deepEqual(indexedDbSlotKeys("owner-hash:main"), [
    "owner-hash:main",
    "owner-hash:main:backup:v2",
  ]);
  assert.throws(() => v2BackupKey(""), /invalid/i);
});
