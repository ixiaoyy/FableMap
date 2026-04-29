# AI Assisted Tavern Drafts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-confirmed `/create` AI draft flow that uses a server-side owner default LLM config to fill tavern + first NPC form fields without persisting drafts until the owner creates the tavern.

**Architecture:** Add a focused owner-config JSON store beside the existing tavern JSON store, expose safe owner default LLM read/write APIs, then add a draft-generation API that loads the current owner config, calls the existing LLM client factory, parses strict JSON, and returns a sanitized draft. Frontend code adds service helpers and a compact create-page panel that maps draft responses into existing form fields; existing `createTavern` / `addCharacter` remain the only persistence path.

**Tech Stack:** Python/FastAPI/Pydantic, existing `fablemap_api.core.llm_clients`, JSON file persistence, pytest + monkeypatch, React Router/Vite/TypeScript, existing Node script tests.

---

## Storage Strategy Reminder

- JSON storage in this plan is an MVP adapter, not the long-term architecture.
- `OwnerConfigStore` is mandatory: routes and application services must not directly manipulate `owner_configs.json`.
- Keep the service contract independent of JSON so a later `MySQLOwnerConfigStore` can replace it without changing API behavior.
- Do not add more persistent JSON files from UI code or scattered service helpers; new persistent domains need an explicit Store boundary.
- Raw API Key must never be returned in read APIs, public Tavern payloads, export packages, frontend build artifacts, or logs.
## File Structure

- Create `backend/src/fablemap_api/domain/owner_llm_policy.py`: normalize/mask owner default LLM configs and draft request/response fields.
- Create `backend/src/fablemap_api/infrastructure/owner_config_store.py`: JSON file store at `<output_root>/owner_configs.json`.
- Modify `backend/src/fablemap_api/application/taverns.py`: accept optional `owner_config_store`.
- Modify `backend/src/fablemap_api/main.py`: instantiate `OwnerConfigStore`.
- Create `backend/src/fablemap_api/contracts/owner_defaults.py`: request models.
- Create `backend/src/fablemap_api/api/v1/owner_defaults.py`: owner default LLM + draft routes.
- Modify `backend/src/fablemap_api/api/v1/router.py`: include new router.
- Modify `backend/src/fablemap_api/application/services/owner_config.py`: service methods.
- Create `tests/test_ai_assisted_tavern_drafts.py`: backend coverage.
- Modify `frontend/app/lib/taverns.ts`: API types/functions.
- Create `frontend/app/lib/tavern-drafts.js`: pure request/response mapping helpers.
- Create `frontend/scripts/ai-tavern-drafts-test.mjs`: helper coverage.
- Modify `frontend/package.json`: include new script in `test`.
- Modify `frontend/app/routes/create.tsx`: AI draft panel and fillable form state.

---

### Task 1: Backend owner default LLM policy and store

**Files:**
- Create: `backend/src/fablemap_api/domain/owner_llm_policy.py`
- Create: `backend/src/fablemap_api/infrastructure/owner_config_store.py`
- Test: `tests/test_ai_assisted_tavern_drafts.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_ai_assisted_tavern_drafts.py` with:

```python
from fablemap_api.domain.owner_llm_policy import mask_owner_llm_config, normalize_owner_llm_config
from fablemap_api.infrastructure.owner_config_store import OwnerConfigStore


def test_owner_default_llm_config_persists_and_masks_api_key(tmp_path):
    store = OwnerConfigStore(tmp_path / "owner_configs.json")
    saved = store.save_default_llm_config("owner_alpha", normalize_owner_llm_config({
        "backend": "openai",
        "model": "gpt-4o-mini",
        "api_key": "sk-owner-secret",
        "temperature": 0.7,
        "max_tokens": 1200,
        "top_p": 0.9,
    }))

    assert saved["api_key"] == "sk-owner-secret"
    reloaded = OwnerConfigStore(tmp_path / "owner_configs.json").get_default_llm_config("owner_alpha")
    assert reloaded["api_key"] == "sk-owner-secret"

    masked = mask_owner_llm_config(reloaded)
    assert masked["configured"] is True
    assert masked["llm_config"]["backend"] == "openai"
    assert masked["llm_config"]["api_key_configured"] is True
    assert "api_key" not in masked["llm_config"]


def test_owner_default_llm_configs_are_isolated_by_owner(tmp_path):
    store = OwnerConfigStore(tmp_path / "owner_configs.json")
    store.save_default_llm_config("owner_alpha", normalize_owner_llm_config({"api_key": "sk-alpha"}))
    store.save_default_llm_config("owner_beta", normalize_owner_llm_config({"api_key": "sk-beta"}))

    assert store.get_default_llm_config("owner_alpha")["api_key"] == "sk-alpha"
    assert store.get_default_llm_config("owner_beta")["api_key"] == "sk-beta"
    assert store.get_default_llm_config("owner_missing") == {}
```

