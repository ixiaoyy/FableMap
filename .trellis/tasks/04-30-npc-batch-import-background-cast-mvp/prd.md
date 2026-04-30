# NPC Batch Import and Background Cast MVP

## Goal

为店主保留“批量导入/创建背景 NPC”的安全任务入口，降低配置多角色酒馆成本。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / NPC 批量创建
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 支持店主确认的批量导入或批量草稿，不自动发布平台生成角色。
* 保持 TavernCharacter / SillyTavern 字段兼容。
* 默认不做 NPC 关系图谱或自动剧情生成，除非另行设计。

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
