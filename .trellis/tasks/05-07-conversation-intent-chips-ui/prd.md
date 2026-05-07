# Conversation intent chips UI

## Goal

Render the default conversation-intent chip row in the active native tavern chat composer while preserving free typing and no auto-send behavior.

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\`

## Source Plan

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\implementation-plan.md` — Task 3.

## Requirements

* Modify `frontend/app/features/tavern-chat-workbench/index.tsx`.
* Import conversation-beats helpers from `./conversation-beats.js`.
* Add local `selectedIntentId` state and derived `selectedIntent`.
* Add `toggleConversationIntent` and `clearConversationIntent` helpers.
* Render `data-conversation-intent-chips` above the textarea.
* Show selected state using `aria-pressed` and a `data-selected-conversation-intent` summary.
* The visitor must still type and press send; chips must not auto-send or fill a mandatory template.
* Update `frontend/scripts/tavern-chat-workbench-test.mjs` source assertions for the chip UI.

## Acceptance Criteria

* [x] Default chips are visible in the composer source and have accessible label `对话意图`.
* [x] Clicking a chip only selects/clears local intent state.
* [x] Selected summary says the visitor still needs to input their own message.
* [x] Focused workbench source test passes.

## Verification

* `node .\frontend\scripts\conversation-beats-test.mjs`
* `node .\frontend\scripts\tavern-chat-workbench-test.mjs`
* `npm --prefix .\frontend run typecheck`

## Out of Scope

* Send flow context changes.
* Progress card rendering.
* Owner-configurable chips.
