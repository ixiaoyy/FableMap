import type { NpcSchedulePhase } from "../time/game-time.ts";
import { DAILY_REQUESTS } from "../requests/definitions.ts";
import type { RelationshipStage } from "../social/relationship-stage.ts";

export interface DialogueMemoryEntry {
  dialogueId: string;
  day: number;
}

export interface NpcDialogueState {
  recent: DialogueMemoryEntry[];
  acknowledgedStage: RelationshipStage;
}

export interface NpcDialogueProfile {
  readonly npcId: string;
  readonly baseDialogueId: string;
}

export const NPC_DIALOGUE_PROFILES: readonly NpcDialogueProfile[] = [
  profile("seed-keeper", "seed-keeper-welcome"),
  profile("town-blacksmith", "blacksmith-intro"),
  profile("town-resident-01", "town-resident-pink-tree"),
  profile("town-resident-mozi", "resident-mozi-home"),
  profile("town-resident-haonan", "resident-haonan-home"),
  profile("town-resident-alan", "resident-alan-home"),
  profile("town-resident-haomeili", "resident-haomeili-home"),
  profile("town-resident-xiangzi", "resident-xiangzi-home"),
];

export const RETENTION_EVENT_IDS = [
  "seed-keeper-two-heart",
  "blacksmith-two-heart",
  "day-3-watering-intro",
  "day-5-backpack-intro",
  "day-7-mirror-teaser",
] as const;

export type RetentionEventId = typeof RETENTION_EVENT_IDS[number];

/** Creates the persisted dialogue default for one catalog-owned NPC identity. */
export function createNpcDialogueState(): NpcDialogueState {
  return { recent: [], acknowledgedStage: "stranger" };
}

/** Returns one NPC dialogue profile by stable world identity. */
export function getNpcDialogueProfile(npcId: string): NpcDialogueProfile | null {
  return NPC_DIALOGUE_PROFILES.find((profileDefinition) => profileDefinition.npcId === npcId) ?? null;
}

/** Creates one stable activity-variant ID without storing dialogue text in save state. */
export function activityDialogueId(npcId: string, phase: NpcSchedulePhase, variant: 0 | 1): string {
  return `activity:${npcId}:${phase}:${variant}`;
}

/** Creates one stable personality-variant ID from the fixed three-entry pool. */
export function personalityDialogueId(npcId: string, variant: 0 | 1 | 2): string {
  return `personality:${npcId}:${variant}`;
}

/** Creates one stable relationship-stage dialogue ID. */
export function relationshipDialogueId(npcId: string, stage: Exclude<RelationshipStage, "stranger">): string {
  return `relationship:${npcId}:${stage}`;
}

/** Creates one request-state dialogue ID for the target NPC. */
export function requestDialogueId(requestId: string, status: "missing" | "thanks"): string {
  return `request:${requestId}:${status}`;
}

/** Creates one stable two-heart event dialogue ID for the supported NPC identity. */
export function eventDialogueId(eventId: RetentionEventId): string {
  return `event:${eventId}`;
}

/** Reports whether one persisted dialogue-selection ID belongs to the closed retention catalog. */
export function isKnownDialogueSelectionId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (NPC_DIALOGUE_PROFILES.some(({ npcId }) => (
    (["morning", "day", "evening", "night"] as const).some((phase) => (
      value === activityDialogueId(npcId, phase, 0) || value === activityDialogueId(npcId, phase, 1)
    ))
    || value === personalityDialogueId(npcId, 0)
    || value === personalityDialogueId(npcId, 1)
    || value === personalityDialogueId(npcId, 2)
    || value === relationshipDialogueId(npcId, "familiar")
    || value === relationshipDialogueId(npcId, "friendly")
  ))) return true;
  if (DAILY_REQUESTS.some(({ requestId }) => (
    value === requestDialogueId(requestId, "missing") || value === requestDialogueId(requestId, "thanks")
  ))) return true;
  return RETENTION_EVENT_IDS.some((eventId) => value === eventDialogueId(eventId));
}

/** Reports whether one persisted once-only event ID belongs to the closed retention catalog. */
export function isRetentionEventId(value: unknown): value is RetentionEventId {
  return typeof value === "string" && RETENTION_EVENT_IDS.includes(value as RetentionEventId);
}

/** Builds one immutable NPC-to-dialogue profile entry. */
function profile(npcId: string, baseDialogueId: string): NpcDialogueProfile {
  return { npcId, baseDialogueId };
}
