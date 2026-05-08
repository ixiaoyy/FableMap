# Home light coarse sliced 1:1

## Goal

Respond to the owner feedback: do not redraw or reinterpret `设计参考/index_light.png`. Split it gradually, starting with a coarse 1:1 slice pass.

## Scope

First split only into 6 visual blocks:

1. `01-nav-hero` — navigation + hero.
2. `02-featured-regions` — glowing region cards.
3. `03-ai-roles` — AI role cards.
4. `04-memory-echoes` — memory cards.
5. `05-recommended-coordinates` — recommended coordinate cards.
6. `06-cta-footer` — creator CTA + footer.

Each slice has 1x and 2x PNG assets, and the route stacks them without gaps so the visual remains the same as the approved artboard. Existing transparent hotspots are redistributed to the slice that owns their y-range.

## Out of scope

- No freehand redesign.
- No approximate HTML/CSS redraw.
- No typography/card recreation yet.
- No API or schema changes.

## Files

Runtime:

- `frontend/app/routes/home.tsx`
- `frontend/app/assets/homepage/light/slices/home-light-slice-01-nav-hero.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-01-nav-hero-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02-featured-regions.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02-featured-regions-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-03-ai-roles.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-03-ai-roles-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-04-memory-echoes.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-04-memory-echoes-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-05-recommended-coordinates.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-05-recommended-coordinates-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-06-cta-footer.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-06-cta-footer-2x.png`

Each 1x slice has a same-directory `.prompt.md` provenance sidecar.

## Validation

Passed on 2026-05-09:

```powershell
node .\frontend\scripts\home-visual-density-test.mjs
node .\frontend\scripts\home-pc-polish-test.mjs
node .\frontend\scripts\homepage-dynamic-entry-test.mjs
node .\frontend\scripts\home-links-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
node .\frontend\scripts\playwright-home-light-reference-check.mjs
git diff --check -- .\frontend\app\routes\home.tsx .\frontend\scripts\home-visual-density-test.mjs .\frontend\scripts\home-pc-polish-test.mjs .\frontend\scripts\homepage-dynamic-entry-test.mjs .\frontend\scripts\playwright-home-light-reference-check.mjs
```

Playwright evidence:

- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-coarse-sliced-1to1\artifacts\playwright\home-light-reference-desktop.png`
- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-coarse-sliced-1to1\artifacts\playwright\home-light-reference-mobile.png`
- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-coarse-sliced-1to1\artifacts\playwright\report.md`

## Next decomposition step

If accepted, the next safe step is to split one coarse block at a time, starting with `02-featured-regions` into: section heading, card row, and decorative mascot/background. No redesign unless explicitly approved.
