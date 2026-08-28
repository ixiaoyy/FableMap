import {
  schedulePhaseAt,
  type NpcSchedulePhase,
} from "../time/game-time.ts";
import type {
  NpcSpawnDefinition,
  WorldCatalog,
} from "./regions.ts";

type NpcInteractionType = NpcSpawnDefinition["interactionType"];

interface NpcScheduleAnchor {
  readonly regionId?: string;
  readonly spawnId: string;
  readonly interactionType?: NpcInteractionType;
}

type NpcSchedule = Readonly<Record<NpcSchedulePhase, NpcScheduleAnchor>>;

const NPC_SCHEDULES: Readonly<Record<string, NpcSchedule>> = {
  "seed-keeper": {
    morning: baseRegionAnchor("npc-huaqiang-home", "dialogue"),
    day: baseRegionAnchor("npc-huaqiang-counter", "shop"),
    evening: baseRegionAnchor("npc-huaqiang-shelves", "dialogue"),
    night: baseRegionAnchor("npc-huaqiang-home", "dialogue"),
  },
  "town-blacksmith": {
    morning: anchor("town-house-southwest", "npc-haotian-home"),
    day: anchor("town", "npc-haotian-work"),
    evening: anchor("blacksmith", "npc-haotian-evening"),
    night: anchor("town-house-southwest", "npc-haotian-home"),
  },
  "town-resident-01": {
    morning: anchor("town-house", "npc-ahe-home"),
    day: anchor("town", "npc-ahe-tree"),
    evening: anchor("lakeshore", "npc-ahe-evening"),
    night: anchor("town-house", "npc-ahe-home"),
  },
  "town-resident-mozi": {
    morning: anchor("town-house-west", "npc-mozi-home"),
    day: anchor("town", "npc-mozi-work"),
    evening: anchor("town", "npc-mozi-evening"),
    night: anchor("town-house-west", "npc-mozi-home"),
  },
  "town-resident-haonan": {
    morning: anchor("town-house-north", "npc-haonan-home"),
    day: anchor("foothills", "npc-haonan-trail"),
    evening: anchor("town", "npc-haonan-evening"),
    night: anchor("town-house-north", "npc-haonan-home"),
  },
  "town-resident-alan": {
    morning: anchor("town-house", "npc-alan-home"),
    day: anchor("lakeshore", "npc-alan-shore"),
    evening: anchor("town", "npc-alan-bridge"),
    night: anchor("town-house", "npc-alan-home"),
  },
  "town-resident-haomeili": {
    morning: anchor("town-house-southwest", "npc-haomeili-home"),
    day: anchor("blacksmith", "npc-haomeili-work"),
    evening: anchor("town", "npc-haomeili-evening"),
    night: anchor("town-house-southwest", "npc-haomeili-home"),
  },
  "town-resident-xiangzi": {
    morning: anchor("town-house-east", "npc-xiangzi-home"),
    day: anchor("lakeshore", "npc-xiangzi-dock"),
    evening: anchor("lakeshore", "npc-xiangzi-evening"),
    night: anchor("town-house-east", "npc-xiangzi-home"),
  },
};

/** Creates one schedule anchor while keeping all pixel coordinates Tiled-owned. */
function anchor(
  regionId: string,
  spawnId: string,
  interactionType?: NpcInteractionType,
): NpcScheduleAnchor {
  return { regionId, spawnId, interactionType };
}

/** Creates one anchor inside the base NpcSpawns region without duplicating that region ID. */
function baseRegionAnchor(
  spawnId: string,
  interactionType?: NpcInteractionType,
): NpcScheduleAnchor {
  return { spawnId, interactionType };
}

/** Returns every unique base NPC definition and rejects duplicated identity IDs. */
function baseNpcs(catalog: WorldCatalog): readonly NpcSpawnDefinition[] {
  const result = catalog.allRegions().flatMap((region) => region.npcs);
  const ids = new Set<string>();
  for (const npc of result) {
    if (ids.has(npc.npcId)) throw new Error(`Duplicate base NPC identity: ${npc.npcId}.`);
    ids.add(npc.npcId);
  }
  return result;
}

/** Validates complete schedules, Tiled anchors and same-phase NPC separation at startup. */
export function validateNpcSchedules(catalog: WorldCatalog): void {
  const npcs = baseNpcs(catalog);
  const baseIds = new Set(npcs.map((npc) => npc.npcId));
  for (const npc of npcs) {
    if (!NPC_SCHEDULES[npc.npcId]) throw new Error(`NPC schedule is missing for ${npc.npcId}.`);
  }
  for (const npcId of Object.keys(NPC_SCHEDULES)) {
    if (!baseIds.has(npcId)) throw new Error(`NPC schedule has no base identity: ${npcId}.`);
  }
  for (const phase of ["morning", "day", "evening", "night"] as const) {
    const occupied = new Set<string>();
    for (const npc of npcs) {
      const scheduled = projectNpcAtPhase(catalog, npc, phase);
      if (catalog.isBlocked(scheduled.regionId, scheduled.x, scheduled.y, 5, 3, [])) {
        throw new Error(`NPC schedule anchor is blocked: ${npc.npcId}/${phase}.`);
      }
      const key = `${scheduled.regionId}:${scheduled.x}:${scheduled.y}`;
      if (occupied.has(key)) throw new Error(`NPC schedule anchors overlap during ${phase}.`);
      occupied.add(key);
    }
  }
}

/** Projects every unique base NPC into the anchor active at one game minute. */
export function activeNpcSpawns(catalog: WorldCatalog, minuteOfDay: number): readonly NpcSpawnDefinition[] {
  const phase = schedulePhaseAt(minuteOfDay);
  return baseNpcs(catalog).map((npc) => projectNpcAtPhase(catalog, npc, phase));
}

/** Returns active NPC projections belonging to one region at one game minute. */
export function activeNpcSpawnsInRegion(
  catalog: WorldCatalog,
  regionId: string,
  minuteOfDay: number,
): readonly NpcSpawnDefinition[] {
  return activeNpcSpawns(catalog, minuteOfDay).filter((npc) => npc.regionId === regionId);
}

/** Returns one active NPC identity or null when the npcId is unknown. */
export function activeNpcById(
  catalog: WorldCatalog,
  npcId: string,
  minuteOfDay: number,
): NpcSpawnDefinition | null {
  return activeNpcSpawns(catalog, minuteOfDay).find((npc) => npc.npcId === npcId) ?? null;
}

/** Replaces only schedule-owned position/type fields while preserving stable NPC identity and dialogue. */
function projectNpcAtPhase(
  catalog: WorldCatalog,
  npc: NpcSpawnDefinition,
  phase: NpcSchedulePhase,
): NpcSpawnDefinition {
  const scheduled = NPC_SCHEDULES[npc.npcId]?.[phase];
  if (!scheduled) return npc;
  const regionId = scheduled.regionId ?? npc.regionId;
  const point = catalog.requireSpawn(regionId, scheduled.spawnId);
  return {
    ...npc,
    regionId,
    x: point.x,
    y: point.y,
    interactionType: scheduled.interactionType ?? npc.interactionType,
  };
}
