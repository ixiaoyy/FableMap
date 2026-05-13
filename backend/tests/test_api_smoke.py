from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.main import create_app
from fablemap_api.infrastructure.settings import ApiSettings


def _client(tmp_path: Path) -> TestClient:
    return TestClient(
        create_app(
            ApiSettings(
                output_root=tmp_path / "api",
                fixture_file=None,
                frontend_root=None,
                storage_backend="json",
                database_url="",
                mysql_url="",
            )
        )
    )


def test_health_payload_exposes_enterprise_api_status(tmp_path: Path) -> None:
    client = _client(tmp_path)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["app_name"] == "FableMap API"
    assert "tavern discovery" in payload["mainline"]


def test_meta_payload_identifies_frontend_backend_separation(tmp_path: Path) -> None:
    client = _client(tmp_path)

    response = client.get("/api/v1/meta")

    assert response.status_code == 200
    assert response.json()["architecture"] == "frontend-backend-separated"


def test_v1_tavern_discover_search_filters_are_additive(tmp_path: Path) -> None:
    client = _client(tmp_path)
    owner_headers = {"X-User-Id": "owner-discover"}

    def create_tavern(payload: dict[str, object]) -> dict[str, object]:
        response = client.post(
            "/api/v1/taverns",
            headers=owner_headers,
            json={
                "description": "discover-sla-needle",
                "lat": 31.2304,
                "lon": 121.4737,
                "access": "public",
                **payload,
            },
        )
        assert response.status_code == 200, response.text
        return response.json()

    cafe = create_tavern({"name": "discover-sla-cafe", "place_type": "cafe"})
    bookstore = create_tavern({"name": "discover-sla-bookstore", "place_type": "bookstore"})
    cultivation = create_tavern(
        {
            "name": "discover-sla-cultivation",
            "layout_style": "quest-play",
            "special_type": "cultivation",
        }
    )
    closed = create_tavern({"name": "discover-sla-closed-cafe", "place_type": "cafe"})
    closed_response = client.put(
        f"/api/v1/taverns/{closed['id']}",
        headers=owner_headers,
        json={"status": "closed"},
    )
    assert closed_response.status_code == 200
    home = create_tavern({"name": "discover-sla-home", "place_type": "home"})

    filtered_response = client.get(
        "/api/v1/taverns",
        params={
            "search": "discover-sla-needle",
            "place_type": "cafe",
            "status": "open",
            "limit": 10,
            "offset": 0,
        },
    )
    assert filtered_response.status_code == 200
    filtered_payload = filtered_response.json()
    filtered_ids = [row["id"] for row in filtered_payload["taverns"]]
    assert cafe["id"] in filtered_ids
    assert bookstore["id"] not in filtered_ids
    assert cultivation["id"] not in filtered_ids
    assert closed["id"] not in filtered_ids
    assert home["id"] not in filtered_ids
    assert all(row["place_type"] == "cafe" and row["status"] == "open" for row in filtered_payload["taverns"])
    assert filtered_payload["count"] == len(filtered_payload["taverns"])
    assert filtered_payload["total"] == len(filtered_payload["taverns"])
    assert filtered_payload["limit"] == 10
    assert filtered_payload["offset"] == 0
    assert filtered_payload["has_more"] is False

    q_alias_response = client.get(
        "/api/v1/taverns",
        params={"q": "discover-sla-cafe", "place_type": "cafe", "limit": 10},
    )
    assert q_alias_response.status_code == 200
    assert cafe["id"] in [row["id"] for row in q_alias_response.json()["taverns"]]

    special_response = client.get(
        "/api/v1/taverns",
        params={"q": "discover-sla-needle", "special_type": "cultivation", "limit": 10},
    )
    assert special_response.status_code == 200
    assert [row["id"] for row in special_response.json()["taverns"]] == [cultivation["id"]]

    home_public_response = client.get("/api/v1/taverns", params={"q": "discover-sla-home"})
    assert home_public_response.status_code == 200
    assert [row["id"] for row in home_public_response.json()["taverns"]] == []