- [ ] **Step 2: Verify failure**

Run:

```powershell
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
```

Expected: `ModuleNotFoundError` for the new policy/store modules.

- [ ] **Step 3: Implement policy**

Create `backend/src/fablemap_api/domain/owner_llm_policy.py`:

```python
from __future__ import annotations

from typing import Any


def _text(value: Any, fallback: str = "") -> str:
    return str(value or fallback).strip()


def _float(value: Any, fallback: float, *, minimum: float, maximum: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        number = fallback
    return max(minimum, min(maximum, number))


def _int(value: Any, fallback: int, *, minimum: int, maximum: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        number = fallback
    return max(minimum, min(maximum, number))


def normalize_owner_llm_config(data: dict[str, Any] | None) -> dict[str, Any]:
    payload = data or {}
    return {
        "backend": _text(payload.get("backend"), "openai") or "openai",
        "model": _text(payload.get("model"), "gpt-4o-mini") or "gpt-4o-mini",
        "api_key": _text(payload.get("api_key")),
        "base_url": _text(payload.get("base_url")),
        "temperature": _float(payload.get("temperature"), 0.8, minimum=0.0, maximum=2.0),
        "max_tokens": _int(payload.get("max_tokens"), 1024, minimum=128, maximum=4096),
        "top_p": _float(payload.get("top_p"), 1.0, minimum=0.01, maximum=1.0),
    }


def owner_llm_is_configured(config: dict[str, Any] | None) -> bool:
    payload = config or {}
    return bool(_text(payload.get("api_key")) or _text(payload.get("base_url")))


def mask_owner_llm_config(config: dict[str, Any] | None) -> dict[str, Any]:
    normalized = normalize_owner_llm_config(config)
    return {
        "configured": owner_llm_is_configured(normalized),
        "llm_config": {
            "backend": normalized["backend"],
            "model": normalized["model"],
            "api_key_configured": bool(normalized.get("api_key")),
            "base_url": normalized["base_url"],
            "temperature": normalized["temperature"],
            "max_tokens": normalized["max_tokens"],
            "top_p": normalized["top_p"],
        },
    }
```

- [ ] **Step 4: Implement JSON store**

Create `backend/src/fablemap_api/infrastructure/owner_config_store.py`:

```python
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fablemap_api.domain.owner_llm_policy import normalize_owner_llm_config


class OwnerConfigStore:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def _read_all(self) -> dict[str, Any]:
        if not self.path.exists():
            return {}
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def _write_all(self, data: dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def get_default_llm_config(self, owner_id: str) -> dict[str, Any]:
        safe_owner = str(owner_id or "").strip()
        if not safe_owner:
            return {}
        data = self._read_all()
        owner_data = data.get(safe_owner) if isinstance(data.get(safe_owner), dict) else {}
        config = owner_data.get("default_llm") if isinstance(owner_data, dict) else {}
        return normalize_owner_llm_config(config) if isinstance(config, dict) and config else {}

    def save_default_llm_config(self, owner_id: str, config: dict[str, Any]) -> dict[str, Any]:
        safe_owner = str(owner_id or "").strip()
        if not safe_owner:
            raise ValueError("owner_id is required")
        data = self._read_all()
        owner_data = data.get(safe_owner) if isinstance(data.get(safe_owner), dict) else {}
        owner_data["default_llm"] = normalize_owner_llm_config(config)
        data[safe_owner] = owner_data
        self._write_all(data)
        return owner_data["default_llm"]
```

- [ ] **Step 5: Verify**

Run:

```powershell
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
```

Expected: first two tests pass.

---

### Task 2: Backend owner default LLM APIs

**Files:**
- Modify: `backend/src/fablemap_api/application/taverns.py`
- Modify: `backend/src/fablemap_api/main.py`
- Create: `backend/src/fablemap_api/contracts/owner_defaults.py`
- Create: `backend/src/fablemap_api/api/v1/owner_defaults.py`
- Modify: `backend/src/fablemap_api/api/v1/router.py`
- Modify: `backend/src/fablemap_api/application/services/owner_config.py`
- Test: `tests/test_ai_assisted_tavern_drafts.py`

- [ ] **Step 1: Add failing route tests**

Append:

