import type { WorldCatalog } from "../../../../domain/world/regions.ts";
import { validateNpcActivities } from "../../../../domain/world/npc-activities.ts";
import { validateNpcSchedules } from "../../../../domain/world/npc-schedules.ts";
import { createWorldCatalog, decodeTiledRegion } from "./tiled-region-decoder.ts";

const REGION_SOURCES = [
  { mapKey: "region-farm", url: "/map/farm.tmj" },
  { mapKey: "region-town", url: "/map/town.tmj" },
  { mapKey: "region-cottage", url: "/map/cottage.tmj" },
  { mapKey: "region-seed-shop", url: "/map/seed-shop.tmj" },
  { mapKey: "region-blacksmith", url: "/map/blacksmith.tmj" },
  { mapKey: "region-town-house-west", url: "/map/town-house-west.tmj" },
  { mapKey: "region-town-house-north", url: "/map/town-house-north.tmj" },
  { mapKey: "region-town-house", url: "/map/town-house.tmj" },
  { mapKey: "region-town-house-southwest", url: "/map/town-house-southwest.tmj" },
  { mapKey: "region-town-house-east", url: "/map/town-house-east.tmj" },
  { mapKey: "region-foothills", url: "/map/foothills.tmj" },
  { mapKey: "region-lakeshore", url: "/map/lakeshore.tmj" },
] as const;

let catalogPromise: Promise<WorldCatalog> | null = null;
let loadedCatalog: WorldCatalog | null = null;

/** Loads, validates and caches the complete local world catalog before a game can start. */
export function loadWorldCatalog(): Promise<WorldCatalog> {
  if (catalogPromise) return catalogPromise;
  catalogPromise = Promise.all(REGION_SOURCES.map(async (source) => {
    const response = await fetch(source.url, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Region map failed to load with HTTP ${response.status}.`);
    return decodeTiledRegion(await response.json() as unknown, source.mapKey);
  })).then((regions) => {
    loadedCatalog = createWorldCatalog(regions);
    validateNpcSchedules(loadedCatalog);
    validateNpcActivities(loadedCatalog);
    return loadedCatalog;
  });
  return catalogPromise;
}

/** Returns the already validated world catalog or fails before application bootstrap completes. */
export function getWorldCatalog(): WorldCatalog {
  if (!loadedCatalog) throw new Error("World catalog is unavailable.");
  return loadedCatalog;
}

/** Returns immutable map loader sources so Phaser uses the exact catalog keys and URLs. */
export function worldRegionSources(): readonly { readonly mapKey: string; readonly url: string }[] {
  return REGION_SOURCES;
}
