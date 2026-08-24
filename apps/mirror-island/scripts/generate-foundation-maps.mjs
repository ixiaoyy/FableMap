import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(root, "public", "map");
const columns = 40;
const rows = 30;
const tileSize = 16;

/** Creates one zero-filled finite tile layer data array. */
function emptyLayer() {
  return Array.from({ length: columns * rows }, () => 0);
}

/** Writes one tile GID into a finite layer when the coordinate is in bounds. */
function setTile(data, x, y, gid) {
  if (x < 0 || y < 0 || x >= columns || y >= rows) return;
  data[y * columns + x] = gid;
}

/** Fills one axis-aligned tile rectangle with a single GID. */
function fillRect(data, x, y, width, height, gid) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) setTile(data, column, row, gid);
  }
}

/** Creates the shared finite border while leaving one reviewed exit opening. */
function createBorder(openingSide) {
  const data = emptyLayer();
  for (let x = 0; x < columns; x += 1) {
    setTile(data, x, 0, 6);
    if (!(openingSide === "south" && x >= 19 && x <= 20)) setTile(data, x, rows - 1, 6);
  }
  for (let y = 0; y < rows; y += 1) {
    if (!(openingSide === "west" && y >= 13 && y <= 16)) setTile(data, 0, y, 6);
    if (!(openingSide === "east" && y >= 13 && y <= 16)) setTile(data, columns - 1, y, 6);
  }
  return data;
}

/** Creates one complete Tiled tile layer with deterministic IDs and data. */
function tileLayer(id, name, data, visible = true) {
  return { id, name, type: "tilelayer", x: 0, y: 0, width: columns, height: rows, opacity: 1, visible, data };
}

/** Creates one complete Tiled object layer. */
function objectLayer(id, name, objects) {
  return { id, name, type: "objectgroup", x: 0, y: 0, opacity: 1, visible: true, draworder: "topdown", objects };
}

/** Creates a typed Tiled custom property entry. */
function property(name, value, type = "string") {
  return { name, type, value };
}

/** Creates one point-shaped Tiled behavior object whose name is editor-only. */
function pointObject(id, name, type, x, y, properties) {
  return { id, name, type, point: true, x, y, width: 0, height: 0, rotation: 0, visible: true, properties };
}

/** Creates one rectangular Tiled behavior object. */
function rectObject(id, name, type, x, y, width, height, properties) {
  return { id, name, type, x, y, width, height, rotation: 0, visible: true, properties };
}

/** Builds one valid embedded-tileset TMJ document from reviewed layer/object data. */
function createMap({ regionId, displayName, defaultSpawn, startRegion, openingSide, decorate }) {
  const ground = Array.from({ length: columns * rows }, () => 1);
  const detail = emptyLayer();
  const water = emptyLayer();
  const buildings = emptyLayer();
  const above = emptyLayer();
  const collision = createBorder(openingSide);
  const objects = decorate({ ground, detail, water, buildings, above, collision });
  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    infinite: false,
    width: columns,
    height: rows,
    tilewidth: tileSize,
    tileheight: tileSize,
    nextlayerid: 12,
    nextobjectid: 100,
    properties: [
      property("regionId", regionId),
      property("displayName", displayName),
      property("defaultSpawn", defaultSpawn),
      property("startRegion", startRegion, "bool"),
    ],
    tilesets: [{
      firstgid: 1,
      name: "foundation",
      tilewidth: tileSize,
      tileheight: tileSize,
      tilecount: 6,
      columns: 6,
      margin: 0,
      spacing: 0,
      image: "foundation.png",
      imagewidth: tileSize * 6,
      imageheight: tileSize,
    }],
    layers: [
      tileLayer(1, "Ground", ground),
      tileLayer(2, "GroundDetail", detail),
      tileLayer(3, "Water", water),
      tileLayer(4, "Buildings", buildings),
      tileLayer(5, "AbovePlayer", above),
      tileLayer(6, "Collision", collision, false),
      objectLayer(7, "SpawnPoints", objects.spawns),
      objectLayer(8, "Exits", objects.exits),
      objectLayer(9, "Interactions", objects.interactions),
      objectLayer(10, "ResourceSpawns", objects.resources),
      objectLayer(11, "NpcSpawns", objects.npcs),
    ],
  };
}

const farm = createMap({
  regionId: "farm",
  displayName: "玩家农场",
  defaultSpawn: "home-yard",
  startRegion: true,
  openingSide: "east",
  /** Lays out the temporary farm landmarks and property-owned world objects. */
  decorate({ detail, water, buildings, above, collision }) {
    fillRect(water, 7, 20, 6, 5, 3);
    fillRect(collision, 7, 20, 6, 5, 6);
    fillRect(buildings, 7, 4, 8, 6, 4);
    fillRect(above, 7, 4, 8, 2, 5);
    fillRect(collision, 7, 4, 8, 6, 6);
    for (let x = 16; x < 40; x += 1) setTile(detail, x, 14, 2);
    return {
      spawns: [
        pointObject(1, "Home Yard", "spawn", 16 * tileSize, 12 * tileSize, [property("spawnId", "home-yard")]),
        pointObject(2, "East Gate", "spawn", 37 * tileSize, 14 * tileSize, [property("spawnId", "east-gate")]),
        pointObject(7, "Cottage Door", "spawn", 11 * tileSize, 12 * tileSize, [property("spawnId", "cottage-door")]),
      ],
      exits: [
        rectObject(3, "To Town", "exit", 39 * tileSize, 13 * tileSize, tileSize, 4 * tileSize, [
          property("exitId", "farm-east-exit"),
          property("targetRegion", "town"),
          property("targetSpawn", "west-gate"),
        ]),
        rectObject(8, "Into Cottage", "exit", 10 * tileSize, 10 * tileSize, 2 * tileSize, tileSize, [
          property("exitId", "farm-cottage-entry"),
          property("targetRegion", "cottage"),
          property("targetSpawn", "entry"),
        ]),
      ],
      interactions: [
        rectObject(4, "Farm Plot", "interaction", 12 * tileSize, 15 * tileSize, tileSize, tileSize, [
          property("entityId", "farm-plot-001"),
          property("interactionKind", "farm-plot"),
        ]),
        rectObject(9, "Cottage Door", "interaction", 10 * tileSize, 10 * tileSize, 2 * tileSize, tileSize, [
          property("entityId", "farm-cottage-door"),
          property("interactionKind", "door"),
        ]),
      ],
      resources: [
        pointObject(5, "Tree", "resource", 20 * tileSize, 14 * tileSize, [
          property("entityId", "farm-tree-001"),
          property("resourceKind", "tree"),
        ]),
        pointObject(6, "Rock", "resource", 10 * tileSize, 25 * tileSize, [
          property("entityId", "farm-rock-001"),
          property("resourceKind", "stone"),
        ]),
      ],
      npcs: [],
    };
  },
});

