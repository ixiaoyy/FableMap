# Overlay focus ring fix

Date: 2026-05-10

## Issue
Mouse-clicking transparent DOM hotspots over the SoulLink/reference artboards could leave the hidden overlay control focused, making a large violet focus ring visible over the underlying icon.

## Fix
Added `onMouseDown={suppressMouseFocus}` to overlay link/button controls so mouse clicks do not transfer focus to invisible hotspot layers. Existing keyboard focus styles were left unchanged; only mouse-down focus transfer is suppressed.

## Verification
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- `node .\frontend\scripts\soul-link-reference-artboards-test.mjs`
- `npm --prefix .\frontend run test:soul-link-reference-ux`
- One-off Playwright regression: `theme-toggle-mouse-focus-regression: ok`

## Evidence
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\theme-toggle-mouse-click-no-focus-ring.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\soul-link-reference-check.md`

