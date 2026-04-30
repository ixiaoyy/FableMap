# Owner AI Dialogue Preview Simulator

## Goal

让店主在发布前预览 NPC 回复效果，但不写入访客聊天历史或公开内容。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / AI 对话模拟
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 预览必须 owner-only，不进入正式 chat history/writeback。
* 不暴露 API Key、隐藏 prompt 或其他访客记忆。
* 若调用 LLM，成本和 provider 设置仍由店主控制。

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
