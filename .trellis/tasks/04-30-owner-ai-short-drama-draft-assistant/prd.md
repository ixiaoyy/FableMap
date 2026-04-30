# Owner AI Short-drama Draft Assistant

## Goal

让店主基于酒馆设定生成未发布的短剧玩法草稿，编辑确认后才能保存。

## Source Planning

* Parent task: `.trellis/tasks/04-30-ai-video-story-mini-game-brainstorm/`
* Source note: AI video story mini-game MVP 3 / Approach C
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 草稿默认不发布、不覆盖已有玩法。
* 严守 AI draft lifecycle/status UI 边界。
* 风险包括 prompt safety、版权素材、成本，需先设计。

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
