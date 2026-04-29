from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_episode_export"
VISITOR_ID = "visitor_episode_alpha"
OTHER_VISITOR_ID = "visitor_episode_beta"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient, *, access: str = "public") -> tuple[str, str]:
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": f"episode-export-tavern-{access}",
            "name": "Episode Export Tavern",
            "description": "用于测试剧集导出。",
            "lat": 31.23,
            "lon": 121.47,
            "access": access,
            "status": "open",
            "scene_prompt": "温暖的赛博酒馆。",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert response.status_code == 200
    tavern_id = response.json()["id"]

    char_response = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"id": "char_keeper", "name": "Keeper", "description": "记录故事的店员。"},
    )
    assert char_response.status_code == 200
    return tavern_id, char_response.json()["id"]


def _send_chat(client: TestClient, tavern_id: str, character_id: str, visitor_id: str, message: str) -> None:
    response = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": visitor_id},
        json={
            "character_id": character_id,
            "visitor_id": visitor_id,
            "visitor_name": "Mina",
            "message": message,
        },
    )
    assert response.status_code == 200


def _confirm_state_card(client: TestClient, tavern_id: str, character_id: str) -> str:
    created = client.post(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "category": "task",
            "status": "pending",
            "canon_scope": "visitor",
            "title": "桥边委托",
            "summary": "访客确认接下桥边委托。",
            "visitor_id": VISITOR_ID,
            "character_id": character_id,
        },
    )
    assert created.status_code == 200
    card_id = created.json()["state_card"]["id"]
    decided = client.put(
        f"/api/v1/taverns/{tavern_id}/state-cards/{card_id}/decision",
        headers={"X-User-Id": VISITOR_ID},
        json={"status": "confirmed", "note": "作为本集正史。"},
    )
    assert decided.status_code == 200
    return card_id


def test_episode_export_builds_markdown_from_chat_and_confirmed_state_cards(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)
    _send_chat(client, tavern_id, character_id, VISITOR_ID, "我接下桥边委托，拿起铜钥匙。")
    _confirm_state_card(client, tavern_id, character_id)

    response = client.post(
        f"/api/v1/taverns/{tavern_id}/episodes/export",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "visitor_id": VISITOR_ID,
            "character_id": character_id,
            "title": "桥边委托第一夜",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["persisted"] is False
    assert payload["visitor_id"] == VISITOR_ID
    assert payload["character_id"] == character_id
    episode = payload["episode"]
    assert episode["message_count"] >= 2
    assert episode["state_card_count"] == 1
    assert "我接下桥边委托" in episode["markdown"]
    assert "桥边委托" in episode["markdown"]
    assert "你是 FableMap" not in episode["markdown"]


def test_episode_export_enforces_identity_visitor_scope_and_visibility(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)
    _send_chat(client, tavern_id, character_id, VISITOR_ID, "这是一段私密导出范围测试。")

    missing_identity = client.post(
        f"/api/v1/taverns/{tavern_id}/episodes/export",
        json={"visitor_id": VISITOR_ID, "character_id": character_id},
    )
    assert missing_identity.status_code == 401

    missing_visitor = client.post(
        f"/api/v1/taverns/{tavern_id}/episodes/export",
        headers={"X-User-Id": VISITOR_ID},
        json={"character_id": character_id},
    )
    assert missing_visitor.status_code == 400

    forbidden = client.post(
        f"/api/v1/taverns/{tavern_id}/episodes/export",
        headers={"X-User-Id": OTHER_VISITOR_ID},
        json={"visitor_id": VISITOR_ID, "character_id": character_id},
    )
    assert forbidden.status_code == 403

    owner_export = client.post(
        f"/api/v1/taverns/{tavern_id}/episodes/export",
        headers={"X-User-Id": OWNER_ID},
        json={"visitor_id": VISITOR_ID, "character_id": character_id},
    )
    assert owner_export.status_code == 200

    private_tavern_id, private_character_id = _create_tavern_with_character(client, access="private")
    hidden = client.post(
        f"/api/v1/taverns/{private_tavern_id}/episodes/export",
        headers={"X-User-Id": VISITOR_ID},
        json={"visitor_id": VISITOR_ID, "character_id": private_character_id},
    )
    assert hidden.status_code == 403
