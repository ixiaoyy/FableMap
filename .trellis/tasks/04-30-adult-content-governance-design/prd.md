# Adult Content Governance Design

## Goal

仅作为治理/边界设计任务保留：如未来支持成人空间，必须先设计年龄声明、合意、访问控制、分级、退出机制。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: NPC role prompt safety adult/consent caveat
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 当前默认模板不包含成人/强制内容。
* 不实现成人内容系统；先做安全/合规设计。
* 必须可退出、可治理、店主审核明确。

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
