# Conversation beats chat request typing

## Goal

Type the existing frontend chat API boundaries needed by conversation beats without changing backend schema or runtime behavior.

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\`

## Source Plan

`D:\work\ai-\.trellis\tasks\05-07-05-07-chat-gameplay-variety-brainstorm\implementation-plan.md` — Task 2.

## Requirements

* Modify `frontend/app/lib/taverns.ts` only.
* Add `ConversationProgressSignal` type.
* Extend `ChatMessage` with optional `progress_signals?: ConversationProgressSignal[]` for local UI metadata.
* Extend `sendTavernChat` request data type with optional `extra_context?: Array<Record<string, unknown>>` and `display_message?: string`.
* Do not change runtime function body or backend contracts.

## Acceptance Criteria

* [x] Type additions compile.
* [x] `sendTavernChat` accepts the already-supported `extra_context` and `display_message` fields.
* [x] No persisted schema, backend route, or API behavior is changed.

## Verification

* `npm --prefix .\frontend run typecheck` ✅

## Notes

* Implementation date: 2026-05-07
* Scope kept strictly to `frontend/app/lib/taverns.ts`.

## Verification

* `npm --prefix .\frontend run typecheck`

## Out of Scope

* Creating helper module.
* Rendering chips.
* Sending selected intent.
* Rendering progress cards.
