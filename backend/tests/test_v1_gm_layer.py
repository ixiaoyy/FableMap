from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_gm_layer"
VISITOR_ID = "visitor_alpha"
OTHER_VISITOR_ID = "visitor_beta"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient, *, access: str = "public") -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": f"gm-layer-tavern-{access}",
            "name": "GM Layer Tavern",
            "description": "Tracks GM preview candidates.",
            "lat": 31.23,
            "lon": 121.47,
            "access": access,
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert created.status_code == 200
    tavern_id = created.json()["id"]

    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"id": "char_keeper", "name": "Keeper", "first_mes": "我只提出待确认 GM 候选。"},
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_gm_layer_preview_returns_candidates_and_does_not_persist_state_cards(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    preview = client.post(
        f"/api/v1/taverns/{tavern_id}/gm-layer/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "visitor_id": VISITOR_ID,
            "character_id": character_id,
            "user_message": "我接下码头委托，拿到铜钥匙，但强敌竞争者盯上我们。",
            "assistant_message": "Keeper 记录这个机会和风险，等你确认是否加入正史。",
            "source_message_ids": ["msg_user", "msg_assistant"],
        },
    )
    assert preview.status_code == 200
    payload = preview.json()
    assert payload["ok"] is True
    assert payload["preview_only"] is True
    assert payload["applied"] is False
    assert payload["summary"]["conflict"] >= 1
    assert payload["summary"]["task"] >= 1
    assert payload["summary"]["resource"] >= 1
    assert all(card["metadata"]["gm_layer"] == "structured_conflict_v1" for card in payload["candidates"])

    listed = client.get(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": VISITOR_ID},
        params={"status": "pending", "visitor_id": VISITOR_ID},
    )
    assert listed.status_code == 200
    assert listed.json()["state_cards"] == []


def test_gm_layer_preview_enforces_identity_and_visitor_scope(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)
    body = {
        "visitor_id": OTHER_VISITOR_ID,
        "character_id": character_id,
        "user_message": "我接下委托，但竞争者带来风险。",
    }

    missing_identity = client.post(f"/api/v1/taverns/{tavern_id}/gm-layer/preview", json=body)
    assert missing_identity.status_code == 401

    forbidden = client.post(
        f"/api/v1/taverns/{tavern_id}/gm-layer/preview",
        headers={"X-User-Id": VISITOR_ID},
        json=body,
    )
    assert forbidden.status_code == 403

    owner_preview = client.post(
        f"/api/v1/taverns/{tavern_id}/gm-layer/preview",
        headers={"X-User-Id": OWNER_ID},
        json=body,
    )
    assert owner_preview.status_code == 200
    assert owner_preview.json()["visitor_id"] == OTHER_VISITOR_ID


def test_gm_layer_preview_respects_private_tavern_visibility(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client, access="private")

    hidden = client.post(
        f"/api/v1/taverns/{tavern_id}/gm-layer/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "visitor_id": VISITOR_ID,
            "character_id": character_id,
            "user_message": "我接下委托，但竞争者带来风险。",
        },
    )
    assert hidden.status_code == 403
