import type { GameState } from "../state/game-state.ts";
import {
  DAILY_MISSED_TALK_DECAY,
  DAILY_TALK_POINTS,
  FRIENDSHIP_MAX_POINTS,
} from "./definitions.ts";

export type TalkFriendshipResult = "recorded" | "already-counted" | "missing-friendship";

export class FriendshipSystem {
  /** Records one valid daily conversation and applies the capped twenty-point gain exactly once. */
  talk(state: GameState, npcId: string): TalkFriendshipResult {
    const friendship = state.friendships[npcId];
    if (!friendship) return "missing-friendship";
    if (friendship.lastTalkedDay === state.day) return "already-counted";
    friendship.points = Math.min(FRIENDSHIP_MAX_POINTS, friendship.points + DAILY_TALK_POINTS);
    friendship.lastTalkedDay = state.day;
    return "recorded";
  }

  /** Applies one pre-increment daily decay to missed, non-zero and non-maxed resident friendships. */
  settleDay(state: GameState): boolean {
    let changed = false;
    for (const friendship of Object.values(state.friendships)) {
      if (
        friendship.lastTalkedDay === state.day
        || friendship.points === 0
        || friendship.points === FRIENDSHIP_MAX_POINTS
      ) continue;
      friendship.points = Math.max(0, friendship.points - DAILY_MISSED_TALK_DECAY);
      changed = true;
    }
    return changed;
  }
}
