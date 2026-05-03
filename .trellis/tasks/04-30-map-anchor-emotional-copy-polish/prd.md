# Map Anchor Emotional Copy Polish

## Goal

把真实坐标表达成“街角的门、巷口的灯牌、附近有人经营的酒馆”等产品语言。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 地图锚点情绪化表达
* Status: selected for frontend implementation on 2026-05-03.

## Requirements

* 优先改 marker/card 文案和信息层级，不改地图数据模型。
* 不做传统地图 App 路线/导航/POI 评分。
* 与 discovery polish 保持一致。
* 保留真实锚点可见性：有 address 展示门牌；没有 address 时展示格式化经纬度；缺失坐标时明确“坐标待确认”。
* 用户可见文案避免暴露 raw `marker` 实现词。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API only; no contract or persistence change.
* [x] Discovery cards and map chrome use street-door / lantern / operated-nearby copy.
* [x] Address and coordinate fallbacks remain visible as real anchors.
* [x] Raw user-facing `marker` wording is removed from the changed discovery/map surfaces.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task was implemented as a frontend-only copy/UI polish; no backend/schema/API change.

## Research Notes

### Relevant docs/specs

* `docs/PRODUCT_BRIEF.md`: FableMap differentiates by real map anchors + cyber tavern UGC; owner content remains owner-confirmed.
* `docs/FABLEMAP_TAVERN_PLATFORM.md`: discovery flow is “打开地图 → 看到酒馆标记 → 查看简介和角色 → 进入酒馆”.
* `docs/WHAT_NOT_TO_BUILD.md`: do not add route planning, POI rating, traditional map app features, or unanchored free spaces.
* `.trellis/spec/frontend/component-guidelines.md`: keep UI accessible, readable, and mobile-aware.
* `.trellis/spec/frontend/type-safety.md`: normalize dynamic `address` / `lat` / `lon` payloads at display boundaries.
* `.trellis/spec/guides/code-reuse-thinking-guide.md`: extracted shared copy helpers instead of duplicating address/coordinate fallback copy across map/card/marker surfaces.

### Code patterns inspected

* `frontend/app/product/WorldStageTavernDiscoveryLane.jsx`: existing tavern discovery card, filters, summary row, access/status chips.
* `frontend/app/product/WorldMap.jsx`: map topbar and tavern legend copy.
* `frontend/app/product/mapAdapter/AMapAdapter.js`: tavern marker HTML content.
* `frontend/app/product/services/tavernService.js`: reused existing access icon/marker-label helpers.

## Implementation Summary

* Added `frontend/app/product/mapAnchorCopy.js` as the shared map-anchor copy boundary:
  * `formatTavernAnchorLocation(tavern)`
  * `buildMapAnchorCardCopy(tavern)`
  * `buildMapAnchorMarkerCopy(tavern)`
  * `buildMapAnchorSummaryCopy({ matching, total })`
* Updated tavern discovery cards to show `街区灯牌`, `街角门牌`, `坐标门牌`, `灯牌亮着`, `附近有人经营`, and door-rule copy.
* Updated discovery summary/load-more/empty states to say `灯牌` instead of user-visible `marker`.
* Updated map topbar/legend copy to `街区底图`, `酒馆灯牌`, and shared lantern summary.
* Updated AMap tavern marker HTML to show access “灯牌” badge and lantern status.
* Added `frontend/scripts/map-anchor-copy-test.mjs` and wired it into `npm --prefix .\frontend test`.
* Added `.trellis/spec/frontend/map-anchor-copy.md` and linked it from the frontend spec index.

## Verification

TDD red:

```powershell
node frontend/scripts/map-anchor-copy-test.mjs
# Failed as expected before implementation:
# ERR_MODULE_NOT_FOUND: frontend/app/product/mapAnchorCopy.js
```

Fresh passing verification after final code changes:

```powershell
node frontend/scripts/map-anchor-copy-test.mjs
# map-anchor-copy-test: ok

npm --prefix .\frontend test
# all frontend script tests passed, including map-anchor-copy-test

npm --prefix .\frontend run typecheck
# react-router typegen && tsc --noEmit passed

npm --prefix .\frontend run build
# react-router build passed

node .trellis/tmp/playwright-mainline/map-anchor-copy-visual-acceptance.cjs
# ok: true
```

Playwright evidence:

* Report: `.trellis/tmp/playwright-mainline/evidence/04-30-map-anchor-emotional-copy-polish-visual-acceptance/map-anchor-copy-visual-acceptance-report.json`
* Desktop screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-map-anchor-emotional-copy-polish-visual-acceptance/map-anchor-copy-desktop.png`
* Mobile screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-map-anchor-emotional-copy-polish-visual-acceptance/map-anchor-copy-mobile.png`

## Deferred / Not Done

* No backend/API/schema changes.
* No route planning, navigation, POI rating, ranking, or traditional map app function.
* No new map provider or map rendering dependency.
* No AI-generated tavern/NPC/story publication.
* Existing untracked `frontend/app/lib/emotional-location.js` was left untouched and not wired in, to avoid mixing an unreviewed native-route helper with this product-surface task.
