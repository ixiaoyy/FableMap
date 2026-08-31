import type { GameState } from "../state/game-state.ts";
import {
  PLAYER_FEET_HALF_HEIGHT,
  PLAYER_FEET_HALF_WIDTH,
  type NpcSpawnDefinition,
  type WorldCatalog,
} from "./regions.ts";

export const PLAYER_SPEED_PIXELS_PER_SECOND = 96;

/** Applies bounded digital movement for one elapsed frame and returns whether position changed. */
export function movePlayer(
  state: GameState,
  catalog: WorldCatalog,
  xAxis: -1 | 0 | 1,
  yAxis: -1 | 0 | 1,
  deltaMs: number,
  activeNpcs: readonly NpcSpawnDefinition[],
): boolean {
  if ((xAxis === 0 && yAxis === 0) || !Number.isFinite(deltaMs) || deltaMs <= 0) return false;
  const boundedDeltaMs = Math.min(deltaMs, 100);
  const magnitude = Math.hypot(xAxis, yAxis) || 1;
  const distance = PLAYER_SPEED_PIXELS_PER_SECOND * (boundedDeltaMs / 1000);
  const previousX = state.player.x;
  const previousY = state.player.y;
  const region = catalog.requireRegion(state.player.regionId);
  const nextX = clamp(
    previousX + (xAxis / magnitude) * distance,
    PLAYER_FEET_HALF_WIDTH,
    region.widthPixels - PLAYER_FEET_HALF_WIDTH,
  );
  if (!catalog.isBlocked(
    state.player.regionId,
    nextX,
    previousY,
    PLAYER_FEET_HALF_WIDTH,
    PLAYER_FEET_HALF_HEIGHT,
    activeNpcs,
  )) state.player.x = nextX;
  const nextY = clamp(
    previousY + (yAxis / magnitude) * distance,
    PLAYER_FEET_HALF_HEIGHT,
    region.heightPixels - PLAYER_FEET_HALF_HEIGHT,
  );
  if (!catalog.isBlocked(
    state.player.regionId,
    state.player.x,
    nextY,
    PLAYER_FEET_HALF_WIDTH,
    PLAYER_FEET_HALF_HEIGHT,
    activeNpcs,
  )) state.player.y = nextY;
  return state.player.x !== previousX || state.player.y !== previousY;
}

/** Clamps one finite numeric value to an inclusive local-world interval. */
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
