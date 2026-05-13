# Verification

Date: 2026-05-13

## Fix summary

- Preserve existing public/private chat messages when delayed `visitorState` updates re-run the entrance-message initialization effect; this prevents the first user message from being wiped after `enterTavern` resolves.
- Track the per-turn reply target name while a send request is pending, so `@NPC` / selected-NPC turns show `NPC 正在回复…` instead of `公共频道正在接话…`.

## Commands run

```powershell
npm --prefix .\frontend run build
```

Result: passed.

## Browser self-acceptance

Local React Router dev server: `http://127.0.0.1:5173`

Playwright mocked the relevant tavern APIs and verified `/tavern/pw_lantern_helpdesk` with a delayed `enterTavern` response to reproduce the first-message overwrite timing.

Assertions:

- Typed `@灯灯 你好` in the public composer.
- Pending indicator showed `灯灯 正在回复…`.
- User line `旅人 → @灯灯` appeared immediately and remained visible after delayed visitorState returned.
- Chat request body used `character_id: "lamp"`, `message: "你好"`, `display_message: "@灯灯 你好"`.
- Assistant reply `收到，灯灯 正在回应。` appeared.
- No browser console errors/warnings were captured.

Evidence files:

- `evidence/chat-mention-echo-browser-check.json`
- `evidence/chat-mention-echo-desktop.png`
- `evidence/chat-mention-echo-mobile.png`

## Remaining risk

This is a frontend state/indicator fix. It does not change backend chat routing or the broader public-channel/group-chat product semantics.
