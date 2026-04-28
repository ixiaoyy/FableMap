# Discover PC Visual Polish

## Goal

Improve `/discover` desktop visual quality after homepage PC polish. Keep the approved A+B model: default radar, search/filter/manual switch to cards.

## Scope

* PC/desktop discover page only.
* Preserve current data/API/schema and view-mode behavior.
* Do not continue mobile-specific work.
* Use existing project-local assets only.

## Design Direction

* Make the radar board feel denser and more finished on desktop.
* Keep the left control column, but make it sticky on large screens so the page feels like a cockpit.
* Give the radar board stronger PC presence with:
  * wider main grid ratio,
  * taller desktop radar board,
  * compact telemetry strip inside the board,
  * two-column signal list on wide screens.
* Keep card mode as the efficient browsing state; do not add new concepts or schema.

## Acceptance Criteria

* `/discover` desktop grid gives more space to the radar board than before.
* Radar view has a PC telemetry strip and denser two-column signal layout on wide screens.
* Left control column is stable/sticky on desktop.
* Existing `DiscoverViewMode = "radar" | "cards"` behavior remains intact.
* `npm --prefix .\frontend run typecheck`, `npm --prefix .\frontend test`, and `npm --prefix .\frontend run build` pass.
* Desktop screenshot captured under `artifacts/dev-server/`.

## Implementation Notes

* Added `DesktopRadarTelemetry` to give the default radar view a denser desktop cockpit feel.
* Expanded the desktop grid from `0.72fr/1.28fr` to `0.62fr/1.38fr`, made the left controls sticky on large screens, and increased radar board desktop height.
* Kept A+B behavior: default radar, manual/search/filter card browsing remains based on `DiscoverViewMode = "radar" | "cards"`.
* Updated script coverage with `frontend/scripts/discover-pc-polish-test.mjs` and adjusted the view-mode headline assertion for the two-line title.

## Verification

* `node .\frontend\scripts\home-visual-density-test.mjs` — passed.
* `node .\frontend\scripts\discover-view-mode-test.mjs` — passed.
* `node .\frontend\scripts\discover-pc-polish-test.mjs` — passed.
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend test` — passed.
* `npm --prefix .\frontend run build` — passed.
* Screenshot QA: `artifacts/dev-server/discover-radar-desktop.png`, `artifacts/dev-server/discover-cards-desktop.png`.

## Deferred / Not Done

* Mobile-specific Discover polish is intentionally deferred per user confirmation: PC first.
* Tavern detail / owner pages are not changed in this task.

