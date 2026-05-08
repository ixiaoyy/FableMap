# Implementation: Garden Tavern Currency Economy

## Summary
- Added black-diamond currency economy helpers: seed costs, daily bonus, local visitor stats, shop purchases, premium seed unlocks, and tavern-local self-rank prompts.
- Updated planting so seeds require wallet funds and deduct seed cost; insufficient balance is disabled in UI and explained by NPC prompt.
- Extended Garden Farm UI with daily bonus, local economic stats, seed price labels, shop modal, affordable/owned states, and premium seed unlock path.
- Updated `TavernChatRoom` to use extended farm update/prompt handling for plant/buy/daily-bonus while preserving read-only status/market/steal-status actions.
- Extended farm regression tests for daily bonus, seed-cost planting, earnings stats, and tavern-local rank prompt.

## Validation
- `node .\frontend\scripts\tavern-farm-modes-test.mjs` — PASS.
- `npm --prefix .\frontend test` — PASS.
- `npm --prefix .\frontend run build` — PASS.
- `node .\.trellis\tasks\05-07-05-07-garden-tavern-currency-economy\artifacts\playwright\garden-currency-check.mjs` — PASS.
  - Desktop screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-currency-economy/artifacts/playwright/desktop-garden-currency.png`
  - Mobile screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-currency-economy/artifacts/playwright/mobile-garden-currency.png`
- `npm --prefix .\frontend run typecheck` — FAILS on unrelated existing territory TS inline-style errors in `frontend/app/components/TerritoryClaimPanel.tsx` and `frontend/app/components/TerritoryManagementPanel.tsx`; no reported error points to garden farm files.
