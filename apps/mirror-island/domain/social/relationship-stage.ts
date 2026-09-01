import { FRIENDSHIP_POINTS_PER_HEART } from "./definitions.ts";

export const RELATIONSHIP_STAGES = ["stranger", "familiar", "friendly"] as const;
export type RelationshipStage = typeof RELATIONSHIP_STAGES[number];

/** Projects internal friendship points into the three currently content-backed relationship stages. */
export function relationshipStageAt(points: number): RelationshipStage {
  if (!Number.isFinite(points) || points < 0) throw new Error("Relationship points are invalid.");
  if (points >= FRIENDSHIP_POINTS_PER_HEART * 2) return "friendly";
  if (points >= FRIENDSHIP_POINTS_PER_HEART) return "familiar";
  return "stranger";
}

/** Narrows one unknown persisted value to a reviewed relationship stage. */
export function decodeRelationshipStage(value: unknown): RelationshipStage {
  if (typeof value === "string" && RELATIONSHIP_STAGES.includes(value as RelationshipStage)) {
    return value as RelationshipStage;
  }
  throw new Error("Relationship stage is invalid.");
}

/** Returns whether one stage is strictly newer than an already acknowledged stage. */
export function isRelationshipStageAfter(current: RelationshipStage, acknowledged: RelationshipStage): boolean {
  return RELATIONSHIP_STAGES.indexOf(current) > RELATIONSHIP_STAGES.indexOf(acknowledged);
}
