# Home light featured card rows fine slice

## Goal

Continue the accepted gradual 1:1 split. This step only fine-splits the existing `02b-featured-cards` slice into two horizontal rows without redesigning anything.

## Scope

Parent slice:

- `02b-featured-cards` — `y=552`, `height=195`

New runtime slices:

1. `02b1-featured-card-covers` — `y=552`, `height=112`: cover-image/badge area of the three featured cards.
2. `02b2-featured-card-info` — `y=664`, `height=83`: title, location, and chips of the three featured cards.

Runtime now stacks 9 slices total. Transparent hotspots remain on the full-artboard overlay so links are not clipped by slice boundaries.

## Guardrails

- No redraw.
- No typography/card recreation.
- No design interpretation.
- Keep source artboard visual 1:1.
- Playwright visual self-check was not run because the user confirmed they can manually inspect; use static/build validation only unless the user asks for a screenshot/self-check.

## Validation

Passed on 2026-05-09:

```powershell
node .\frontend\scripts\home-visual-density-test.mjs
node .\frontend\scripts\home-pc-polish-test.mjs
node .\frontend\scripts\homepage-dynamic-entry-test.mjs
node .\frontend\scripts\home-links-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
git diff --check -- .\frontend\app\routes\home.tsx .\frontend\scripts\home-visual-density-test.mjs .\frontend\scripts\home-pc-polish-test.mjs .\frontend\scripts\homepage-dynamic-entry-test.mjs .\frontend\scripts\playwright-home-light-reference-check.mjs
```

## Next possible slice

If accepted, next split can target `02b1-featured-card-covers` into three per-card cover slices plus preserved background strip, or move to another coarse section such as `03-ai-roles`.
