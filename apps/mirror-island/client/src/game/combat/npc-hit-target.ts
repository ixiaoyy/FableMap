import type { WorldPoint } from "../../../../domain/world/regions.ts";

export type Facing = "down" | "up" | "left" | "right";

export interface NpcHitCandidate extends WorldPoint {
  readonly entityId: string;
}

const MAX_FORWARD_DISTANCE = 28;
const MAX_LATERAL_DISTANCE = 10;

/** Returns the unit world vector for one player-facing direction. */
export function facingVector(facing: Facing): WorldPoint {
  switch (facing) {
    case "down": return { x: 0, y: 1 };
    case "up": return { x: 0, y: -1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}

/** Selects the deterministic nearest NPC inside the fixed forward punch corridor. */
export function selectNpcHitTarget<T extends NpcHitCandidate>(
  player: WorldPoint,
  facing: Facing,
  candidates: readonly T[],
): T | null {
  const direction = facingVector(facing);
  return candidates
    .map((candidate) => {
      const deltaX = candidate.x - player.x;
      const deltaY = candidate.y - player.y;
      return {
        candidate,
        forward: deltaX * direction.x + deltaY * direction.y,
        lateral: Math.abs(deltaX * direction.y - deltaY * direction.x),
        distanceSquared: deltaX * deltaX + deltaY * deltaY,
      };
    })
    .filter(({ forward, lateral }) => (
      forward >= 0
      && forward <= MAX_FORWARD_DISTANCE
      && lateral <= MAX_LATERAL_DISTANCE
    ))
    .sort((left, right) => (
      left.distanceSquared - right.distanceSquared
      || compareEntityIds(left.candidate.entityId, right.candidate.entityId)
    ))[0]?.candidate ?? null;
}

/** Compares stable entity IDs without locale-dependent collation. */
function compareEntityIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
