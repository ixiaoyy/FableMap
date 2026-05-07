# Mobile Critical Flow First-screen Polish

## Goal

打磨关键页面移动首屏质量：发现、创建、进入空间、店主入口在移动端默认呈现一条清晰主线，不把全部面板挤进第一屏；保留既有底部 dock 与触摸目标，不引入新移动端框架。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 移动端适配后续
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 移动端默认一条主线，避免把全部面板挤进首屏。
* 触摸目标和底部 dock 不遮挡主 CTA。
* 不引入新移动端框架。
* 覆盖关键页面：发现、创建、进入空间、店主入口。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed mobile polish must not introduce social feed, ranking, combat/equipment, billing, or platform-generated content direction.
* `frontend/app/shell/product-shell.tsx`: existing shared shell, desktop nav, mobile bottom dock, `pb-28`, touch targets.
* `frontend/app/routes/discover.tsx`, `create.tsx`, `tavern.tsx`, `owner.tsx`: critical flows to anchor.
* `frontend/scripts/mobile-shell-layout-test.mjs`, `mobile-touch-targets-test.mjs`: existing mobile regression expectations.
* `.trellis/spec/frontend/component-guidelines.md` and `quality-guidelines.md`: mobile-safe layout, no extra framework, build/test and Playwright requirements.

## Implementation Notes

* Added `MOBILE_CRITICAL_FLOW_GUIDES` in `ProductShell` for `Discover`, `Create`, `Tavern`, and `Owner`.
* Added a mobile-only first-screen guide strip (`data-mobile-critical-flow`, `lg:hidden`) with:
  * one-line page intent;
  * a short “why this first” helper;
  * one full-width `min-h-14 touch-manipulation` CTA;
  * no extra desktop panel.
* Added route anchors with `scroll-mt-28`:
  * `#discover-mainline`
  * `#create-mainline`
  * `#tavern-mainline`
  * `#owner-mainline`
* Added `frontend/scripts/mobile-critical-flow-test.mjs` and included it in `npm --prefix .\frontend test`.
* No schema/API/dependency changes; no mobile framework was introduced.

## Verification

* `node .\frontend\scripts\mobile-critical-flow-test.mjs` — passed (`mobile-critical-flow-test: ok`).
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `mobile-critical-flow-test: ok`.

## Playwright Visual Self-Acceptance

* Command: `$env:MOBILE_CRITICAL_FLOW_HARNESS_URL='http://127.0.0.1:5180'; node .\.trellis\tmp\playwright-mainline\mobile-critical-flow-visual-acceptance.cjs` — passed.
* Harness: `.trellis/tmp/mobile-critical-flow-harness/` with Vite on `http://127.0.0.1:5180`.
* Script: `.trellis/tmp/playwright-mainline/mobile-critical-flow-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-critical-flow-visual-acceptance/mobile-critical-flow-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-critical-flow-visual-acceptance/mobile-critical-flow-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-critical-flow-visual-acceptance/mobile-critical-flow-visual-acceptance-report.json`
* Checked: desktop shell still loads, mobile first-screen guide appears, bottom dock visible, touch-safe CTA, anchor action, and no horizontal overflow.

## Out of Scope

* No new mobile framework or dependency.
* No backend/API/schema change.
* No social feed, ranking, combat/levels/equipment, token billing/recharge/settlement, or platform-generated content change.

## Completion

Completed on 2026-04-30 with mobile regression test, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
