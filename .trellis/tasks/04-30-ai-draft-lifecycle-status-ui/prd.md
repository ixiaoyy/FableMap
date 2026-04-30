# AI Draft Lifecycle Status UI

## Goal

明确“草稿/待确认/已发布”的 UI 语义，防止 AI 辅助内容被误解为平台自动发布。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research NPC 是接待者，不是平台作者
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* AI draft 必须 owner-editable、owner-confirmed。
* 发布前不得进入公开 tavern payload。
* 适用于 tavern draft、character draft、future gameplay draft。

## Acceptance Criteria

* [ ] Relevant existing code/docs are inspected before implementation.
* [ ] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [ ] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [ ] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.
