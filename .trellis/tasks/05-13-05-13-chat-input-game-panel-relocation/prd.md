# Move mini-game panel out of chat input flow

## Problem

The tabletop mini-game launcher currently renders inside the main chat panel between the message log/status and the composer. User screenshot highlighted that this large panel sits in the input area and interferes with normal dialogue flow.

## Requirements

- Keep chat log and composer adjacent; no large secondary tools between messages/status and input.
- Move the mini-game launcher into a secondary/folded tools area below the composer or another non-blocking area.
- Preserve the existing mini-game start behavior and visual content.
- Keep only one lightweight source-order script check for the large mini-game panel placement; avoid copy-level assertions for incidental wording.
- Keep the NPC @ mention candidate menu hidden by default; it may open only after the visitor types `@`, and must hide again when `@` is removed.
- Keep @ mention copy conversational: do not describe it as “message directly sent to a specified NPC”; tell the visitor to @ a NPC and wait for reply.
- Do not change backend/API/schema.

## Acceptance Criteria

- [x] `data-mini-game-launcher` is no longer rendered before `data-chat-composer="fast-entry"` in `TavernChatWorkbench` source order.
- [x] Mini-game launcher remains present on the tavern page.
- [x] NPC @ mention suggestions use nullable active-query state so no candidate list appears before `@`, and deleting `@` closes it.
- [x] Public-chat copy avoids “direct send / specified NPC” wording and uses “输入 @NPC名 后等对应 NPC 回复”.
- [x] Frontend focused script and build pass.

## Verification / Grill-Me Review

Verdict: PASS.

Source of truth:
- User screenshot: the large “桌边小玩法 / 抽一张玩法卡” panel was highlighted between chat flow and the input area and should not live there.
- Frontend component source order in `frontend/app/features/tavern-chat-workbench/index.tsx`.
- Browser/Playwright evidence for `/tavern/pw_hospital_night_care`.

Evidence:
- `frontend/scripts/tavern-chat-workbench-test.mjs` keeps one lightweight source-order assertion: `<TavernMiniGamePanel>` renders after `data-chat-composer="fast-entry"`.
- `frontend/scripts/mini-games-test.mjs` keeps one legacy source-order assertion: mini-games render after `<ChatInputArea>`.
- Removed brittle copy-level and mention-implementation source assertions after review; these made small UI requests unnecessarily complex.
- Browser DOM: composer visible; big mini-game panel absent before composer; folded “桌边小玩法/小游戏收在这里，不挡聊天输入” summary visible after composer.
- Playwright screenshots saved:
  - `.trellis/tasks/05-13-05-13-chat-input-game-panel-relocation/evidence/desktop-composer-mini-game-folded.png`
  - `.trellis/tasks/05-13-05-13-chat-input-game-panel-relocation/evidence/mobile-composer-mini-game-folded.png`
  - `.trellis/tasks/05-13-05-13-chat-input-game-panel-relocation/evidence/browser-current-composer-mini-game-folded.png`

Problems / risks:
1. [P3] The folded drawer still exists below the composer; if product wants zero mini-game UI in the chat main column, next step is to move it to a side panel or separate tab.
2. [P2 unrelated] Full frontend test suite is still known to fail at `homepage-dynamic-entry-test.mjs` from an existing home-route `clientLoader` expectation, not from this change.

Smallest safe next step:
- If this still feels too close to the input, move the drawer into the left NPC/tools rail or a dedicated “玩法” tab.
