from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.main import create_app
from fablemap_api.infrastructure.settings import ApiSettings


def test_health_payload_exposes_enterprise_api_status() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["app_name"] == "FableMap API"
    assert "tavern discovery" in payload["mainline"]


def test_meta_payload_identifies_frontend_backend_separation() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/meta")

    assert response.status_code == 200
    assert response.json()["architecture"] == "frontend-backend-separated"


def test_v1_tavern_mainline_create_discover_enter_and_chat(tmp_path: Path) -> None:
    client = TestClient(
        create_app(
            ApiSettings(
                output_root=tmp_path / "api",
                fixture_file=None,
                frontend_root=None,
            )
        )
    )
    owner_headers = {"X-User-Id": "owner-1"}

    create_response = client.post(
        "/api/v1/taverns",
        headers=owner_headers,
        json={
            "name": "星港夜谈",
            "description": "靠近真实坐标的小空间",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert create_response.status_code == 200
    created = create_response.json()
    tavern_id = created["id"]
    assert created["owner_id"] == "owner-1"
    assert created["llm_config"]["api_key"] == ""

    list_response = client.get("/api/v1/taverns", params={"q": "星港"})
    assert list_response.status_code == 200
    taverns = list_response.json()["taverns"]
    assert [t["id"] for t in taverns] == [tavern_id]

    character_response = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers=owner_headers,
        json={
            "name": "阿珀",
            "description": "记得每个回访者点过什么酒。",
            "first_mes": "欢迎回到星港夜谈。",
        },
    )
    assert character_response.status_code == 200
    character = character_response.json()

    enter_response = client.post(
        f"/api/v1/taverns/{tavern_id}/enter",
        headers={"X-User-Id": "visitor-1"},
        json={},
    )
    assert enter_response.status_code == 200
    assert enter_response.json()["ok"] is True

    chat_response = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": "visitor-1"},
        json={
            "character_id": character["id"],
            "visitor_id": "visitor-1",
            "visitor_name": "测试旅人",
            "message": "今晚有什么推荐？",
        },
    )
    assert chat_response.status_code == 200
    chat_payload = chat_response.json()
    assert chat_payload["character_id"] == character["id"]
    assert chat_payload["response"]

    history_response = client.get(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": "visitor-1"},
        params={"visitor_id": "visitor-1", "character_id": character["id"]},
    )
    assert history_response.status_code == 200
    assert len(history_response.json()["messages"]) == 2
