from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-character-assets"
VISITOR_ID = "visitor-character-assets"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient) -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "表情测试酒馆",
            "description": "用于测试角色表情与角色卡迁移。",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules", "api_key": "owner-secret"},
        },
    )
    assert created.status_code == 200
    tavern_id = created.json()["id"]

    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "表情角色",
            "description": "带 SillyTavern 表情精灵图。",
            "first_mes": "今晚想喝点什么？",
            "sprites": {"neutral": "/sprites/neutral.png", "joy": "/sprites/joy.png", "empty": ""},
        },
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_v1_expression_catalog_inference_and_character_sprites(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    catalog = client.get("/api/v1/expressions")
    assert catalog.status_code == 200
    assert catalog.json()["count"] == len(catalog.json()["expressions"])
    assert "joy" in catalog.json()["expressions"]
    assert "neutral" in catalog.json()["categories"]["neutral"]

    inferred = client.post(
        "/api/v1/expression/infer",
        headers={"X-User-Id": VISITOR_ID},
        json={"text": "谢谢你，今晚太好了！", "tavern_id": tavern_id, "character_id": character_id},
    )
    assert inferred.status_code == 200
    assert inferred.json()["expression"] in {"gratitude", "joy"}
    assert inferred.json()["source"] == "keyword"

    sprites = client.get(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert sprites.status_code == 200
    payload = sprites.json()
    assert payload["sprites"] == {"neutral": "/sprites/neutral.png", "joy": "/sprites/joy.png"}
    assert payload["sprite_map"]["joy"] == "/sprites/joy.png"
    assert payload["default_expression"] == "joy"

    visitor_update = client.put(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
        json={"sprites": {"neutral": "/sprites/hacked.png"}},
    )
    assert visitor_update.status_code == 403

    owner_update = client.put(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": OWNER_ID},
        json={"sprites": {"neutral": "/sprites/new-neutral.png", "empty": ""}},
    )
    assert owner_update.status_code == 200
    assert owner_update.json()["sprites"] == {"neutral": "/sprites/new-neutral.png"}

    updated = client.get(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert updated.status_code == 200
    assert updated.json()["sprites"] == {"neutral": "/sprites/new-neutral.png"}
    assert updated.json()["sprite_map"]["joy"] is None
    assert updated.json()["default_expression"] == "neutral"


def test_v1_character_card_parse_and_export_contract(tmp_path: Path) -> None:
    client = _client(tmp_path)
    card = {
        "spec": "chara_card_v3",
        "spec_version": "3.0",
        "name": "夜航角色",
        "description": "坐标锚定酒馆里的 NPC。",
        "personality": "温和、短句回复",
        "scenario": "黄浦江边的赛博酒馆。",
        "first_mes": "欢迎回来。",
        "tags": ["tavern", "npc"],
        "sprite": {"neutral": "/sprites/night/neutral.png"},
        "character_book": {"entries": [{"keys": ["夜航"], "content": "夜航是酒馆暗号。"}]},
    }

    parsed = client.post("/api/v1/characters/parse", headers={"X-User-Id": OWNER_ID}, json={"json": card})
    assert parsed.status_code == 200
    payload = parsed.json()
    assert payload["name"] == "夜航角色"
    assert payload["sprites"] == {"neutral": "/sprites/night/neutral.png"}
    assert payload["world_info"][0]["keys"] == ["夜航"]
    assert payload["source_format"] == "sillytavern_3.0"

    exported = client.post(
        "/api/v1/characters/export",
        headers={"X-User-Id": OWNER_ID},
        json={"character": payload, "format": "v3"},
    )
    assert exported.status_code == 200
    exported_payload = exported.json()
    assert exported_payload["spec"] == "chara_card_v3"
    assert exported_payload["spec_version"] == "3.0"
    assert exported_payload["name"] == "夜航角色"
    assert exported_payload["sprite"] == {"neutral": "/sprites/night/neutral.png"}
