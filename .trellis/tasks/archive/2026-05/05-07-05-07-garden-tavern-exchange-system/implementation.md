# Implementation: Garden Tavern Exchange System

## Summary
- Extended the Garden Tavern farm helper with deterministic crop quotes, watermelon anchor pricing, wallet/revenue formatting, inventory normalization, and sell actions.
- Added a farm exchange section to the Garden Farm panel with price rows, sell-one/sell-all controls, empty-inventory handling, and mobile-safe layout styles.
- Wired farm sell/market/status actions through `TavernChatRoom` so the NPC farm housekeeper can broadcast market quotes and transaction revenue.
- Added a script test for farm market/sale helper contracts and included it in the frontend test command.

## Validation
- `node .\frontend\scripts\tavern-farm-modes-test.mjs` — PASS.
- `npm --prefix .\frontend test` — PASS.
- `npm --prefix .\frontend run build` — PASS.
- `node .\.trellis\tasks\05-07-05-07-garden-tavern-exchange-system\artifacts\playwright\garden-exchange-check.mjs` — PASS.
  - Desktop screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-exchange-system/artifacts/playwright/desktop-garden-exchange.png`
  - Mobile screenshot: `.trellis/tasks/05-07-05-07-garden-tavern-exchange-system/artifacts/playwright/mobile-garden-exchange.png`
- `npm --prefix .\frontend run typecheck` — FAILS on unrelated existing territory TS inline-style errors in `frontend/app/components/TerritoryClaimPanel.tsx` and `frontend/app/components/TerritoryManagementPanel.tsx`; no reported error points to the garden exchange files.
