# Implementation plan

1. Red: add `frontend/scripts/tavern-chat-workbench-test.mjs` that fails until the native workbench, route replacement, owner gate, and owner links exist.
2. Green: add `frontend/app/features/tavern-chat-workbench/index.tsx` with NPC roster, chat history, persistent composer, password gate, folded public/owner panels, and owner-only management slot.
3. Replace `frontend/app/routes/tavern.tsx` default render with the workbench and remove visitor-to-owner loader fallback.
4. Preserve owner identity in `frontend/app/routes/owner.tsx` tavern links.
5. Update mobile tavern guide copy in `frontend/app/shell/product-shell.tsx` to chat-first.
6. Wire the new static test into `frontend/package.json`; run targeted test, full frontend test, typecheck, build, and browser self-acceptance if possible.
