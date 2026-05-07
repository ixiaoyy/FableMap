# Conversation intent send flow

## Goal

Thread the selected conversation intent through existing chat send boundaries without changing the visible visitor-authored chat history.

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\`

## Source Plan

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\implementation-plan.md` — Task 4.

## Requirements

* Modify `frontend/app/features/tavern-chat-workbench/index.tsx`.
* Capture `intentForTurn = selectedIntent` during submit and clear selected intent after submit starts.
* Update `sendPublicChat` / `sendPrivateChat` signatures to accept the per-turn intent.
* For every `sendTavernChat` call, pass `extra_context: buildConversationIntentContext(intentForTurn)` and `display_message: cleanMessage`.
* For group chat, send `message: buildMessageWithConversationIntent(cleanMessage, intentForTurn)` while preserving `display_message: cleanMessage`.
* Update `frontend/scripts/tavern-chat-workbench-test.mjs` assertions for the send flow.

## Acceptance Criteria

* [x] Visible local user messages remain exactly the typed visitor text.
* [x] Single/private/mention chat sends hidden intent through `extra_context`.
* [x] Group chat can pass intent in the model-facing message while preserving visible stored text through `display_message`.
* [x] Selected intent clears after submit starts.
* [x] Focused tests and typecheck pass.

## Verification

* `node .\frontend\scripts\conversation-beats-test.mjs`
* `node .\frontend\scripts\tavern-chat-workbench-test.mjs`
* `npm --prefix .\frontend run typecheck`

## Out of Scope

* Creating the helper module.
* Rendering progress cards.
* Backend schema changes.
