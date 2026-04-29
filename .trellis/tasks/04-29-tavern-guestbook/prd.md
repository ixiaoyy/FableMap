# Tavern Visitor Notes / 回访反馈 MVP

## Status

- Task claimed by: `lijin`
- Current phase: brainstorm / scope correction
- Date: 2026-04-29

## Why this PRD replaces the original public guestbook scope

The original task text proposed a public guestbook with visitor-visible messages, replies, and pinning. That direction is risky for FableMap because `docs/WHAT_NOT_TO_BUILD.md` explicitly excludes unbounded visitor social features:

- no visitor social feed / dynamic wall;
- no cross-tavern visitor messaging;
- product focus is the relationship between visitor and tavern/NPC, not a generic social network;
- real-human participation must stay tavern-scoped and owner-governed.

Therefore this task is re-scoped to a bounded **visitor note / revisit feedback** feature:

> Visitors can leave a short note to the tavern owner after visiting a tavern. The note is tied to one tavern and one visitor identity. It is owner-visible by default and does not create visitor-to-visitor conversation.

## Goal

Add a lightweight feedback loop after tavern visits:

- Visitors can leave a short note such as “今天很喜欢这个 NPC 的欢迎语”.
- Owners can read/delete notes in their owner context.
- Notes help owners improve tavern content and understand revisit feedback.
- The feature must not become a public comment wall, reply thread, social feed, or private messaging system.

## Non-goals

- No visitor-to-visitor replies.
- No public social feed by default.
- No likes, follows, friend graph, mentions, inbox, or global notification stream.
- No anonymous moderation/reporting system in MVP.
- No platform ranking based on notes.
- No AI auto-publishing visitor notes into tavern content.

## MVP Product Shape

### Visitor side

On `/tavern/{id}`:

1. Visitor sees a small “给店主留一句反馈” entry after/near tavern interaction.
2. Visitor enters nickname and note content.
3. Submit creates a private owner-visible note.
4. Visitor can see “已发送给店主” confirmation.
5. Visitor can optionally view their own latest note in the current browser/session if supported by `visitor_id`, but not all visitors' notes.

### Owner side

MVP owner surface can be minimal:

1. Owner can call/list notes for their tavern.
2. Owner can delete any note in their tavern.
3. Owner sees note count / latest notes in owner context if UI scope allows.

Public display is explicitly out of MVP unless later approved as an owner-curated showcase with moderation.

## Data Model Draft

```typescript
interface TavernVisitorNote {
  id: string
  tavern_id: string
  visitor_id: string
  visitor_nickname: string
  content: string
  created_at: string
  visibility: "owner_only"
  deleted_at?: string | null
}
```

Rules:

- `visibility` is fixed to `owner_only` for MVP.
- `content` is plain text, length-limited.
- `visitor_nickname` is display text only, not identity proof.
- `visitor_id` comes from `X-User-Id` and is used for visitor-owned reads/deletes if implemented.
- Public Tavern payload must not include notes.

## API Draft

### Create note

```http
POST /api/v1/taverns/{tavern_id}/visitor-notes
X-User-Id: <visitor_id>
Content-Type: application/json

{
  "visitor_nickname": "旅行者",
  "content": "今晚的欢迎语很有氛围。"
}
```

Response:

```json
{
  "ok": true,
  "note": {
    "id": "note_xxx",
    "tavern_id": "...",
    "visitor_id": "visitor-demo",
    "visitor_nickname": "旅行者",
    "content": "今晚的欢迎语很有氛围。",
    "created_at": "2026-04-29T...Z",
    "visibility": "owner_only"
  }
}
```

### Owner list notes

```http
GET /api/v1/taverns/{tavern_id}/visitor-notes?limit=20&offset=0
X-User-Id: <owner_id>
```

Only tavern owner can list all notes.

### Delete note

```http
DELETE /api/v1/taverns/{tavern_id}/visitor-notes/{note_id}
X-User-Id: <owner_id or original visitor_id>
```

Owner can delete any note. Visitor can delete their own note if visitor self-delete is included.

## Acceptance Criteria

- [ ] Visitor note create requires `X-User-Id` and valid tavern access.
- [ ] Note content and nickname are trimmed and length-limited.
- [ ] Notes are stored outside public Tavern payload.
- [ ] Owner can list notes for owned tavern.
- [ ] Non-owner cannot list all notes.
- [ ] Owner can delete notes.
- [ ] No reply/thread/pin/social-feed behavior is implemented.
- [ ] Frontend service helpers live in `frontend/app/lib/taverns.ts`.
- [ ] `/tavern/{id}` visitor UI can submit a note without disrupting chat/entry flow.
- [ ] Tests cover create, owner list, unauthorized list, delete, and public payload exclusion.

## Verification Plan

Backend:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q tests/test_tavern_visitor_notes.py --tb=short
```

Frontend:

```powershell
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## Open Implementation Questions

1. Storage location: extend `TavernStore` JSON with a private bucket, or add a separate `visitor_notes.json` store abstraction?
   - Preferred: separate store abstraction if small and isolated, to avoid public tavern payload coupling.
2. Frontend owner surface: add note list to existing owner panel now, or backend + visitor submit first?
   - Preferred MVP order: backend + visitor submit + service tests first; owner UI can be next slice if current owner route is already busy.
3. Visitor self-delete in MVP?
   - Optional; owner delete is required.