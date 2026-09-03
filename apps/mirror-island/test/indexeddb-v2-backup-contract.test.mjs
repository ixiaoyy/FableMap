import assert from "node:assert/strict";
import test from "node:test";
import { createStoredGame } from "../domain/persistence/SaveRepository.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import { WorldCatalog } from "../domain/world/regions.ts";
import {
  indexedDbSlotKeys,
  planIndexedDbSave,
  v2BackupKey,
  v9BackupKey,
} from "../client/src/persistence/v2-migration-backup.ts";

/** Builds the smallest valid catalog needed to produce one current v5 save. */
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

test("first v5 write over v2 plans one exact owner-scoped backup", () => {
  const mainKey = "owner-hash:main";
  const rawV2 = createRawV2();
  const v5 = createStoredGame(createInitialGameState(createCatalog()), 456);
  const plan = planIndexedDbSave(mainKey, { key: mainKey, game: rawV2 }, undefined, v5);
  assert.deepEqual(plan.main, { key: mainKey, game: v5 });
  assert.deepEqual(plan.backup, { key: `${mainKey}:backup:v2`, game: rawV2 });
  assert.strictEqual(plan.backup.game, rawV2);
});

test("existing backup, current v5 and new slots never create another v2 backup", () => {
  const mainKey = "owner-hash:main";
  const rawV2 = createRawV2();
  const v5 = createStoredGame(createInitialGameState(createCatalog()), 456);
  const existingBackup = { key: v2BackupKey(mainKey), game: rawV2 };
  assert.equal(
    planIndexedDbSave(mainKey, { key: mainKey, game: rawV2 }, existingBackup, v5).backup,
    null,
  );
  assert.equal(planIndexedDbSave(mainKey, { key: mainKey, game: v5 }, undefined, v5).backup, null);
  assert.equal(planIndexedDbSave(mainKey, undefined, undefined, v5).backup, null);
});

test("v10 preserves an exact released v9 envelope only once", () => {
  const mainKey = "owner-hash:main";
  const raw = { version: 9, updatedAt: 789, state: { version: 9, marker: "original-pet-save" } };
  const current = createStoredGame(createInitialGameState(createCatalog()), 999);
  const plan = planIndexedDbSave(mainKey, { key: mainKey, game: raw }, undefined, current, 9);
  assert.deepEqual(plan.backup, { key: v9BackupKey(mainKey), game: raw });
  assert.strictEqual(plan.backup.game, raw);
  assert.equal(planIndexedDbSave(mainKey, { key: mainKey, game: raw }, plan.backup, current, 9).backup, null);
  assert.equal(planIndexedDbSave(mainKey, plan.main, undefined, current, 9).backup, null);
});

test("explicit slot deletion owns only its main, v2 and v9 backup keys", () => {
  assert.deepEqual(indexedDbSlotKeys("owner-hash:main"), [
    "owner-hash:main",
    "owner-hash:main:backup:v2",
    "owner-hash:main:backup:v9",
  ]);
  assert.throws(() => v2BackupKey(""), /invalid/i);
});
