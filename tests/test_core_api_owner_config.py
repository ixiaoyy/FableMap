from uuid import uuid4

from fastapi.testclient import TestClient

from fablemap_api.core.api import create_app


def test_core_api_owner_default_llm_config_persists_and_masks_secret(tmp_path):
    app = create_app(output_root=tmp_path, fixture_file=None, frontend_root=None)
    client = TestClient(app)
    headers = {"X-User-Id": f"owner_core_api_{uuid4().hex}"}

    missing = client.get("/api/v1/owners/me/default-llm", headers=headers)
    assert missing.status_code == 200
    assert missing.json()["configured"] is False

    saved = client.put(
        "/api/v1/owners/me/default-llm",
        headers=headers,
        json={"backend": "openai", "model": "gpt-core", "api_key": "sk-core-secret"},
    )

    assert saved.status_code == 200, saved.text
    body = saved.json()
    assert body["configured"] is True
    assert body["llm_config"]["api_key_configured"] is True
    assert "api_key" not in body["llm_config"]
    loaded = client.get("/api/v1/owners/me/default-llm", headers=headers).json()
    assert loaded["configured"] == body["configured"]
    assert loaded["llm_config"] == body["llm_config"]
    assert loaded["data"] == body["data"]
