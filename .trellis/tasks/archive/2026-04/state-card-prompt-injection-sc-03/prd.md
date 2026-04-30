# State Card Prompt Injection SC-03

## Goal

把 confirmed + fixed_canon 状态卡注入 AI Prompt，普通 confirmed 卡仅在 WorldInfo 层级可见。

## Source Planning

* Parent task: `.trellis/tasks/04-29-state-cards-for-tavern-continuity/`
* Source note: docs/AI_SHARED_TASKLIST.md SC-03 / docs claim file
* Status: review. PromptBuilder/default-block support plus runtime chat/preview wiring are implemented and verified; awaiting review/commit.

## Requirements

* 不修改 StateCard 数据模型字段。
* 注入内容随卡片更新刷新。
* 需要 backend tests + frontend build，且不暴露 hidden prompt。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API; no StateCard schema fields were added; tests and `.trellis/spec/backend/state-card-api-contract.md` were updated.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* 2026-04-30 audit: this task is no longer a pure planning placeholder; keep it `in_progress` until real chat/runtime prompt construction passes confirmed+fixed_canon state cards into `PromptBuildConfig` and verification is recorded here.


## 2026-04-30 Audit Notes

* Working tree contains partial implementation in `prompt_blocks.py`, `prompt_builder.py`, `state_cards.py`, plus focused tests in `tests/test_tavern_prompt_blocks.py`.
* Resolved after implementation: runtime chat and owner prompt preview now pass tavern `_state_cards` into `PromptBuildConfig`; focused runtime test and full verification are recorded below.
* Do not mark completed until review/commit is done.


## 2026-04-30 Implementation Notes

* Added runtime prompt wiring in `WebService._build_tavern_character_prompt(...)`: tavern `_state_cards` are loaded via `TavernStore.list_state_cards(...)` and passed into `PromptBuildConfig.state_cards`.
* Added owner prompt preview wiring in both legacy core `WebService.preview_prompt_blocks_payload(...)` and application `OwnerConfigApplicationMixin.preview_prompt_blocks(...)`.
* Kept filtering centralized in `PromptBuilder`: only `status == "confirmed"` and `fixed_canon == True` cards render into prompt text. Ordinary confirmed visitor cards remain outside the prompt.
* Added TDD regression test `test_runtime_chat_prompt_loads_confirmed_fixed_state_cards`, which first failed because runtime prompt construction did not include `Blue Ticket Task`, then passed after wiring.
* Updated `.trellis/spec/backend/state-card-api-contract.md` with SC-03 executable contract.


## 2026-04-30 Verification Results

* RED: `py -3 -m pytest -q tests/test_tavern_prompt_blocks.py::test_runtime_chat_prompt_loads_confirmed_fixed_state_cards --tb=short` — failed as expected before implementation (`Blue Ticket Task` absent from runtime prompt).
* GREEN focused: `py -3 -m pytest -q tests/test_tavern_prompt_blocks.py::test_runtime_chat_prompt_loads_confirmed_fixed_state_cards --tb=short` — passed (`1 passed`).
* Focused backend: `py -3 -m pytest -q tests/test_tavern_prompt_blocks.py tests/test_tavern_state_cards.py --tb=short` — passed (`12 passed`).
* Python syntax: `py -3 -m compileall -q backend/src` — passed (`compileall: ok`).
* Full backend: `py -3 -m pytest -q --tb=short` — passed (`533 passed, 103 warnings`).
* Frontend build: `npm --prefix .\frontend run build` — passed (`✓ built`).
* Trellis validation: `py -3 .trellis/scripts/task.py validate` across 62 active tasks — passed (`FAILURES 0`).
