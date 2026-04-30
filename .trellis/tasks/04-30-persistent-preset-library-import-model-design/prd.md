# Persistent Preset Library Import Model Design

## Goal

在 preview converter 之后，设计是否需要持久化 preset library/import model。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: Preset Import future persistent model
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 先评估 preview 是否有用，再决定新增模型。
* 不静默应用 jailbreak/NSFW/CoT forcing 模块。
* 若新增 schema，必须同步 WORLD_SCHEMA/tests/docs。

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
