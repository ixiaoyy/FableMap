import { decodeGameMinute } from "../../../../domain/time/game-time.ts";
import { isOutdoorRegion } from "../world/region-environment.ts";

export type DaylightPhase = "dawn" | "day" | "dusk" | "night";
export type DaylightEnvironment = "outdoor" | "indoor";

export interface DaylightVisual {
  readonly phase: DaylightPhase;
  readonly environment: DaylightEnvironment;
  readonly color: `#${string}`;
  readonly opacity: number;
}

interface DaylightKeyframe {
  readonly minute: number;
  readonly color: `#${string}`;
  readonly opacity: number;
}

const OUTDOOR_KEYFRAMES: readonly DaylightKeyframe[] = [
  { minute: 360, color: "#9b7185", opacity: 0.16 },
  { minute: 420, color: "#ffffff", opacity: 0 },
  { minute: 900, color: "#ffffff", opacity: 0 },
  { minute: 960, color: "#fff1d6", opacity: 0.02 },
  { minute: 1_020, color: "#efb36f", opacity: 0.08 },
  { minute: 1_080, color: "#d68a6d", opacity: 0.14 },
  { minute: 1_200, color: "#766f91", opacity: 0.28 },
  { minute: 1_260, color: "#4d5f87", opacity: 0.36 },
  { minute: 1_440, color: "#2d3d66", opacity: 0.44 },
];

const INDOOR_KEYFRAMES: readonly DaylightKeyframe[] = [
  { minute: 360, color: "#ad8878", opacity: 0.05 },
  { minute: 420, color: "#ffffff", opacity: 0 },
  { minute: 960, color: "#fff6e9", opacity: 0 },
  { minute: 1_020, color: "#d8b28f", opacity: 0.02 },
  { minute: 1_080, color: "#b88c78", opacity: 0.04 },
  { minute: 1_200, color: "#817180", opacity: 0.07 },
  { minute: 1_260, color: "#696277", opacity: 0.09 },
  { minute: 1_440, color: "#585366", opacity: 0.12 },
];

/** Projects one validated game minute and region into the client-only atmospheric overlay contract. */
export function daylightVisualAt(minuteOfDay: number, regionId: string): DaylightVisual {
  const minute = decodeGameMinute(minuteOfDay);
  const environment: DaylightEnvironment = isOutdoorRegion(regionId) ? "outdoor" : "indoor";
  const keyframes = environment === "outdoor" ? OUTDOOR_KEYFRAMES : INDOOR_KEYFRAMES;
  const visual = interpolateKeyframes(keyframes, minute);
  return {
    phase: daylightPhaseAt(minute),
    environment,
    color: visual.color,
    opacity: visual.opacity,
  };
}

/** Resolves the four user-facing daylight phases from the existing 06:00–24:00 clock. */
function daylightPhaseAt(minuteOfDay: number): DaylightPhase {
  if (minuteOfDay < 420) return "dawn";
  if (minuteOfDay < 1_020) return "day";
  if (minuteOfDay < 1_260) return "dusk";
  return "night";
}

/** Interpolates color and opacity between the two keyframes surrounding one valid minute. */
function interpolateKeyframes(
  keyframes: readonly DaylightKeyframe[],
  minuteOfDay: number,
): Pick<DaylightVisual, "color" | "opacity"> {
  const upperIndex = keyframes.findIndex(({ minute }) => minute >= minuteOfDay);
  const upper = keyframes[upperIndex < 0 ? keyframes.length - 1 : upperIndex]!;
  const lower = keyframes[Math.max(0, upperIndex - 1)] ?? upper;
  if (lower.minute === upper.minute) return { color: upper.color, opacity: upper.opacity };
  const progress = (minuteOfDay - lower.minute) / (upper.minute - lower.minute);
  return {
    color: interpolateHexColor(lower.color, upper.color, progress),
    opacity: lower.opacity + (upper.opacity - lower.opacity) * progress,
  };
}

/** Interpolates two six-digit hex colors in sRGB for a short atmospheric transition. */
function interpolateHexColor(
  from: `#${string}`,
  to: `#${string}`,
  progress: number,
): `#${string}` {
  const fromValue = Number.parseInt(from.slice(1), 16);
  const toValue = Number.parseInt(to.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => {
    const start = (fromValue >> shift) & 0xff;
    const end = (toValue >> shift) & 0xff;
    return Math.round(start + (end - start) * progress);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
