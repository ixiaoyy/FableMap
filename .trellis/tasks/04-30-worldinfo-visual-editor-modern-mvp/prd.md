# WorldInfo Visual Editor Modern MVP

## Goal

把世界书/WorldInfo 编辑体验整理为当前 React Router 前端可继续打磨的现代化任务；优先复用既有 world_info 数据，不新增 schema。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / WorldInfo 可视化
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* owner 可视化查看/编辑 WorldInfo 条目、关键词和启用状态。
* 保持 SillyTavern/world_info 兼容，不新增持久化字段。
* 如只是现代化现有能力，必须先盘点旧实现，避免重复造轮子。

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
