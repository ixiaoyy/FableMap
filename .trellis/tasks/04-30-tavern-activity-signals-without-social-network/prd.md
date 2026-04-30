# Tavern Activity Signals Without Social Network

## Goal

保留“有活性但不做社交网络”的产品方向：用传闻、owner-visible feedback 和聚合活动摘要表达酒馆活性，而不是公开访客社交。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 社交互动增强修正
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 不做访客好友、私信、公开访客墙、全局社交图谱。
* 可探索 owner-visible feedback、单酒馆治理内的活动摘要。
* 所有访客隐私和店主治理边界必须可见。
* 复用现有 Tavern 字段、rumor/feedback 表面，不新增社交协议。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed no visitor friends, DMs, public visitor wall, global social graph, ranking, or social feed.
* `docs/WORLD_SCHEMA.md`: VisitorState / relationship data is tavern-scoped and must not become public social profile or global graph.
* `frontend/app/routes/tavern.tsx`: existing owner-visible visitor feedback and NeighborhoodRumorBubble placement.
* `frontend/app/components/NeighborhoodRumorBubble.tsx`: existing ambient rumor surface to keep as discovery hint rather than social feed.
* `.trellis/spec/frontend/component-guidelines.md` and `quality-guidelines.md`: polished, mobile-safe card and Playwright validation rules.

## Implementation Notes

* Added `frontend/app/lib/tavern-activity-signals.js`:
  * derives aggregate activity level from `visit_count`, NPC count, gameplay count, and `local-rumor` skill pack presence;
  * exposes guardrails: no visitor friends/DMs, no public visitor wall, no global social graph, feedback only for owner governance;
  * avoids visitor identity and cross-tavern social data.
* Added `frontend/app/components/TavernActivitySignalsCard.tsx`:
  * displays aggregate activity signals: visits, NPC cast, ambient rumors, owner-visible feedback, gameplay clues;
  * shows “Activity without social graph” boundary copy;
  * mobile-safe grid and visible governance chips.
* Integrated the card into `frontend/app/routes/tavern.tsx` after the tavern mainline showcase.
* Added `frontend/scripts/tavern-activity-signals-test.mjs` and included it in `npm --prefix .\frontend test`.
* No backend/API/schema changes and no public visitor social feature was added.

## Verification

* `node .\frontend\scripts\tavern-activity-signals-test.mjs` — passed (`tavern-activity-signals-test: ok`).
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `tavern-activity-signals-test: ok`.

## Playwright Visual Self-Acceptance

* Command: `$env:TAVERN_ACTIVITY_HARNESS_URL='http://127.0.0.1:5181'; node .\.trellis\tmp\playwright-mainline\tavern-activity-signals-visual-acceptance.cjs` — passed.
* Harness: `.trellis/tmp/tavern-activity-harness/` with Vite on `http://127.0.0.1:5181`.
* Script: `.trellis/tmp/playwright-mainline/tavern-activity-signals-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-tavern-activity-signals-visual-acceptance/tavern-activity-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-tavern-activity-signals-visual-acceptance/tavern-activity-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-tavern-activity-signals-visual-acceptance/tavern-activity-signals-visual-acceptance-report.json`
* Checked: desktop/mobile activity card, aggregate visits, rumor/feedback boundaries, no social UI, and no horizontal overflow.

## Out of Scope

* No visitor friends, DMs, public visitor wall, global social graph, or public social feed.
* No ranking, combat/levels/equipment, or cross-tavern competitive display.
* No backend/API/schema change.
* No platform-generated content publication or token billing changes.

## Completion

Completed on 2026-04-30 with regression test, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
