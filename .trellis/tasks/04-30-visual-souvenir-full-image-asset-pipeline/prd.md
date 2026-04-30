# Visual Souvenir Full Image Asset Pipeline

## Goal

在 prompt preview 之后，设计/实现真正图像生成、资产落盘、引用和保留/删除策略。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: visual-souvenir deferred not done
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 必须遵守 image asset spec，生成物进入项目或 owner asset 路径。
* 默认不公开分享，隐私和删除策略先设计。
* 不把临时/chat preview 当作已交付资产。

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
