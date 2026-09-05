import {
  npcActivityAt,
  type NpcActivityKind,
} from "./npc-activities.ts";
import { activeNpcSpawns, type NpcDayContext } from "./npc-schedules.ts";
import { findNpcPath } from "./npc-pathfinding.ts";
import {
  CARPENTER_NPC_ID, CARPENTER_REGION_ID, CARPENTER_PASS_SPAWN, carpenterServiceAt,
} from "../building/carpenter-schedule.ts";
import {
  NPC_FEET_HALF_HEIGHT,
  NPC_FEET_HALF_WIDTH,
  PLAYER_FEET_HALF_HEIGHT,
  PLAYER_FEET_HALF_WIDTH,
  worldFeetOverlap,
  type CollisionGrid,
  type NpcSpawnDefinition,
  type WorldCatalog,
  type WorldPoint,
} from "./regions.ts";

export const NPC_WALK_SPEED_PIXELS_PER_SECOND = 48;
export const NPC_TRANSFER_DURATION_MS = 360;
export const NPC_ACTIVITY_DWELL_MS = 2_400;
export const NPC_REPLAN_DELAY_MS = 600;
const NPC_ACTIVITY_PHASE_MS = 400;
const NPC_AVOIDANCE_SUBSTEP_MS = 50;

export type NpcMotionKind = "idle" | "walking" | "waiting" | "leaving" | "arriving";

export interface NpcAvoidancePosition extends WorldPoint {
  readonly regionId: string;
}

export type NpcWorldBlocked = (npc: NpcSpawnDefinition, x: number, y: number) => boolean;

export interface NpcRuntimeSpawn extends NpcSpawnDefinition {
  readonly opacity: number;
  readonly motion: NpcMotionKind;
  readonly activity: NpcActivityKind | null;
  readonly activityPhase: 0 | 1;
}

interface NpcActivityState {
  readonly kind: NpcActivityKind;
  readonly route: readonly WorldPoint[];
  readonly routeIndex: number;
  readonly dwellRemainingMs: number;
  readonly cycleElapsedMs: number;
}

interface IdleNpcMotion {
  readonly kind: "idle";
  readonly target: NpcSpawnDefinition;
  readonly activity: NpcActivityState | null;
}

interface WalkingNpcMotion {
  readonly kind: "walking";
  readonly target: NpcSpawnDefinition;
  readonly waypoints: readonly Readonly<{ x: number; y: number }>[];
  readonly waypointIndex: number;
  readonly x: number;
  readonly y: number;
  readonly activity: NpcActivityState | null;
  readonly arrivalActivity: NpcActivityState | null;
  readonly blockedMs: number;
  readonly continuation?: NpcMotionState;
}

interface TransferNpcMotion {
  readonly kind: "transfer";
  readonly source: NpcSpawnDefinition;
  readonly target: NpcSpawnDefinition;
  readonly elapsedMs: number;
  readonly arrivalActivity: NpcActivityState | null;
  readonly continuation?: NpcMotionState;
}

type NpcMotionState = IdleNpcMotion | WalkingNpcMotion | TransferNpcMotion;

interface NpcAvoidanceObstacle extends NpcAvoidancePosition {
  readonly halfWidth: number;
  readonly halfHeight: number;
}

export class NpcMotionRuntime {
  private motions = new Map<string, NpcMotionState>();
  private scheduleTargets = new Map<string, NpcSpawnDefinition>();
  private minuteOfDay = 360;
  private dayContext: NpcDayContext = { day: 2, weather: "sunny" };

  /** Creates transient NPC motion; the optional synchronous blocker may enqueue push intents but must not mutate saved state. */
  constructor(private readonly catalog: WorldCatalog, private readonly worldBlocked?: NpcWorldBlocked) {}

  /** Resets every NPC directly to the schedule anchor for one persisted game minute. */
  reset(minuteOfDay: number, context: NpcDayContext = this.dayContext): void {
    this.dayContext = context;
    this.minuteOfDay = minuteOfDay;
    const targets = activeNpcSpawns(this.catalog, minuteOfDay, context);
    this.scheduleTargets = new Map(targets.map((target) => [target.entityId, target]));
    this.motions = new Map(targets.map((target) => (
      [target.entityId, this.createIdleMotion(target, minuteOfDay)]
    )));
  }

