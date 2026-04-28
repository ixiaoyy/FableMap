# Homepage PC Visual Polish

## Goal

Improve desktop homepage first impression before continuing mobile work.

## Scope

* Focus on PC/desktop homepage hero and immediate below-fold density.
* Preserve the approved headline: `每个坐标，都可能藏着一个世界`.
* Preserve broad coordinate-space positioning; do not revert to tavern-only copy.
* Do not change backend/API/schema.
* Do not continue mobile-specific work in this task.

## Design Direction

* More premium cyber landing page: denser, sharper, stronger visual hierarchy.
* Hero should feel like a high-end product/game opening screen, not a sparse slide.
* Use existing high-quality project-local assets only.
* Keep explanatory text minimal.
* Strengthen PC composition using:
  * wider hero grid,
  * stronger radar visual panel,
  * compact desktop metrics strip integrated into first screen,
  * sharper HTML/CSS overlays instead of blurry baked-in text.

## Acceptance Criteria

* Desktop homepage no longer feels loose/empty in a 1440px viewport.
* Hero visual remains high-quality and uses `discover-radar-surface.png`.
* PC first screen exposes core CTAs and meaningful metrics without large dead space.
* Mobile-specific changes are out of scope.
* `npm --prefix .\frontend run typecheck`, `npm --prefix .\frontend test`, and `npm --prefix .\frontend run build` pass.
* Desktop screenshot captured under `artifacts/dev-server/`.
## Implementation Notes (2026-04-28)

Desktop homepage polish slice completed.

Changes:

* `frontend/app/routes/home.tsx`
  * Added `DesktopMetricRail` so PC metrics live inside the hero instead of only in a separate below-hero band.
  * Shifted desktop hero grid to `lg:grid-cols-[0.56fr_1.44fr]`, giving the radar visual stronger dominance.
  * Raised desktop radar panel to `lg:min-h-[560px]` while keeping the no-viewport-height rule, avoiding the old blank full-screen layout.
  * Added crisp HTML/CSS overlay details to the radar visual: layer status panel and coordinate/memory/NPC signal rail.
  * Hid the old separate metrics strip on desktop with `lg:hidden`; it remains available for smaller layouts.
* `frontend/scripts/home-pc-polish-test.mjs`
  * Added a static regression test for PC hero metric integration, visual dominance, approved asset use, and no viewport-height blank layout.
* `frontend/scripts/home-visual-density-test.mjs`
  * Updated the expected desktop poster height from the prior 500px slice to the new approved 560px PC polish slice.
* `frontend/package.json`
  * Wired `home-pc-polish-test.mjs` into `npm --prefix .\frontend test`.

Verification:

* RED: `node .\frontend\scripts\home-pc-polish-test.mjs` failed before implementation because `DesktopMetricRail` did not exist.
* GREEN: `node .\frontend\scripts\home-pc-polish-test.mjs`: exit 0, `home-pc-polish-test: ok`.
* `node .\frontend\scripts\home-visual-density-test.mjs`: exit 0.
* `npm --prefix .\frontend run typecheck`: exit 0.
* `npm --prefix .\frontend test`: exit 0; all frontend script tests ok including `home-visual-density-test`, `home-pc-polish-test`, `mobile-touch-targets-test`, and `discover-view-mode-test`.
* `npm --prefix .\frontend run build`: exit 0; React Router/Vite production build completed.
* Browser screenshot captured: `artifacts/dev-server/home-compact-desktop.png` (1440x1000). Visual check confirms the PC first screen is denser: left-side metrics are integrated into hero, the radar panel has stronger width/scale, and the next section starts without a large dead zone.

Deferred:

* Discover PC and tavern detail PC polish remain next slices.
* No backend/API/schema changes were made.
