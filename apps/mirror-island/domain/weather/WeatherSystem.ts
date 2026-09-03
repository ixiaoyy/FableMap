import type { GameState } from "../state/game-state.ts";
import type { WeatherKind, WeatherState } from "./definitions.ts";

export class WeatherSystem {
  /** Creates the first saved forecast from one validated world seed and absolute day. */
  create(worldSeed: number, day: number): WeatherState {
    validateWeatherInputs(worldSeed, day);
    return {
      day,
      current: weatherAt(worldSeed, day),
      next: weatherAt(worldSeed, day + 1),
    };
  }

  /** Advances today's saved forecast exactly once after the GameSession increments the day. */
  settleDay(state: GameState): void {
    if (state.weather.day !== state.day - 1) throw new Error("Weather state is inconsistent before day settlement.");
    state.weather = {
      day: state.day,
      current: state.weather.next,
      next: weatherAt(state.worldSeed, state.day + 1),
    };
  }
}

/** Selects one deterministic Spring weather kind without runtime randomness or hidden rerolls. */
export function weatherAt(worldSeed: number, day: number): WeatherKind {
  validateWeatherInputs(worldSeed, day);
  if (day === 1) return "sunny";
  if (day === 3) return "rain";
  const roll = stableHash(worldSeed, day, "weather") % 100;
  if (roll < 20) return "rain";
  if (roll < 38) return "wind";
  return "sunny";
}

/** Produces one unsigned deterministic hash from a world seed, day and stable namespace. */
export function stableHash(worldSeed: number, day: number, namespace: string): number {
  validateWeatherInputs(worldSeed, day);
  let hash = (2166136261 ^ worldSeed ^ day) >>> 0;
  for (const character of namespace) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return hash >>> 0;
}

/** Requires the seed/day pair used by all deterministic Spring content selectors. */
function validateWeatherInputs(worldSeed: number, day: number): void {
  if (!Number.isSafeInteger(worldSeed) || worldSeed < 0 || worldSeed > 0xffffffff) {
    throw new Error("World seed is invalid.");
  }
  if (!Number.isSafeInteger(day) || day < 1 || day >= Number.MAX_SAFE_INTEGER) {
    throw new Error("Weather day is invalid.");
  }
}
