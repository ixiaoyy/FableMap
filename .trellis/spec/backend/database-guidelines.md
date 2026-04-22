# Backend Persistence Guidelines

> FableMap currently uses JSON-file persistence, not a SQL database or ORM.

---

## Overview

There is no database migration framework in this repository. Persistent backend state is stored as JSON/JSONL under the configured output root (default described in `backend/src/fablemap_api/core/web/config.py` and architecture docs as `fablemap_data/`).

Important stores:

```text
fablemap_data/
├── taverns.json                  # Tavern public/config payloads; includes gameplay_definitions
├── taverns_keyvault.json          # Owner LLM API keys / private config
├── chat_history/                  # Per-tavern/per-visitor/per-character JSONL-like histories
├── writeback-state.json           # World/player writeback state
└── _gameplay_sessions             # Logical private bucket inside TavernStore data
```

The exact implementation is in `backend/src/fablemap_api/core/tavern.py` and `backend/src/fablemap_api/core/writeback.py`.

---

## Persistence patterns

### Use explicit load-normalize-save flows

`TavernStore` reads JSON from disk, normalizes through dataclasses/helper functions, then writes JSON back. Existing examples:

```python
def _load_taverns(self) -> dict[str, Any]:
    try:
        return json.loads(self.taverns_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
```

```python
characters = [TavernCharacter.from_dict(c) for c in d.get("characters", [])]
world_info = [WorldInfoEntry.from_dict(w) for w in d.get("world_info", [])]
llm = LLMConfig.from_dict(d.get("llm_config", {}))
```

When reading older data, prefer defaults and normalizers over crashing on missing optional fields.

### Keep public and private payloads separate

`Tavern.to_dict()` and `Tavern.to_dict_public()` must not expose secrets. `LLMConfig.to_dict()` intentionally returns `api_key: ""`; `to_dict_private()` is only for owner/internal use.

Example from `backend/src/fablemap_api/core/tavern.py`:

```python
def to_dict_private(self, user_id: str) -> dict[str, Any]:
    result = self.to_dict()
    if user_id == self.owner_id:
        result["llm_config"] = self.llm_config.to_dict_private()
    return result
```

New persistence code must preserve this owner/public separation.

### Gameplay sessions are runtime-private

`gameplay_definitions` are Tavern content and can be exported/imported with tavern packages. `GameplaySession` data is visitor runtime state and must not be mixed into public Tavern payloads or exported as tavern content.

Existing docs and code to inspect:

- `docs/WORLD_SCHEMA.md` Gameplay section
- `backend/src/fablemap_api/core/gameplay.py`
- `backend/src/fablemap_api/core/tavern.py` `list_gameplay_sessions`, `get_gameplay_session`, `save_gameplay_session`
- `tests/test_tavern_gameplay_api.py`

---

## Query/list patterns

### Filtering belongs in service/store methods

`TavernService.list_taverns(...)` handles filters such as access, status, owner, query, and distance. Keep new list filters close to that logic and cover them with tests.

### Always scope visitor-owned state

Chat history, memory atoms, visitor states, and gameplay sessions are scoped by tavern and visitor/owner identity. Existing service methods enforce this with helpers such as:

```python
def _ensure_gameplay_session_access(self, tavern: Any, session: GameplaySession, user_id: str) -> None: ...
```

```python
def _ensure_group_chat_visitor_scope(...): ...
```

Do not add a list endpoint that lets ordinary visitors read other visitors' runtime data.

---

## Schema change rules

Schema changes are medium/high risk. Before adding/changing persistent fields:

1. Confirm the field is allowed by `docs/WORLD_SCHEMA.md` and not blocked by `docs/WHAT_NOT_TO_BUILD.md`.
2. Update `docs/WORLD_SCHEMA.md` if this is a canonical schema change.
3. Add backward-compatible `from_dict` / normalization behavior.
4. Update frontend service/component expectations if payload shape changes.
5. Add or update tests in `tests/test_tavern_*.py` or the relevant module test.
6. Run at least `py -3 -m compileall -q backend/src` and relevant pytest.

Do **not** silently change enum semantics (`access`, `status`, gameplay states, relationship stages) without docs and tests.

---

## Migrations

There is no formal migration runner. Compatibility is handled by:

- default values in dataclass fields,
- `from_dict` fallbacks,
- `_normalize_*` helpers,
- idempotent seed/update logic such as default public-welfare tavern seeding.

If a change cannot be handled by backward-compatible readers, stop and design an explicit migration plan with the user.

---

## Naming conventions

- Persistent JSON keys use `snake_case` to match existing schema (`owner_id`, `created_at`, `world_info`, `llm_config`, `token_used`).
- IDs are strings. Existing code often generates prefixed IDs such as `msg_<hex>` or gameplay IDs from payloads.
- Timestamps should be ISO strings; helper functions typically use UTC and `Z` suffix where needed.
- Do not introduce frontend-only labels as persistent enum values.

---

## Real examples to follow

1. `backend/src/fablemap_api/core/tavern.py` `Tavern.from_dict`: reads optional lists with `d.get(...)`, normalizes nested structures, and preserves defaults.
2. `backend/src/fablemap_api/core/gameplay.py` `normalize_gameplay_definition`: clamps/normalizes user-provided gameplay definitions before saving.
3. `backend/src/fablemap_api/core/writeback.py` `WritebackStore` / `WritebackEngine`: separates storage paths, state defaults, event validation, and state mutation.
4. `tests/test_tavern_backup_restore.py` and `tests/test_tavern_gameplay_models.py`: demonstrate persistence/import-export behavior expected by tests.

---

## Common mistakes

- Treating `taverns.json` as free-form storage and adding fields without `WORLD_SCHEMA` alignment.
- Returning `password_hash`, `api_key`, private voice/LLM config, or other sensitive fields to non-owner users.
- Storing gameplay sessions in public Tavern payloads.
- Writing one-off migration scripts or destructive data rewrites without a design/review step.
- Assuming JSON files are valid; existing code intentionally handles decode errors in selected paths.