  /** Synchronizes exact-minute schedule targets while preserving every unchanged patrol, dwell and in-progress route. */
  transitionTo(minuteOfDay: number, context: NpcDayContext = this.dayContext): void {
    this.dayContext = context;
    this.minuteOfDay = minuteOfDay;
    const next = new Map<string, NpcMotionState>();
    const nextTargets = new Map<string, NpcSpawnDefinition>();
    for (const target of activeNpcSpawns(this.catalog, minuteOfDay, context)) {
      nextTargets.set(target.entityId, target);
      const current = this.motions.get(target.entityId);
      const previous = this.scheduleTargets.get(target.entityId);
      if (current && previous && sameScheduleTarget(previous, target)) {
        next.set(target.entityId, current);
        continue;
      }
      const source = current ? projectMotion(current) : idleProjection(target, null);
      const arrivalActivity = this.createActivityState(target, minuteOfDay);
      next.set(target.entityId, this.createTransition(source, target, arrivalActivity));
    }
    this.motions = next;
    this.scheduleTargets = nextTargets;
  }

  /** Advances routes in bounded substeps against the optional player and every latest NPC footprint. */
  advance(deltaMs: number, player?: NpcAvoidancePosition): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    const boundedDeltaMs = Math.min(deltaMs, 1_000);
    let remainingMs = boundedDeltaMs;
    while (remainingMs > 0) {
      const substepMs = Math.min(NPC_AVOIDANCE_SUBSTEP_MS, remainingMs);
      this.advanceSubstep(substepMs, player);
      remainingMs -= substepMs;
    }
  }

  /** Returns defensive runtime projections for every stable NPC identity. */
  activeSpawns(): readonly NpcRuntimeSpawn[] {
    return Array.from(this.motions.values(), (motion) => {
      const npc = projectMotion(motion);
      if (npc.npcId !== CARPENTER_NPC_ID) return npc;
      const serving = npc.motion !== "leaving" && npc.motion !== "arriving"
        && carpenterServiceAt(this.catalog, npc, this.minuteOfDay, this.dayContext);
      return { ...npc, interactionType: serving ? "building-service" : "dialogue" };
    });
  }

  /** Returns defensive runtime projections currently belonging to one region. */
  activeSpawnsInRegion(regionId: string): readonly NpcRuntimeSpawn[] {
    return this.activeSpawns().filter((spawn) => spawn.regionId === regionId);
  }

  /** Returns one current runtime NPC projection by identity or null when it is unknown. */
  activeByNpcId(npcId: string): NpcRuntimeSpawn | null {
    return this.activeSpawns().find((spawn) => spawn.npcId === npcId) ?? null;
  }

  /** Creates one idle state and resolves the phase activity owned by its exact schedule target. */
  private createIdleMotion(target: NpcSpawnDefinition, minuteOfDay: number): IdleNpcMotion {
    return {
      kind: "idle",
      target,
      activity: this.createActivityState(target, minuteOfDay),
    };
  }

  /** Resolves one applicable transient phase activity while leaving unknown fixture identities activity-free. */
  private createActivityState(target: NpcSpawnDefinition, minuteOfDay: number): NpcActivityState | null {
    if (target.npcId !== CARPENTER_NPC_ID && (target.routine === "rest" || target.routine === "rain")) return null;
    const plan = npcActivityAt(this.catalog, target.npcId, minuteOfDay, this.dayContext);
    if (!plan || plan.regionId !== target.regionId) return null;
    const routeIndex = plan.route.findIndex((point) => point.x === target.x && point.y === target.y);
    if (plan.route.length > 0 && routeIndex < 0) {
      throw new Error(`NPC activity route does not contain its schedule target: ${target.npcId}.`);
    }
    return {
      kind: plan.kind,
      route: plan.route,
      routeIndex: Math.max(0, routeIndex),
      dwellRemainingMs: NPC_ACTIVITY_DWELL_MS,
      cycleElapsedMs: 0,
    };
  }

  /** Builds walking motion for same-region routes and transfer motion for cross-region schedule changes. */
  private createTransition(
    source: NpcRuntimeSpawn,
    target: NpcSpawnDefinition,
    arrivalActivity: NpcActivityState | null,
    allowCarpenterRoute = true,
  ): NpcMotionState {
    if (allowCarpenterRoute && source.npcId === CARPENTER_NPC_ID && source.regionId !== target.regionId
      && (source.regionId === CARPENTER_REGION_ID || target.regionId === CARPENTER_REGION_ID)) {
      return this.createCarpenterTransition(source, target, arrivalActivity);
    }
    if (
      source.regionId === target.regionId
      && source.x === target.x
      && source.y === target.y
    ) {
      return { kind: "idle", target, activity: arrivalActivity };
    }
    if (source.regionId === target.regionId) {
      const route = findNpcPath(this.catalog.requireRegion(target.regionId).collision, source, target);
      if (route && route.length >= 2) {
        return {
          kind: "walking",
          target,
          waypoints: route,
          waypointIndex: 1,
          x: source.x,
          y: source.y,
          activity: null,
          arrivalActivity,
          blockedMs: 0,
        };
      }
    }
    return {
      kind: "transfer",
      source,
      target,
      elapsedMs: 0,
      arrivalActivity,
    };
  }

  /** Routes carpenter departures/returns through the authored counter-pass and door before transferring regions. */
  private createCarpenterTransition(source: NpcRuntimeSpawn, target: NpcSpawnDefinition, arrivalActivity: NpcActivityState | null): NpcMotionState {
    const pass = { ...target, ...this.catalog.requireSpawn(CARPENTER_REGION_ID, CARPENTER_PASS_SPAWN), regionId: CARPENTER_REGION_ID };
    const entry = { ...target, ...this.catalog.requireSpawn(CARPENTER_REGION_ID, "entry"), regionId: CARPENTER_REGION_ID };
    const intermediate = source.regionId === CARPENTER_REGION_ID ? [pass, entry] : [entry, pass];
    const points: NpcSpawnDefinition[] = [source, ...intermediate, target];
    let continuation: NpcMotionState = { kind: "idle", target, activity: arrivalActivity };
    for (let index = points.length - 2; index >= 0; index -= 1) {
      const from = idleProjection(points[index]!, null);
      const to = points[index + 1]!;
      const leg = this.createTransition(from, to, null, false);
      if (leg.kind !== "idle") continuation = { ...leg, continuation };
    }
    return continuation;
  }

  /** Advances one motion variant and starts patrol legs only after their reviewed dwell interval. */
  private advanceMotion(motion: NpcMotionState, deltaMs: number): NpcMotionState {
    switch (motion.kind) {
      case "idle": return this.advanceIdleMotion(motion, deltaMs);
      case "transfer": {
        const elapsedMs = Math.min(NPC_TRANSFER_DURATION_MS, motion.elapsedMs + deltaMs);
        return elapsedMs >= NPC_TRANSFER_DURATION_MS
          ? motion.continuation ?? { kind: "idle", target: motion.target, activity: motion.arrivalActivity }
          : { ...motion, elapsedMs };
      }
      case "walking": return this.advanceWalkingMotion(motion, deltaMs);
    }
  }

  /** Advances stationary cadence or starts the next closed patrol leg after idle dwell completes. */
  private advanceIdleMotion(motion: IdleNpcMotion, deltaMs: number): NpcMotionState {
    const activity = advanceActivityPhase(motion.activity, deltaMs);
    if (!activity || activity.route.length < 2) return { ...motion, activity };
    const dwellRemainingMs = Math.max(0, activity.dwellRemainingMs - deltaMs);
    const dwellingActivity = { ...activity, dwellRemainingMs };
    if (dwellRemainingMs > 0) return { ...motion, activity: dwellingActivity };
    const routeIndex = (activity.routeIndex + 1) % activity.route.length;
    const destination = activity.route[routeIndex]!;
    const target: NpcSpawnDefinition = {
      ...motion.target,
      x: destination.x,
      y: destination.y,
      interactionType: "dialogue",
    };
    const route = findNpcPath(this.catalog.requireRegion(target.regionId).collision, motion.target, target);
    if (!route || route.length < 2) {
      throw new Error(`NPC activity patrol route became unavailable: ${target.npcId}.`);
    }
    return {
      kind: "walking",
      target,
      waypoints: route,
      waypointIndex: 1,
      x: motion.target.x,
      y: motion.target.y,
      activity: { ...dwellingActivity, routeIndex },
      arrivalActivity: null,
      blockedMs: 0,
    };
  }

  /** Consumes pixel distance across walking waypoints and lands exactly on the route target. */
  private advanceWalkingMotion(motion: WalkingNpcMotion, deltaMs: number): NpcMotionState {
    const activity = advanceActivityPhase(motion.activity, deltaMs);
    let remaining = NPC_WALK_SPEED_PIXELS_PER_SECOND * deltaMs / 1_000;
    let waypointIndex = motion.waypointIndex;
    let x = motion.x;
    let y = motion.y;
    while (remaining > 0 && waypointIndex < motion.waypoints.length) {
      const waypoint = motion.waypoints[waypointIndex]!;
      const deltaX = waypoint.x - x;
      const deltaY = waypoint.y - y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance <= remaining) {
        x = waypoint.x;
        y = waypoint.y;
        remaining -= distance;
        waypointIndex += 1;
        continue;
      }
      x += deltaX / distance * remaining;
      y += deltaY / distance * remaining;
      remaining = 0;
    }
    if (waypointIndex >= motion.waypoints.length) {
      if (motion.continuation) return motion.continuation;
      return {
        kind: "idle",
        target: motion.target,
        activity: activity
          ? { ...activity, dwellRemainingMs: NPC_ACTIVITY_DWELL_MS }
          : motion.arrivalActivity,
      };
    }
    return { ...motion, waypointIndex, x, y, activity, blockedMs: 0 };
  }

  /** Advances one deterministic substep and lets earlier stable identities reserve their accepted positions. */
  private advanceSubstep(deltaMs: number, player?: NpcAvoidancePosition): void {
    const projections = new Map<string, NpcRuntimeSpawn>(
      Array.from(this.motions, ([entityId, motion]) => [entityId, projectMotion(motion)]),
    );
    const orderedMotions = Array.from(this.motions).sort(([leftId], [rightId]) => (
      leftId < rightId ? -1 : leftId > rightId ? 1 : 0
    ));
    for (const [entityId, motion] of orderedMotions) {
      let next = this.advanceMotion(motion, deltaMs);
      const projectedNext = projectMotion(next);
      const worldObstructed = projectedNext.opacity > 0
        && Boolean(this.worldBlocked?.(projectedNext, projectedNext.x, projectedNext.y));
      if (motion.kind === "walking") {
        const candidate = projectedNext;
        const obstacles = avoidanceObstacles(entityId, candidate.regionId, projections, player);
        const collision = this.catalog.requireRegion(candidate.regionId).collision;
        if (worldObstructed || obstacles.some((obstacle) => (
          npcOverlapsObstacle(candidate, obstacle)
          || sharesCollisionTile(candidate, obstacle, collision)
        ))) {
          next = this.blockWalkingMotion(motion, deltaMs, obstacles);
        }
      } else if (worldObstructed) next = motion;
      this.motions.set(entityId, next);
      projections.set(entityId, projectMotion(next));
    }
  }

  /** Waits on one blocked route and performs at most one dynamic replan per reviewed delay interval. */
  private blockWalkingMotion(
    motion: WalkingNpcMotion,
    deltaMs: number,
    obstacles: readonly NpcAvoidanceObstacle[],
  ): WalkingNpcMotion {
    const activity = advanceActivityPhase(motion.activity, deltaMs);
    const blockedMs = motion.blockedMs + deltaMs;
    if (blockedMs < NPC_REPLAN_DELAY_MS) return { ...motion, activity, blockedMs };
    const route = findNpcPath(
      this.catalog.requireRegion(motion.target.regionId).collision,
      { x: motion.x, y: motion.y },
      motion.target,
      obstacles.map(({ x, y }) => ({ x, y })),
    );
    if (!route || route.length < 2) {
      return { ...motion, activity, blockedMs: Number.EPSILON };
    }
    return {
      ...motion,
      waypoints: route,
      waypointIndex: 1,
      activity,
      blockedMs: 0,
    };
  }
}

