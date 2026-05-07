# Backend Error Handling

> How backend errors are represented, propagated, and degraded in FableMap.

---

## Overview

The backend exposes FastAPI endpoints. User/client errors should become `fastapi.HTTPException` with meaningful Chinese user-facing `detail` strings. `backend/src/fablemap_api/core/web/app.py` normalizes these into JSON:

```python
@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})
```

Frontend clients accept both `error` and `detail`, so keep this response shape stable.

---

## Error types and response shape

Use these conventions:

| Situation | Pattern |
|-----------|---------|
| Missing resource | `HTTPException(status_code=404, detail="空间不存在")` |
| Missing/invalid identity | `HTTPException(status_code=400 or 403, detail="...")` |
| Permission denied | `HTTPException(status_code=403, detail="...")` |
| Invalid user payload | `HTTPException(status_code=400, detail="...")` |
| LLM unavailable | Degraded payload where possible; do not crash chat flow unnecessarily |
| Unexpected server bug | Log server-side; return safe generic error or degraded fallback where product requires continuity |

Examples from existing code include private tavern checks, missing visitor identity checks, and gameplay/session ownership checks in `backend/src/fablemap_api/core/web/service.py`.

---

## Error handling patterns

### Validate at the boundary, enforce in service

Routes extract request data and user identity, then delegate. Service methods enforce ownership and state. Example route pattern:

```python
@router.post("/{tavern_id}/chat")
def send_chat(request: Request, tavern_id: str, data: ChatRequest) -> dict[str, Any]:
    return _taverns(request).send_chat(
        tavern_id,
        character_id=data.character_id,
        message=data.message,
        visitor_id=data.visitor_id or _get_user_id(request),
        user_id=_get_user_id(request),
    )
```

The application method should check tavern existence, access, status, LLM config, and visitor scope. Migrated-product-core `/api/*` routes follow the same rule through `backend/src/fablemap_api/core/web/service.py`.

### Prefer degraded chat/gameplay payloads over hard crashes

FableMap's tavern experience should remain understandable when an LLM backend fails. Existing `WebService` chat/group-chat logic catches `LLMError`, logs a warning, marks the tavern closed when appropriate, and returns a rule/fallback response with degradation metadata.

Follow this pattern for AI-adjacent features:

```python
except LLMError as e:
    logger.warning("... %s", e)
    response_text = self._fallback_response(message, char.name)
    self._mark_tavern_closed(tavern)
```

Do not expose API keys, full provider payloads, or sensitive request bodies in degradation messages.

### Use deterministic fallback for gameplay

`backend/src/fablemap_api/core/gameplay.py` uses fallback events and seeds based on session context. AI Director output must be validated before use; illegal JSON, unknown node IDs, or unsafe values should fall back rather than corrupt session state.

---

## API error responses

Backend HTTP errors are JSON objects with an `error` field because of `backend/src/fablemap_api/core/web/app.py`. Frontend service helpers parse:

```javascript
const err = new Error(payload.error || payload.detail || `HTTP ${response.status}`)
```

Do not change the backend error envelope without updating frontend clients and tests.

---

## Logging errors

- Use module loggers: `logger = logging.getLogger(__name__)`.
- Use `logger.warning` for expected external failures such as LLM provider issues or invalid output-rule application.
- Use `logger.error` for unexpected internal exceptions.
- Never log raw API keys, owner secrets, visitor-sensitive data, or full prompts unless explicitly redacted.

See `backend/src/fablemap_api/core/web/service.py` and `backend/src/fablemap_api/core/llm_clients.py` for existing patterns.

---

## Real examples to follow

1. `backend/src/fablemap_api/core/web/app.py` central `HTTPException` handler keeps API errors JSON-shaped for the frontend.
2. `backend/src/fablemap_api/core/web/service.py` `send_group_chat_payload(...)` separates user identity checks, tavern status checks, LLM degradation, token counting, history persistence, and memory fallback.
3. `backend/src/fablemap_api/core/gameplay.py` `fallback_result(...)` / `AIDirector` validation keeps gameplay sessions recoverable when AI output is unusable.
4. `backend/src/fablemap_api/core/tavern.py` `_load_taverns(...)` returns `{}` on invalid JSON rather than throwing during store load.

---

## Common mistakes

- Letting raw `KeyError`, `ValueError`, or provider exceptions leak to clients for expected user mistakes.
- Returning different error envelopes from different endpoints.
- Swallowing an exception and continuing with partially written state.
- Logging `llm_config.api_key`, prompt text containing secrets, visitor private memory, or password hashes.
- Treating every AI failure as a 500 when a degraded/fallback response is part of the product flow.
