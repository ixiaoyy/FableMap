import json

from fablemap_api.domain.owner_llm_policy import mask_owner_llm_config, normalize_owner_llm_config
from fablemap_api.infrastructure.owner_config_store import OwnerConfigStore
from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app
from fastapi.testclient import TestClient


def test_owner_default_llm_config_persists_and_masks_api_key(tmp_path):
    store = OwnerConfigStore(tmp_path / "owner_configs.json")
    saved = store.save_default_llm_config(
        "owner_alpha",
        normalize_owner_llm_config(
            {
                "backend": "openai",
                "model": "gpt-4o-mini",
                "api_key": "sk-owner-secret",
                "temperature": 0.7,
                "max_tokens": 1200,
                "top_p": 0.9,
            }
        ),
    )

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


def test_owner_default_llm_api_masks_secret(tmp_path):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)
    headers = {"X-User-Id": "owner_api"}

    missing = client.get("/api/v1/owners/me/default-llm", headers=headers)
    assert missing.status_code == 200
    assert missing.json()["configured"] is False

    saved = client.put(
        "/api/v1/owners/me/default-llm",
        headers=headers,
        json={
            "backend": "openai",
            "model": "gpt-test",
            "api_key": "sk-api",
            "temperature": 0.6,
        },
    )
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


class DraftResponse:
    model = "gpt-draft"
    usage = {"total_tokens": 42}

    def __init__(self, content):
        self.content = content


class DraftClient:
    def __init__(self, content):
        self.content = content
        self.messages = None

    def complete(self, messages):
        self.messages = messages
        return DraftResponse(self.content)


def test_tavern_draft_generate_requires_owner_default_llm(tmp_path):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)

    response = client.post(
        "/api/v1/owners/me/tavern-drafts/generate",
        headers={"X-User-Id": "owner_no_llm"},
        json={"lat": 31.23, "lon": 121.47, "address": "上海 · 外滩", "place_type": "tavern"},
    )
    assert response.status_code == 400
    assert "默认 LLM" in response.json()["error"]


def test_tavern_draft_generate_uses_llm_and_does_not_persist(tmp_path, monkeypatch):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)
    headers = {"X-User-Id": "owner_draft"}
    client.put(
        "/api/v1/owners/me/default-llm",
        headers=headers,
        json={"backend": "openai", "model": "gpt-draft", "api_key": "sk-draft"},
    )

    content = json.dumps(
        {
            "name": "外滩雨灯空间",
            "description": "一间望向江风和霓虹的夜间小空间。",
            "scene_prompt": "雨后的外滩，玻璃窗上映着轮渡灯影。",
            "character": {
                "name": "灯叔",
                "description": "守着旧吧台的夜班招待。",
                "personality": "温和、细心、带一点上海式幽默。",
                "scenario": "他会向初来者介绍这间店的规矩和窗外的风景。",
                "system_prompt": "你是灯叔，只回应空间内的现实映射和店主确认内容。",
                "first_mes": "伞先靠门边，今晚江风有点急。",
                "mes_example": "旅人：这里为什么叫雨灯？\n灯叔：因为雨一来，灯就替人记路。",
                "tags": ["外滩", "雨夜", "招待"],
            },
        },
        ensure_ascii=False,
    )
    draft_client = DraftClient(content)
    monkeypatch.setattr("fablemap_api.application.services.owner_config.create_client", lambda config: draft_client)

    response = client.post(
        "/api/v1/owners/me/tavern-drafts/generate",
        headers=headers,
        json={
            "lat": 31.23,
            "lon": 121.47,
            "address": "上海 · 外滩",
            "place_type": "tavern",
            "style_tags": ["雨夜"],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["draft"]["name"] == "外滩雨灯空间"
    assert body["draft"]["character"]["name"] == "灯叔"
    assert "api_key" not in json.dumps(body, ensure_ascii=False)
    assert draft_client.messages[0]["role"] == "system"
    assert "只返回 JSON" in draft_client.messages[0]["content"]

    listed = client.get("/api/v1/taverns", headers=headers).json()
    assert all(tavern.get("owner_id") != "owner_draft" for tavern in listed["taverns"])


def test_tavern_draft_generate_rejects_non_json_llm_output(tmp_path, monkeypatch):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)
    headers = {"X-User-Id": "owner_bad_json"}
    client.put("/api/v1/owners/me/default-llm", headers=headers, json={"api_key": "sk-json"})
    monkeypatch.setattr("fablemap_api.application.services.owner_config.create_client", lambda config: DraftClient("not json"))

    response = client.post(
        "/api/v1/owners/me/tavern-drafts/generate",
        headers=headers,
        json={"lat": 31.23, "lon": 121.47},
    )
    assert response.status_code == 502
    assert "JSON" in response.json()["error"]
