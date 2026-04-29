# Backend Quality Guidelines

> Quality standards for Python backend changes in FableMap.

---

## Overview

Backend quality is defined by project constraints first, then by tests. The most important rule is to preserve the cyber tavern product boundary: real coordinates, owner-authored tavern content, AI as NPC/dialogue engine, sensitive owner LLM config, and SillyTavern-compatible character data.

---

## Required patterns

### Read docs before medium/high-risk work

For backend API/schema/product changes, read at least the relevant docs from `AGENTS.md`:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/WORLD_SCHEMA.md`
- `docs/WHAT_NOT_TO_BUILD.md`
- `docs/AI参与开发协议.md`
- relevant `.trellis/tasks/<task>/prd.md`, context jsonl files, and `.trellis/spec/` docs for the active task

### Keep behavior testable

Most backend behavior has pytest coverage in `tests/`. New or changed behavior should add/update focused tests near existing files:

- Tavern CRUD/chat/history: `tests/test_tavern_*.py`
- Gameplay: `tests/test_tavern_gameplay_api.py`, `tests/test_tavern_gameplay_models.py`
- World info/prompt/output rules: `tests/test_tavern_world_info_injection.py`, `tests/test_tavern_prompt_blocks.py`, `tests/test_tavern_output_rules.py`
- Core engines: `tests/test_writeback...`, `tests/test_orchestrator.py`, etc.

### New NPC completion requires art payload tests

If a backend/default-seed task adds a formal NPC role, do not claim the NPC is complete with text fields alone. The focused test must assert that the character payload includes `avatar` or `sprites.neutral`, required expression sprite semantics, and that project-local asset files exist. See `../frontend/npc-art-guidelines.md` for the cross-layer NPC completion contract.

### Keep route/service/store boundaries

- `router.py`: HTTP method/path/parameters and thin delegation.
- `web/service.py`: response payload orchestration, owner/visitor boundary checks, cross-module coordination.
- `tavern.py`: tavern domain dataclasses, JSON store, tavern CRUD/character/history operations.
- `gameplay.py`: gameplay normalization, session/event mechanics, AI/fallback result shaping.

### Normalize external/user input

Follow existing helpers such as `_normalize_*`, `_clamp_*`, `_safe_*`, and `from_dict` defaults. Do not assume browser payloads or imported SillyTavern cards are complete or well-typed.

---

## Forbidden patterns

- Adding dependencies not already in `requirements.txt` without user approval.
- Adding/changing schema fields without docs and tests.
- Exposing owner-only secrets to visitors.
- Implementing platform-generated tavern/NPC/story content.
- Adding platform token purchase/settlement/market logic.
- Adding visitor-to-visitor social features, combat, levels, equipment, or traditional map-app features.
- Mixing unrelated formatting/refactors into a functional change.
- Writing destructive file or git operations without explicit user confirmation.

---

## Verification requirements

For new enterprise-backend code under `backend/src`, run:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q backend/tests --tb=short
```

If a change touches both the migrated product core and new backend code, also run the migrated-product-core command:

```powershell
py -3 -m compileall -q backend/src
```

Choose the smallest real verification that matches the change:

```powershell
# Python syntax/importability check
py -3 -m compileall -q backend/src

# Focused backend tests
py -3 -m pytest -q tests/test_tavern_gameplay_api.py --tb=short

# Full backend tests when API/schema behavior is broad
py -3 -m pytest -q --tb=short
```

If frontend contracts change, also run relevant frontend build/tests from `frontend/` docs.

Never claim completion without fresh command output.

---

## Code review checklist

Review backend changes for:

- Product boundary: does it reinforce tavern discovery/entry/dialogue/memory instead of old map-game directions?
- Schema contract: are docs/tests/frontend services aligned?
- Security: are API keys, password hashes, private visitor data, and owner-only views protected?
- Persistence: is JSON read/write backward-compatible?
- Error handling: expected user/provider errors return stable JSON/degraded payloads.
- Tests: relevant pytest added/updated and command output recorded.
- Scope: no unrelated refactor, dependency, or formatting churn.

---

## Real examples to follow

