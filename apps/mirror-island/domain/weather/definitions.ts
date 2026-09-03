export const WEATHER_KINDS = ["sunny", "rain", "wind"] as const;
export type WeatherKind = typeof WEATHER_KINDS[number];

export interface WeatherState {
  day: number;
  current: WeatherKind;
  next: WeatherKind;
}

/** Narrows an unknown weather value to the Spring-v1 closed weather catalog. */
export function decodeWeatherKind(value: unknown): WeatherKind {
  if (typeof value === "string" && WEATHER_KINDS.includes(value as WeatherKind)) {
    return value as WeatherKind;
  }
  throw new Error("Weather kind is invalid.");
}

/** Validates one persisted current/next forecast against its owning absolute day. */
export function decodeWeatherState(value: unknown, currentDay: number): WeatherState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Weather state is invalid.");
  }
  const weather = value as Record<string, unknown>;
  if (weather.day !== currentDay) throw new Error("Weather day is inconsistent.");
  return {
    day: currentDay,
    current: decodeWeatherKind(weather.current),
    next: decodeWeatherKind(weather.next),
  };
}
