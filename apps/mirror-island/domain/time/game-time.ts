export const DAY_START_MINUTE = 6 * 60;
export const MIDNIGHT_MINUTE = 24 * 60;
export const DAY_END_MINUTE = 26 * 60;
export const GAME_TIME_STEP_MINUTES = 10;
export const REAL_MILLISECONDS_PER_TIME_STEP = 8_000;
export const MAX_CLOCK_TICK_DELTA_MS = 1_000;

export type NpcSchedulePhase = "morning" | "day" | "evening" | "night";

/** Validates one persisted minute inside the closed 06:00–02:00-next-day ten-minute clock. */
export function decodeGameMinute(value: unknown, message = "Game time is invalid."): number {
  if (
    !Number.isSafeInteger(value)
    || Number(value) < DAY_START_MINUTE
    || Number(value) > DAY_END_MINUTE
    || Number(value) % GAME_TIME_STEP_MINUTES !== 0
  ) {
    throw new Error(message);
  }
  return Number(value);
}

/** Resolves the four fixed resident schedule phases from one validated game minute. */
export function schedulePhaseAt(minuteOfDay: number): NpcSchedulePhase {
  const minute = decodeGameMinute(minuteOfDay);
  if (minute < 9 * 60) return "morning";
  if (minute < 17 * 60) return "day";
  if (minute < 21 * 60) return "evening";
  return "night";
}

/** Advances the ten-minute clock once and freezes at 02:00 for GameSession settlement. */
export function advanceGameMinute(minuteOfDay: number): number {
  return Math.min(DAY_END_MINUTE, decodeGameMinute(minuteOfDay) + GAME_TIME_STEP_MINUTES);
}

/** Formats one validated game minute as the zero-padded HUD label HH:MM. */
export function formatGameMinute(minuteOfDay: number): string {
  const minute = decodeGameMinute(minuteOfDay);
  const hours = Math.floor(minute / 60) % 24;
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
