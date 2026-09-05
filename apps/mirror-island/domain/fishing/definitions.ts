import { ITEM_ID, type ItemId } from "../items/definitions.ts";
import type { WeatherKind } from "../weather/definitions.ts";

export const FISHING_PHASES = ["idle", "casting", "waiting", "reeling", "caught", "escaped", "inventory-full"] as const;
export type FishingPhase = typeof FISHING_PHASES[number];
export type FishingSaveStatus = "not-needed" | "saving" | "saved" | "failed";

export interface FishDefinition {
  readonly itemId: ItemId;
  readonly minMinute: number;
  readonly maxMinute: number;
  readonly weather?: WeatherKind;
  readonly minCast: number;
  readonly pull: number;
}

export interface FishingSnapshot {
  readonly phase: FishingPhase;
  readonly zoneId: string | null;
  readonly castPower: number;
  readonly tension: number;
  readonly progress: number;
  readonly bite: boolean;
  readonly resultItemId: ItemId | null;
  readonly failureReason: "missed-bite" | "line-broke" | "slack-line" | null;
  readonly saveStatus: FishingSaveStatus;
}

export const FISHING_SAFE_TENSION = { min: 22, max: 78 } as const;

export const FISH_DEFINITIONS: readonly FishDefinition[] = [
  { itemId: ITEM_ID.lakeCarp, minMinute: 6 * 60, maxMinute: 26 * 60, minCast: 0, pull: 8 },
  { itemId: ITEM_ID.silverMinnow, minMinute: 6 * 60, maxMinute: 12 * 60, minCast: 15, pull: 12 },
  { itemId: ITEM_ID.rainLoach, minMinute: 6 * 60, maxMinute: 26 * 60, weather: "rain", minCast: 20, pull: 14 },
  { itemId: ITEM_ID.windDace, minMinute: 9 * 60, maxMinute: 20 * 60, weather: "wind", minCast: 35, pull: 17 },
  { itemId: ITEM_ID.duskPerch, minMinute: 17 * 60, maxMinute: 26 * 60, minCast: 45, pull: 20 },
  { itemId: ITEM_ID.jadeBream, minMinute: 6 * 60, maxMinute: 26 * 60, minCast: 75, pull: 24 },
];

export const IDLE_FISHING_SNAPSHOT: FishingSnapshot = {
  phase: "idle",
  zoneId: null,
  castPower: 0,
  tension: 50,
  progress: 0,
  bite: false,
  resultItemId: null,
  failureReason: null,
  saveStatus: "not-needed",
};

/** Reports which fishing phases pause the game clock while focus stays on retrieval or its result. */
export function fishingPausesClock(phase: FishingPhase): boolean {
  return phase === "reeling" || phase === "caught" || phase === "escaped" || phase === "inventory-full";
}

/** Returns every Spring fish eligible for the supplied saved time, weather and cast distance. */
export function eligibleFish(
  minuteOfDay: number,
  weather: WeatherKind,
  castPower: number,
): readonly FishDefinition[] {
  return FISH_DEFINITIONS.filter((fish) => (
    minuteOfDay >= fish.minMinute
    && minuteOfDay < fish.maxMinute
    && (!fish.weather || fish.weather === weather)
    && castPower >= fish.minCast
  ));
}
