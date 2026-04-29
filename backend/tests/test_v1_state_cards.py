from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_state_cards"
VISITOR_ID = "visitor_alpha"
OTHER_VISITOR_ID = "visitor_beta"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient) -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "state-card-tavern",
            "name": "State Card Tavern",
            "description": "Tracks continuity.",
            "lat": 31.23,
            "lon": 121.47,
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert created.status_code == 200
    tavern_id = created.json()["id"]

    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"id": "char_keeper", "name": "Keeper", "first_mes": "我会先标成待确认。"},
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_chat_creates_pending_state_cards_and_user_confirms_own_card(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    chat = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": character_id,
            "visitor_id": VISITOR_ID,
            "message": "我接下桥边委托，找到了铜钥匙和旧照片线索。",
        },
    )
    assert chat.status_code == 200
    payload = chat.json()
    candidates = payload["state_card_candidates"]
    categories = {card["category"] for card in candidates}
    assert {"task", "resource", "event_log"}.issubset(categories)
    assert all(card["status"] == "pending" for card in candidates)
    assert all(card["fixed_canon"] is False for card in candidates)

    pending = client.get(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": VISITOR_ID},
        params={"status": "pending", "visitor_id": VISITOR_ID},
    )
    assert pending.status_code == 200
    pending_cards = pending.json()["state_cards"]
    assert len(pending_cards) >= 3

    card_id = pending_cards[0]["id"]
    forbidden = client.put(
        f"/api/v1/taverns/{tavern_id}/state-cards/{card_id}/decision",
        headers={"X-User-Id": OTHER_VISITOR_ID},
        json={"status": "confirmed", "note": "不该能确认别人的卡。"},
    )
    assert forbidden.status_code == 403

    confirmed = client.put(
        f"/api/v1/taverns/{tavern_id}/state-cards/{card_id}/decision",
        headers={"X-User-Id": VISITOR_ID},
        json={"status": "confirmed", "note": "加入这条访客正史。"},
    )
    assert confirmed.status_code == 200
    confirmed_card = confirmed.json()["state_card"]
    assert confirmed_card["status"] == "confirmed"
    assert confirmed_card["confirmed_by"] == VISITOR_ID
    assert "加入这条访客正史" in confirmed_card["metadata"]["decision_note"]

    owner_view = client.get(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": OWNER_ID},
        params={"status": "confirmed"},
    )
    assert owner_view.status_code == 200
    assert any(card["id"] == card_id for card in owner_view.json()["state_cards"])

    tavern = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": OWNER_ID}).json()
    assert "_state_cards" not in tavern
    assert "state_cards" not in tavern
