import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getDialogueDefinition } from "../client/src/game/dialogue/definitions.ts";
import {
  advanceDialogue,
  clearGameState,
  closeShop,
  gameUiState,
  isWorldInputLocked,
  openShop,
  setDialogue,
} from "../client/src/stores/game-store.ts";
import {
  createWorldCatalog,
  decodeTiledRegion,
} from "../client/src/game/world/tiled-region-decoder.ts";


const TILE_SIZE = 16;

/** Loads one formal Tiled JSON region from the production map directory. */
async function loadMap(name) {
  return JSON.parse(await readFile(new URL(`../public/map/${name}.tmj`, import.meta.url), "utf8"));
}

/** Returns one shortest four-direction route through the real catalog collision contract. */
function findRoute(catalog, regionId, start, goals) {
  const region = catalog.requireRegion(regionId);
  const width = region.widthPixels / TILE_SIZE;
  const height = region.heightPixels / TILE_SIZE;
  const queue = [start];
  const previous = new Set([start.join(",")]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (goals.has(current.join(","))) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [current[0] + dx, current[1] + dy];
      const key = next.join(",");
      if (
        next[0] >= 0 && next[0] < width && next[1] >= 0 && next[1] < height
        && !previous.has(key)
        && !catalog.isBlocked(regionId, next[0] * TILE_SIZE + 8, next[1] * TILE_SIZE + 8)
      ) {
        previous.add(key);
        queue.push(next);
      }
    }
  }
  return false;
}

/** Returns passable tile goals within the fixed 42px interaction range of one NPC. */
function interactionGoals(catalog, npc) {
  const goals = new Set();
  const centerX = Math.floor(npc.x / TILE_SIZE);
  const centerY = Math.floor(npc.y / TILE_SIZE);
  for (let y = centerY - 2; y <= centerY + 2; y += 1) {
    for (let x = centerX - 2; x <= centerX + 2; x += 1) {
      const worldX = x * TILE_SIZE + 8;
      const worldY = y * TILE_SIZE + 8;
      if (
        Math.hypot(worldX - npc.x, worldY - npc.y) <= 42
        && !catalog.isBlocked(npc.regionId, worldX, worldY)
      ) goals.add(`${x},${y}`);
    }
  }
  return goals;
}

test("formal maps decode three stable NPCs with reviewed interaction types and reachable feet", async () => {
  const [farmMap, townMap, cottageMap, seedShopMap] = await Promise.all([
    loadMap("farm"), loadMap("town"), loadMap("cottage"), loadMap("seed-shop"),
  ]);
  const catalog = createWorldCatalog([
    decodeTiledRegion(farmMap, "test-farm"),
    decodeTiledRegion(townMap, "test-town"),
    decodeTiledRegion(cottageMap, "test-cottage"),
    decodeTiledRegion(seedShopMap, "test-seed-shop"),
  ]);
  const town = catalog.requireRegion("town");
  const shop = catalog.requireRegion("seed-shop");
  assert.deepEqual(town.npcs.map((npc) => [npc.entityId, npc.npcId, npc.dialogueId, npc.interactionType]), [
    ["town-resident-01", "town-resident-01", "town-resident-pink-tree", "dialogue"],
    ["town-blacksmith", "town-blacksmith", "blacksmith-intro", "dialogue"],
  ]);
  assert.deepEqual(shop.npcs.map((npc) => [npc.entityId, npc.npcId, npc.dialogueId, npc.interactionType]), [
    ["seed-shop-keeper", "seed-keeper", "seed-keeper-welcome", "shop"],
  ]);

  const townStart = [2, 18];
  for (const npc of town.npcs) {
    assert.equal(catalog.isBlocked("town", npc.x, npc.y), true);
    assert.equal(findRoute(catalog, "town", townStart, interactionGoals(catalog, npc)), true);
  }
  const keeper = shop.npcs[0];
  assert.equal(catalog.isBlocked("seed-shop", keeper.x, keeper.y), false);
  assert.equal(findRoute(catalog, "seed-shop", [20, 26], interactionGoals(catalog, keeper)), true);

  const invalid = structuredClone(seedShopMap);
  const invalidNpc = invalid.layers.find((layer) => layer.name === "NpcSpawns").objects[0];
  invalidNpc.properties.find((property) => property.name === "interactionType").value = "quest";
  assert.throws(() => decodeTiledRegion(invalid, "invalid-interaction"), /interaction type is invalid/u);
});

test("linear dialogue and shop share one transient world-input lock", () => {
  clearGameState();
  const dialogue = getDialogueDefinition("blacksmith-intro");
  assert.ok(dialogue);
  setDialogue({ speaker: dialogue.speaker, lines: dialogue.lines });
  assert.equal(isWorldInputLocked(), true);
  assert.equal(gameUiState.dialogue?.lineIndex, 0);
  assert.equal(gameUiState.dialogue?.lines[0], "炉子还没正式开张。");
  advanceDialogue();
  assert.equal(gameUiState.dialogue?.lineIndex, 1);
  advanceDialogue();
  assert.equal(gameUiState.dialogue, null);
  assert.equal(isWorldInputLocked(), false);

  openShop("萝卜种子还压着半箱。今天种下的话，别忘了浇水。");
  assert.equal(gameUiState.shopOpen, true);
  assert.equal(gameUiState.shopWelcome.includes("萝卜种子"), true);
  assert.equal(isWorldInputLocked(), true);
  closeShop();
  assert.equal(isWorldInputLocked(), false);
});
