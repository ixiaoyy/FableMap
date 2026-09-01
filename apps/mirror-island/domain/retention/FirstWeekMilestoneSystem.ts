import type { RetentionEventId } from "../dialogue/definitions.ts";
import type { GameState } from "../state/game-state.ts";

export interface FirstWeekMilestone {
  readonly eventId: RetentionEventId;
  readonly unlockDay: 3 | 5 | 7;
  readonly message: string;
}

export type FirstWeekMilestoneResult =
  | "milestone-acknowledged"
  | "milestone-already-seen"
  | "milestone-not-yet-available"
  | "milestone-unsupported";

export const FIRST_WEEK_MILESTONES: readonly FirstWeekMilestone[] = [
  {
    eventId: "day-3-watering-intro",
    unlockDay: 3,
    message: "昊天提起：水壶可以升级，一次浇三格。去小镇或铁匠铺找他。",
  },
  {
    eventId: "day-5-backpack-intro",
    unlockDay: 5,
    message: "华强添了背包扩容服务：1500g，可从 24 格扩到 32 格。",
  },
  {
    eventId: "day-7-mirror-teaser",
    unlockDay: 7,
    message: "湖岸传来奇怪的回声。那块指向东方的石标，正映出不属于这里的光。",
  },
];

export class FirstWeekMilestoneSystem {
  /** Records one unlocked first-week presentation exactly once without controlling feature availability. */
  acknowledge(state: GameState, eventId: RetentionEventId): FirstWeekMilestoneResult {
    const milestone = getFirstWeekMilestone(eventId);
    if (!milestone) return "milestone-unsupported";
    if (state.day < milestone.unlockDay) return "milestone-not-yet-available";
    if (state.seenEventIds.includes(eventId)) return "milestone-already-seen";
    state.seenEventIds.push(eventId);
    return "milestone-acknowledged";
  }
}

/** Returns the newest milestone unlocked by one absolute day, without consulting presentation history. */
export function latestFirstWeekMilestoneAt(day: number): FirstWeekMilestone | null {
  if (!Number.isSafeInteger(day) || day < 1) throw new Error("First-week milestone day is invalid.");
  return [...FIRST_WEEK_MILESTONES].reverse().find(({ unlockDay }) => unlockDay <= day) ?? null;
}

/** Resolves one closed first-week milestone identity without accepting heart-event IDs. */
export function getFirstWeekMilestone(eventId: RetentionEventId): FirstWeekMilestone | null {
  return FIRST_WEEK_MILESTONES.find((milestone) => milestone.eventId === eventId) ?? null;
}
