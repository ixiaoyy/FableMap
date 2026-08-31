import {
  schedulePhaseAt,
  type NpcSchedulePhase,
} from "../time/game-time.ts";
import { activeNpcById, activeNpcSpawns } from "./npc-schedules.ts";
import { findNpcPath } from "./npc-pathfinding.ts";
import type {
  WorldCatalog,
  WorldPoint,
} from "./regions.ts";

const ACTIVITY_MINUTE_BY_PHASE: Readonly<Record<NpcSchedulePhase, number>> = {
  morning: 6 * 60,
  day: 9 * 60,
  evening: 17 * 60,
  night: 21 * 60,
};

const NPC_ACTIVITY_PHASES = ["morning", "day", "evening", "night"] as const;

export type NpcActivityKind =
  | "serve"
  | "forge"
  | "tend"
  | "repair"
  | "mountain-patrol"
  | "observe"
  | "organize"
  | "dock-watch"
  | "stock"
  | "close"
  | "prepare"
  | "tea"
  | "record"
  | "sew"
  | "rope-check";

interface NpcActivityDefinition {
  readonly kind: NpcActivityKind;
  readonly regionId: string;
  readonly routeSpawnIds?: readonly [string, string, ...string[]];
}

type NpcActivitySchedule = Readonly<Record<NpcSchedulePhase, NpcActivityDefinition>>;

export interface NpcActivityPlan {
  readonly kind: NpcActivityKind;
  readonly regionId: string;
  readonly route: readonly WorldPoint[];
}

const NPC_ACTIVITY_SCHEDULES: Readonly<Record<string, NpcActivitySchedule>> = {
  "seed-keeper": {
    morning: { kind: "stock", regionId: "seed-shop" },
    day: { kind: "serve", regionId: "seed-shop" },
    evening: { kind: "close", regionId: "seed-shop" },
    night: { kind: "record", regionId: "seed-shop" },
  },
  "town-blacksmith": {
    morning: { kind: "prepare", regionId: "town-house-southwest" },
    day: { kind: "forge", regionId: "town" },
    evening: { kind: "close", regionId: "blacksmith" },
    night: { kind: "tea", regionId: "town-house-southwest" },
  },
  "town-resident-01": {
    morning: { kind: "tend", regionId: "town-house" },
    day: { kind: "tend", regionId: "town" },
    evening: { kind: "observe", regionId: "lakeshore" },
    night: { kind: "tea", regionId: "town-house" },
  },
  "town-resident-mozi": {
    morning: { kind: "prepare", regionId: "town-house-west" },
    day: { kind: "repair", regionId: "town" },
    evening: { kind: "repair", regionId: "town" },
    night: { kind: "organize", regionId: "town-house-west" },
  },
  "town-resident-haonan": {
    morning: { kind: "prepare", regionId: "town-house-north" },
    day: {
      kind: "mountain-patrol",
      regionId: "foothills",
      routeSpawnIds: [
        "npc-haonan-trail",
        "npc-haonan-patrol-mid",
        "npc-haonan-patrol-lookout",
      ],
    },
    evening: { kind: "record", regionId: "town" },
    night: { kind: "record", regionId: "town-house-north" },
  },
  "town-resident-alan": {
    morning: { kind: "prepare", regionId: "town-house" },
    day: { kind: "observe", regionId: "lakeshore" },
    evening: { kind: "observe", regionId: "town" },
    night: { kind: "tea", regionId: "town-house" },
  },
  "town-resident-haomeili": {
    morning: { kind: "sew", regionId: "town-house-southwest" },
    day: { kind: "organize", regionId: "blacksmith" },
    evening: { kind: "organize", regionId: "town" },
    night: { kind: "tea", regionId: "town-house-southwest" },
  },
  "town-resident-xiangzi": {
    morning: { kind: "rope-check", regionId: "town-house-east" },
    day: {
      kind: "dock-watch",
      regionId: "lakeshore",
      routeSpawnIds: [
        "npc-xiangzi-dock",
        "npc-xiangzi-dock-east",
        "npc-xiangzi-dock-west",
      ],
    },
    evening: { kind: "close", regionId: "lakeshore" },
    night: { kind: "record", regionId: "town-house-east" },
  },
};

/** Resolves one phase-owned activity plan from stable NPC identity and Tiled route points. */
export function npcActivityAt(
  catalog: WorldCatalog,
  npcId: string,
  minuteOfDay: number,
): NpcActivityPlan | null {
  const definition = NPC_ACTIVITY_SCHEDULES[npcId]?.[schedulePhaseAt(minuteOfDay)];
  if (!definition) return null;
  return {
    kind: definition.kind,
    regionId: definition.regionId,
    route: definition.routeSpawnIds?.map((spawnId) => (
      { ...catalog.requireSpawn(definition.regionId, spawnId) }
    )) ?? [],
  };
}

/** Validates complete four-phase activities, schedule ownership and every routed patrol leg. */
export function validateNpcActivities(catalog: WorldCatalog): void {
  const knownNpcIds = new Set(
    activeNpcSpawns(catalog, ACTIVITY_MINUTE_BY_PHASE.day).map(({ npcId }) => npcId),
  );
  for (const npcId of knownNpcIds) {
    const schedule = NPC_ACTIVITY_SCHEDULES[npcId];
    if (!schedule) throw new Error(`NPC activity schedule is missing for ${npcId}.`);
    for (const phase of NPC_ACTIVITY_PHASES) {
      const definition = schedule[phase];
      const minuteOfDay = ACTIVITY_MINUTE_BY_PHASE[phase];
      const target = activeNpcById(catalog, npcId, minuteOfDay);
      if (!target || target.regionId !== definition.regionId) {
        throw new Error(`NPC activity region does not match ${phase} schedule: ${npcId}.`);
      }
      validateActivityRoute(catalog, npcId, target, definition);
    }
  }
  for (const npcId of Object.keys(NPC_ACTIVITY_SCHEDULES)) {
    if (!knownNpcIds.has(npcId)) {
      throw new Error(`NPC activity schedule has no scheduled identity: ${npcId}.`);
    }
  }
}

/** Validates one optional routed activity without imposing Tiled points on stationary actions. */
function validateActivityRoute(
  catalog: WorldCatalog,
  npcId: string,
  target: WorldPoint,
  definition: NpcActivityDefinition,
): void {
  if (!definition.routeSpawnIds) return;
  const route = definition.routeSpawnIds.map((spawnId) => (
    catalog.requireSpawn(definition.regionId, spawnId)
  ));
  if (route[0]!.x !== target.x || route[0]!.y !== target.y) {
    throw new Error(`NPC activity route must start at its schedule anchor: ${npcId}.`);
  }
  for (const point of route) {
    if (catalog.isBlocked(definition.regionId, point.x, point.y, 5, 3, [])) {
      throw new Error(`NPC activity route point is blocked: ${npcId}.`);
    }
  }
  for (let index = 0; index < route.length; index += 1) {
    const start = route[index]!;
    const end = route[(index + 1) % route.length]!;
    if (!findNpcPath(catalog.requireRegion(definition.regionId).collision, start, end)) {
      throw new Error(`NPC activity route leg is unreachable: ${npcId}.`);
    }
  }
}
