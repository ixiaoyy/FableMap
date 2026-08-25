import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mapDirectory = join(root, "public", "map");
const supportedMapNames = ["farm.tmj", "town.tmj", "cottage.tmj", "seed-shop.tmj"];
const requestedMapNames = process.argv.slice(2);
const mapNames = requestedMapNames.length > 0 ? requestedMapNames : supportedMapNames;
if (mapNames.some((name) => !supportedMapNames.includes(name))) {
  throw new Error("Only registered World Foundation TMJ files may be formatted.");
}

/** Formats one Tiled JSON map while keeping large finite tile arrays compact and reviewable. */
async function formatTiledMap(filePath) {
  const map = JSON.parse(await readFile(filePath, "utf8"));
  const compactArrays = [];
  for (const layer of map.layers) {
    if (layer.type !== "tilelayer" || !Array.isArray(layer.data)) continue;
    const token = `__MIRROR_ISLAND_TILE_DATA_${compactArrays.length}__`;
    compactArrays.push({ token, data: layer.data });
    layer.data = token;
  }
  let output = JSON.stringify(map, null, 2);
  for (const { token, data } of compactArrays) {
    output = output.replace(JSON.stringify(token), JSON.stringify(data));
  }
  await writeFile(filePath, `${output}\n`, "utf8");
}

for (const mapName of mapNames) await formatTiledMap(join(mapDirectory, mapName));
console.log(`Formatted ${mapNames.length} Tiled maps without changing map data.`);
