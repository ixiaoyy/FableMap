# Implementation — Notification System MVP

## Summary

Completed the process-local notification MVP and fixed the live WebSocket delivery path. Existing code had REST notification APIs and frontend hook/component, but WebSocket connections were tracked in a separate `ConnectionManager` while `NotificationStore.add_notification(...)` broadcast to its own queue registry. That meant newly created notifications were stored but not pushed live to connected clients.

## Changes

- `backend/src/fablemap_api/core/notifications.py`
  - Uses timezone-aware UTC timestamps.
  - Uses printf-style logger calls.
  - Updates guest-message copy to owner-visible revisit feedback wording.
- `backend/src/fablemap_api/api/v1/notifications.py`
  - WebSocket now registers a queue with `NotificationStore`.
  - WebSocket loop races inbound client messages with outbound notification queue events.
  - New notifications after connect are pushed as `{ type: "notification", data }`.
  - REST user-id extraction accepts `X-User-Id` and `X-User-ID`.
  - Removes unused imports and avoids f-string logging.
- `tests/test_notifications.py`
  - Covers REST list + mark-read.
  - Covers live WebSocket push after connection.
- `.trellis/spec/backend/quality-guidelines.md`
  - Adds executable `Notification WebSocket MVP` scenario.

## Validation

- `py -3 -m compileall -q backend/src` → passed.
- `py -3 -m pytest -q tests/test_notifications.py tests/test_tavern_visitor_notes.py --tb=short` → passed (`7 passed`).

## Follow-up

- Current store is memory-only and process-local. Redis/pub-sub and durable notification persistence remain future work.
- No additional frontend changes were needed; `useNotifications` and `NotificationBell` already existed.