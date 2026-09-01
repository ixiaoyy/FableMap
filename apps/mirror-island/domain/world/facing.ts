import type { WorldPoint } from "./regions.ts";

export type Facing = "down" | "up" | "left" | "right";

/** Returns the unit world vector for one shared player-facing direction. */
export function facingVector(facing: Facing): WorldPoint {
  switch (facing) {
    case "down": return { x: 0, y: 1 };
    case "up": return { x: 0, y: -1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}
