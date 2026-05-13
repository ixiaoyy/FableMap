# Home light component decomposition

> Compact archive for a completed Trellis task. Historical implementation details were removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-09
- Completed: 2026-05-09
- Scope: / home light hybrid Hero-backed DOM replacement decision and verification
- Notes: Homepage bright theme now uses a hybrid Hero-backed body replacement. Runtime slice count is 2 (shared nav backing plus full Hero backing); the Hero is a single complete visual slice with transparent accessible hotspots, avoiding the previous left-DOM/right-crop vertical seam. Lower body sections remain real DOM with owned hotspots. Recommendation: proceed to human visual acceptance; only optional future work is nav full-DOM or narrow pixel tuning.

## Validation
- node ./frontend/scripts/home-visual-density-test.mjs
- node ./frontend/scripts/home-pc-polish-test.mjs
- node ./frontend/scripts/homepage-dynamic-entry-test.mjs
- node ./frontend/scripts/home-links-test.mjs
- npm --prefix ./frontend run typecheck
- npm --prefix ./frontend run build
- node ./frontend/scripts/playwright-home-light-reference-check.mjs

## Context policy
- Prefer current docs/specs/code over this archived task. Restore old details from git history only on explicit request.
