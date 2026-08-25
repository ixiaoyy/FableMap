import {
  WorldCatalog,
  assertStableId,
  type CollisionGrid,
  type ExitDefinition,
  type InteractionDefinition,
  type NpcSpawnDefinition,
  type RegionDefinition,
  type ResourceSpawnDefinition,
  type WorldPoint,
} from "../../../../domain/world/regions.ts";

const TILE_SIZE = 16;
const REQUIRED_TILE_LAYERS = [
  "Ground",
  "GroundDetail",
  "Water",
  "Buildings",
  "AbovePlayer",
  "Collision",
] as const;
const REQUIRED_OBJECT_LAYERS = [
  "SpawnPoints",
  "Exits",
  "Interactions",
  "ResourceSpawns",
  "NpcSpawns",
] as const;

/** Decodes one raw Tiled JSON map into the only plain region contract consumed by the app. */
export function decodeTiledRegion(value: unknown, mapKey: string): RegionDefinition {
  const map = recordFrom(value, "Tiled map is invalid.");
  const width = positiveInteger(map.width, "Tiled map width is invalid.");
  const height = positiveInteger(map.height, "Tiled map height is invalid.");
  if (
    map.type !== "map"
    || map.orientation !== "orthogonal"
    || map.infinite !== false
    || map.tilewidth !== TILE_SIZE
    || map.tileheight !== TILE_SIZE
  ) {
    throw new Error("Tiled map must be a finite orthogonal 16px map.");
  }
  validateEmbeddedTilesets(map.tilesets);
  const properties = propertyRecord(map.properties);
  const regionId = requiredString(properties, "regionId");
  const defaultSpawnId = requiredString(properties, "defaultSpawn");
  const displayName = requiredString(properties, "displayName");
  assertStableId(regionId, "Region ID");
  assertStableId(defaultSpawnId, "Default spawn ID");

  const layers = arrayFrom(map.layers, "Tiled layers are invalid.").map((layer) => (
    recordFrom(layer, "Tiled layer is invalid.")
  ));
  validateLayerNames(layers);
  const tileLayers = new Map(REQUIRED_TILE_LAYERS.map((name) => [name, requireLayer(layers, name, "tilelayer")]));
  const objectLayers = new Map(REQUIRED_OBJECT_LAYERS.map((name) => [name, requireLayer(layers, name, "objectgroup")]));
  for (const layer of tileLayers.values()) validateTileLayerData(layer, width, height);
  const collision = decodeCollision(tileLayers.get("Collision")!, width, height);
  const spawns = decodeSpawns(objectLayers.get("SpawnPoints")!);
  const exits = decodeExits(objectLayers.get("Exits")!);
  const resources = decodeResources(objectLayers.get("ResourceSpawns")!, regionId);
  const interactions = decodeInteractions(objectLayers.get("Interactions")!, regionId);
  const npcs = decodeNpcs(objectLayers.get("NpcSpawns")!, regionId);

  return {
    id: regionId,
    mapKey,
    displayName,
    defaultSpawnId,
    isStartRegion: properties.startRegion === true,
    widthPixels: width * TILE_SIZE,
    heightPixels: height * TILE_SIZE,
    collision,
    spawns,
    exits,
    resources,
    interactions,
    npcs,
  };
}

/** Builds a cross-region catalog after every individual TMJ passes structural decoding. */
export function createWorldCatalog(regions: readonly RegionDefinition[]): WorldCatalog {
  return new WorldCatalog(regions);
}

/** Rejects external TSJ references and malformed embedded tileset metadata unsupported by Phaser. */
function validateEmbeddedTilesets(value: unknown): void {
  const tilesets = arrayFrom(value, "Tiled tilesets are invalid.");
  if (tilesets.length === 0) throw new Error("Tiled map requires an embedded tileset.");
  for (const rawTileset of tilesets) {
    const tileset = recordFrom(rawTileset, "Tiled tileset is invalid.");
    if ("source" in tileset) throw new Error("External Tiled tilesets are not supported.");
    if (
      typeof tileset.name !== "string"
      || tileset.tilewidth !== TILE_SIZE
      || tileset.tileheight !== TILE_SIZE
      || !Number.isInteger(tileset.firstgid)
    ) {
      throw new Error("Embedded Tiled tileset metadata is invalid.");
    }
  }
}

