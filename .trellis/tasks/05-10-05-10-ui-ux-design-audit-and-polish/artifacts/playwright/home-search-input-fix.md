# Home search input clickability fix

Date: 2026-05-10

## Issue
The homepage search field was backed by the raster artboard, while the real DOM input overlay was fully transparent. It could not show a caret, typed text, or active feedback, so it felt unclickable.

## Fix
- Made the SoulLink overlay input a visible/focusable real input layer with transparent idle styling and visible focused state.
- Wired homepage search text state so clicks and typing are observable.
- Pressing Enter on the homepage search opens `/discover?search=<query>`.
- Discover reads the `search` / legacy `q` query parameter into its filter state.

## Verification
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- `node .\frontend\scripts\soul-link-reference-artboards-test.mjs`
- `npm --prefix .\frontend run test:soul-link-reference-ux`
- One-off Playwright regression: `home-search-click-regression: ok`

## Evidence
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-search-input-focused.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-search-enter-discover.png`
