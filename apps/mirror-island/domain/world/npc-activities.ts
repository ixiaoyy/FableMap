import { schedulePhaseAt } from "../time/game-time.ts";
import { activeNpcById, activeNpcSpawns } from "./npc-schedules.ts";
import { findNpcPath } from "./npc-pathfinding.ts";
import type {
  WorldCatalog,
  WorldPoint,
} from "./regions.ts";

const DAY_ACTIVITY_MINUTE = 9 * 60;

export type NpcActivityKind =
  | "serve"
  | "forge"
  | "tend"
  | "repair"
  | "mountain-patrol"
  | "observe"
  | "organize"
  | "dock-watch";

interface NpcActivityDefinition {
  readonly npcId: string;
  readonly kind: NpcActivityKind;
  readonly regionId: string;
  readonly routeSpawnIds?: readonly [string, string, ...string[]];
}

export interface NpcActivityPlan {
  readonly kind: NpcActivityKind;
  readonly regionId: string;
  readonly route: readonly WorldPoint[];
}

const NPC_ACTIVITY_DEFINITIONS: readonly NpcActivityDefinition[] = [
  {
    npcId: "seed-keeper",
    kind: "serve",
    regionId: "seed-shop",
  },
  {
    npcId: "town-blacksmith",
    kind: "forge",
    regionId: "town",
  },
  {
    npcId: "town-resident-01",
    kind: "tend",
    regionId: "town",
  },
  {
    npcId: "town-resident-mozi",
    kind: "repair",
    regionId: "town",
  },
  {
    npcId: "town-resident-haonan",
    kind: "mountain-patrol",
    regionId: "foothills",
    routeSpawnIds: [
      "npc-haonan-trail",
      "npc-haonan-patrol-mid",
      "npc-haonan-patrol-lookout",
    ],
  },
  {
    npcId: "town-resident-alan",
    kind: "observe",
    regionId: "lakeshore",
  },
  {
    npcId: "town-resident-haomeili",
    kind: "organize",
    regionId: "blacksmith",
  },
  {
    npcId: "town-resident-xiangzi",
    kind: "dock-watch",
    regionId: "lakeshore",
    routeSpawnIds: [
      "npc-xiangzi-dock",
      "npc-xiangzi-dock-east",
      "npc-xiangzi-dock-west",
    ],
  },
];

/** Resolves one day-only activity plan from stable NPC identity and Tiled-owned route points. */
export function npcActivityAt(
  catalog: WorldCatalog,
  npcId: string,
  minuteOfDay: number,
): NpcActivityPlan | null {
  if (schedulePhaseAt(minuteOfDay) !== "day") return null;
  const definition = NPC_ACTIVITY_DEFINITIONS.find((candidate) => candidate.npcId === npcId);
  if (!definition) return null;
  return {
    kind: definition.kind,
    regionId: definition.regionId,
    route: definition.routeSpawnIds?.map((spawnId) => (
      { ...catalog.requireSpawn(definition.regionId, spawnId) }
    )) ?? [],
  };
}

/** Validates eight unique day activities, their schedule ownership and every closed patrol leg. */
export function validateNpcActivities(catalog: WorldCatalog): void {
  const knownNpcIds = new Set(activeNpcSpawns(catalog, DAY_ACTIVITY_MINUTE).map(({ npcId }) => npcId));
  const activityNpcIds = new Set<string>();
  for (const definition of NPC_ACTIVITY_DEFINITIONS) {
    if (activityNpcIds.has(definition.npcId)) {
      throw new Error(`Duplicate NPC activity identity: ${definition.npcId}.`);
    }
    activityNpcIds.add(definition.npcId);
    if (!knownNpcIds.has(definition.npcId)) {
      throw new Error(`NPC activity has no scheduled identity: ${definition.npcId}.`);
    }
    const dayTarget = activeNpcById(catalog, definition.npcId, DAY_ACTIVITY_MINUTE);
    if (!dayTarget || dayTarget.regionId !== definition.regionId) {
      throw new Error(`NPC activity region does not match its day schedule: ${definition.npcId}.`);
    }
    if (!definition.routeSpawnIds) continue;
    const route = definition.routeSpawnIds.map((spawnId) => (
      catalog.requireSpawn(definition.regionId, spawnId)
    ));
    if (route[0]!.x !== dayTarget.x || route[0]!.y !== dayTarget.y) {
      throw new Error(`NPC activity route must start at its day schedule anchor: ${definition.npcId}.`);
    }
    for (const point of route) {
      if (catalog.isBlocked(definition.regionId, point.x, point.y, 5, 3, [])) {
        throw new Error(`NPC activity route point is blocked: ${definition.npcId}.`);
      }
    }
    for (let index = 0; index < route.length; index += 1) {
      const start = route[index]!;
      const end = route[(index + 1) % route.length]!;
      if (!findNpcPath(catalog.requireRegion(definition.regionId).collision, start, end)) {
        throw new Error(`NPC activity route leg is unreachable: ${definition.npcId}.`);
      }
    }
  }
}