```python
from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


def test_owner_default_llm_api_masks_secret(tmp_path):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)
    headers = {"X-User-Id": "owner_api"}

    missing = client.get("/api/v1/owners/me/default-llm", headers=headers)
    assert missing.status_code == 200
    assert missing.json()["configured"] is False

    saved = client.put("/api/v1/owners/me/default-llm", headers=headers, json={
        "backend": "openai",
        "model": "gpt-test",
        "api_key": "sk-api",
        "temperature": 0.6,
    })
    assert saved.status_code == 200
    body = saved.json()
    assert body["configured"] is True
    assert body["llm_config"]["api_key_configured"] is True
    assert "api_key" not in body["llm_config"]

    assert client.get("/api/v1/owners/me/default-llm", headers=headers).json() == body


def test_owner_default_llm_api_requires_user_id(tmp_path):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    response = TestClient(app).get("/api/v1/owners/me/default-llm")
    assert response.status_code == 401
    assert "用户身份" in response.json()["error"]
```

- [ ] **Step 2: Verify failure**

Run:

```powershell
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py::test_owner_default_llm_api_masks_secret tests/test_ai_assisted_tavern_drafts.py::test_owner_default_llm_api_requires_user_id --tb=short
```

Expected: 404.

- [ ] **Step 3: Wire owner config store into app service**

In `backend/src/fablemap_api/application/taverns.py` import `OwnerConfigStore`, change constructor to:

```python
def __init__(self, store: TavernStore, owner_config_store: OwnerConfigStore | None = None):
    self.store = store
    self.taverns = TavernService(store)
    self.owner_config_store = owner_config_store
```

and `from_settings` to pass `OwnerConfigStore(settings.output_root / "owner_configs.json")`.

In `backend/src/fablemap_api/main.py`, instantiate:

```python
app.state.taverns = TavernApplicationService(
    store,
    OwnerConfigStore(resolved.output_root / "owner_configs.json"),
)
```

- [ ] **Step 4: Add contracts and routes**

Create `backend/src/fablemap_api/contracts/owner_defaults.py`:

```python
from __future__ import annotations

from .common import FlexibleBody


class OwnerDefaultLLMRequest(FlexibleBody):
    backend: str | None = None
    model: str | None = None
    api_key: str | None = None
    base_url: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    top_p: float | None = None


class TavernDraftGenerateRequest(FlexibleBody):
    lat: float | None = None
    lon: float | None = None
    address: str | None = None
    place_type: str | None = None
    style_tags: list[str] | None = None
    forbidden: list[str] | None = None
    tone: str | None = None
```

Create `backend/src/fablemap_api/api/v1/owner_defaults.py`:

```python
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from .common import get_user_id, taverns_service
from ...contracts.owner_defaults import OwnerDefaultLLMRequest, TavernDraftGenerateRequest

router = APIRouter(tags=["owner-defaults"])


@router.get("/owners/me/default-llm")
def get_default_llm(request: Request) -> dict[str, Any]:
    return taverns_service(request).get_owner_default_llm(get_user_id(request))


@router.put("/owners/me/default-llm")
def save_default_llm(request: Request, data: OwnerDefaultLLMRequest) -> dict[str, Any]:
    return taverns_service(request).save_owner_default_llm(data.to_payload(), get_user_id(request))
```

Modify `backend/src/fablemap_api/api/v1/router.py` to import/include `owner_defaults.router`.

- [ ] **Step 5: Add service methods**

Append to `OwnerConfigApplicationMixin`:

```python
def _require_user_id(self, user_id: str) -> str:
    safe_user_id = str(user_id or "").strip()
    if not safe_user_id:
        raise HTTPException(status_code=401, detail="用户身份不能为空")
    return safe_user_id

def get_owner_default_llm(self, user_id: str = "") -> dict[str, Any]:
    owner_id = self._require_user_id(user_id)
    if not self.owner_config_store:
        return {"configured": False, "llm_config": {}}
    from fablemap_api.domain.owner_llm_policy import mask_owner_llm_config
    return mask_owner_llm_config(self.owner_config_store.get_default_llm_config(owner_id))

def save_owner_default_llm(self, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
    owner_id = self._require_user_id(user_id)
    if not self.owner_config_store:
        raise HTTPException(status_code=500, detail="店主默认 LLM 配置存储不可用")
    from fablemap_api.domain.owner_llm_policy import mask_owner_llm_config, normalize_owner_llm_config
    config = self.owner_config_store.save_default_llm_config(owner_id, normalize_owner_llm_config(data))
    return mask_owner_llm_config(config)
```

- [ ] **Step 6: Verify**

Run:

```powershell
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
```

Expected: pass.

---

### Task 3: Backend tavern draft generation API

