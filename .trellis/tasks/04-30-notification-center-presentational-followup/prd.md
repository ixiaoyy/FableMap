# Notification Center Presentational Follow-up

## Goal

在已有通知 MVP 之后，补一个前端通知中心表现化入口：复用现有 notification API / WebSocket / 标记已读能力，明确 owner/visitor 边界，不扩复杂协议、不做营销推送或广告复活。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 通知系统后续
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 复用现有通知 API/WebSocket 能力，不扩复杂协议。
* owner/visitor 通知边界清晰。
* 不做营销推送、广告复活或频控不明的主动触达。
* 新入口需要是前端表现化改进，桌面/移动端可读可用。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed no marketing push, ad resurrection, public social feed, visitor-to-visitor social network, ranking, or platform-generated content bypass.
* `backend/src/fablemap_api/core/notifications.py`: reused existing notification types and in-memory MVP boundary.
* `backend/src/fablemap_api/api/v1/notifications.py`: existing WebSocket and mark-read message protocol; no protocol expansion.
* `frontend/app/hooks/useNotifications.ts`: reused current WebSocket state and mark-read actions.
* `frontend/app/components/NotificationBell.tsx`: existing dropdown entry point and “查看全部通知” link.
* `.trellis/spec/frontend/component-guidelines.md`, `state-management.md`, `type-safety.md`, `quality-guidelines.md`: followed route/component quality, local display state, runtime normalization, build/test, and Playwright rules.

## Implementation Notes

* Added `frontend/app/lib/notification-center.js`:
  * type metadata for existing notification types;
  * owner/visitor audience labels;
  * guardrails: current identity only, clear owner/visitor boundary, no marketing push/ad resurrection, no undefined-frequency proactive touch;
  * pure normalize/build/filter helpers.
* Added `frontend/app/components/NotificationCenterPanel.tsx`:
  * polished notification center panel;
  * summary cards for unread/all/owner-side/visitor-side;
  * filters for all/owner/visitor/unread with `aria-pressed`;
  * mark single/all read actions wired to existing hook callbacks;
  * designed loading/empty states.
* Added `frontend/app/routes/notifications.tsx` and registered it in `frontend/app/routes.ts`.
* Updated `NotificationBell.tsx` “查看全部通知” link to include `?user_id=...`, preserving current identity.
* Added `frontend/scripts/notification-center-test.mjs` and included it in `npm --prefix .\frontend test`.
* No backend, schema, REST/WebSocket protocol, marketing, billing, ranking, or social-feed feature was added.

## Verification

* `node .\frontend\scripts\notification-center-test.mjs` — passed (`notification-center-test: ok`).
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `notification-center-test: ok`.

## Playwright Visual Self-Acceptance

* Command: `$env:NOTIFICATION_CENTER_HARNESS_URL='http://127.0.0.1:5179'; node .\.trellis\tmp\playwright-mainline\notification-center-visual-acceptance.cjs` — passed.
* Harness: `.trellis/tmp/notification-center-harness/` with Vite on `http://127.0.0.1:5179`.
* Script: `.trellis/tmp/playwright-mainline/notification-center-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-notification-center-visual-acceptance/notification-center-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-notification-center-visual-acceptance/notification-center-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-notification-center-visual-acceptance/notification-center-visual-acceptance-report.json`
* Checked: desktop/mobile notification center, owner/visitor filters, unread filter, mark-all action, no marketing/ranking copy, and no horizontal overflow.

## Out of Scope

* No new notification backend schema or protocol.
* No marketing push, ad resurrection, public social feed, visitor-to-visitor social network, ranking, combat, levels, or equipment.
* No platform-generated content publication.
* No platform token billing, recharge, settlement, marketplace, or revenue-share system.

## Completion

Completed on 2026-04-30 with helper/contract tests, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
