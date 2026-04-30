# Character Editor Prompt Risk Linter

## Goal

为角色编辑器保留 prompt 风险检查任务，提示越权、PII、强制成人内容、用户代言等风险。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: NPC role prompt safety Approach B / Prompt Risk Linter
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 输出 blocked/warning/info 分级和 owner-facing 解释。
* 不把不安全社区 prompt 静默保存为 system prompt。
* 规则应覆盖 ignore restrictions、absolute obedience、CoT forcing、PII。

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
