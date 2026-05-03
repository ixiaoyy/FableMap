# Mobile Single-mainline Experience Polish

## Goal

把移动端默认路径收敛为定位 / 探索 / 进店，店主创建与高级管理入口保持清晰但不挤进移动首屏。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 移动端单主线体验
* Implemented: 2026-05-03 frontend-only slice.

## Scope

* Touches frontend product shell navigation, mobile first-screen regression tests, Trellis frontend spec, and Playwright self-acceptance harness.
* No backend/API/schema/persistence change.
* No new mobile framework or UI dependency.

## Requirements

* 移动端不把地图、创建、配置、聊天全部塞进首屏。
* 关键 CTA 不被底部导航遮挡。
* 移动底部 dock 保持访客优先：`首页 / 发现 / 进店 / 清单 / 管理`。
* 桌面顶部导航仍保留店主明确入口：`创建空间` / `管理入口`。
* `/tavern/:id` 移动端默认显示入店主线与活性信号，Place/Home、回访反馈、邻里传闻等次级面板默认折叠在 `更多酒馆信息`。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Mobile bottom dock label/order is covered by focused regression.
* [x] Mobile top navigation is hidden below `lg` so it does not duplicate bottom dock or expose owner-create wording in the first line.
* [x] Desktop top navigation keeps `创建空间` and creator conversion remains desktop-only.
* [x] Tavern mobile secondary panels remain collapsed behind `更多酒馆信息`; desktop secondary panels remain visible.
* [x] Implementation uses existing schema/API; no contract change was introduced.
* [x] Playwright self-acceptance captured desktop and mobile screenshots/report.

## Implementation Summary

* Added `frontend/scripts/mobile-single-mainline-test.mjs` and wired it into `frontend/package.json`.
* Updated `frontend/app/shell/product-shell.tsx` so primary top nav is desktop-only (`hidden ... lg:flex`) while mobile bottom dock keeps visitor-first labels.
* Clarified product-shell comments so `进店` is not described as a creation-first CTA.
* Added `.trellis/spec/frontend/mobile-single-mainline.md` and linked it from `.trellis/spec/frontend/index.md`.
* Added `.trellis/tmp/playwright-mainline/mobile-single-mainline-visual-acceptance.cjs` to verify actual ProductShell/TavernRoute desktop + mobile behavior.
* Updated `frontend/scripts/tavern-layouts-test.mjs` to match the already-adopted `mapAnchorCopy` coordinate wording (`坐标门牌` / `真实锚点`).

## Verification Commands

### TDD / Regression Red

```powershell
node .\frontend\scripts\mobile-single-mainline-test.mjs
```

Observed expected failures before implementation:

* Stale source comment still described `进店` as creation-first.
* Primary top navigation was still visible on mobile and duplicated owner-create wording.

### Passed Verification

```powershell
node .\frontend\scripts\mobile-single-mainline-test.mjs
node .\frontend\scripts\mobile-shell-layout-test.mjs
node .\frontend\scripts\mobile-critical-flow-test.mjs
node .\frontend\scripts\tavern-layouts-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
node .\.trellis\tmp\playwright-mainline\mobile-single-mainline-visual-acceptance.cjs
```

Playwright evidence:

* Report: `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-single-mainline-experience-visual-acceptance/mobile-single-mainline-visual-acceptance-report.json`
* Desktop screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-single-mainline-experience-visual-acceptance/mobile-single-mainline-desktop.png`
* Mobile screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-mobile-single-mainline-experience-visual-acceptance/mobile-single-mainline-mobile.png`

## Out of Scope / Deferred

* No backend/API/schema changes.
* No platform automatic publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, equipment, route planning, or POI scoring.
* No new mobile framework.

## Technical Notes

* `ProductShell` still keeps the desktop top nav sticky and clear; only narrow/mobile hides it to avoid duplicate first-line navigation.
* `/create` remains reachable from mobile bottom dock via visitor-facing `进店` label and from desktop via explicit `创建空间`.
* Playwright harness renders the actual `ProductShell` + `TavernRoute` in a Vite temp harness with mocked `/api/v1` calls; temp harness files are removed after the run, evidence remains under `.trellis/tmp/playwright-mainline/evidence/`.