1. `tests/test_tavern_chat_history_permissions.py` and `tests/test_tavern_memory_permissions.py` show permission-sensitive behavior should be directly tested.
2. `tests/test_tavern_gameplay_api.py` exercises the route/service/session boundary for gameplay rather than only unit-normalizing data.
3. `backend/src/fablemap_api/core/gameplay.py` keeps AI Director output validation/fallback separate from route handling.
4. `backend/src/fablemap_api/core/web/app.py` centralizes error envelope behavior instead of letting each route invent one.

---

## Common mistakes

- Running only `compileall` for behavior changes that need pytest.
- Changing response shape in backend but forgetting `frontend/app/lib/`, `frontend/app/product/services/`, and frontend scripts.
- Treating tests as documentation substitutes; still update `docs/WORLD_SCHEMA.md` for schema changes.
- Using broad `except Exception` without logging, rollback/fallback, or a clear reason.

---

## Scenario: Notification WebSocket MVP

### 1. Scope / Trigger

Use this contract when changing `backend/src/fablemap_api/core/notifications.py` or `backend/src/fablemap_api/api/v1/notifications.py`. The notification MVP is in-memory and process-local; it is not a Redis/pub-sub production system yet.

### 2. Signatures

```python
NotificationStore.add_notification(user_id, notification_type, title, content, data=None, tavern_id=None, tavern_name=None) -> Notification
NotificationStore.register_connection(user_id: str) -> asyncio.Queue
NotificationStore.unregister_connection(user_id: str, queue: asyncio.Queue) -> None
NotificationStore.get_notifications(user_id: str, limit=20, offset=0, unread_only=False) -> tuple[list[dict], int, int]
NotificationStore.mark_as_read(user_id: str, notification_id: str) -> bool
```

```http
GET /api/v1/notifications
POST /api/v1/notifications/{notification_id}/read
POST /api/v1/notifications/read-all
DELETE /api/v1/notifications/{notification_id}
GET /api/v1/notifications/unread-count
WS  /api/v1/notifications/ws/{user_id}
```

### 3. Contracts

- REST endpoints identify the user from `X-User-Id` / `X-User-ID` or `user_id`; missing identity returns `401`.
- WebSocket sends an initial `{ type: "connected", unread_count, notifications }` payload.
- After a WebSocket connects, new `NotificationStore.add_notification(...)` calls for that user must push `{ type: "notification", data }` to the connection.
- WebSocket client messages support `ping`, `mark_read`, `mark_all_read`, and `get_unread_count`.
- Store keeps only the most recent 100 notifications per user.
- MVP persistence is memory-only; data loss on restart is expected until a future store abstraction replaces it.
- Logs must use logger formatting and must not include private message bodies beyond notification title/type/user/tavern identifiers.

### 4. Validation & Error Matrix

| Case | Expected |
|------|----------|
| Missing user ID on REST list/read/delete | `401` |
| Mark unknown notification | `404` |
| WebSocket connect with no pending notifications | initial `connected` with `unread_count: 0` |
| Add notification while WebSocket is connected | WebSocket receives `type: notification` |
| Client sends `mark_read` | WebSocket replies `notification_read` and REST unread count decreases |
| Invalid WebSocket JSON | warning log only; connection stays alive |

### 5. Good/Base/Bad Cases

- Good: WebSocket registers a queue in `NotificationStore`, and `add_notification` broadcasts through that queue.
- Base: REST list/mark-read works without an active WebSocket.
- Bad: tracking sockets in a separate manager while `NotificationStore` broadcasts to unused queues; that makes real-time delivery silently fail.

### 6. Tests Required

```powershell
py -3 -m pytest -q tests/test_notifications.py --tb=short
py -3 -m compileall -q backend/src
```

Focused tests must assert REST list/mark-read and live WebSocket push after connection.

### 7. Wrong vs Correct

#### Wrong

```python
await manager.connect(websocket, user_id)
# NotificationStore.add_notification broadcasts to a different connection registry.
```

#### Correct

```python
store = get_notification_store()
queue = await store.register_connection(user_id)
# queue.get() is raced with websocket.receive_text(); add_notification pushes to this queue.
```
