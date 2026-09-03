import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { selectNpcHitTarget } from "../client/src/game/combat/npc-hit-target.ts";
import { getDialogueDefinition } from "../client/src/game/dialogue/definitions.ts";
import { daylightVisualAt } from "../client/src/game/presentation/daylight.ts";
import {
  advanceDialogue,
  applyGameState,
  applyFishingState,
  applyDaySettlement,
  cancelSleepConfirmation,
  clearGameState,
  closeBackpack,
  closeRequestBoard,
  closeShop,
  closeSocial,
  confirmSleep,
  deferPetAdoption,
  gameUiState,
  isWorldInputLocked,
  isGameClockPaused,
  openShop,
  openBackpack,
  openPetAdoption,
  openRequestBoard,
  openSocial,
  openSleepConfirmation,
  selectHotbarSlot,
  selectInventorySlot,
  setDialogue,
  setWorldActionBusy,
} from "../client/src/stores/game-store.ts";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { IDLE_FISHING_SNAPSHOT } from "../domain/fishing/definitions.ts";
import { IDLE_DAY_SETTLEMENT } from "../domain/session/day-settlement.ts";
import { createInitialGameState } from "../domain/state/game-state.ts";
import { validateNpcActivities } from "../domain/world/npc-activities.ts";
import {
  NPC_ACTIVITY_DWELL_MS,
  NPC_REPLAN_DELAY_MS,
  NPC_TRANSFER_DURATION_MS,
  NpcMotionRuntime,
} from "../domain/world/npc-motions.ts";
import { findNpcPath } from "../domain/world/npc-pathfinding.ts";
import {
  NPC_FEET_HALF_HEIGHT,
  NPC_FEET_HALF_WIDTH,
  PLAYER_FEET_HALF_HEIGHT,
  PLAYER_FEET_HALF_WIDTH,
  worldFeetOverlap,
} from "../domain/world/regions.ts";
import {
  activeNpcById,
  activeNpcSpawns,
  validateNpcSchedules,
} from "../domain/world/npc-schedules.ts";
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

