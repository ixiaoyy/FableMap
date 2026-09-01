export const DAYS_PER_SEASON = 28;
export const SEASONS_PER_YEAR = 4;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS_PER_YEAR;

export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Season = typeof SEASONS[number];
export type Weekday = typeof WEEKDAYS[number];

export interface GameCalendarDate {
  readonly absoluteDay: number;
  readonly year: number;
  readonly season: Season;
  readonly dayOfSeason: number;
  readonly weekday: Weekday;
}

export interface PlayableCalendarDate {
  readonly absoluteDay: number;
  readonly season: "spring";
  readonly weekday: Weekday;
}

/** Projects one positive absolute game day into the fixed four-season, 28-day calendar. */
export function calendarAt(absoluteDay: number): GameCalendarDate {
  if (!Number.isSafeInteger(absoluteDay) || absoluteDay < 1) {
    throw new Error("Calendar day is invalid.");
  }
  const zeroBasedDay = absoluteDay - 1;
  return {
    absoluteDay,
    year: Math.floor(zeroBasedDay / DAYS_PER_YEAR) + 1,
    season: SEASONS[Math.floor(zeroBasedDay / DAYS_PER_SEASON) % SEASONS_PER_YEAR]!,
    dayOfSeason: zeroBasedDay % DAYS_PER_SEASON + 1,
    weekday: WEEKDAYS[zeroBasedDay % WEEKDAYS.length]!,
  };
}

/** Projects the current pre-Summer game into an unbounded Day-N spring-content calendar. */
export function playableCalendarAt(absoluteDay: number): PlayableCalendarDate {
  const date = calendarAt(absoluteDay);
  return { absoluteDay, season: "spring", weekday: date.weekday };
}

/** Reports whether the current content slice supports sleeping into the following game day. */
export function canAdvancePlayableCalendar(absoluteDay: number): boolean {
  return Number.isSafeInteger(absoluteDay) && absoluteDay >= 1 && absoluteDay < Number.MAX_SAFE_INTEGER;
}
