import type { DailyRequestSubmission } from "../requests/DailyRequestSystem.ts";
import { getDailyRequest } from "../requests/definitions.ts";
import { relationshipStageAt, isRelationshipStageAfter } from "../social/relationship-stage.ts";
import type { GameState } from "../state/game-state.ts";
import { schedulePhaseAt } from "../time/game-time.ts";
import type { NpcSpawnDefinition } from "../world/regions.ts";
import {
  activityDialogueId,
  eventDialogueId,
  getNpcDialogueProfile,
  personalityDialogueId,
  relationshipDialogueId,
  requestDialogueId,
  type NpcDialogueState,
  type RetentionEventId,
} from "./definitions.ts";

const DIALOGUE_HISTORY_DAYS = 3;
const DIALOGUE_HISTORY_LIMIT = 12;

export interface NpcDialogueSelection {
  readonly dialogueId: string;
  readonly baseDialogueId: string;
}

export class NpcDialogueSystem {
  /** Selects and records one deterministic context dialogue without storing presentation text. */
  select(
    state: GameState,
    npc: NpcSpawnDefinition,
    submission: DailyRequestSubmission,
  ): NpcDialogueSelection {
    const profile = getNpcDialogueProfile(npc.npcId);
    const memory = state.npcDialogue[npc.npcId];
    const friendship = state.friendships[npc.npcId];
    if (!profile || profile.baseDialogueId !== npc.dialogueId || !memory || !friendship) {
      throw new Error(`NPC dialogue identity is inconsistent: ${npc.npcId}.`);
    }
    this.prune(memory, state.day);
    const groups: string[][] = [];
    const request = getDailyRequest(state.dailyRequest?.requestId);
    if (request?.npcId === npc.npcId) {
      if (state.dailyRequest?.completed) groups.push([requestDialogueId(request.requestId, "thanks")]);
      else if (submission.result === "request-missing-items") {
        groups.push([requestDialogueId(request.requestId, "missing")]);
      }
    }
    const eventId = twoHeartEventId(npc, friendship.points);
    if (eventId && !state.seenEventIds.includes(eventId)) groups.push([eventDialogueId(eventId)]);
    const stage = relationshipStageAt(friendship.points);
    if (isRelationshipStageAfter(stage, memory.acknowledgedStage)) {
      groups.push([relationshipDialogueId(npc.npcId, stage === "friendly" ? "friendly" : "familiar")]);
    }
    const phase = schedulePhaseAt(state.minuteOfDay);
    groups.push([
      activityDialogueId(npc.npcId, phase, 0),
      activityDialogueId(npc.npcId, phase, 1),
    ]);
    groups.push([
      personalityDialogueId(npc.npcId, 0),
      personalityDialogueId(npc.npcId, 1),
      personalityDialogueId(npc.npcId, 2),
    ]);
    const recentIds = new Set(memory.recent.map(({ dialogueId }) => dialogueId));
    const availableSelection = groups
      .map((group) => deterministicAvailable(group, recentIds, state.day + memory.recent.length))
      .find((dialogueId) => dialogueId !== null);
    const selected = availableSelection ?? groups.flat()[0]!;
    if (availableSelection) memory.recent.push({ dialogueId: selected, day: state.day });
    this.prune(memory, state.day);
    if (selected.startsWith("relationship:")) memory.acknowledgedStage = stage;
    if (eventId && selected === eventDialogueId(eventId)) state.seenEventIds.push(eventId);
    return { dialogueId: selected, baseDialogueId: profile.baseDialogueId };
  }

  /** Prunes one NPC dialogue memory to the recent three-day, twelve-entry persisted bound. */
  private prune(memory: NpcDialogueState, currentDay: number): void {
    memory.recent = memory.recent
      .filter(({ day }) => day >= currentDay - DIALOGUE_HISTORY_DAYS && day <= currentDay)
      .slice(-DIALOGUE_HISTORY_LIMIT);
  }
}

/** Selects one deterministic unused candidate or null when the complete priority group is recent. */
function deterministicAvailable(
  candidates: readonly string[],
  recentIds: ReadonlySet<string>,
  seed: number,
): string | null {
  const available = candidates.filter((candidate) => !recentIds.has(candidate));
  return available.length > 0 ? available[Math.abs(seed) % available.length]! : null;
}

/** Returns the supported once-only two-heart event for one eligible NPC identity. */
function twoHeartEventId(npc: NpcSpawnDefinition, points: number): RetentionEventId | null {
  if (relationshipStageAt(points) !== "friendly") return null;
  if (npc.npcId === "seed-keeper" && npc.regionId === "seed-shop") return "seed-keeper-two-heart";
  if (npc.npcId === "town-blacksmith" && (npc.regionId === "town" || npc.regionId === "blacksmith")) {
    return "blacksmith-two-heart";
  }
  return null;
}
