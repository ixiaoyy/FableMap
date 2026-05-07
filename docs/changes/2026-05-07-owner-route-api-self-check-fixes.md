# Owner route API self-check fixes

Date: 2026-05-07

## Context

Playwright self-check of `http://127.0.0.1:8950/` found browser console errors on `/create` and `/owner`:

- `/create` and `/owner` requested `/api/v1/owners/me/default-llm` without an explicit owner identity, producing expected backend `401` responses.
- `/owner` requested the retired `/api/v1/sessions` path, while the mounted v1 endpoint is `/api/v1/chat/sessions`.

## Changes

- Added `hasExplicitOwnerIdentity(...)` in `frontend/app/lib/tavern-runtime-config.js` for non-throwing owner identity checks.
- Updated `/create` to skip default LLM status fetches until `owner_id` is explicit.
- Updated `/owner` to skip owner-only default LLM status fetches until `owner_id` is explicit.
- Updated `listGlobalChatSessions(...)` to call `/api/v1/chat/sessions`.
- Extended `frontend/scripts/identity-boundary-test.mjs` to cover these contracts.

## Verification

- `node frontend/scripts/identity-boundary-test.mjs`
- `node frontend/scripts/owner-dashboard-layout-test.mjs`
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`
- `node .\artifacts\playwright-self-check\2026-05-07-page-check\run.mjs`

Latest Playwright report: `artifacts/playwright-self-check/2026-05-07-page-check/report.md` reported `0 error / 0 warning` across 16 desktop/mobile page checks.
