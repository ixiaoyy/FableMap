import type { WorldPoint } from "./regions.ts";

export type Facing = "down" | "up" | "left" | "right";

/** Resolves a motion/aim vector to its dominant axis, keeping fallback at rest and horizontal on ties. */
export function facingFromVector(x: number, y: number, fallback: Facing): Facing {
  if (Math.abs(x) >= Math.abs(y) && x !== 0) return x < 0 ? "left" : "right";
  if (y !== 0) return y < 0 ? "up" : "down";
  return fallback;
}

/** Returns the unit world vector for one shared player-facing direction. */
export function facingVector(facing: Facing): WorldPoint {
  switch (facing) {
    case "down": return { x: 0, y: 1 };
    case "up": return { x: 0, y: -1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}
