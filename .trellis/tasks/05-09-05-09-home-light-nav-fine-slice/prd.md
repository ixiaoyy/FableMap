# Home light nav fine slice

## Goal

Continue the accepted 1:1 reference decomposition, but follow real frontend design boundaries instead of splitting just to increase slice count.

This step extracts the top navigation as one `Header/Nav` boundary and leaves all internal nav elements together because logo, menu links, search, theme toggle, owner entry, and primary CTA are one navigation component in the actual page design.

## Scope

Parent slice:

- `01-nav-hero` — `y=0`, `height=470`

New runtime slices:

1. `01a-nav-bar` — `y=0`, `height=72`: complete top navigation component boundary.
2. `01b-hero-main` — `y=72`, `height=398`: hero body component boundary.

Runtime now stacks 12 slices total. Transparent hotspots remain on the full-artboard overlay so links are not clipped by slice boundaries.

## Design-boundary guardrails

- Split by actual frontend component semantics: Header/Nav and Hero.
- Do not split logo/menu/search/actions into separate image fragments at this stage.
- No redraw.
- No typography/button/illustration recreation.
- No arbitrary decorative micro-slices.
- Keep source artboard visual 1:1.
- Keep the old parent slice in the asset directory for comparison, but do not import it in the runtime manifest.
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
```

## Next possible slice

Continue by real frontend boundaries, for example:

- `Hero` internals only if implementing real DOM later: copy/CTA/metric cluster vs illustration/overlay panels.
- Or move to the next page section and avoid splitting decorative spacer-only strips unless required by layout composition.

