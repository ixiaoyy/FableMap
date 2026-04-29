# Implementation — Tavern Visitor Notes / 回访反馈 MVP

## Summary

Implemented the re-scoped, owner-visible visitor notes MVP. This replaces the risky public guestbook/reply/pin scope with a bounded feedback loop: visitors can send a private note to the tavern owner; owners can list/delete notes; notes never appear in public Tavern payloads.

## Files changed

- `backend/src/fablemap_api/infrastructure/visitor_note_store.py`
  - JSON-backed `VisitorNoteStore` abstraction.
- `backend/src/fablemap_api/application/taverns.py`
  - Wires `visitor_note_store` and adds `create_visitor_note`, `list_visitor_notes`, `delete_visitor_note`.
  - Removed exposed application message-board methods from this task path.
- `backend/src/fablemap_api/main.py`
  - Wires `VisitorNoteStore(output_root / "visitor_notes.json")`.
- `backend/src/fablemap_api/api/v1/taverns.py`
  - Adds `/visitor-notes` create/list/delete endpoints.
  - Removes v1 `/messages` public guestbook/reply/pin routes.
- `backend/src/fablemap_api/contracts/taverns.py`
  - Adds visitor note request/list response contracts.
- `tests/test_tavern_visitor_notes.py`
  - Covers create, owner-only list, public payload exclusion, delete, and old social route non-exposure.
- `frontend/app/lib/taverns.ts`
  - Adds `createVisitorNote`, `listVisitorNotes`, `deleteVisitorNote` helpers and types.
- `frontend/app/routes/tavern.tsx`
  - Adds `VisitorNotesPanel` with visitor submit and owner-only review/delete UI.
- `frontend/scripts/visitor-notes-test.mjs`
  - Adds frontend contract checks.
- `.trellis/spec/backend/database-guidelines.md`
  - Adds executable `Owner-Visible Tavern Visitor Notes` scenario.
- `.trellis/spec/frontend/type-safety.md`
  - Adds executable `Tavern Visitor Notes UI Boundary` scenario.

## Validation

- `py -3 -m compileall -q backend/src` → passed.
- `py -3 -m pytest -q tests/test_tavern_visitor_notes.py tests/test_ai_assisted_tavern_drafts.py --tb=short` → passed (`12 passed`).
- `npm --prefix .\frontend run typecheck` → passed.
- `npm --prefix .\frontend test` → passed.
- `npm --prefix .\frontend run build` → passed.

## Notes

- Existing MySQL `TavernMessageModel`/store code remains outside the v1 route path; this task prevents public social exposure through the active v1 API.
- Manual browser testing was not run in this session.