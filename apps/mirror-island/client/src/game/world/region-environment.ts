const OUTDOOR_REGION_IDS = new Set([
  "farm",
  "town",
  "foothills",
  "lakeshore",
]);

/** Reports whether one formal region uses the outdoor art and daylight environment. */
export function isOutdoorRegion(regionId: string): boolean {
  return OUTDOOR_REGION_IDS.has(regionId);
}
