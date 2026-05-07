# Completion note

## Implemented

- Replaced `/tavern/:id` first screen with a native SillyTavern-style chat workbench.
- Kept tavern chat as the mainline: NPC roster, chat history, and persistent bottom composer are visible before folded panels.
- Folded public secondary features under `更多空间功能`.
- Gated owner management with `isOwner` and `data-owner-only-panel`.
- Removed loader fallback from visitor identity to `DEFAULT_OWNER_ID`.
- Preserved owner identity from `/owner` tavern links with `?owner_id=...`.
- Updated mobile single-mainline spec and regression tests for the new chat-first contract.

## Verification

Commands run on 2026-05-05:

```powershell
node .\frontend\scripts\tavern-chat-workbench-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend test
npm --prefix .\frontend run build
node .\.trellis\tasks\05-05-05-05-tavern-chat-workbench\artifacts\playwright-check.mjs
```

Results:

- `tavern-chat-workbench-test`: ok.
- `typecheck`: exit 0.
- `npm test`: exit 0.
- `build`: exit 0.
- Playwright: exit 0; checked visitor desktop, visitor mobile, and owner desktop.

Playwright artifacts:

- `.trellis/tasks/05-05-05-05-tavern-chat-workbench/artifacts/playwright-report.json`
- `.trellis/tasks/05-05-05-05-tavern-chat-workbench/artifacts/visitor-desktop.png`
- `.trellis/tasks/05-05-05-05-tavern-chat-workbench/artifacts/visitor-mobile.png`
- `.trellis/tasks/05-05-05-05-tavern-chat-workbench/artifacts/owner-desktop.png`

## Notes

- Playwright required sandbox escalation to launch local Chromium.
- The public-welfare fixture still stores older flat NPC avatar paths; the workbench normalizes those to the current `assets/npcs/public-welfare/<character>/<expression>.png` layout to avoid broken avatar requests.
