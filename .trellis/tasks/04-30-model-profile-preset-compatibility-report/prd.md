# Model Profile and Preset Compatibility Report

## Goal

为不同模型/预设兼容性报告保留任务入口，帮助店主理解 preset 风险与能力边界。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: Player experience analysis / Model Profile & Preset Compatibility Report
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 只做报告/建议，不自动套用高风险 preset。
* 不暴露 hidden prompt 或 provider secrets。
* 可与 preset import preview 联动。

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
