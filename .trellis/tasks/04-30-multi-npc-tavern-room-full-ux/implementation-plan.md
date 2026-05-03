# Implementation Plan — Multi-NPC Tavern Room Full UX

Task: `04-30-multi-npc-tavern-room-full-ux`  
Date: 2026-05-03  
Chosen scope: frontend-only MVP; reuse existing backend group-chat API/schema.

## Evidence read

- `docs/WHAT_NOT_TO_BUILD.md`: no platform auto-publication, no platform token billing, no unbounded visitor social features, no combat/levels/equipment.
- `docs/WORLD_SCHEMA.md`: Tavern/Character/VisitorState remain authoritative; StateCard/group chat outputs can only be pending candidates until confirmed.
- `.trellis/spec/backend/directory-structure.md`: existing native group-chat endpoints already cover config/send/history/talkativeness and include visitor isolation.
- `frontend/app/product/TavernChatRoom.jsx`: group-chat visitor room already loads group history and sends via `sendGroupChat`, but only shows a small “群聊模式” badge.
- `frontend/app/product/TavernGroupSettingsModal.jsx`: owner-facing speaker settings already exist; visitor room should explain them rather than create new config.
- `frontend/app/product/services/tavernService.js`: group-chat service helpers already exist; no new API helper needed.

## Decisions

1. Do not change backend contracts, schema, persistence, or API endpoints.
2. Add a visitor-facing multi-NPC guide panel inside `TavernChatRoom` only when `groupChatEnabled` is true.
3. The guide must explicitly define:
   - speaker rules: strategy, max response cap, cooldown/name prefix if enabled;
   - visitor agency: NPCs respond but cannot speak/decide for the visitor;
   - canon/state boundary: group chat may produce pending memory/state-card candidates; confirmation is required before canon.
4. Add a compact participant roster using existing character data and talkativeness, with no new data fields.
5. Add source-level script test and wire it into `npm --prefix .\frontend test`.

## Files to change

- `frontend/scripts/multi-npc-room-ux-test.mjs` — new source contract test.
- `frontend/package.json` — include the new test in the frontend test chain.
- `frontend/app/product/TavernChatRoom.jsx` — add helper copy/component and render in group-chat mode.
- `frontend/app/product/styles.css` — add desktop/mobile-safe styles.
- `.trellis/tasks/04-30-multi-npc-tavern-room-full-ux/prd.md` — record research, scope, and verification.
- `.trellis/tasks/04-30-multi-npc-tavern-room-full-ux/task.json` — mark frontend progress/completion when verified.

## TDD checkpoints

1. Add `multi-npc-room-ux-test.mjs` with assertions for the new guide/rules/agency/canon copy and CSS selectors.
2. Run `node frontend/scripts/multi-npc-room-ux-test.mjs` and observe the expected failure before implementation.
3. Implement JSX/CSS/package changes.
4. Re-run:
   - `node frontend/scripts/multi-npc-room-ux-test.mjs`
   - `npm --prefix .\frontend test`
   - `npm --prefix .\frontend run typecheck`
   - `npm --prefix .\frontend run build`
   - `python ./.trellis/scripts/task.py validate '.trellis/tasks/04-30-multi-npc-tavern-room-full-ux'`

## Non-goals

- No owner settings redesign.
- No AI content generation/autopublish.
- No visitor-to-visitor chat/social graph.
- No new gameplay/combat/ranking system.
- No token/billing UI.