/** Compares schedule-owned facts, excluding runtime patrol positions so ten-minute updates cannot restart activities. */
function sameScheduleTarget(left: NpcSpawnDefinition, right: NpcSpawnDefinition): boolean {
  return left.regionId === right.regionId && left.x === right.x && left.y === right.y
    && left.interactionType === right.interactionType && left.routine === right.routine;
}

/** Projects one internal motion into the sole shape consumed by rendering, collision and interaction. */
function projectMotion(motion: NpcMotionState): NpcRuntimeSpawn {
  switch (motion.kind) {
    case "idle": return idleProjection(motion.target, motion.activity);
    case "walking": return {
      ...motion.target,
      x: motion.x,
      y: motion.y,
      interactionType: "dialogue",
      opacity: 1,
      motion: motion.blockedMs > 0 ? "waiting" : "walking",
      ...activityProjection(motion.activity),
    };
    case "transfer": return projectTransfer(motion);
  }
}

/** Adds stable idle presentation fields to one schedule-owned target anchor. */
function idleProjection(target: NpcSpawnDefinition, activity: NpcActivityState | null): NpcRuntimeSpawn {
  return {
    ...target,
    opacity: 1,
    motion: "idle",
    ...activityProjection(activity),
  };
}

/** Projects exactly one side of a transfer so the same NPC never occupies two regions at once. */
function projectTransfer(motion: TransferNpcMotion): NpcRuntimeSpawn {
  const halfDuration = NPC_TRANSFER_DURATION_MS / 2;
  if (motion.elapsedMs < halfDuration) {
    return {
      ...motion.source,
      interactionType: "dialogue",
      opacity: clampUnit(1 - motion.elapsedMs / halfDuration),
      motion: "leaving",
      activity: null,
      activityPhase: 0,
    };
  }
  return {
    ...motion.target,
    interactionType: "dialogue",
    opacity: clampUnit((motion.elapsedMs - halfDuration) / halfDuration),
    motion: "arriving",
    activity: null,
    activityPhase: 0,
  };
}

