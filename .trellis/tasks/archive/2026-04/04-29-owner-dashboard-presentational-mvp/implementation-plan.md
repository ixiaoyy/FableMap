# Implementation Plan: Owner Dashboard Presentational MVP

## Scope

Frontend-only owner dashboard polish on top of the existing `/owner` route and `owner-summary` helper. Avoid backend/schema changes unless a focused frontend test proves an existing helper is unusable.

## Step 1 — Extend owner summary helper

Files:
- `frontend/app/lib/owner-summary.js`
- `frontend/scripts/owner-summary-test.mjs`

Changes:
- Add derived fields for dashboard state, e.g. closed taverns, has interactions, primary tavern needing attention.
- Add next-action kinds for owner-visible feedback/notes as an entry concept without public social semantics.
- Keep helper pure and testable; no API calls in helper.

Verification:
- `node frontend/scripts/owner-summary-test.mjs`

## Step 2 — Upgrade `/owner` hero and entry cards

Files:
- `frontend/app/routes/owner.tsx`

Changes:
- Add a stronger cyber-tavern hero panel with operating status, owner ID form, and two primary CTAs.
- Surface clear cards for:
  - Create / AI draft assisted opening;
  - Review returning visitors / recent sessions;
  - Check closed taverns / LLM configuration;
  - Owner-visible visitor feedback entry.
- Keep current metrics/charts where useful; reduce crowded first-screen feel.

Verification:
- inspect route source for required copy/links via a script or existing frontend test.

## Step 3 — Add dashboard regression script

Files:
- `frontend/scripts/owner-dashboard-layout-test.mjs`
- `frontend/package.json`

Changes:
- Assert `/owner` source includes required bounded concepts:
  - real coordinate / owner confirmation / AI draft assistance copy;
  - no public guestbook/social language;
  - links to `/create` and `/tavern/` detail flow;
  - owner-visible feedback / LLM config status language.

Verification:
- `node frontend/scripts/owner-dashboard-layout-test.mjs`
- `npm --prefix .\frontend test`

## Step 4 — Full frontend validation

Commands:
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend run build`

Manual check if feasible:
- desktop `/owner`
- narrow/mobile `/owner`

## Non-goals during implementation

- No new backend routes.
- No schema migration.
- No token billing UI.
- No visitor-to-visitor social surface.
- No broad CSS/theme rewrite outside files needed for `/owner`.
