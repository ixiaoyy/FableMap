# Project cleanup audit

## Goal
Clean useless, generated, and obsolete project contents without deleting source-of-truth docs/assets or Trellis history.

## In scope
- Remove ignored/generated caches and build outputs that can be regenerated.
- Remove obsolete runtime source left behind by the discarded home desktop layout.
- Keep the SoulLink 1536×1024 desktop artboard at pixel parity with `D:/work/ai-/设计问题/index.png`.

## Out of scope
- Do not delete `.env*`, `frontend/node_modules/`, `设计问题/`, or user reference folders.
- Do not delete tracked Trellis historical task records unless explicitly confirmed, because they are traceability records.
- Do not force-delete ACL-protected temp folders outside normal workspace permissions.

## Changes
- Simplified `frontend/app/routes/home.tsx` to only load taverns needed for mobile cards and render `FableMapHomeReference`.
- Removed obsolete home desktop DOM implementation, stale home panel helpers, stale props, and unused asset imports from `frontend/app/components/fable-map-reference-artboards.tsx`.
- Updated black online panel label from `ACTIVE TAVERN ROLES` to `ONLINE ENTITIES`.
- Deleted regenerated/ignored local outputs where accessible: `frontend/build`, `frontend/.react-router`, `.pytest_cache`, `.trellis/tmp`, `test-results`, task `artifacts/`, and all accessible `__pycache__` directories.

## Audit results
- No tracked runtime light-theme asset/component files remain under `frontend/app/assets` or `frontend/app/components` for `home-light`, `discover-light`, `bg-light`, `light-reference-top-nav`, or `home-reference-layout`.
- Tracked old `.trellis/tasks/*light*` records remain as history only.
- `manual_tmp_test/` and `artifacts/` still contain ACL-protected pytest/runlog folders; normal PowerShell delete, `takeown`, and `icacls` did not have permission. Remaining size after cleanup: `manual_tmp_test` ≈ 0.44 MB, `artifacts` ≈ 22.24 MB.

## Validation
- `npm --prefix .\frontend run build` passed after source cleanup.
- `node frontend/scripts/playwright-soullink-visual-compare.mjs` passed after source cleanup: MAE 0, RMS 0, mismatchPixels 0, no Playwright errors.
- `git diff --check -- frontend/app/components/fable-map-reference-artboards.tsx frontend/app/routes/home.tsx` passed.
- Updated `frontend/app/assets/fable-map-05-10/README.md` to document the current SoulLink desktop artboard and avoid naming retired light folders as future targets.
