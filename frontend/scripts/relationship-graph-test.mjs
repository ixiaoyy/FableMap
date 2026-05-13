import assert from "node:assert/strict"

import {
  createRelationshipEdgeDraftSeed,
  isCrossOwnerRelationshipPerspective,
  normalizeRelationshipBehaviorType,
  normalizeRelationshipEdgeDraft,
  normalizeRelationshipEdgeStatus,
  normalizeRelationshipGovernanceMode,
  normalizeRelationshipStrengthPreset,
} from "../app/lib/relationship-graph.js"

assert.deepEqual([
  normalizeRelationshipBehaviorType("friendly"),
  normalizeRelationshipBehaviorType("mystery-freeform"),
  normalizeRelationshipStrengthPreset("strong"),
  normalizeRelationshipStrengthPreset("ultra"),
  normalizeRelationshipGovernanceMode("delegated_ai"),
  normalizeRelationshipGovernanceMode("crowd_vote"),
  normalizeRelationshipEdgeStatus("pending"),
  normalizeRelationshipEdgeStatus("platform_truth"),
], ["friendly", "friendly", "strong", "normal", "delegated_ai", "manual", "pending", "confirmed"])

const seed = createRelationshipEdgeDraftSeed({ id: "tavern_alpha" }, [{ id: "char_guard", name: "守门人" }])
assert.deepEqual({ source_tavern_id: seed.source_tavern_id, source_node_type: seed.source_node_type, source_node_id: seed.source_node_id }, { source_tavern_id: "tavern_alpha", source_node_type: "character", source_node_id: "char_guard" })

const tavernTargetDraft = normalizeRelationshipEdgeDraft({ source_tavern_id: "tavern_alpha", source_node_type: "tavern", target_tavern_id: "tavern_beta", target_node_type: "tavern", target_node_id: "should_be_replaced" }, { source_tavern_id: "tavern_alpha" })
const characterDraft = normalizeRelationshipEdgeDraft({ source_tavern_id: "tavern_alpha", source_node_type: "character", target_tavern_id: "tavern_beta", target_node_type: "character", target_node_id: "char_beta" }, { source_tavern_id: "tavern_alpha", fallback_source_character_id: "char_guard" })
assert.deepEqual([tavernTargetDraft.source_node_id, tavernTargetDraft.target_node_id, characterDraft.source_node_id, characterDraft.target_node_id], ["tavern_alpha", "tavern_beta", "char_guard", "char_beta"])
assert.deepEqual([isCrossOwnerRelationshipPerspective({ target_owner_id: "owner_beta" }, "owner_alpha"), isCrossOwnerRelationshipPerspective({ target_owner_id: "owner_alpha" }, "owner_alpha")], [true, false])

console.log("relationship-graph-test: ok")
