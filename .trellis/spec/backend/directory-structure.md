# Backend Directory Structure

> How Python backend code is organized in FableMap.

---

## Overview

> **Refactor target note (2026-04-22)**: New enterprise-backend code lives under `backend/src/fablemap_api/` while the current runnable FableMap core remains under `backend/src/fablemap_api/core/`. The root `fablemap/` package has been retired; migrated product-core modules now live under `backend/src/fablemap_api/core/` and provide regression coverage while v1 modules are extracted.

Backend code lives in `backend/src/fablemap_api/core/`; tests live in `tests/`. The project is mostly standard-library Python plus `fastapi`, `uvicorn`, `httpx`, `python-multipart`, and `pytest` from `requirements.txt`.

The current backend is not organized as a deep package hierarchy. Many domain modules are top-level files under `backend/src/fablemap_api/core/`, while web/API composition is under `backend/src/fablemap_api/core/web/`.

---

## Directory layout

### Target enterprise backend layout

New FastAPI enterprise-layered code should follow this shape:

```text
backend/
├── src/fablemap_api/
│   ├── main.py                  # FastAPI app factory
│   ├── api/v1/                  # APIRouter modules only
│   ├── contracts/               # Pydantic request/response models
│   ├── application/             # use cases / orchestration
│   ├── domain/                  # framework-independent product rules
│   ├── repositories/            # repository interfaces
│   └── infrastructure/          # settings, storage, LLM/external adapters
└── tests/                       # tests for the new backend package
```

Contract: `api/v1/*` can import `contracts` and `application`; `application` can use `domain` and repository interfaces; `domain` must not import FastAPI.

```text
backend/src/fablemap_api/core/
├── __main__.py                 # `python -m fablemap_api` entry
├── api.py                      # API server CLI: arguments, app creation, uvicorn
├── web/
│   ├── app.py                  # FastAPI app factory and SPA static serving
│   ├── config.py               # ApiSettings and default paths/ports
│   ├── router.py               # HTTP routes; thin delegation to WebService
│   └── service.py              # Web-facing orchestration/payload methods
├── tavern.py                   # Tavern dataclasses, JSON store, TavernService
├── gameplay.py                 # GameplayDefinition/Session normalization and AI Director/fallback
├── llm_clients.py              # LLM backend adapters and client factory
├── char_card_parser.py         # SillyTavern card JSON/PNG parsing/export
├── world_info_injector.py      # WorldInfo keyword injection and macro substitution
├── writeback.py                # World/player writeback state engine
├── default_taverns.py          # Default public-welfare tavern seed data
├── memory/                     # Memory atom core types
├── orchestrator/               # Orchestrator schemas/rule/AI engine
└── application/                # Cross-layer web payload helpers

tests/
├── test_tavern_*.py            # Tavern/chat/gameplay/memory/API behavior
├── test_*                      # Core engine tests
└── fixtures/                   # Test fixtures such as Overpass samples
```

Do not use or modify generated/runtime folders as source: `__pycache__/`, `.pytest_cache/`, `tmp_pytest*/`, `frontend/dist/`, and similar output directories.

---

## Module organization rules

### Routes stay thin

New enterprise routes under `backend/src/fablemap_api/api/v1/` should declare HTTP shape and immediately delegate to application services. Example pattern:

```python
@router.get("/{tavern_id}/gameplays")
def list_gameplays(request: Request, tavern_id: str) -> dict:
    return _taverns(request).list_gameplays(tavern_id, _get_user_id(request))
```

When adding an endpoint, place request parsing and `X-User-Id` extraction in the route, but put domain checks and payload construction in `backend/src/fablemap_api/application/` or the relevant domain service. Migrated-product-core routes under `backend/src/fablemap_api/core/web/router.py` should keep their existing thin-route pattern while they remain in use.

### Domain models live near their store/service

`backend/src/fablemap_api/core/tavern.py` contains dataclasses such as `Tavern`, `TavernCharacter`, `WorldInfoEntry`, `LLMConfig`, `VisitorState`, and `ChatMessage`, plus `TavernStore` and `TavernService`.

Follow its serialization pattern:

```python
@dataclass
class ChatMessage:
    id: str
    tavern_id: str
    character_id: str
    visitor_id: str
    role: str
    content: str
    timestamp: str

    def to_dict(self) -> dict[str, Any]: ...

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "ChatMessage": ...
```

