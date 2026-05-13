# Black theme shared-template home and search alignment

> Compact archive for a completed Trellis task. Historical implementation details were removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-09
- Completed: 2026-05-09
- Scope: / and /discover black reference theme alignment
- Notes: Corrected after feedback: black/cyber homepage and discover/search are lean shells composed from extracted section components on shared layout/nav. Playwright now also audits visible runtime images for raster upscaling to catch blur sources; search result card covers were corrected to render at their extracted 172px height ratio instead of being stretched. Focused static checks, typecheck, frontend build, and Playwright desktop/mobile self-acceptance passed on 2026-05-09.

## Validation
- node ./frontend/scripts/black-reference-test.mjs
- node ./frontend/scripts/discover-light-reference-test.mjs
- node ./frontend/scripts/home-visual-density-test.mjs
- node ./frontend/scripts/homepage-dynamic-entry-test.mjs
- node ./frontend/scripts/home-pc-polish-test.mjs
- node ./frontend/scripts/home-links-test.mjs
- node ./frontend/scripts/discover-pc-polish-test.mjs
- node ./frontend/scripts/discover-view-mode-test.mjs
- npm --prefix ./frontend run typecheck
- npm --prefix ./frontend run build
- node ./frontend/scripts/playwright-black-reference-check.mjs

## Context policy
- Prefer current docs/specs/code over this archived task. Restore old details from git history only on explicit request.
