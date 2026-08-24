import type { GameState } from "../state/game-state.ts";

export const WORLD_WIDTH_PIXELS = 512;
export const WORLD_HEIGHT_PIXELS = 512;
export const PLAYER_SPEED_PIXELS_PER_SECOND = 96;

/** Applies bounded digital movement for one elapsed frame and returns whether position changed. */
export function movePlayer(
  state: GameState,
  xAxis: -1 | 0 | 1,
  yAxis: -1 | 0 | 1,
  deltaMs: number,
): boolean {
  if ((xAxis === 0 && yAxis === 0) || !Number.isFinite(deltaMs) || deltaMs <= 0) return false;
  const boundedDeltaMs = Math.min(deltaMs, 100);
  const magnitude = Math.hypot(xAxis, yAxis) || 1;
  const distance = PLAYER_SPEED_PIXELS_PER_SECOND * (boundedDeltaMs / 1000);
  const previousX = state.player.x;
  const previousY = state.player.y;
  state.player.x = clamp(previousX + (xAxis / magnitude) * distance, 0, WORLD_WIDTH_PIXELS);
  state.player.y = clamp(previousY + (yAxis / magnitude) * distance, 0, WORLD_HEIGHT_PIXELS);
  return state.player.x !== previousX || state.player.y !== previousY;
}

/** Clamps one finite numeric value to an inclusive local-world interval. */
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