/** Advances one activity's pause-aware two-phase cadence without changing its patrol dwell. */
function advanceActivityPhase(
  activity: NpcActivityState | null,
  deltaMs: number,
): NpcActivityState | null {
  if (!activity) return null;
  return {
    ...activity,
    cycleElapsedMs: (activity.cycleElapsedMs + deltaMs) % (NPC_ACTIVITY_PHASE_MS * 2),
  };
}

/** Projects internal activity timing into a stable semantic kind and two-state presentation phase. */
function activityProjection(activity: NpcActivityState | null): Pick<NpcRuntimeSpawn, "activity" | "activityPhase"> {
  return {
    activity: activity?.kind ?? null,
    activityPhase: activity && activity.cycleElapsedMs >= NPC_ACTIVITY_PHASE_MS ? 1 : 0,
  };
}

/** Builds current same-region player/NPC obstacles while excluding only the moving identity itself. */
function avoidanceObstacles(
  movingEntityId: string,
  regionId: string,
  projections: ReadonlyMap<string, NpcRuntimeSpawn>,
  player?: NpcAvoidancePosition,
): readonly NpcAvoidanceObstacle[] {
  const obstacles: NpcAvoidanceObstacle[] = [];
  if (player?.regionId === regionId) {
    obstacles.push({
      ...player,
      halfWidth: PLAYER_FEET_HALF_WIDTH,
      halfHeight: PLAYER_FEET_HALF_HEIGHT,
    });
  }
  for (const [entityId, npc] of projections) {
    if (entityId === movingEntityId || npc.regionId !== regionId) continue;
    obstacles.push({
      x: npc.x,
      y: npc.y,
      regionId: npc.regionId,
      halfWidth: NPC_FEET_HALF_WIDTH,
      halfHeight: NPC_FEET_HALF_HEIGHT,
    });
  }
  return obstacles;
}

/** Tests one NPC projection against a dynamic player or NPC foot box. */
function npcOverlapsObstacle(npc: NpcRuntimeSpawn, obstacle: NpcAvoidanceObstacle): boolean {
  return npc.regionId === obstacle.regionId
    && worldFeetOverlap(
      npc,
      NPC_FEET_HALF_WIDTH,
      NPC_FEET_HALF_HEIGHT,
      obstacle,
      obstacle.halfWidth,
      obstacle.halfHeight,
    );
}

/** Reports whether two dynamic actors reserve the same Collision tile for coarse route avoidance. */
function sharesCollisionTile(
  npc: NpcRuntimeSpawn,
  obstacle: NpcAvoidanceObstacle,
  collision: CollisionGrid,
): boolean {
  return Math.floor(npc.x / collision.tileWidth) === Math.floor(obstacle.x / collision.tileWidth)
    && Math.floor(npc.y / collision.tileHeight) === Math.floor(obstacle.y / collision.tileHeight);
}

/** Clamps a finite transfer ratio to the closed presentation interval zero through one. */
function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}
