from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-mainline-smoke"
VISITOR_ID = "visitor-mainline-smoke"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(
        create_app(
            ApiSettings(
                output_root=tmp_path / "api",
                fixture_file=None,
                frontend_root=None,
            )
        )
    )


def test_mainline_golden_path_persists_chat_memory_state_cards_and_revisit_feedback(tmp_path: Path) -> None:
    client = _client(tmp_path)
    owner_headers = {"X-User-Id": OWNER_ID}
    visitor_headers = {"X-User-Id": VISITOR_ID}

    create_response = client.post(
        "/api/v1/taverns",
        headers=owner_headers,
        json={
            "id": "mainline-golden-path-tavern",
            "name": "主链路验收空间",
            "description": "一间挂在真实坐标上的小空间，用来验收主链路。",
            "lat": 31.230416,
            "lon": 121.473701,
            "address": "上海市黄浦区真实坐标测试点",
            "access": "public",
            "scene_prompt": "雨夜、吧台灯和一块写着回访者名字的小黑板。",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert create_response.status_code == 200
    tavern = create_response.json()
    tavern_id = tavern["id"]
    assert tavern["status"] == "open"
    assert tavern["owner_id"] == OWNER_ID
    assert tavern["lat"] == 31.230416
    assert tavern["lon"] == 121.473701
    assert tavern["llm_config"]["api_key"] == ""

    character_response = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers=owner_headers,
        json={
            "id": "char-mainline-keeper",
            "name": "验收店员",
            "description": "负责确认访客记忆和回访线索的店员。",
            "personality": "温和、克制、会提醒访客确认重要状态。",
            "system_prompt": "Stay in the tavern scene and never publish owner content without confirmation.",
            "first_mes": "欢迎光临，今晚我会把重要线索先记成待确认。",
        },
    )
    assert character_response.status_code == 200
    character = character_response.json()
    character_id = character["id"]

    enter_response = client.post(
        f"/api/v1/taverns/{tavern_id}/enter",
        headers=visitor_headers,
        json={"visitor_gender": "unspecified"},
    )
    assert enter_response.status_code == 200
    first_entry = enter_response.json()
    assert first_entry["ok"] is True
    assert first_entry["visitor_state"]["visitor_id"] == VISITOR_ID
    assert first_entry["visitor_state"]["visit_count"] == 1
    assert first_entry["characters"][0]["id"] == character_id

    chat_message = "我喜欢茉莉茶。今天我接下桥边委托，找到铜钥匙和旧照片线索。我答应下次带照片回来。"
    chat_response = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers=visitor_headers,
        json={
            "character_id": character_id,
            "visitor_id": VISITOR_ID,
            "visitor_name": "主链路旅人",
            "message": chat_message,
        },
    )
    assert chat_response.status_code == 200
    chat_payload = chat_response.json()
    assert chat_payload["character_id"] == character_id
    assert chat_payload["response"]
    assert chat_payload["degraded"] is False
    assert chat_payload["visitor_state"]["visitor_id"] == VISITOR_ID
    assert chat_payload["visitor_state"]["relationship"]["stage"] in {
        "stranger",
        "acquaintance",
        "familiar",
        "friend",
        "close_friend",
        "best_friend",
    }
    assert chat_payload["created_memories"], "chat turn should create at least one structured memory atom"
    assert chat_payload["state_card_candidates"], "chat turn should create pending continuity candidates"

    history_response = client.get(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers=visitor_headers,
        params={"visitor_id": VISITOR_ID, "character_id": character_id},
    )
    assert history_response.status_code == 200
    history = history_response.json()["messages"]
    assert [message["role"] for message in history] == ["user", "assistant"]
    assert history[0]["content"] == chat_message
    assert history[1]["content"] == chat_payload["response"]

    memories_response = client.get(
        f"/api/v1/taverns/{tavern_id}/memory-atoms",
        headers=visitor_headers,
        params={"visitor_id": VISITOR_ID},
    )
    assert memories_response.status_code == 200
    memories = memories_response.json()["memory_atoms"]
    assert {memory["id"] for memory in memories}.issuperset(
        {memory["id"] for memory in chat_payload["created_memories"]}
    )
    assert {memory["dimension"] for memory in memories} & {"preference", "event", "promise"}

    cards_response = client.get(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers=visitor_headers,
        params={"status": "pending", "visitor_id": VISITOR_ID},
    )
    assert cards_response.status_code == 200
    cards = cards_response.json()["state_cards"]
    categories = {card["category"] for card in cards}
    assert {"task", "resource", "event_log"}.issubset(categories)
    assert all(card["status"] == "pending" for card in cards)
    assert all(card["visitor_id"] == VISITOR_ID for card in cards)

    revisit_response = client.post(
        f"/api/v1/taverns/{tavern_id}/enter",
        headers=visitor_headers,
        json={},
    )
    assert revisit_response.status_code == 200
    revisit_state = revisit_response.json()["visitor_state"]
    assert revisit_state["visit_count"] == 2
    assert revisit_state["last_visit"]

    owner_visitors_response = client.get(
        f"/api/v1/taverns/{tavern_id}/visitors",
        headers=owner_headers,
    )
    assert owner_visitors_response.status_code == 200
    visitors = owner_visitors_response.json()["visitors"]
    visitor_row = next(visitor for visitor in visitors if visitor["visitor_id"] == VISITOR_ID)
    assert visitor_row["visit_count"] == 2
    assert visitor_row["visitor_name"] == "主链路旅人"
    assert visitor_row["message_count"] == 2
    assert visitor_row["relationship"]["stage"] in {
        "stranger",
        "acquaintance",
        "familiar",
        "friend",
        "close_friend",
        "best_friend",
    }
