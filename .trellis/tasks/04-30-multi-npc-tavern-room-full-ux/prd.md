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

## 2026-05-03 Research Notes

* Existing backend group-chat primitives already cover member selection, response cap, cooldown, talkativeness, send/history APIs, and visitor-history isolation.
  * Main evidence: `backend/src/fablemap_api/core/group_chat.py`, `backend/src/fablemap_api/domain/group_chat_policy.py`, `.trellis/spec/backend/directory-structure.md`.
  * Existing tests: `backend/tests/test_v1_runtime_features.py`, `tests/test_group_chat.py`.
* Existing frontend already uses group-chat primitives in `frontend/app/product/TavernChatRoom.jsx` and `frontend/app/product/services/tavernService.js`.
* Owner settings already exist in `frontend/app/product/TavernGroupSettingsModal.jsx`; this task should not duplicate owner configuration.
* `docs/WHAT_NOT_TO_BUILD.md` confirms this task must avoid platform-generated published content, token billing, unbounded visitor social networking, and combat/level/equipment loops.
* `docs/WORLD_SCHEMA.md` confirms StateCard/group-chat outputs can only be pending candidates before confirmation and must not rewrite owner-authored Tavern / TavernCharacter / WorldInfo data directly.

## 2026-05-03 Selected MVP Scope

Frontend-only visitor-room UX polish:

1. Add a group-room guide shown only when `groupChatEnabled` is true.
2. Make speaker rules visible to the visitor: selection strategy, max response cap, cooldown/name-prefix behavior.
3. Make visitor agency explicit: NPCs respond to visitor input but do not speak or decide actions for the visitor.
4. Make canon/state boundary explicit: group chat may propose pending memory/state-card candidates, but confirmation is required before canon.
5. Add compact NPC participant roster using existing character fields (`name`, `archetype/personality`, `talkativeness`, avatar/sprites) without adding schema fields.
6. Add a frontend script test and wire it into `npm --prefix .\frontend test`.

No backend/API/schema/persistence change is planned for this MVP.

## 2026-05-03 Implementation Notes

* Added visitor-facing `MultiNpcRoomGuide` to `frontend/app/product/TavernChatRoom.jsx`.
* The guide is rendered only when existing `groupChatEnabled` is true.
* The guide explains:
  * speaker rules derived from existing `groupChatConfig` (`strategy`, `max_responses_per_turn`, `response_cooldown_seconds`, `require_name_prefix`);
  * visitor agency: NPCs respond but do not speak or decide actions for the visitor;
  * state/canon boundary: group chat may propose pending memory/state-card candidates, but confirmation is required before canon.
* Added compact participant roster from existing character fields, including `talkativeness`.
* Added mobile-safe CSS for the new guide.
* No backend/API/schema/persistence changes were made.

## 2026-05-03 Verification

* `node frontend/scripts/multi-npc-room-ux-test.mjs` — passed (`multi-npc-room-ux-test: ok`).
* `npm --prefix .\frontend test` — passed; includes new `multi-npc-room-ux-test.mjs` plus existing frontend script suite.
* `npm --prefix .\frontend run typecheck` — passed (exit 0).
* `npm --prefix .\frontend run build` — passed; React Router / Vite build completed.
* `python ./.trellis/scripts/task.py validate '.trellis/tasks/04-30-multi-npc-tavern-room-full-ux'` — passed in the implementation shell.
* 2026-05-03 pre-commit recheck: `py -3 .\.trellis\scripts\task.py validate '.trellis/tasks/04-30-multi-npc-tavern-room-full-ux'` and `python .\.trellis\scripts\task.py validate ...` failed because the WindowsApps Python launchers were unavailable; `& 'C:\Users\phpxi\miniconda3\python.exe' .\.trellis\scripts\task.py validate '.trellis/tasks/04-30-multi-npc-tavern-room-full-ux'` passed with `implement.jsonl`, `check.jsonl`, and `debug.jsonl` valid.
* `npm --prefix .\frontend run lint` — not run; `frontend/package.json` has no `lint` script.
* Playwright visual self-acceptance was not run because `frontend/node_modules` does not contain `playwright` or `@playwright/test`; no dependency was added without approval.
