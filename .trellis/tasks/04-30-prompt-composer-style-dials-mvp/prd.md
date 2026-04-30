# Prompt Composer and Style Dials MVP

## Goal

保留 owner-facing prompt layer preview 和安全风格拨盘任务。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: External preset analysis Approach D
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 预览平台边界、TavernCharacter、world_info、visitor state 等层次，但不暴露 secret/API key。
* 风格拨盘先编译进现有字段或草稿，不新增持久化 schema。
* 保持访客主权，禁止 NPC 决定访客言行/内心/同意。

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