If a new persistent concept is needed, first confirm it belongs in the schema and product scope; then add `to_dict`/`from_dict`, backward-compatible defaults, tests, and docs together.

### Cross-layer payload code belongs in application services

For new enterprise code, `backend/src/fablemap_api/application/*.py` is the boundary between versioned routes, stores, prompt/LLM logic, and response payloads. It may call migrated product core domain modules such as `backend/src/fablemap_api/core/tavern.py`, `backend/src/fablemap_api/core/gameplay.py`, `backend/src/fablemap_api/core/memory`, and `backend/src/fablemap_api/core/llm_clients.py`, but it must not delegate to the migrated product web router/service layer.

Migrated-product-core `backend/src/fablemap_api/core/web/service.py` remains the boundary for current `/api/*` routes. Existing methods use the `_payload` suffix for route-facing responses, for example:

- `list_taverns_payload(...)`
- `tavern_chat_payload(...)`
- `start_gameplay_session_payload(...)`
- `advance_gameplay_session_payload(...)`

Use the existing suffix convention for migrated-product-core route responses. For new `/api/v1` route responses, prefer explicit application method names such as `send_chat(...)`, `list_gameplays(...)`, and `start_gameplay_session(...)` with request/response contracts in `backend/src/fablemap_api/contracts/`.

### Keep helpers local until reused

Many modules use small private helpers such as `_utc_now_iso`, `_normalize_*`, `_clamp_*`, `_ensure_*`, and `_safe_*`. Prefer local private helpers for module-specific normalization. Extract shared utilities only when the same logic is genuinely reused across modules.

---

## Naming conventions

- Python modules: `snake_case.py`.
- Classes/dataclasses: `PascalCase`.
- Functions/methods: `snake_case`.
- Internal helpers: leading underscore, e.g. `_normalize_group_chat_config`.
- Route handler names: HTTP/action-oriented, e.g. `get_tavern`, `post_tavern_chat`, `advance_gameplay_session`.
- Payload methods: suffix `_payload` when returning route response objects.
- Tests: `tests/test_<feature>.py`, with behavior-oriented names.

---

## Where to put new work

| Change type | Preferred location |
|-------------|--------------------|
| New tavern field or store behavior | `backend/src/fablemap_api/core/tavern.py` + tests + `docs/WORLD_SCHEMA.md` if schema-level |
| New `/api/v1/taverns/...` endpoint | `backend/src/fablemap_api/api/v1/taverns.py` route + `backend/src/fablemap_api/application/taverns.py` use case + `backend/src/fablemap_api/contracts/taverns.py` contract |
| Migrated-product-core `/api/taverns/...` endpoint | `backend/src/fablemap_api/core/web/router.py` route + `backend/src/fablemap_api/core/web/service.py` payload method |
| Gameplay normalization/session behavior | `backend/src/fablemap_api/core/gameplay.py` and relevant enterprise/migrated-product-core application boundary methods |
| LLM backend adapter | `backend/src/fablemap_api/core/llm_clients.py`, without logging secrets |
| SillyTavern import/export behavior | `backend/src/fablemap_api/core/char_card_parser.py` and tavern character tests |
| Writeback/world state behavior | `backend/src/fablemap_api/core/writeback.py` and writeback tests |
| Frontend-only API consumer | `frontend/app/lib/taverns.ts` for new routes or `frontend/app/product/services/tavernService.js` for product parity source, not Python |

---

## Examples of well-scoped modules

1. `backend/src/fablemap_api/core/gameplay.py` keeps definition normalization, session/event dataclasses, deterministic fallback, completion payloads, and AI Director output validation in one domain file.
2. `backend/src/fablemap_api/core/char_card_parser.py` isolates SillyTavern JSON/PNG card parsing and export helpers instead of spreading binary parsing through API code.
3. `backend/src/fablemap_api/core/web/app.py` is small and compositional: app creation, exception response shape, router registration, and SPA static fallback.

---

## Common mistakes

- Adding API logic directly inside route handlers when it belongs in `WebService` or `TavernService`.
- Putting frontend-specific display labels into backend schema fields.
- Treating old world/POI modules as the product mainline when docs say the current mainline is Tavern-centric.
- Creating new broad utility modules before checking whether the helper belongs to an existing domain file.
