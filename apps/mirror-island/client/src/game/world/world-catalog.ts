import type { WorldCatalog } from "../../../../domain/world/regions.ts";
import { validateNpcActivities } from "../../../../domain/world/npc-activities.ts";
import { validatePetAnchors } from "../pets/pet-presentation.ts";
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
let loadedMaps: readonly { readonly mapKey: string; readonly data: object }[] = [];

/** Loads, validates and caches the complete local world catalog before a game can start. */
export function loadWorldCatalog(): Promise<WorldCatalog> {
  if (catalogPromise) return catalogPromise;
  const version = import.meta.env?.VITE_MAP_VERSION;
  catalogPromise = Promise.all(REGION_SOURCES.map(async (source) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(version ? `${source.url}?v=${version}` : source.url, {
        credentials: "same-origin", signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Region map failed to load with HTTP ${response.status}.`);
      const data: unknown = await response.json();
      const region = decodeTiledRegion(data, source.mapKey);
      if (!data || typeof data !== "object") throw new Error("Region map is not an object.");
      return { mapKey: source.mapKey, data, region };
    } finally {
      clearTimeout(timeout);
    }
  })).then((maps) => {
    const catalog = createWorldCatalog(maps.map((map) => map.region));
    validateNpcSchedules(catalog);
    validateNpcActivities(catalog);
    validatePetAnchors(catalog);
    loadedMaps = maps.map(({ mapKey, data }) => ({ mapKey, data }));
    loadedCatalog = catalog;
    return catalog;
  }).catch((error: unknown) => {
    catalogPromise = null;
    throw error;
  });
  return catalogPromise;
}

/** Returns the already validated world catalog or fails before application bootstrap completes. */
export function getWorldCatalog(): WorldCatalog {
  if (!loadedCatalog) throw new Error("World catalog is unavailable.");
  return loadedCatalog;
}

/** 返回已校验地图的独立副本供 Phaser 使用，避免二次请求或修改规则层持有的原数据。 */
export function worldRegionMaps(): readonly { readonly mapKey: string; readonly data: object }[] {
  if (!loadedCatalog) throw new Error("World maps are unavailable.");
  return loadedMaps.map(({ mapKey, data }) => ({ mapKey, data: structuredClone(data) }));
}