**Files:**
- Modify: `backend/src/fablemap_api/domain/owner_llm_policy.py`
- Modify: `backend/src/fablemap_api/application/services/owner_config.py`
- Modify: `backend/src/fablemap_api/api/v1/owner_defaults.py`
- Test: `tests/test_ai_assisted_tavern_drafts.py`

- [ ] **Step 1: Add failing tests**

Append tests for:

```python
def test_tavern_draft_generate_requires_owner_default_llm(tmp_path): ...
def test_tavern_draft_generate_uses_llm_and_does_not_persist(tmp_path, monkeypatch): ...
def test_tavern_draft_generate_rejects_non_json_llm_output(tmp_path, monkeypatch): ...
```

Use a `DraftClient.complete(messages)` fake and monkeypatch `fablemap_api.application.services.owner_config.create_client`. Assert no taverns are created after generation with `GET /api/v1/taverns`.

- [ ] **Step 2: Implement draft request/response helpers**

Append to `owner_llm_policy.py`:

```python
def _list_text(value: Any, *, limit: int = 8, item_max: int = 24) -> list[str]:
    raw_items = value.replace("，", ",").split(",") if isinstance(value, str) else value if isinstance(value, list) else []
    result: list[str] = []
    for item in raw_items:
        text = _text(item)[:item_max]
        if text and text not in result:
            result.append(text)
        if len(result) >= limit:
            break
    return result


def normalize_tavern_draft_request(data: dict[str, Any] | None) -> dict[str, Any]:
    payload = data or {}
    return {
        "lat": _float(payload.get("lat"), 0.0, minimum=-90.0, maximum=90.0),
        "lon": _float(payload.get("lon"), 0.0, minimum=-180.0, maximum=180.0),
        "address": _text(payload.get("address"))[:120],
        "place_type": _text(payload.get("place_type"), "tavern")[:40] or "tavern",
        "style_tags": _list_text(payload.get("style_tags")),
        "forbidden": _list_text(payload.get("forbidden"), limit=10, item_max=40),
        "tone": _text(payload.get("tone"))[:80],
    }


def sanitize_tavern_draft(data: dict[str, Any]) -> dict[str, Any]:
    character = data.get("character") if isinstance(data.get("character"), dict) else {}
    draft = {
        "name": _text(data.get("name"))[:80],
        "description": _text(data.get("description"))[:500],
        "scene_prompt": _text(data.get("scene_prompt"))[:800],
        "character": {
            "name": _text(character.get("name"))[:80],
            "description": _text(character.get("description"))[:500],
            "personality": _text(character.get("personality"))[:500],
            "scenario": _text(character.get("scenario"))[:800],
            "system_prompt": _text(character.get("system_prompt"))[:1200],
            "first_mes": _text(character.get("first_mes"))[:500],
            "mes_example": _text(character.get("mes_example"))[:1000],
            "tags": _list_text(character.get("tags"), limit=8, item_max=20),
        },
    }
    if not draft["name"] or not draft["description"] or not draft["scene_prompt"]:
        raise ValueError("AI 草稿缺少酒馆名称、简介或场景提示")
    if not draft["character"]["name"] or not draft["character"]["first_mes"]:
        raise ValueError("AI 草稿缺少 NPC 名称或首次问候")
    return draft
```

- [ ] **Step 3: Implement generation service and route**

In `OwnerConfigApplicationMixin`, add `generate_tavern_draft()` that:

```python
owner_id = self._require_user_id(user_id)
config = self.owner_config_store.get_default_llm_config(owner_id)
if not owner_llm_is_configured(config):
    raise HTTPException(status_code=400, detail="请先配置店主默认 LLM")
messages = self._build_tavern_draft_messages(normalize_tavern_draft_request(data))
response = create_client(ClientLLMConfig(...config...)).complete(messages)
parsed = json.loads(str(response.content or ""))
return {"draft": sanitize_tavern_draft(parsed)}
```

Catch `LLMError` as 502 and `JSONDecodeError` as 502 `"AI 草稿返回不是有效 JSON"`; never include config or API key in response.

Append route to `owner_defaults.py`:

```python
@router.post("/tavern-drafts/generate")
def generate_tavern_draft(request: Request, data: TavernDraftGenerateRequest) -> dict[str, Any]:
    return taverns_service(request).generate_tavern_draft(data.to_payload(), get_user_id(request))
```

- [ ] **Step 4: Verify**

Run:

```powershell
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
```

Expected: pass.

---

### Task 4: Frontend service helpers and script tests

**Files:**
- Modify: `frontend/app/lib/taverns.ts`
- Create: `frontend/app/lib/tavern-drafts.js`
- Create: `frontend/scripts/ai-tavern-drafts-test.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: Add `frontend/app/lib/tavern-drafts.js`**

Implement:

```javascript
function text(value) {
  return String(value || '').trim()
}

