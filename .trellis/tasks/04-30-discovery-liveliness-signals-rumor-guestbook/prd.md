# Discovery Liveliness Signals from Rumors and Feedback

## Goal

在发现页用已有 rumor/guestbook/feedback 信号制造“附近有人经营”的活性。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 社区感但不做社交网络
* Status: selected for frontend implementation on 2026-05-03.

## Requirements

* 不做访客间社交、私信、好友或公开评论墙。
* 信号应是轻量摘要/标签，不是排行。
* 复用已有数据，避免扩 schema。
* 发现页可提示“附近有人经营 / 环境传闻 / 回访反馈 / 聚合到访”，但不能展示访客身份、留言内容、回复、点赞、置顶或公开留言墙。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API only; no backend or persistence contract change.
* [x] Discovery cards can show rumor / owner-visible feedback / aggregate activity labels.
* [x] No visitor friends, DMs, public visitor wall, global social graph, ranking, or public guestbook UI is added.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* Implemented as frontend-only discovery surface polish; no backend/API/schema change.

## Research Notes

### Relevant docs/specs

* `docs/WHAT_NOT_TO_BUILD.md`: forbids visitor friends, DMs, public social feed/wall, global social graph, rankings, and traditional map-app features.
* `.trellis/spec/frontend/component-guidelines.md`: discovery UI must stay polished and mobile-safe.
* `.trellis/spec/frontend/quality-guidelines.md`: visible UI changes require build plus Playwright desktop/narrow self-acceptance.
* `.trellis/spec/frontend/type-safety.md`: dynamic Tavern payloads need runtime-safe normalization.
* `.trellis/spec/frontend/map-anchor-copy.md`: discovery copy must preserve real-coordinate anchor and avoid raw marker wording.
* `.trellis/spec/guides/code-reuse-thinking-guide.md`: reuse existing activity signal helper instead of duplicating rules.

### Code inspected

* `frontend/app/routes/discover.tsx`: native discover route card/radar surfaces.
* `frontend/app/lib/tavern-activity-signals.js`: existing aggregate visit/NPC/rumor/feedback/gameplay signal model with no-social guardrails.
* `frontend/app/components/TavernActivitySignalsCard.tsx`: tavern route activity-card wording and boundaries.
* `frontend/app/components/NeighborhoodRumorBubble.tsx`: existing ambient rumor surface, not a feed.
* `frontend/app/routes/tavern.tsx`: owner-visible `VisitorNotesPanel` boundary.

## Implementation Summary

* Added `frontend/app/lib/discovery-liveliness.js`:
  * wraps `buildTavernActivitySignals(...)`;
  * derives `headline`, `levelLabel`, `summary`, `chips`, and `searchText`;
  * emits safe labels such as `附近有人经营`, `环境传闻可用`, `回访反馈给店主`, `24 次到访`, `等待第一束灯`;
  * exports `DISCOVERY_LIVELINESS_FORBIDDEN_COPY` for tests.
* Added `frontend/app/components/DiscoveryLivelinessStrip.tsx`:
  * route-visible chip strip for radar and card views;
  * supports compact and muted states for closed/quiet cards.
* Updated `frontend/app/routes/discover.tsx`:
  * integrates liveliness strips into radar and card results;
  * adds liveliness text into discovery search matching;
  * updates telemetry copy to “有人经营” instead of generic signal-only copy;
  * fixes the card overlay coordinate label through `buildMapAnchorCardCopy(...)`.
* Added `frontend/scripts/discovery-liveliness-test.mjs` and wired it into `npm --prefix .\frontend test`.
* Added `.trellis/spec/frontend/discovery-liveliness-signals.md` and linked it from frontend spec index.

## Verification

TDD red:

```powershell
node frontend/scripts/discovery-liveliness-test.mjs
# Failed as expected before implementation:
# ERR_MODULE_NOT_FOUND: frontend/app/lib/discovery-liveliness.js
```

Fresh passing verification:

```powershell
node frontend/scripts/discovery-liveliness-test.mjs
# discovery-liveliness-test: ok

node frontend/scripts/tavern-activity-signals-test.mjs
# tavern-activity-signals-test: ok

node frontend/scripts/map-anchor-copy-test.mjs
# map-anchor-copy-test: ok

npm --prefix .\frontend test
# all frontend script tests passed, including discovery-liveliness-test

npm --prefix .\frontend run typecheck
# react-router typegen && tsc --noEmit passed

npm --prefix .\frontend run build
# react-router build passed

node .trellis/tmp/playwright-mainline/discovery-liveliness-visual-acceptance.cjs
# ok: true
```

Playwright evidence:

* Report: `.trellis/tmp/playwright-mainline/evidence/04-30-discovery-liveliness-signals-rumor-guestbook-visual-acceptance/discovery-liveliness-visual-acceptance-report.json`
* Desktop screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-discovery-liveliness-signals-rumor-guestbook-visual-acceptance/discovery-liveliness-desktop.png`
* Mobile screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-discovery-liveliness-signals-rumor-guestbook-visual-acceptance/discovery-liveliness-mobile.png`

## Deferred / Not Done

* No backend/API/schema changes.
* No public guestbook, public visitor wall, visitor friends, DMs, replies, likes, pins, or global social graph.
* No rankings, POI scoring, route planning, combat, levels, or equipment.
* No AI-generated tavern/NPC/story publication.