def test_v1_tavern_entry_view_is_slim_and_public_safe(tmp_path: Path) -> None:
    client = _client(tmp_path)
    owner_headers = {"X-User-Id": "owner-entry"}

    create_response = client.post(
        "/api/v1/taverns",
        headers=owner_headers,
        json={
            "name": "入口响应测试",
            "description": "用于校验进入页轻量响应。",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {
                "backend": "openai",
                "model": "secret-model",
                "api_key": "sk-owner-secret",
                "base_url": "https://owner-llm.example",
            },
        },
    )
    assert create_response.status_code == 200, create_response.text
    tavern_id = create_response.json()["id"]

    character_response = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers=owner_headers,
        json={
            "name": "入口 NPC",
            "description": "公开简介",
            "personality": "公开口吻",
            "scenario": "公开场景",
            "system_prompt": "hidden system prompt",
            "first_mes": "欢迎进门。",
            "mes_example": "hidden example dialogue",
            "tags": ["店长"],
            "hobbies": ["记住回访"],
        },
    )
    assert character_response.status_code == 200, character_response.text

    update_response = client.put(
        f"/api/v1/taverns/{tavern_id}",
        headers=owner_headers,
        json={
            "world_info": [{"id": "wi-secret", "keys": ["secret"], "content": "hidden world info"}],
            "prompt_blocks": [{"id": "pb-secret", "content": "hidden prompt block"}],
            "runtime_presets": [{"id": "preset-secret", "prompt": "hidden preset"}],
            "output_rules": [{"id": "rule-secret", "content": "hidden output rule"}],
            "memory_policy": {"secret": True},
            "group_chat_config": {"strategy": "round_robin"},
            "gameplay_definitions": [
                {"id": "published-task", "name": "公开任务", "status": "published", "nodes": [{"id": "start"}]},
                {"id": "draft-task", "name": "草稿任务", "status": "draft", "nodes": [{"id": "start"}]},
            ],
        },
    )
    assert update_response.status_code == 200, update_response.text

    default_response = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": "visitor-entry"})
    assert default_response.status_code == 200
    default_payload = default_response.json()
    assert "world_info" in default_payload
    assert "prompt_blocks" in default_payload

    entry_response = client.get(
        f"/api/v1/taverns/{tavern_id}",
        headers={"X-User-Id": "visitor-entry"},
        params={"view": "entry"},
    )
    assert entry_response.status_code == 200
    payload = entry_response.json()
    assert payload["response_view"] == "entry"
    assert payload["id"] == tavern_id
    assert payload["characters"][0]["name"] == "入口 NPC"
    assert payload["characters"][0]["first_mes"] == "欢迎进门。"
    assert "system_prompt" not in payload["characters"][0]
    assert "mes_example" not in payload["characters"][0]
    assert "social_memories" not in payload["characters"][0]
    assert "world_info" not in payload
    assert "prompt_blocks" not in payload
    assert "runtime_presets" not in payload
    assert "output_rules" not in payload
    assert "memory_policy" not in payload
    assert "group_chat_config" not in payload
    assert payload["llm_config"] == {"backend": "openai"}
    assert [item["id"] for item in payload["gameplay_definitions"]] == ["published-task"]
    assert "nodes" not in payload["gameplay_definitions"][0]


def test_v1_tavern_mainline_create_discover_enter_and_chat(tmp_path: Path) -> None:
    client = _client(tmp_path)
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
    list_payload = list_response.json()
    taverns = list_payload["taverns"]
    assert [t["id"] for t in taverns] == [tavern_id]
    assert list_payload["count"] == 1
    assert list_payload["total"] == 1
    assert list_payload["offset"] == 0
    assert list_payload["has_more"] is False

    second_create_response = client.post(
        "/api/v1/taverns",
        headers=owner_headers,
        json={
            "name": "分页小屋",
            "description": "用于校验首页轻量分页元数据",
            "lat": 31.231,
            "lon": 121.474,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert second_create_response.status_code == 200

    paged_response = client.get("/api/v1/taverns", params={"limit": 1, "offset": 0})
    assert paged_response.status_code == 200
    paged_payload = paged_response.json()
    assert paged_payload["count"] == 1
    assert paged_payload["total"] >= 2
    assert paged_payload["limit"] == 1
    assert paged_payload["offset"] == 0
    assert paged_payload["has_more"] is True

    last_offset = paged_payload["total"] - 1
    last_page_response = client.get("/api/v1/taverns", params={"limit": 1, "offset": last_offset})
    assert last_page_response.status_code == 200
    last_page_payload = last_page_response.json()
    assert last_page_payload["count"] == 1
    assert last_page_payload["total"] == paged_payload["total"]
    assert last_page_payload["limit"] == 1
    assert last_page_payload["offset"] == last_offset
    assert last_page_payload["has_more"] is False

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
