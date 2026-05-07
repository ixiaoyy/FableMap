# Conversation progress cards

## Goal

Render compact “本轮有推进” cards directly under assistant replies when existing backend chat response payloads contain memory, affinity, or state-card candidate signals.

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\`

## Source Plan

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\implementation-plan.md` — Task 5.

## Requirements

* Modify `frontend/app/features/tavern-chat-workbench/index.tsx`.
* Update `buildAssistantLine` to accept the chat result and attach `progress_signals: progressSignalsFromChatResult(result)`.
* Pass `result` into assistant-line builders for private, mention, and fallback single-target replies.
* Attach group chat progress signals to the final group reply.
* Render `data-conversation-progress-card` under assistant bubbles when `line.progress_signals` exists.
* Update `frontend/scripts/tavern-chat-workbench-test.mjs` assertions for progress-card rendering.

## Acceptance Criteria

* [x] Progress cards render only under assistant replies, not user messages.
* [x] Progress cards summarize existing response data only.
* [x] The card text includes `本轮有推进`.
* [x] Mobile layout remains inline below the reply rather than hidden in a sidebar.
* [x] Focused tests and typecheck pass.

## Verification

* `node .\frontend\scripts\conversation-beats-test.mjs`
* `node .\frontend\scripts\tavern-chat-workbench-test.mjs`
* `npm --prefix .\frontend run typecheck`

## Out of Scope

* New backend memory/state-card behavior.
* Owner review UI for state cards.
* Changing affinity calculations.
