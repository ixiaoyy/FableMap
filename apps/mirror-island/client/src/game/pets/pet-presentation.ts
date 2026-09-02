import type { PetHomeRegionId } from "../../../../domain/pets/definitions.ts";
import type { WorldCatalog, WorldPoint } from "../../../../domain/world/regions.ts";

const PET_ANCHOR_IDS: Readonly<Record<PetHomeRegionId, readonly [string, string, string]>> = {
  farm: ["pet-farm-yard-west", "pet-farm-yard-east", "pet-farm-yard-rest"],
  cottage: ["pet-cottage-hearth", "pet-cottage-window", "pet-cottage-rug"],
};

const PET_ROUTE_SAMPLE_PIXELS = 4;
const PET_ROUTE_MAX_PIXELS = 96;

/** Resolves the reviewed presentation-only anchor loop for one home region. */
export function petAnchorsForRegion(
  catalog: WorldCatalog,
  regionId: PetHomeRegionId,
): readonly WorldPoint[] {
  return PET_ANCHOR_IDS[regionId].map((spawnId) => catalog.requireSpawn(regionId, spawnId));
}

/** Validates both home anchor loops against current Tiled collision before gameplay starts. */
export function validatePetAnchors(catalog: WorldCatalog): void {
  for (const regionId of ["farm", "cottage"] as const) {
    const anchors = petAnchorsForRegion(catalog, regionId);
    for (let index = 0; index < anchors.length; index += 1) {
      const start = anchors[index]!;
      const end = anchors[(index + 1) % anchors.length]!;
      assertPetRouteClear(catalog, regionId, start, end);
    }
  }
}

/** Requires one short direct pet leg to stay inside walkable Tiled space at foot-box samples. */
function assertPetRouteClear(
  catalog: WorldCatalog,
  regionId: PetHomeRegionId,
  start: WorldPoint,
  end: WorldPoint,
): void {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  if (distance <= 0 || distance > PET_ROUTE_MAX_PIXELS) {
    throw new Error(`Pet anchor route is invalid in region ${regionId}.`);
  }
  const steps = Math.ceil(distance / PET_ROUTE_SAMPLE_PIXELS);
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;
    if (catalog.isBlocked(regionId, x, y, 4, 3, [])) {
      throw new Error(`Pet anchor route crosses collision in region ${regionId}.`);
    }
  }
}
