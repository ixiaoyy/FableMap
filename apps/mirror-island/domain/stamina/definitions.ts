import { decodeGameMinute } from "../time/game-time.ts";

export const MAX_STAMINA = 100;

export const STAMINA_COST = {
  hoe: 2,
  wateringPerTile: 1,
  axe: 2,
  pickaxe: 2,
  fishingCast: 6,
} as const;

const LATE_SLEEP_RECOVERY_PERCENT = [100, 98, 95, 93, 90, 88, 75, 73, 70, 68, 65, 63, 50] as const;

/** Validates one persisted stamina value against the fixed Spring-v1 maximum. */
export function decodeStamina(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > MAX_STAMINA) {
    throw new Error("Player stamina is invalid.");
  }
  return Number(value);
}

/** Returns the deterministic next-morning stamina for one validated bedtime. */
export function staminaAfterSleep(minuteOfDay: number): number {
  const minute = decodeGameMinute(minuteOfDay);
  if (minute <= 24 * 60) return MAX_STAMINA;
  const lateStep = Math.min(12, Math.ceil((minute - 24 * 60) / 10));
  return Math.max(1, Math.round(MAX_STAMINA * LATE_SLEEP_RECOVERY_PERCENT[lateStep]! / 100));
}
