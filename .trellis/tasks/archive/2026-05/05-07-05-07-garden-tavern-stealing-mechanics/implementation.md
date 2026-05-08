# Implementation: Garden Tavern Stealing Mechanics

## Summary
- Added local daily stealing state to farm progress with `FARM_DAILY_STEAL_LIMIT = 3`, deterministic neighbor plots, per-day reset, and same-target daily lockout.
- Added helper APIs for neighbor rows, theft calculation, and steal progress updates that add stolen crops to the visitor's private inventory.
- Extended Garden Farm UI with a “邻田成熟作物” panel, remaining-attempt counter, disabled states for already-stolen / daily-limit targets, and mobile-safe styles.
- Wired `steal` / `steal-status` actions through `TavernChatRoom` so the farm housekeeper can explain the result and affected-visitor notification boundary.
- Extended `frontend/scripts/tavern-farm-modes-test.mjs` with daily limit, repeat stealing, inventory, and prompt-boundary checks.

## Validation
- `node .\frontend\scripts\tavern-farm-modes-test.mjs` — PASS.
- `npm --prefix .\frontend test` — PASS.
- `npm --prefix .\frontend run build` — PASS.
- `node .\.trellis\tasks\05-07-05-07-garden-tavern-stealing-mechanics\artifacts\playwright\garden-stealing-check.mjs` — PASS.
  - Desktop screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-stealing-mechanics/artifacts/playwright/desktop-garden-stealing.png`
  - Mobile screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-stealing-mechanics/artifacts/playwright/mobile-garden-stealing.png`
- `npm --prefix .\frontend run typecheck` — FAILS on unrelated existing territory TS inline-style errors in `frontend/app/components/TerritoryClaimPanel.tsx` and `frontend/app/components/TerritoryManagementPanel.tsx`; no reported error points to garden farm files.
