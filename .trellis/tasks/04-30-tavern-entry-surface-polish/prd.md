# Tavern Entry Surface Polish

## Goal

让 tavern 详情/入口顶部更像可进入的场所，而不是普通信息详情页。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 空间空间感
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 优化入口氛围、角色预览、入店 CTA。
* 不新增 schema；优先复用现有 tavern/character/rumor 数据。
* 保持移动端可用。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.

## Implementation Notes — 2026-05-03

* Confirmed user-approved scope A: polish the existing tavern entry surface only, without schema/API changes or generated platform content.
* Added a doorway/entry band to `TavernLayoutShowcase` using existing tavern description, scene prompt, world info preview, access/location status, and selected/current NPC data.
* Added a primary mobile-safe CTA: “进入吧台 / 和当前 NPC 对话”, which switches to the existing `npc-chat` layout.
* Added `frontend/scripts/tavern-entry-surface-test.mjs` and wired it into `frontend/package.json` test script to guard the entry-surface affordance.

## Verification — 2026-05-03

* `node frontend/scripts/tavern-entry-surface-test.mjs` — passed.
* `npm --prefix .\frontend test` — passed.
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `python .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-tavern-entry-surface-polish` — passed.
* Playwright visual self-acceptance was not run because this frontend package does not currently have a local Playwright binary/configured dependency (`frontend\node_modules\.bin\playwright.cmd` absent).
