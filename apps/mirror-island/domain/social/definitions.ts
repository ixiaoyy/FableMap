export const FRIENDSHIP_POINTS_PER_HEART = 250;
export const FRIENDSHIP_MAX_POINTS = 2_500;
export const DAILY_TALK_POINTS = 20;
export const DAILY_MISSED_TALK_DECAY = 2;

export interface FriendshipState {
  readonly npcId: string;
  points: number;
  lastTalkedDay: number;
}

/** Creates one zero-point friendship record for a catalog-owned NPC identity. */
export function createFriendshipState(npcId: string): FriendshipState {
  return { npcId, points: 0, lastTalkedDay: 0 };
}