const town = createMap({
  regionId: "town",
  displayName: "小镇",
  defaultSpawn: "west-gate",
  startRegion: false,
  openingSide: "west",
  /** Lays out the temporary town main street and property-owned world objects. */
  decorate({ detail, buildings, above, collision }) {
    fillRect(detail, 0, 14, 40, 3, 2);
    fillRect(buildings, 8, 4, 9, 7, 4);
    fillRect(above, 8, 4, 9, 2, 5);
    fillRect(collision, 8, 4, 9, 7, 6);
    fillRect(buildings, 23, 5, 8, 6, 4);
    fillRect(above, 23, 5, 8, 2, 5);
    fillRect(collision, 23, 5, 8, 6, 6);
    return {
      spawns: [
        pointObject(20, "West Gate", "spawn", 2 * tileSize, 14 * tileSize, [property("spawnId", "west-gate")]),
        pointObject(24, "Seed Shop Door", "spawn", 12 * tileSize, 12 * tileSize, [property("spawnId", "seed-shop-door")]),
      ],
      exits: [
        rectObject(21, "To Farm", "exit", 0, 13 * tileSize, tileSize, 4 * tileSize, [
          property("exitId", "town-west-exit"),
          property("targetRegion", "farm"),
          property("targetSpawn", "east-gate"),
        ]),
        rectObject(25, "Into Seed Shop", "exit", 12 * tileSize, 11 * tileSize, tileSize, tileSize, [
          property("exitId", "town-seed-shop-entry"),
          property("targetRegion", "seed-shop"),
          property("targetSpawn", "entry"),
        ]),
      ],
      interactions: [rectObject(22, "Seed Shop Door", "interaction", 12 * tileSize, 11 * tileSize, tileSize, tileSize, [
        property("entityId", "town-seed-shop-door"),
        property("interactionKind", "door"),
      ])],
      resources: [],
      npcs: [],
    };
  },
});

const cottage = createMap({
  regionId: "cottage",
  displayName: "玩家小屋",
  defaultSpawn: "entry",
  startRegion: false,
  openingSide: "south",
  /** Lays out the temporary cottage interior and its return doorway. */
  decorate({ buildings, collision }) {
    collision.forEach((gid, index) => { if (gid !== 0) buildings[index] = 4; });
    return {
      spawns: [pointObject(40, "Entry", "spawn", 20 * tileSize, 26 * tileSize, [property("spawnId", "entry")])],
      exits: [rectObject(41, "To Farm", "exit", 19 * tileSize, 29 * tileSize, 2 * tileSize, tileSize, [
        property("exitId", "cottage-exit"),
        property("targetRegion", "farm"),
        property("targetSpawn", "cottage-door"),
      ])],
      interactions: [],
      resources: [],
      npcs: [],
    };
  },
});

const seedShop = createMap({
  regionId: "seed-shop",
  displayName: "种子店",
  defaultSpawn: "entry",
  startRegion: false,
  openingSide: "south",
  /** Lays out the temporary seed-shop interior, owner stand and return doorway. */
  decorate({ detail, buildings, collision }) {
    collision.forEach((gid, index) => { if (gid !== 0) buildings[index] = 4; });
    fillRect(detail, 14, 10, 12, 2, 2);
    return {
      spawns: [pointObject(50, "Entry", "spawn", 20 * tileSize, 26 * tileSize, [property("spawnId", "entry")])],
      exits: [rectObject(51, "To Town", "exit", 19 * tileSize, 29 * tileSize, 2 * tileSize, tileSize, [
        property("exitId", "seed-shop-exit"),
        property("targetRegion", "town"),
        property("targetSpawn", "seed-shop-door"),
      ])],
      interactions: [],
      resources: [],
      npcs: [pointObject(52, "Seed Keeper", "npc", 20 * tileSize, 9 * tileSize, [
        property("entityId", "seed-shop-keeper"),
        property("npcId", "seed-keeper"),
        property("dialogueId", "seed-keeper-welcome"),
      ])],
    };
  },
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, "farm.tmj"), `${JSON.stringify(farm)}\n`, "utf8"),
  writeFile(join(outputDirectory, "town.tmj"), `${JSON.stringify(town)}\n`, "utf8"),
  writeFile(join(outputDirectory, "cottage.tmj"), `${JSON.stringify(cottage)}\n`, "utf8"),
  writeFile(join(outputDirectory, "seed-shop.tmj"), `${JSON.stringify(seedShop)}\n`, "utf8"),
]);
console.log("Generated farm.tmj, town.tmj, cottage.tmj and seed-shop.tmj.");