/** Requires the complete fixed layer set with no duplicates or unreviewed extra behavior layers. */
function validateLayerNames(layers: readonly Record<string, unknown>[]): void {
  const expected = new Set<string>([...REQUIRED_TILE_LAYERS, ...REQUIRED_OBJECT_LAYERS]);
  const actual = new Set<string>();
  for (const layer of layers) {
    if (typeof layer.name !== "string" || actual.has(layer.name)) throw new Error("Tiled layer names are invalid.");
    actual.add(layer.name);
  }
  if (actual.size !== expected.size || [...actual].some((name) => !expected.has(name))) {
    throw new Error("Tiled map does not match the fixed layer contract.");
  }
}

/** Returns one required layer with its exact Tiled type. */
function requireLayer(
  layers: readonly Record<string, unknown>[],
  name: string,
  type: "tilelayer" | "objectgroup",
): Record<string, unknown> {
  const layer = layers.find((candidate) => candidate.name === name);
  if (!layer || layer.type !== type) throw new Error(`Tiled layer ${name} is missing or has the wrong type.`);
  return layer;
}

/** Converts the Collision tile layer into a finite plain boolean grid. */
function decodeCollision(layer: Record<string, unknown>, columns: number, rows: number): CollisionGrid {
  const data = arrayFrom(layer.data, "Collision layer data is invalid.");
  return {
    columns,
    rows,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    blocked: data.map((entry) => {
      if (!Number.isInteger(entry) || Number(entry) < 0) throw new Error("Collision tile GID is invalid.");
      return Number(entry) !== 0;
    }),
  };
}

/** Validates one finite tile layer's dimensions and non-negative integer GIDs. */
function validateTileLayerData(layer: Record<string, unknown>, columns: number, rows: number): void {
  const data = arrayFrom(layer.data, "Tiled tile layer data is invalid.");
  if (layer.width !== columns || layer.height !== rows || data.length !== columns * rows) {
    throw new Error("Tiled tile layer dimensions are invalid.");
  }
  if (data.some((entry) => !Number.isInteger(entry) || Number(entry) < 0)) {
    throw new Error("Tiled tile layer GID is invalid.");
  }
}

/** Decodes named spawn properties while treating Tiled object names as editor-only labels. */
function decodeSpawns(layer: Record<string, unknown>): Readonly<Record<string, WorldPoint>> {
  const result: Record<string, WorldPoint> = {};
  for (const object of objectRecords(layer)) {
    if (object.type !== "spawn") throw new Error("SpawnPoints contains a non-spawn object.");
    const properties = propertyRecord(object.properties);
    const spawnId = requiredString(properties, "spawnId");
    assertStableId(spawnId, "Spawn ID");
    if (result[spawnId]) throw new Error(`Duplicate spawn ID: ${spawnId}.`);
    result[spawnId] = pointFrom(object);
  }
  return result;
}

/** Decodes region exits and their property-owned destinations. */
function decodeExits(layer: Record<string, unknown>): readonly ExitDefinition[] {
  return objectRecords(layer).map((object) => {
    if (object.type !== "exit") throw new Error("Exits contains a non-exit object.");
    const properties = propertyRecord(object.properties);
    const id = requiredString(properties, "exitId");
    const targetRegionId = requiredString(properties, "targetRegion");
    const targetSpawnId = requiredString(properties, "targetSpawn");
    assertStableId(id, "Exit ID");
    assertStableId(targetRegionId, "Target region ID");
    assertStableId(targetSpawnId, "Target spawn ID");
    return { id, targetRegionId, targetSpawnId, ...rectFrom(object) };
  });
}

/** Decodes globally stable resource spawn definitions without creating gameplay state. */
function decodeResources(layer: Record<string, unknown>, regionId: string): readonly ResourceSpawnDefinition[] {
  return objectRecords(layer).map((object) => {
    if (object.type !== "resource") throw new Error("ResourceSpawns contains a non-resource object.");
    const properties = propertyRecord(object.properties);
    const entityId = requiredString(properties, "entityId");
    const kind = requiredString(properties, "resourceKind");
    assertStableId(entityId, "Resource entity ID");
    if (kind !== "tree" && kind !== "stone") throw new Error("Resource kind is invalid.");
    return { entityId, regionId, kind, ...pointFrom(object) };
  });
}

