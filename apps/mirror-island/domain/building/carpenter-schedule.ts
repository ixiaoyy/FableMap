import { playableCalendarAt } from "../calendar/game-calendar.ts";
import type { WeatherKind } from "../weather/definitions.ts";
import type { NpcSpawnDefinition, WorldCatalog, WorldPoint } from "../world/regions.ts";

export const CARPENTER_NPC_ID = "town-resident-mozi";
export const CARPENTER_REGION_ID = "town-house-west";
export const CARPENTER_COUNTER_ID = "town-house-west-carpenter-counter";
export const CARPENTER_COUNTER_SPAWN = "npc-mozi-counter";
export const CARPENTER_PASS_SPAWN = "npc-mozi-counter-pass";
export const CARPENTER_HOME_SPAWN = "npc-mozi-home";

export interface CarpenterSpecialSchedule {
  readonly reason: "summer-clinic" | "festival" | "night-market" | "green-rain" | "construction";
  readonly regionId: string;
  readonly spawnId: string;
  readonly passingMinute?: number;
}

export interface CarpenterScheduleContext {
  readonly day: number;
  readonly weather: WeatherKind;
  readonly carpenterSpecialSchedule?: CarpenterSpecialSchedule;
}

export interface CarpenterScheduleResolution {
  readonly regionId: string;
  readonly spawnId: string;
  readonly service: "open" | "passing" | "closed";
  readonly routine: "regular" | "rain" | "rest";
  readonly activity: "prepare" | "serve" | "repair" | "organize";
}

/** Resolves the reviewed minute/weekday/rain schedule; future event owners supply real authored special targets instead of dummy state. */
export function resolveCarpenterSchedule(minuteOfDay: number, context: CarpenterScheduleContext): CarpenterScheduleResolution {
  const special = context.carpenterSpecialSchedule;
  if (special) return {
    regionId: special.regionId, spawnId: special.spawnId,
    service: special.passingMinute !== undefined && minuteOfDay >= special.passingMinute
      && minuteOfDay < special.passingMinute + 10 ? "passing" : "closed",
    routine: "rest", activity: "repair",
  };
  const rainy = context.weather === "rain";
  const weekday = playableCalendarAt(context.day).weekday;
  const restTuesday = weekday === "tuesday" && !rainy;
  const earlyFriday = weekday === "friday" && !rainy;
  const routine = rainy ? "rain" : restTuesday ? "rest" : "regular";
  if (restTuesday) {
    if (minuteOfDay < 9 * 60 + 40) return atHome(routine, "prepare");
    if (minuteOfDay < 20 * 60) return {
      regionId: "town", spawnId: "npc-mozi-work", routine, activity: "repair",
      service: minuteOfDay < 9 * 60 + 50 ? "passing" : "closed",
    };
    return { ...atHome(routine, "organize"), service: minuteOfDay < 20 * 60 + 10 ? "passing" : "closed" };
  }
  const closingMinute = earlyFriday ? 16 * 60 : 17 * 60;
  if (minuteOfDay < 8 * 60) return atHome(routine, "prepare");
  if (minuteOfDay < closingMinute) return {
    regionId: CARPENTER_REGION_ID, spawnId: CARPENTER_COUNTER_SPAWN,
    service: minuteOfDay >= 9 * 60 ? "open" : "closed", routine,
    activity: minuteOfDay >= 9 * 60 ? "serve" : "prepare",
  };
  if (minuteOfDay < 21 * 60) return {
    regionId: "town", spawnId: "npc-mozi-evening", routine, activity: "repair",
    service: earlyFriday && minuteOfDay < closingMinute + 10 ? "passing" : "closed",
  };
  return atHome(routine, "organize");
}

/** Reports service only when the current resolver allows it and the actual NPC feet are at the counter or its passing tile. */
export function carpenterServiceAt(
  catalog: WorldCatalog, npc: Pick<NpcSpawnDefinition, "npcId" | "regionId" | "x" | "y">,
  minuteOfDay: number, context: CarpenterScheduleContext,
): boolean {
  if (npc.npcId !== CARPENTER_NPC_ID || npc.regionId !== CARPENTER_REGION_ID) return false;
  const resolution = resolveCarpenterSchedule(minuteOfDay, context);
  if (resolution.service === "closed") return false;
  return carpenterCounterContains(catalog, npc, resolution.service === "passing");
}

/** Checks only the actual authored desk footprint; temporal permission remains owned by the runtime's resolved service marker. */
export function carpenterCounterContains(
  catalog: WorldCatalog, npc: Pick<NpcSpawnDefinition, "npcId" | "regionId" | "x" | "y">, includePassingTile: boolean,
): boolean {
  if (npc.npcId !== CARPENTER_NPC_ID || npc.regionId !== CARPENTER_REGION_ID) return false;
  const counter = catalog.requireSpawn(CARPENTER_REGION_ID, CARPENTER_COUNTER_SPAWN);
  const pass = catalog.requireSpawn(CARPENTER_REGION_ID, CARPENTER_PASS_SPAWN);
  return nearPoint(npc, counter, 12) || (includePassingTile && nearPoint(npc, pass, 12));
}

/** Creates the ordinary home resolution without duplicating its stable authored region or identity. */
function atHome(routine: CarpenterScheduleResolution["routine"], activity: "prepare" | "organize"): CarpenterScheduleResolution {
  return { regionId: CARPENTER_REGION_ID, spawnId: CARPENTER_HOME_SPAWN, service: "closed", routine, activity };
}

/** Tests one actual foot position against the service radius of an authored point. */
function nearPoint(left: WorldPoint, right: WorldPoint, radius: number): boolean {
  return Math.hypot(left.x - right.x, left.y - right.y) <= radius;
}
