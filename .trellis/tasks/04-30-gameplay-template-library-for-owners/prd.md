# Gameplay Template Library for Tavern Owners

## Goal

沉淀店主可选择的轻量空间玩法模板库，复用现有 `GameplayDefinition` / `gameplay_definitions` / `nodes` / `choices`，不走 RPG 战斗/等级路线。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / 玩法模板库
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 模板必须是店主确认后保存的玩法草稿。
* 复用现有 `gameplay_definitions` / `nodes` / `choices` 和既有保存接口。
* 不做装备、等级、排行、可交易奖励。
* 模板库 UI 需要支持桌面与窄屏浏览，并保留短剧模板入口。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed no combat, levels, equipment, ranking, tradable rewards, or platform-generated auto-publication.
* `docs/WORLD_SCHEMA.md`: reused Tavern `gameplay_definitions` and `GameplayDefinition`-style payloads.
* `docs/ARCHITECTURE.md`: kept frontend changes in product UI and existing `/api/v1/taverns/:id/gameplays` service boundary.
* `.trellis/spec/frontend/component-guidelines.md`, `state-management.md`, `type-safety.md`, `quality-guidelines.md`: followed local state, service boundary, runtime normalization, and mobile visual verification rules.
* Existing code patterns: `frontend/app/product/GameplayManager.jsx`, `GameplayDefinitionEditor.jsx`, `shortDramaGameplayTemplates.js`, `tavernGameplay.css`, `frontend/scripts/gameplay-test.mjs`.

## Implementation Notes

* Added `frontend/app/product/ownerGameplayTemplates.js` with 4 owner-selectable templates: three-step clue ledger, returning note, kindness checklist, and quiet object reading.
* Integrated a “玩法模板库” panel into `GameplayManager.jsx` with category/search filtering and “生成草稿” actions.
* Template actions create local draft `GameplayDefinition` payloads only; persistence still requires owner clicking “保存玩法”.
* Template payloads include reusable `owner_brief`, `nodes`, `fallback_events`, and `completion`, and carry explicit forbidden boundaries against combat/levels/equipment/ranking/tradable rewards and auto-publication.
* Fixed `GameplayManager.jsx` save handler naming so it no longer shadows the imported `saveGameplays` API helper; added response normalization for both `gameplays` and `gameplay_definitions` payload shapes.
* Added CSS for template search/filter/card states and narrow-screen wrapping.
* Extended `frontend/scripts/gameplay-test.mjs` to cover template schema shape, non-RPG boundaries, UI integration, and save handler/API guard.

## Verification

* `node .\frontend\scripts\gameplay-test.mjs` — passed (`gameplay-test: ok`).
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `gameplay-test: ok`.

## Playwright Visual Self-Acceptance

* Command: `$env:GAMEPLAY_TEMPLATE_HARNESS_URL='http://127.0.0.1:5177'; node .\.trellis\tmp\playwright-mainline\gameplay-template-visual-acceptance.cjs` — passed.
* Harness: `.trellis/tmp/gameplay-template-harness/` with Vite on `http://127.0.0.1:5177`.
* Script: `.trellis/tmp/playwright-mainline/gameplay-template-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-gameplay-template-visual-acceptance/gameplay-template-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-gameplay-template-visual-acceptance/gameplay-template-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-gameplay-template-visual-acceptance/gameplay-template-visual-acceptance-report.json`
* Checked: desktop/mobile template library, category/search, owner-confirmed save through existing PUT endpoint, draft status, GameplayDefinition nodes, non-RPG boundary copy, and no horizontal overflow.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, equipment, or tradable rewards.
* No backend schema/API change.

## Completion

Completed on 2026-04-30 with script tests, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
