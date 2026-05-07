# Conversation beats helper and tests

## Goal

Create the pure conversation-beats helper module and focused Node regression test for the default intent chips and progress-signal extraction.

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\`

## Source Plan

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\implementation-plan.md` — Task 1.

## Requirements

* Create `frontend/app/features/tavern-chat-workbench/conversation-beats.js`.
* Define exactly five MVP chips: `追问线索`, `安慰一下`, `试探态度`, `请 NPC 建议`, `换个轻松话题`.
* Provide helpers: `findConversationIntent`, `buildConversationIntentContext`, `buildMessageWithConversationIntent`, `progressSignalsFromChatResult`.
* Create `frontend/scripts/conversation-beats-test.mjs` covering chip labels, hidden context, group prompt augmentation, and progress signals.
* Wire the focused test into `frontend/package.json` `test` script without removing existing tests.

## Acceptance Criteria

* [ ] Helper module exists and exports the required constants/functions.
* [ ] Focused test passes with `node .\frontend\scripts\conversation-beats-test.mjs`.
* [ ] `npm --prefix .\frontend test` includes `conversation-beats-test.mjs` before the existing suite.
* [ ] No UI behavior or chat send flow is changed in this child task.

## Verification

* `node .\frontend\scripts\conversation-beats-test.mjs`
* If package script changed, later full verification child runs `npm --prefix .\frontend test`.

## Out of Scope

* React UI chips.
* Chat request typing.
* Send flow changes.
* Progress card rendering.
