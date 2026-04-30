# Owner Token Usage Reference Status

## Goal

为店主提供安全的 token / 模型用量参考状态：只帮助店主估算外部 LLM 成本与配置状态，不做平台充值、结算、抽成或访客可见账单。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm Owner Dashboard / Token 用量
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 只展示 owner 参考信息或配置状态。
* 不记录/展示 API Key。
* 不引入平台付费系统。
* 对访客不可见，不把参考用量表达成账单、充值、结算、平台抽成或可购买 Token。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed token自主边界；允许 owner 参考用量，不做充值、结算、Token 市场或抽成，且访客不可见。
* `docs/PRODUCT_BRIEF.md` and `docs/FABLEMAP_TAVERN_PLATFORM.md`: confirmed token 是店主自行承担的 LLM 燃料；`LLMConfig.api_key` 是敏感字段，`token_used` 仅 owner 可见。
* `docs/ARCHITECTURE.md` / `docs/WORLD_SCHEMA.md`: no schema/API change; reused existing Tavern `llm_config.token_used` and owner dashboard state.
* `.trellis/spec/frontend/component-guidelines.md`, `state-management.md`, `type-safety.md`, `quality-guidelines.md`: followed service/state boundary, runtime normalization, no secret display, build/test, and Playwright visual rules.
* Existing code patterns: `frontend/app/product/TavernOwnerPanel.jsx`, `frontend/app/product/styles.css`, `frontend/scripts/owner-dashboard-layout-test.mjs`, `frontend/app/routes/owner.tsx` safe default LLM status pattern.

## Implementation Notes

* Added `frontend/app/product/ownerTokenStatus.js` to derive safe owner token reference rows/stats from Tavern payloads.
  * It normalizes `llm_config.token_used`, backend/model labels, configured/unconfigured counts, and usage rows.
  * It deliberately strips raw `api_key` from row/stats payloads; only `api_key_configured`-style booleans affect display.
* Updated `frontend/app/product/TavernOwnerPanel.jsx` AI section to display “模型使用参考状态”.
  * Copy explicitly states the panel is reference-only and has no recharge, settlement, platform cut, or visitor-visible bill.
  * Boundary chips: “仅供店主参考”, “不展示 API Key”, “不含充值、结算或抽成”, “访客不可见账单”.
  * Token rows no longer carry raw Tavern objects; AI config action passes `tavernId` back to the parent to find the editable tavern.
* Updated `frontend/app/product/styles.css` for boundary chips, configured/unconfigured status pills, 6-card summary layout, and wrapping footer controls.
* Added `frontend/scripts/owner-token-status-test.mjs` and included it in `npm --prefix .\frontend test`.
* No backend, schema, billing, or payment flow was added.

## Verification

* `node .\frontend\scripts\owner-token-status-test.mjs` — passed (`owner-token-status-test: ok`).
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `owner-token-status-test: ok`.

## Playwright Visual Self-Acceptance

* Command: `$env:OWNER_TOKEN_HARNESS_URL='http://127.0.0.1:5178'; node .\.trellis\tmp\playwright-mainline\owner-token-visual-acceptance.cjs` — passed.
* Harness: `.trellis/tmp/owner-token-harness/` with Vite on `http://127.0.0.1:5178`.
* Script: `.trellis/tmp/playwright-mainline/owner-token-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-owner-token-status-visual-acceptance/owner-token-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-owner-token-status-visual-acceptance/owner-token-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-owner-token-status-visual-acceptance/owner-token-visual-acceptance-report.json`
* Checked: desktop/mobile panel rendering, no API key visible, no billing/recharge CTA, AI config action uses tavern id, and no horizontal overflow.

## Out of Scope

* No platform token billing, recharge, settlement, marketplace, or revenue-share system.
* No visitor-visible token bill/cost panel.
* No API Key display, logging, or persistence change.
* No backend schema/API change.

## Completion

Completed on 2026-04-30 with helper tests, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