/** Decodes stable interaction rectangles and their closed first-batch kinds. */
function decodeInteractions(layer: Record<string, unknown>, regionId: string): readonly InteractionDefinition[] {
  return objectRecords(layer).map((object) => {
    if (object.type !== "interaction") throw new Error("Interactions contains a non-interaction object.");
    const properties = propertyRecord(object.properties);
    const entityId = requiredString(properties, "entityId");
    const kind = requiredString(properties, "interactionKind");
    assertStableId(entityId, "Interaction entity ID");
    if (kind !== "farm-plot" && kind !== "door" && kind !== "bed") {
      throw new Error("Interaction kind is invalid.");
    }
    return { entityId, regionId, kind, ...rectFrom(object) };
  });
}

/** Decodes NPC spawn metadata without constructing dialogue or schedule state. */
function decodeNpcs(layer: Record<string, unknown>, regionId: string): readonly NpcSpawnDefinition[] {
  return objectRecords(layer).map((object) => {
    if (object.type !== "npc") throw new Error("NpcSpawns contains a non-npc object.");
    const properties = propertyRecord(object.properties);
    const entityId = requiredString(properties, "entityId");
    const npcId = requiredString(properties, "npcId");
    const dialogueId = requiredString(properties, "dialogueId");
    assertStableId(entityId, "NPC entity ID");
    assertStableId(npcId, "NPC ID");
    assertStableId(dialogueId, "Dialogue ID");
    return { entityId, regionId, npcId, dialogueId, ...pointFrom(object) };
  });
}

/** Returns object records from one validated Tiled object layer. */
function objectRecords(layer: Record<string, unknown>): readonly Record<string, unknown>[] {
  return arrayFrom(layer.objects, "Tiled object list is invalid.").map((object) => (
    recordFrom(object, "Tiled object is invalid.")
  ));
}

/** Converts Tiled custom properties into one duplicate-free value record. */
function propertyRecord(value: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const rawProperty of arrayFrom(value ?? [], "Tiled properties are invalid.")) {
    const property = recordFrom(rawProperty, "Tiled property is invalid.");
    if (typeof property.name !== "string" || property.name in result) {
      throw new Error("Tiled property names are invalid.");
    }
    result[property.name] = property.value;
  }
  return result;
}

/** Returns one required non-empty string property. */
function requiredString(properties: Record<string, unknown>, name: string): string {
  const value = properties[name];
  if (typeof value !== "string" || value.trim() === "") throw new Error(`Tiled property ${name} is invalid.`);
  return value;
}

/** Decodes one finite Tiled point object. */
function pointFrom(object: Record<string, unknown>): WorldPoint {
  return {
    x: finiteNumber(object.x, "Tiled object X is invalid."),
    y: finiteNumber(object.y, "Tiled object Y is invalid."),
  };
}

/** Decodes one positive Tiled rectangle used for exits and interactions. */
function rectFrom(object: Record<string, unknown>): { x: number; y: number; width: number; height: number } {
  const point = pointFrom(object);
  const width = finiteNumber(object.width, "Tiled object width is invalid.");
  const height = finiteNumber(object.height, "Tiled object height is invalid.");
  if (width <= 0 || height <= 0) throw new Error("Tiled object rectangle must be positive.");
  return { ...point, width, height };
}

/** Requires one non-array object before field-level Tiled decoding. */
function recordFrom(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(message);
  return value as Record<string, unknown>;
}

/** Requires one array without accepting array-like or object fallbacks. */
function arrayFrom(value: unknown, message: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(message);
  return value;
}

/** Requires one positive integer Tiled dimension. */
function positiveInteger(value: unknown, message: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) throw new Error(message);
  return Number(value);
}

/** Requires one finite numeric Tiled coordinate. */
function finiteNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(message);
  return value;
}
