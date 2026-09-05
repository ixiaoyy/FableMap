import type { RetentionEventId } from "../dialogue/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import { BACKPACK_UPGRADE_GOLD, SECOND_BACKPACK_UPGRADE_GOLD } from "../progression/definitions.ts";

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
    message: `别忘了种子店柜台旁的背包陈列：${BACKPACK_UPGRADE_GOLD}g 升到 24 格，再花 ${SECOND_BACKPACK_UPGRADE_GOLD}g 升到 36 格。`,
  },
  {
    eventId: "day-7-fishing-intro",
    unlockDay: 7,
    message: "从今天起可以向祥子领取竹制鱼竿，再到湖岸旧码头试钓。雨天可以去东岸民宅找他。",
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
