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

assert.equal(normalizeRelationshipBehaviorType("friendly"), "friendly")
assert.equal(normalizeRelationshipBehaviorType("mystery-freeform"), "friendly", "unknown behavior types should fall back to safe friendly")

assert.equal(normalizeRelationshipStrengthPreset("strong"), "strong")
assert.equal(normalizeRelationshipStrengthPreset("ultra"), "normal", "unknown strength should fall back to normal")

assert.equal(normalizeRelationshipGovernanceMode("delegated_ai"), "delegated_ai")
assert.equal(normalizeRelationshipGovernanceMode("crowd_vote"), "manual", "unknown governance should stay owner-safe")

assert.equal(normalizeRelationshipEdgeStatus("pending"), "pending")
assert.equal(normalizeRelationshipEdgeStatus("platform_truth"), "confirmed", "unknown statuses should fall back to confirmed")

const seed = createRelationshipEdgeDraftSeed(
  { id: "tavern_alpha" },
  [{ id: "char_guard", name: "守门人" }],
)
assert.equal(seed.source_tavern_id, "tavern_alpha")
assert.equal(seed.source_node_type, "character")
assert.equal(seed.source_node_id, "char_guard")

const tavernTargetDraft = normalizeRelationshipEdgeDraft(
  {
    source_tavern_id: "tavern_alpha",
    source_node_type: "tavern",
    target_tavern_id: "tavern_beta",
    target_node_type: "tavern",
    target_node_id: "should_be_replaced",
  },
  { source_tavern_id: "tavern_alpha" },
)
assert.equal(tavernTargetDraft.source_node_id, "tavern_alpha")
assert.equal(tavernTargetDraft.target_node_id, "tavern_beta", "tavern targets should mirror target tavern id")

const characterDraft = normalizeRelationshipEdgeDraft(
  {
    source_tavern_id: "tavern_alpha",
    source_node_type: "character",
    target_tavern_id: "tavern_beta",
    target_node_type: "character",
    target_node_id: "char_beta",
  },
  { source_tavern_id: "tavern_alpha", fallback_source_character_id: "char_guard" },
)
assert.equal(characterDraft.source_node_id, "char_guard")
assert.equal(characterDraft.target_node_id, "char_beta")

assert.equal(
  isCrossOwnerRelationshipPerspective({ target_owner_id: "owner_beta" }, "owner_alpha"),
  true,
  "different target owner should be labelled as cross-owner perspective",
)
assert.equal(
  isCrossOwnerRelationshipPerspective({ target_owner_id: "owner_alpha" }, "owner_alpha"),
  false,
)

console.log("relationship-graph-test: ok")
