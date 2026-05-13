import assert from "node:assert/strict"

import {
  CONVERSATION_INTENT_CHIPS,
  buildConversationIntentContext,
  buildMessageWithConversationIntent,
  findConversationIntent,
  progressSignalsFromChatResult,
} from "../app/features/tavern-chat-workbench/conversation-beats.js"

assert.deepEqual(CONVERSATION_INTENT_CHIPS.map((chip) => chip.label), ["追问线索", "安慰一下", "试探态度", "请 NPC 建议", "换个轻松话题"])

const clueIntent = findConversationIntent("follow_clue")
const context = buildConversationIntentContext(clueIntent)
assert.ok(clueIntent.label === "追问线索" && findConversationIntent("missing") === null)
assert.deepEqual({ length: context.length, role: context[0].role, hasLabel: context[0].content.includes("追问线索"), keepsAgency: context[0].content.includes("不代表访客说出了额外事实") }, { length: 1, role: "system", hasLabel: true, keepsAgency: true })
assert.deepEqual(buildConversationIntentContext(null), [])

const visibleMessage = "你刚才说的纸条在哪里？"
const augmentedMessage = buildMessageWithConversationIntent(visibleMessage, clueIntent)
assert.ok(buildMessageWithConversationIntent(visibleMessage, null) === visibleMessage && augmentedMessage.includes("【对话意图：追问线索】") && augmentedMessage.includes(`访客原文：${visibleMessage}`))

const signals = progressSignalsFromChatResult({
  created_memories: [{ id: "mem_1" }],
  state_card_candidates: [{ id: "card_1" }, { id: "card_2" }],
  affinity: { strength: 0.21, previous_stage: "stranger", new_stage: "familiar", stage_label_zh: "熟人", stage_changed: true },
})
assert.deepEqual(signals.map((signal) => signal.id), ["memory", "affinity-stage", "state-card"])
assert.ok(signals[0].label.includes("记住了 1 件事") && signals[1].label.includes("熟人") && signals[2].label.includes("2 条"))
assert.deepEqual(progressSignalsFromChatResult({}), [])
assert.deepEqual(progressSignalsFromChatResult({
  is_fallback: true,
  created_memories: [{ id: "fake_mem" }],
  state_card_candidates: [{ id: "fake_card" }],
  affinity: { strength: 0.21, previous_stage: "stranger", new_stage: "familiar", stage_label_zh: "熟人", stage_changed: true },
}), [])

console.log("conversation-beats-test: ok")
