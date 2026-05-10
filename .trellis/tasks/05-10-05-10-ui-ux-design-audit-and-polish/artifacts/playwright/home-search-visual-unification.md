# Home search visual unification

Date: 2026-05-10

## Issue
Home light and black surfaces still exposed two different search-field modes: light used the compact white pill, while black kept the large baked artboard search bar with English/Chinese dual placeholder text.

## Fix
- Promoted the homepage search box to one shared DOM overlay geometry for both light and black: `homeSharedSearchBox`.
- Added a black-only artboard mask to hide the old baked wide black search bar.
- Rendered one shared search chrome with the same icon, slash key hint, and Chinese placeholder in both themes.
- Kept theme-specific color tokens only for surface tone, not for search layout/copy mode.

## Verification
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- `node .\frontend\scripts\soul-link-reference-artboards-test.mjs`
- `npm --prefix .\frontend run test:soul-link-reference-ux`
- One-off Playwright regression: `home-search-unified-visual-regression: ok`

## Evidence
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-light-desktop.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-black-desktop.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-search-light-unified.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-search-dark-unified.png`
