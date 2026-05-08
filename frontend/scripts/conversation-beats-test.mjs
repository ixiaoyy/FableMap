import assert from "node:assert/strict"

import {
  CONVERSATION_INTENT_CHIPS,
  buildConversationIntentContext,
  buildMessageWithConversationIntent,
  findConversationIntent,
  progressSignalsFromChatResult,
} from "../app/features/tavern-chat-workbench/conversation-beats.js"

assert.deepEqual(
  CONVERSATION_INTENT_CHIPS.map((chip) => chip.label),
  ["追问线索", "安慰一下", "试探态度", "请 NPC 建议", "换个轻松话题"],
  "default conversation intent chips should match the MVP labels",
)

const clueIntent = findConversationIntent("follow_clue")
assert.equal(clueIntent.label, "追问线索", "findConversationIntent should return the selected chip")
assert.equal(findConversationIntent("missing"), null, "unknown chip id should return null")

const context = buildConversationIntentContext(clueIntent)
assert.equal(context.length, 1, "selected intent should produce one hidden context item")
assert.equal(context[0].role, "system", "intent context should be system-scoped guidance")
assert.ok(context[0].content.includes("追问线索"), "intent context should include the selected label")
assert.ok(context[0].content.includes("不代表访客说出了额外事实"), "intent context should preserve visitor agency")
assert.deepEqual(buildConversationIntentContext(null), [], "missing intent should not add context")

const visibleMessage = "你刚才说的纸条在哪里？"
assert.equal(
  buildMessageWithConversationIntent(visibleMessage, null),
  visibleMessage,
  "message without intent should remain unchanged",
)
const augmentedMessage = buildMessageWithConversationIntent(visibleMessage, clueIntent)
assert.ok(augmentedMessage.includes("【对话意图：追问线索】"), "group chat augmented prompt should include hidden intent")
assert.ok(augmentedMessage.includes(`访客原文：${visibleMessage}`), "group chat augmented prompt should preserve the original text")

const signals = progressSignalsFromChatResult({
  created_memories: [{ id: "mem_1" }],
  state_card_candidates: [{ id: "card_1" }, { id: "card_2" }],
  affinity: {
    strength: 0.21,
    previous_stage: "stranger",
    new_stage: "familiar",
    stage_label_zh: "熟人",
    stage_changed: true,
  },
})
assert.deepEqual(
  signals.map((signal) => signal.id),
  ["memory", "affinity-stage", "state-card"],
  "progress signals should summarize existing backend response data in stable order",
)
assert.ok(signals[0].label.includes("记住了 1 件事"), "memory signal should show count")
assert.ok(signals[1].label.includes("熟人"), "affinity stage signal should show the stage label")
assert.ok(signals[2].label.includes("2 条"), "state-card signal should show count")
assert.deepEqual(progressSignalsFromChatResult({}), [], "empty response data should not render progress signals")

console.log("conversation-beats-test: ok")