test("daylight projection keeps outdoor phases distinct and indoor night readable", () => {
  const dawn = daylightVisualAt(360, "farm");
  const day = daylightVisualAt(720, "town");
  const dusk = daylightVisualAt(1_080, "lakeshore");
  const twilight = daylightVisualAt(1_140, "foothills");
  const night = daylightVisualAt(1_260, "town");
  const midnight = daylightVisualAt(1_440, "farm");
  const indoorMidnight = daylightVisualAt(1_440, "cottage");

  assert.deepEqual([dawn.phase, dawn.environment, dawn.opacity], ["dawn", "outdoor", 0.16]);
  assert.deepEqual([day.phase, day.environment, day.opacity], ["day", "outdoor", 0]);
  assert.deepEqual([dusk.phase, dusk.environment, dusk.opacity], ["dusk", "outdoor", 0.14]);
  assert.ok(Math.abs(twilight.opacity - 0.21) < Number.EPSILON * 4);
  assert.match(twilight.color, /^#[0-9a-f]{6}$/u);
  assert.deepEqual([night.phase, night.environment, night.opacity], ["night", "outdoor", 0.36]);
  assert.deepEqual([midnight.phase, midnight.opacity], ["night", 0.44]);
  assert.deepEqual([indoorMidnight.environment, indoorMidnight.opacity], ["indoor", 0.12]);
  assert.ok(indoorMidnight.opacity < midnight.opacity);
  assert.throws(() => daylightVisualAt(365, "farm"), /time is invalid/i);
});

test("formal world maps decode NPCs, expansion exits and inspect hotspots through one catalog", async () => {
  const [
    farmMap, townMap, cottageMap, seedShopMap, blacksmithMap,
    townHouseWestMap, townHouseNorthMap, townHouseMap, townHouseSouthwestMap, townHouseEastMap,
    foothillsMap, lakeshoreMap,
  ]
    = await Promise.all([
      loadMap("farm"), loadMap("town"), loadMap("cottage"), loadMap("seed-shop"),
      loadMap("blacksmith"),
      loadMap("town-house-west"), loadMap("town-house-north"), loadMap("town-house"),
      loadMap("town-house-southwest"), loadMap("town-house-east"),
      loadMap("foothills"), loadMap("lakeshore"),
  ]);
  const catalog = createWorldCatalog([
    decodeTiledRegion(farmMap, "test-farm"),
    decodeTiledRegion(townMap, "test-town"),
    decodeTiledRegion(cottageMap, "test-cottage"),
    decodeTiledRegion(seedShopMap, "test-seed-shop"),
    decodeTiledRegion(blacksmithMap, "test-blacksmith"),
    decodeTiledRegion(townHouseWestMap, "test-town-house-west"),
    decodeTiledRegion(townHouseNorthMap, "test-town-house-north"),
    decodeTiledRegion(townHouseMap, "test-town-house"),
    decodeTiledRegion(townHouseSouthwestMap, "test-town-house-southwest"),
    decodeTiledRegion(townHouseEastMap, "test-town-house-east"),
    decodeTiledRegion(foothillsMap, "test-foothills"),
    decodeTiledRegion(lakeshoreMap, "test-lakeshore"),
  ]);
  validateNpcSchedules(catalog);
  validateNpcActivities(catalog);
  const visualProfileSource = await readFile(
    new URL("../client/src/game/assets/visual-profile.ts", import.meta.url),
    "utf8",
  );
  const town = catalog.requireRegion("town");
  const shop = catalog.requireRegion("seed-shop");
  assert.deepEqual(town.npcs.map((npc) => [npc.entityId, npc.npcId, npc.dialogueId, npc.interactionType]), [
    ["town-resident-01", "town-resident-01", "town-resident-pink-tree", "dialogue"],
    ["town-blacksmith", "town-blacksmith", "blacksmith-intro", "dialogue"],
  ]);
  assert.deepEqual(shop.npcs.map((npc) => [npc.entityId, npc.npcId, npc.dialogueId, npc.interactionType]), [
    ["seed-shop-keeper", "seed-keeper", "seed-keeper-welcome", "shop"],
  ]);

  const expectedScheduleRegions = new Map([
    [360, ["town-house", "town-house-southwest", "seed-shop", "town-house-west", "town-house-north", "town-house", "town-house-southwest", "town-house-east"]],
    [540, ["town", "town", "seed-shop", "town", "foothills", "lakeshore", "blacksmith", "lakeshore"]],
    [1020, ["lakeshore", "blacksmith", "seed-shop", "town", "town", "town", "town", "lakeshore"]],
    [1260, ["town-house", "town-house-southwest", "seed-shop", "town-house-west", "town-house-north", "town-house", "town-house-southwest", "town-house-east"]],
  ]);
  const scheduledNpcIds = [
    "town-resident-01",
    "town-blacksmith",
    "seed-keeper",
    "town-resident-mozi",
    "town-resident-haonan",
    "town-resident-alan",
    "town-resident-haomeili",
    "town-resident-xiangzi",
  ];
  for (const [minuteOfDay, expectedRegions] of expectedScheduleRegions) {
    const active = activeNpcSpawns(catalog, minuteOfDay);
    assert.equal(active.length, scheduledNpcIds.length);
    assert.deepEqual(active.map(({ npcId }) => npcId), scheduledNpcIds);
    assert.deepEqual(active.map(({ regionId }) => regionId), expectedRegions);
    assert.equal(new Set(active.map(({ entityId }) => entityId)).size, active.length);
    assert.equal(new Set(active.map(({ npcId }) => npcId)).size, active.length);
  }
  const initialState = createInitialGameState(catalog);
  assert.deepEqual(Object.keys(initialState.friendships), scheduledNpcIds);
  assert.equal(Object.values(initialState.friendships).every(({ points, lastTalkedDay }) => (
    points === 0 && lastTalkedDay === 0
  )), true);
  assert.equal(activeNpcById(catalog, "seed-keeper", 360)?.interactionType, "dialogue");
  assert.equal(activeNpcById(catalog, "seed-keeper", 540)?.interactionType, "shop");
  assert.equal(activeNpcById(catalog, "seed-keeper", 1020)?.interactionType, "dialogue");

  const activityRuntime = new NpcMotionRuntime(catalog);
  const expectedActivitiesByMinute = [
    [360, [
      ["town-resident-01", "tend"],
      ["town-blacksmith", "prepare"],
      ["seed-keeper", "stock"],
      ["town-resident-mozi", "prepare"],
      ["town-resident-haonan", "prepare"],
      ["town-resident-alan", "prepare"],
      ["town-resident-haomeili", "sew"],
      ["town-resident-xiangzi", "rope-check"],
    ]],
    [540, [
      ["town-resident-01", "tend"],
      ["town-blacksmith", "forge"],
      ["seed-keeper", "serve"],
      ["town-resident-mozi", "repair"],
      ["town-resident-haonan", "mountain-patrol"],
      ["town-resident-alan", "observe"],
      ["town-resident-haomeili", "organize"],
      ["town-resident-xiangzi", "dock-watch"],
    ]],
    [1020, [
      ["town-resident-01", "observe"],
      ["town-blacksmith", "close"],
      ["seed-keeper", "close"],
      ["town-resident-mozi", "repair"],
      ["town-resident-haonan", "record"],
      ["town-resident-alan", "observe"],
      ["town-resident-haomeili", "organize"],
      ["town-resident-xiangzi", "close"],
    ]],
    [1260, [
      ["town-resident-01", "tea"],
      ["town-blacksmith", "tea"],
      ["seed-keeper", "record"],
      ["town-resident-mozi", "organize"],
      ["town-resident-haonan", "record"],
      ["town-resident-alan", "tea"],
      ["town-resident-haomeili", "tea"],
      ["town-resident-xiangzi", "record"],
    ]],
  ];
  for (const [minuteOfDay, expectedActivities] of expectedActivitiesByMinute) {
    activityRuntime.reset(minuteOfDay);
    assert.deepEqual(
      activityRuntime.activeSpawns().map(({ npcId, activity }) => [npcId, activity]),
      expectedActivities,
    );
  }

  activityRuntime.reset(540);
  assert.equal(activityRuntime.activeByNpcId("town-resident-mozi")?.activityPhase, 0);
  activityRuntime.advance(400);
  assert.equal(activityRuntime.activeByNpcId("town-resident-mozi")?.activityPhase, 1);

  activityRuntime.reset(1260);
  assert.equal(activityRuntime.activeByNpcId("town-resident-01")?.activityPhase, 0);
  assert.equal(activityRuntime.activeByNpcId("town-resident-alan")?.activityPhase, 0);
  assert.equal(activityRuntime.activeByNpcId("town-blacksmith")?.activityPhase, 0);
  assert.equal(activityRuntime.activeByNpcId("town-resident-haomeili")?.activityPhase, 0);
  activityRuntime.advance(400);
  assert.equal(activityRuntime.activeByNpcId("town-resident-01")?.activityPhase, 1);
  assert.equal(activityRuntime.activeByNpcId("town-resident-alan")?.activityPhase, 1);
  assert.equal(activityRuntime.activeByNpcId("town-blacksmith")?.activityPhase, 1);
  assert.equal(activityRuntime.activeByNpcId("town-resident-haomeili")?.activityPhase, 1);

  activityRuntime.reset(360);
  activityRuntime.transitionTo(540);
  assert.equal(activityRuntime.activeByNpcId("seed-keeper")?.activity, null);

  activityRuntime.reset(540);
  const haonanStart = activityRuntime.activeByNpcId("town-resident-haonan");
  activityRuntime.advance(1_000);
  activityRuntime.advance(1_000);
  activityRuntime.advance(NPC_ACTIVITY_DWELL_MS - 2_001);
  assert.equal(activityRuntime.activeByNpcId("town-resident-haonan")?.motion, "idle");
  activityRuntime.advance(1);
  assert.equal(activityRuntime.activeByNpcId("town-resident-haonan")?.motion, "walking");
  activityRuntime.advance(500);
  const patrollingHaonan = activityRuntime.activeByNpcId("town-resident-haonan");
  assert.equal(patrollingHaonan?.activity, "mountain-patrol");
  assert.notDeepEqual([patrollingHaonan?.x, patrollingHaonan?.y], [haonanStart?.x, haonanStart?.y]);
  for (
    let index = 0;
    index < 100 && activityRuntime.activeByNpcId("town-resident-haonan")?.motion !== "idle";
    index += 1
  ) {
    activityRuntime.advance(500);
  }
  const haonanMid = catalog.requireSpawn("foothills", "npc-haonan-patrol-mid");
  assert.deepEqual(
    [activityRuntime.activeByNpcId("town-resident-haonan")?.x, activityRuntime.activeByNpcId("town-resident-haonan")?.y],
    [haonanMid.x, haonanMid.y],
  );
  const xiangziEast = catalog.requireSpawn("lakeshore", "npc-xiangzi-dock-east");
  assert.deepEqual(
    [activityRuntime.activeByNpcId("town-resident-xiangzi")?.x, activityRuntime.activeByNpcId("town-resident-xiangzi")?.y],
    [xiangziEast.x, xiangziEast.y],
  );
  assert.equal(activityRuntime.activeByNpcId("town-resident-xiangzi")?.activity, "dock-watch");

  const avoidanceRuntime = new NpcMotionRuntime(catalog);
  avoidanceRuntime.reset(540);
  avoidanceRuntime.advance(1_000);
  avoidanceRuntime.advance(1_000);
  avoidanceRuntime.advance(400);
  const trailBlocker = { regionId: "foothills", x: 392, y: 464 };
  avoidanceRuntime.advance(500, trailBlocker);
  const waitingHaonan = avoidanceRuntime.activeByNpcId("town-resident-haonan");
  assert.equal(waitingHaonan?.motion, "waiting");
  assert.equal(worldFeetOverlap(
    waitingHaonan,
    NPC_FEET_HALF_WIDTH,
    NPC_FEET_HALF_HEIGHT,
    trailBlocker,
    PLAYER_FEET_HALF_WIDTH,
    PLAYER_FEET_HALF_HEIGHT,
  ), false);
  let detoured = false;
  let passedBlocker = false;
  for (let index = 0; index < 50 && !passedBlocker; index += 1) {
    avoidanceRuntime.advance(100, trailBlocker);
    const haonan = avoidanceRuntime.activeByNpcId("town-resident-haonan");
    detoured ||= Math.abs((haonan?.x ?? trailBlocker.x) - trailBlocker.x) > 1;
    passedBlocker = (haonan?.y ?? trailBlocker.y) < trailBlocker.y - PLAYER_FEET_HALF_HEIGHT;
  }
  assert.equal(detoured, true);
  assert.equal(passedBlocker, true);

  const targetBlockedRuntime = new NpcMotionRuntime(catalog);
  targetBlockedRuntime.reset(540);
  targetBlockedRuntime.advance(1_000);
  targetBlockedRuntime.advance(1_000);
  targetBlockedRuntime.advance(400);
  const blockedTarget = { regionId: "foothills", ...catalog.requireSpawn("foothills", "npc-haonan-patrol-mid") };
  for (let index = 0; index < 30; index += 1) targetBlockedRuntime.advance(100, blockedTarget);
  assert.notEqual(targetBlockedRuntime.activeByNpcId("town-resident-haonan")?.motion, "idle");
  for (
    let index = 0;
    index < 30 && targetBlockedRuntime.activeByNpcId("town-resident-haonan")?.motion !== "idle";
    index += 1
  ) targetBlockedRuntime.advance(100);
  assert.equal(targetBlockedRuntime.activeByNpcId("town-resident-haonan")?.motion, "idle");
  assert.deepEqual(
    [targetBlockedRuntime.activeByNpcId("town-resident-haonan")?.x, targetBlockedRuntime.activeByNpcId("town-resident-haonan")?.y],
    [blockedTarget.x, blockedTarget.y],
  );

  const runtime = new NpcMotionRuntime(catalog);
  runtime.reset(540);
  const moziStart = runtime.activeByNpcId("town-resident-mozi");
  runtime.transitionTo(1020);
  assert.equal(runtime.activeByNpcId("town-resident-mozi")?.motion, "walking");
  runtime.advance(500);
  const movingMozi = runtime.activeByNpcId("town-resident-mozi");
  assert.equal(movingMozi?.regionId, "town");
  assert.notDeepEqual([movingMozi?.x, movingMozi?.y], [moziStart?.x, moziStart?.y]);
  for (let index = 0; index < 100 && runtime.activeByNpcId("town-resident-mozi")?.motion !== "idle"; index += 1) {
    runtime.advance(1_000);
  }
  const moziTarget = activeNpcById(catalog, "town-resident-mozi", 1020);
  assert.deepEqual(
    [runtime.activeByNpcId("town-resident-mozi")?.x, runtime.activeByNpcId("town-resident-mozi")?.y],
    [moziTarget?.x, moziTarget?.y],
  );

  runtime.reset(360);
  runtime.transitionTo(540);
  assert.equal(runtime.activeByNpcId("town-resident-01")?.regionId, "town-house");
  assert.equal(runtime.activeByNpcId("town-resident-01")?.motion, "leaving");
  runtime.advance(NPC_TRANSFER_DURATION_MS / 2);
  assert.equal(runtime.activeByNpcId("town-resident-01")?.regionId, "town");
  assert.equal(runtime.activeByNpcId("town-resident-01")?.motion, "arriving");
  runtime.advance(NPC_TRANSFER_DURATION_MS / 2);
  assert.equal(runtime.activeByNpcId("town-resident-01")?.motion, "idle");
  assert.equal(runtime.activeSpawns().filter(({ npcId }) => npcId === "town-resident-01").length, 1);

  assert.equal(findNpcPath({
    columns: 3,
    rows: 3,
    tileWidth: 16,
    tileHeight: 16,
    blocked: [false, true, false, false, true, false, false, true, false],
  }, { x: 8, y: 8 }, { x: 40, y: 8 }), null);
  assert.equal(findNpcPath({
    columns: 3,
    rows: 1,
    tileWidth: 16,
    tileHeight: 16,
    blocked: [false, false, false],
  }, { x: 8, y: 8 }, { x: 40, y: 8 }, [{ x: 24, y: 8 }]), null);
  assert.equal(NPC_REPLAN_DELAY_MS, 600);

  const townStart = [2, 18];
  for (const npc of town.npcs) {
    assert.equal(catalog.isBlocked("town", npc.x, npc.y), true);
    assert.equal(findRoute(catalog, "town", townStart, interactionGoals(catalog, npc)), true);
  }
  const keeper = shop.npcs[0];
  assert.equal(catalog.isBlocked("seed-shop", keeper.x, keeper.y), false);
  assert.equal(findRoute(catalog, "seed-shop", [20, 26], interactionGoals(catalog, keeper)), true);

  const expansionRegionIds = [
    "blacksmith",
    "town-house-west",
    "town-house-north",
    "town-house",
    "town-house-southwest",
    "town-house-east",
    "foothills",
    "lakeshore",
  ];
  for (const regionId of expansionRegionIds) {
    const region = catalog.requireRegion(regionId);
    assert.equal(region.exits.length, 1);
    for (const interaction of region.interactions.filter(({ kind }) => kind === "inspect")) {
      assert.ok(getDialogueDefinition(interaction.dialogueId));
    }
  }
  assert.equal(catalog.requireRegion("foothills").resources.filter(({ kind }) => kind === "tree").length, 18);
  assert.equal(catalog.requireRegion("lakeshore").resources.filter(({ kind }) => kind === "tree").length, 12);
  assert.equal(findRoute(catalog, "foothills", [24, 33], new Set(["27,5", "28,5", "29,5"])), true);
  assert.equal(findRoute(catalog, "lakeshore", [8, 2], new Set(["20,17", "20,18", "20,19"])), true);

  const houseRegionIds = [
    "town-house-west",
    "town-house-north",
    "town-house",
    "town-house-southwest",
    "town-house-east",
  ];
  const expectedHouseResidents = new Map([
    ["town-house-west", ["town-house-west-resident", "town-resident-mozi", "resident-mozi-home", "墨子"]],
    ["town-house-north", ["town-house-north-resident", "town-resident-haonan", "resident-haonan-home", "浩南"]],
    ["town-house", ["town-house-riverside-resident", "town-resident-alan", "resident-alan-home", "阿澜"]],
    ["town-house-southwest", ["town-house-southwest-resident", "town-resident-haomeili", "resident-haomeili-home", "昊美丽"]],
    ["town-house-east", ["town-house-east-resident", "town-resident-xiangzi", "resident-xiangzi-home", "祥子"]],
  ]);
  for (const regionId of houseRegionIds) {
    const house = catalog.requireRegion(regionId);
    const inspectInteractions = house.interactions.filter(({ kind }) => kind === "inspect");
    assert.equal(inspectInteractions.length, 3);
    assert.equal(inspectInteractions.some(({ entityId }) => entityId.endsWith("private-room")), true);
    assert.equal(catalog.isBlocked(regionId, 17 * TILE_SIZE + 8, 7 * TILE_SIZE + 8), true);
    assert.equal(findRoute(catalog, regionId, [12, 15], new Set(["17,8"])), true);
    const resident = house.npcs[0];
    const expected = expectedHouseResidents.get(regionId);
    assert.ok(resident && expected);
    assert.deepEqual(
      [resident.entityId, resident.npcId, resident.dialogueId, resident.interactionType],
      [...expected.slice(0, 3), "dialogue"],
    );
    const dialogue = getDialogueDefinition(resident.dialogueId);
    assert.equal(dialogue?.speaker, expected[3]);
    assert.equal(dialogue?.lines.length, 3);
    assert.equal(visualProfileSource.includes(`"${resident.npcId}"`), true);
    assert.equal(catalog.isBlocked(regionId, resident.x, resident.y), true);
    assert.equal(findRoute(catalog, regionId, [12, 15], interactionGoals(catalog, resident)), true);
  }
  const publicBuildingExitIds = new Set([
    "town-blacksmith-entry",
    "town-house-west-entry",
    "town-house-north-entry",
    "town-house-entry",
    "town-house-southwest-entry",
    "town-house-east-entry",
  ]);
  for (const buildingExit of town.exits.filter(({ id }) => publicBuildingExitIds.has(id))) {
    const goals = new Set([`${Math.floor(buildingExit.x / TILE_SIZE)},${Math.floor(buildingExit.y / TILE_SIZE)}`]);
    assert.equal(findRoute(catalog, "town", townStart, goals), true);
  }

  const invalid = structuredClone(seedShopMap);
  const invalidNpc = invalid.layers.find((layer) => layer.name === "NpcSpawns").objects[0];
  invalidNpc.properties.find((property) => property.name === "interactionType").value = "quest";
  assert.throws(() => decodeTiledRegion(invalid, "invalid-interaction"), /interaction type is invalid/u);

  const invalidInspect = structuredClone(foothillsMap);
  const inspect = invalidInspect.layers.find((layer) => layer.name === "Interactions").objects[0];
  inspect.properties = inspect.properties.filter((property) => property.name !== "dialogueId");
  assert.throws(() => decodeTiledRegion(invalidInspect, "invalid-inspect"), /dialogueId is invalid/u);
});

test("linear dialogue and shop share one transient world-input lock", () => {
  clearGameState();
  assert.equal(getDialogueDefinition("personality:town-resident-alan:1")?.speaker, "阿澜");
  assert.equal(getDialogueDefinition("relationship:seed-keeper:familiar")?.lines.length, 1);
  assert.equal(getDialogueDefinition("event:blacksmith-two-heart")?.lines.length, 3);
  assert.equal(getDialogueDefinition("request:seed-rack-repair:thanks")?.speaker, "华强");
  assert.equal(getDialogueDefinition("lakeshore-waystone", { day: 6, minuteOfDay: 720 })?.lines.length, 1);
  const waystone = getDialogueDefinition("lakeshore-waystone", { day: 7, minuteOfDay: 720 });
  assert.equal(waystone?.lines.length, 1);
  assert.deepEqual(waystone, getDialogueDefinition("lakeshore-waystone", { day: 6, minuteOfDay: 720 }));
  const dialogue = getDialogueDefinition("blacksmith-intro");
  assert.ok(dialogue);
  setDialogue({ speaker: dialogue.speaker, lines: dialogue.lines });
  assert.equal(isWorldInputLocked(), true);
  assert.equal(gameUiState.dialogue?.lineIndex, 0);
  assert.equal(gameUiState.dialogue?.lines[0], "炉子还没正式开张。");
  advanceDialogue();
  assert.equal(gameUiState.dialogue?.lineIndex, 1);
  advanceDialogue();
  assert.equal(gameUiState.dialogue?.lineIndex, 2);
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

test("Day 2 adoption waits for the Farm yard, defers transiently and locks every world input", () => {
  clearGameState();
  const state = {
    version: 10,
    day: 2,
    minuteOfDay: 360,
    gold: 100,
    player: { regionId: "cottage", x: 320, y: 416, appearanceId: "farmer-original" },
    inventory: [],
    inventoryCapacity: 24,
    wateringCanLevel: 1,
    wateringCanWater: 20,
    stamina: 100,
    fishingCastCount: 0,
    worldSeed: 0,
    lateWarningDay: 0,
    weather: { day: 2, current: "sunny", next: "rain" },
    resources: {},
    farmTiles: {},
    friendships: {},
    dailyRequest: null,
    seenEventIds: [],
    pet: null,
  };
  applyGameState(state);
  assert.equal(gameUiState.petAdoptionOpen, false);
  assert.equal(openPetAdoption(), false);

  state.player.regionId = "farm";
  applyGameState(state);
  assert.equal(gameUiState.petAdoptionOpen, true);
  assert.equal(isWorldInputLocked(), true);
  deferPetAdoption();
  assert.equal(gameUiState.petAdoptionOpen, false);
  applyGameState(state);
  assert.equal(gameUiState.petAdoptionOpen, false);

  clearGameState();
  applyGameState(state);
  assert.equal(gameUiState.petAdoptionOpen, true);
  state.pet = { species: "cat", name: "团子", adoptedDay: 2, bond: 0, lastPettedDay: 0 };
  applyGameState(state);
  assert.equal(gameUiState.petAdoptionOpen, false);
  assert.equal(isWorldInputLocked(), false);
  clearGameState();
});

test("Hotbar selection is transient, toggleable and modal-safe", () => {
  clearGameState();
  const inventory = Array.from({ length: 24 }, () => ({ itemId: "", quantity: 0 }));
  inventory[0] = { itemId: ITEM_ID.hoe, quantity: 1 };
  inventory[1] = { itemId: ITEM_ID.wateringCan, quantity: 1 };
  inventory[2] = { itemId: ITEM_ID.axe, quantity: 1 };
  inventory[10] = { itemId: ITEM_ID.rapeseedFlower, quantity: 2 };
  const state = {
    version: 10,
    day: 1,
    minuteOfDay: 360,
    gold: 100,
    player: { regionId: "farm", x: 0, y: 0 },
    inventory,
    inventoryCapacity: 24,
    wateringCanLevel: 1,
    wateringCanWater: 20,
    stamina: 100,
    weather: { day: 1, current: "sunny", next: "rain" },
    resources: {},
    farmTiles: {},
    friendships: {
      "seed-keeper": { npcId: "seed-keeper", points: 20, lastTalkedDay: 1 },
    },
    dailyRequest: null,
    seenEventIds: [],
  };
  applyGameState(state);
  assert.equal(gameUiState.selectedInventoryIndex, null);
  assert.equal(gameUiState.selectedItemId, "");
  assert.equal(gameUiState.friendships["seed-keeper"].points, 20);
  selectInventorySlot(10);
  assert.equal(gameUiState.selectedItemId, ITEM_ID.rapeseedFlower);
  selectInventorySlot(10);
  assert.equal(gameUiState.selectedItemId, "");

  selectHotbarSlot(0);
  assert.equal(gameUiState.selectedInventoryIndex, 0);
  assert.equal(gameUiState.selectedItemId, ITEM_ID.hoe);
  selectHotbarSlot(0);
  assert.equal(gameUiState.selectedInventoryIndex, null);
  selectHotbarSlot(7);
  assert.equal(gameUiState.selectedItemId, "");

  selectHotbarSlot(1);
  setWorldActionBusy(true);
  selectHotbarSlot(2);
  assert.equal(gameUiState.selectedItemId, ITEM_ID.wateringCan);
  setWorldActionBusy(false);
  openShop("测试商店");
  selectHotbarSlot(2);
  assert.equal(gameUiState.selectedItemId, ITEM_ID.wateringCan);
  closeShop();

  assert.equal(openSocial(), true);
  assert.equal(gameUiState.socialOpen, true);
  assert.equal(isWorldInputLocked(), true);
  closeSocial();
  assert.equal(isWorldInputLocked(), false);

  const consumed = structuredClone(state);
  consumed.inventory[1] = { itemId: "", quantity: 0 };
  applyGameState(consumed);
  assert.equal(gameUiState.selectedInventoryIndex, null);
  assert.equal(gameUiState.selectedItemId, "");
  clearGameState();
});

test("Spring fishing and save-first day settlement share input locks without pausing casting time", () => {
  clearGameState();
  applyFishingState({ ...IDLE_FISHING_SNAPSHOT, phase: "casting", zoneId: "test-zone" });
  assert.equal(isWorldInputLocked(), true);
  assert.equal(isGameClockPaused(), false);
  assert.equal(openBackpack(), false);
  applyFishingState({ ...IDLE_FISHING_SNAPSHOT, phase: "reeling" });
  assert.equal(isGameClockPaused(), true);
  applyFishingState(IDLE_FISHING_SNAPSHOT);
  applyDaySettlement({ phase: "failed", reason: "passed-out", goldLost: 10, nextStamina: 50 });
  assert.equal(isGameClockPaused(), true);
  assert.equal(openSocial(), false);
  applyDaySettlement(IDLE_DAY_SETTLEMENT);
  assert.equal(isWorldInputLocked(), false);
  clearGameState();
});

test("sleep confirmation locks world input and resolves yes or no exactly once", () => {
  clearGameState();
  let sleepRequests = 0;

  assert.equal(openSleepConfirmation(() => { sleepRequests += 1; }), true);
  assert.equal(gameUiState.sleepConfirmationOpen, true);
  assert.equal(isWorldInputLocked(), true);
  assert.equal(openSleepConfirmation(() => { sleepRequests += 10; }), false);

  cancelSleepConfirmation();
  assert.equal(gameUiState.sleepConfirmationOpen, false);
  assert.equal(isWorldInputLocked(), false);
  assert.equal(sleepRequests, 0);

  assert.equal(openSleepConfirmation(() => { sleepRequests += 1; }), true);
  confirmSleep();
  confirmSleep();
  assert.equal(gameUiState.sleepConfirmationOpen, false);
  assert.equal(isWorldInputLocked(), false);
  assert.equal(sleepRequests, 1);
  clearGameState();
});

test("backpack and request board join the shared modal input lock", () => {
  clearGameState();
  assert.equal(openBackpack(), true);
  assert.equal(gameUiState.backpackOpen, true);
  assert.equal(isWorldInputLocked(), true);
  assert.equal(openRequestBoard(), false);
  closeBackpack();
  assert.equal(openRequestBoard(), true);
  assert.equal(gameUiState.requestBoardOpen, true);
  assert.equal(isWorldInputLocked(), true);
  closeRequestBoard();
  assert.equal(isWorldInputLocked(), false);
});

test("punch targeting selects only the deterministic nearest NPC in the facing corridor", () => {
  const player = { x: 100, y: 100 };
  const candidates = [
    { entityId: "npc-far", x: 124, y: 100 },
    { entityId: "npc-near-b", x: 116, y: 104 },
    { entityId: "npc-near-a", x: 116, y: 96 },
    { entityId: "npc-behind", x: 92, y: 100 },
    { entityId: "npc-wide", x: 114, y: 111 },
    { entityId: "npc-out-of-range", x: 129, y: 100 },
  ];

  assert.equal(selectNpcHitTarget(player, "right", candidates)?.entityId, "npc-near-a");
  assert.equal(selectNpcHitTarget(player, "left", candidates)?.entityId, "npc-behind");
  assert.equal(selectNpcHitTarget(player, "up", [{ entityId: "npc-up", x: 100, y: 84 }])?.entityId, "npc-up");
  assert.equal(selectNpcHitTarget(player, "down", [{ entityId: "npc-down", x: 100, y: 116 }])?.entityId, "npc-down");
  assert.equal(selectNpcHitTarget(player, "right", candidates.filter(({ entityId }) => (
    entityId === "npc-behind" || entityId === "npc-wide" || entityId === "npc-out-of-range"
  ))), null);
});