function textList(value) {
  return text(value).replaceAll('，', ',').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8)
}

export function createTavernDraftRequest({ lat = 0, lon = 0, address = '', placeType = 'tavern', styleTagsText = '', forbiddenText = '', tone = '' } = {}) {
  return {
    lat: Number(lat || 0),
    lon: Number(lon || 0),
    address: text(address),
    place_type: text(placeType) || 'tavern',
    style_tags: textList(styleTagsText),
    forbidden: textList(forbiddenText),
    tone: text(tone),
  }
}

export function draftResponseToCreateForm(response) {
  const draft = response?.draft
  const character = draft?.character
  if (!draft || !character) throw new Error('AI 酒馆草稿返回为空')
  return {
    name: text(draft.name),
    description: text(draft.description),
    scene_prompt: text(draft.scene_prompt),
    character_name: text(character.name),
    character_description: text(character.description),
    first_mes: text(character.first_mes),
  }
}
```

- [ ] **Step 2: Add script test and package entry**

Create `frontend/scripts/ai-tavern-drafts-test.mjs` asserting comma normalization, draft-to-form mapping, and empty response error. Add `node ./scripts/ai-tavern-drafts-test.mjs` after `ai-character-drafts-test.mjs` in `frontend/package.json`.

- [ ] **Step 3: Add service functions**

In `frontend/app/lib/taverns.ts`, add:

```typescript
export function getOwnerDefaultLLM(userId = DEFAULT_OWNER_ID) {
  return readApiJson<OwnerDefaultLLMResponse>("/api/v1/owners/me/default-llm", { userId })
}

export function saveOwnerDefaultLLM(data: Record<string, unknown>, userId = DEFAULT_OWNER_ID) {
  return readApiJson<OwnerDefaultLLMResponse>("/api/v1/owners/me/default-llm", jsonInit("PUT", data, userId))
}

export function generateTavernDraft(data: TavernDraftGenerateRequest, userId = DEFAULT_OWNER_ID) {
  return readApiJson<TavernDraftResponse>("/api/v1/tavern-drafts/generate", jsonInit("POST", data, userId))
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
node frontend/scripts/ai-tavern-drafts-test.mjs
npm --prefix .\frontend test
```

Expected: pass.

---

### Task 5: Create page UI integration

**Files:**
- Modify: `frontend/app/routes/create.tsx`

- [ ] **Step 1: Add controlled fields**

Import `createTavernDraftRequest`, `draftResponseToCreateForm`, `generateTavernDraft`, `getOwnerDefaultLLM`, `saveOwnerDefaultLLM`. Add `formDraft` state for `name`, `description`, `scene_prompt`, `character_name`, `character_description`, `first_mes`, and convert those inputs from uncontrolled to controlled.

- [ ] **Step 2: Add AI draft panel**

Add a compact panel before the tavern name field with:

- default LLM status and check button,
- backend/model/API key inputs for saving owner default LLM,
- style tags / forbidden / tone inputs,
- generate button,
- status/error text that says drafts are not published until create.

- [ ] **Step 3: Add actions**

Implement `handleCheckDefaultLlm`, `handleSaveDefaultLlm`, and `handleGenerateDraft`. `handleGenerateDraft` must call `generateTavernDraft(createTavernDraftRequest(...), ownerId)`, then `patchFormDraft(draftResponseToCreateForm(response))`. It must not call `createTavern` or `addCharacter`.

- [ ] **Step 4: Verify**

Run:

```powershell
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

Expected: pass.

---

### Task 6: Final verification and Trellis notes

**Files:**
- Modify: `.trellis/tasks/04-29-ai-assisted-tavern-drafts/implementation.md`
- Modify: `.trellis/tasks/04-29-ai-assisted-tavern-drafts/prd.md`

- [ ] Run:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short
npm --prefix .\frontend test
npm --prefix .\frontend run build
rg "logger\..*api_key|print\(.*api_key" backend/src frontend/app tests
```

- [ ] Record the exact outputs in `implementation.md`.
- [ ] Mark PRD acceptance criteria `[x]` only after fresh passing verification.

---

## Self-Review

- Owner default LLM config: Tasks 1-2.
- API key masking: Tasks 1-2 and Task 6 grep.
- Draft generation from current owner config: Task 3.
- Non-persistent draft behavior: Task 3 test checks tavern count remains zero.
- Create page fill-only behavior: Tasks 4-5.
- Verification: Task 6.

MySQL owner config persistence remains out of MVP per PRD.
