# Home light featured region fine slice

## Goal

Continue the gradual 1:1 decomposition without redesign. This step fine-splits only the coarse `02-featured-regions` block.

## Scope

Parent coarse block:

- `home-light-slice-02-featured-regions.png` (`y=470`, `height=295`)

New fine slices:

1. `02a-featured-heading` — `y=470`, `height=82`: section heading, right-side mascot/decor.
2. `02b-featured-cards` — `y=552`, `height=195`: the three featured-region cards.
3. `02c-featured-bottom` — `y=747`, `height=18`: bottom transition into the AI role section.

Runtime now stacks 8 slices total: the original 6 coarse sections minus `02`, plus `02a/02b/02c`.

## Important guardrail

No freehand component redraw was done. The page still uses image slices from the approved `index_light.png` artboard and a global transparent hotspot overlay. This avoids clipping hotspots that span fine-slice boundaries.

## Files changed

- `frontend/app/routes/home.tsx`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02a-featured-heading.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02a-featured-heading-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02a-featured-heading.prompt.md`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02b-featured-cards.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02b-featured-cards-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02b-featured-cards.prompt.md`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02c-featured-bottom.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02c-featured-bottom-2x.png`
- `frontend/app/assets/homepage/light/slices/home-light-slice-02c-featured-bottom.prompt.md`
- `frontend/scripts/home-visual-density-test.mjs`
- `frontend/scripts/home-pc-polish-test.mjs`
- `frontend/scripts/homepage-dynamic-entry-test.mjs`
- `frontend/scripts/playwright-home-light-reference-check.mjs`

## Validation run

Passed on 2026-05-09:

```powershell
node .\frontend\scripts\home-visual-density-test.mjs
node .\frontend\scripts\home-pc-polish-test.mjs
node .\frontend\scripts\homepage-dynamic-entry-test.mjs
node .\frontend\scripts\home-links-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
git diff --check -- .\frontend\app\routes\home.tsx .\frontend\scripts\home-visual-density-test.mjs .\frontend\scripts\home-pc-polish-test.mjs .\frontend\scripts\homepage-dynamic-entry-test.mjs .\frontend\scripts\playwright-home-light-reference-check.mjs .\.trellis\workspace\lijin\journal-1.md .\.trellis\workspace\lijin\index.md
```

## Visual QA status

Playwright screenshot self-check was intentionally not run after the user preference was recorded: before running Playwright/browser self-acceptance, ask whether manual visual inspection is available. Awaiting user choice for manual inspection vs Playwright run.

## Next possible fine split

If this step is accepted visually, split `02b-featured-cards` into three per-card slices while leaving the section background/heading untouched.
