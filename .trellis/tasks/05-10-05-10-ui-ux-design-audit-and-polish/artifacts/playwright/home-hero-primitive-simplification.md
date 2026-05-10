# Home hero primitive simplification

Date: 2026-05-10

## Decision
The home hero center should be modeled as one background image plus three real DOM primitives: search box, primary CTA, secondary CTA. Light and black may have theme colors, but must not expose separate interaction/copy modes.

## Fix
- Added shared `HomeHeroActions` for the two CTAs.
- Kept one shared search box geometry and placeholder across light/black.
- Masked old baked black search/CTA variants from the artboard and rendered real DOM controls above the hero background.
- Preserved theme-only visual tone differences.

## Verification
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend run test:soul-link-reference-ux`

## Evidence
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-light-desktop.png`
- `D:\work\ai-\.trellis\tasks\05-10-05-10-ui-ux-design-audit-and-polish\artifacts\playwright\home-black-desktop.png`
