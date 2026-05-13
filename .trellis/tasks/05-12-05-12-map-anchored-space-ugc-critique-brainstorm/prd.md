# brainstorm: map-anchored-space-UGC critique response

> Compact archive for a completed Trellis task. Historical implementation details were removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-12
- Completed: 2026-05-12
- Scope: frontend MVP for visitor first-minute entry guidance and location-anchor proof; no schema/API/payment/social changes
- Notes: Implemented Visitor First Minute + Location Anchor Proof as a frontend-only MVP. Added centralized derived guide helper, discover/preview/workbench first-minute surfaces, create-side authoring nudges, regression script, and Playwright evidence. No schema/API/payment/social changes.

## Deferred / not done
- No persisted first-minute fields or backend API/schema changes
- No token recharge/payment/settlement
- No visitor social graph/feed/DM/ranking/combat/traditional navigation
- No platform auto-publication of tavern/NPC/story content

## Validation
- node .\frontend\scripts\first-minute-guide-test.mjs PASS
- focused frontend scripts PASS
- npm --prefix .\frontend run typecheck PASS
- npm --prefix .\frontend test PASS
- npm --prefix .\frontend run build PASS
- git diff --check PASS (CRLF warnings only)
- Playwright discover visual audit PASS

## Context policy
- Prefer current docs/specs/code over this archived task. Restore old details from git history only on explicit request.
