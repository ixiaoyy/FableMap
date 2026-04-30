# Multi-NPC Tavern Room Full UX

## Goal

在已有 group-chat 基础上，保留完整多人 NPC 房间 UX 的未来任务。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: multi-npc deferred not done
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 先定义 speaker rules、visitor agency、state/canon 边界。
* 不让 NPC 替访客说话/决定动作。
* 复用现有 group-chat primitives/tests。

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
