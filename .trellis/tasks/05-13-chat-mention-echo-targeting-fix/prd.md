# Chat First-message Echo and @NPC Targeting Fix

## Goal

Fix the tavern chat sending experience reported on 2026-05-13:

- User sends first message (e.g. `你好`) but the chat area does not show the user's own message.
- User explicitly `@` mentions / targets an NPC, but the UI still shows `公共频道正在接话...`.
- NPC response should be attributed to the targeted NPC instead of public channel when an NPC is selected or mentioned.

## Scope

Frontend chat workbench/send flow only unless the existing API payload contract is proven insufficient.

Likely files:

- `frontend/app/features/tavern-chat-workbench/index.tsx`
- `frontend/app/lib/taverns.ts`
- related chat/status UI helpers if present

## Acceptance Criteria

- [ ] After clicking send, the user's message is visible in the chat timeline immediately or after the request completes, including the first message in an empty chat.
- [ ] If an NPC is selected or the input contains `@NPC名`, pending/status text names that NPC instead of `公共频道`.
- [ ] NPC reply card is attributed to the target NPC when target information is available.
- [ ] No broad UI redesign or unrelated chat copy rewrite.
- [ ] `npm --prefix .\frontend run build` passes.
