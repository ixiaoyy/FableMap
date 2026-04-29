from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_skill_packs"
VISITOR_ID = "visitor_skill_packs"
OTHER_USER_ID = "other_skill_packs"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_taverns(client: TestClient) -> tuple[str, str]:
    source = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "skill-pack-source",
            "name": "Skill Pack Source",
            "description": "Uses explicit skill packs.",
            "lat": 31.23,
            "lon": 121.47,
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert source.status_code == 200
    target = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "skill-pack-target",
            "name": "雨巷电台",
            "description": "A nearby tavern for rumors.",
            "lat": 31.24,
            "lon": 121.48,
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert target.status_code == 200
    char = client.post(
        "/api/v1/taverns/skill-pack-source/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"id": "char_bartender", "name": "灯芯", "system_prompt": "温和分享低风险信息。"},
    )
    assert char.status_code == 200
    return source.json()["id"], char.json()["id"]


def test_skill_pack_api_owner_toggle_and_visitor_boundary(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, _character_id = _create_taverns(client)

    listed = client.get(f"/api/v1/taverns/{tavern_id}/skill-packs", headers={"X-User-Id": OWNER_ID})
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["available_packs"][0]["id"] == "local-rumor"
    assert payload["skill_packs"][0]["enabled"] is False

    forbidden = client.put(
        f"/api/v1/taverns/{tavern_id}/skill-packs",
        headers={"X-User-Id": VISITOR_ID},
        json={"skill_packs": [{"id": "local-rumor", "enabled": True}]},
    )
    assert forbidden.status_code == 403

    invalid = client.put(
        f"/api/v1/taverns/{tavern_id}/skill-packs",
        headers={"X-User-Id": OWNER_ID},
        json={"skill_packs": [{"id": "unknown-pack", "enabled": True}]},
    )
    assert invalid.status_code == 400

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/skill-packs",
        headers={"X-User-Id": OWNER_ID},
        json={"skill_packs": [{"id": "local-rumor", "enabled": True, "config": {"limit": 2}}]},
    )
    assert saved.status_code == 200
    assert saved.json()["skill_packs"] == [{"id": "local-rumor", "enabled": True, "config": {"limit": 2}}]

    tavern = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": OWNER_ID})
    assert tavern.status_code == 200
    assert tavern.json()["skill_packs"][0]["id"] == "local-rumor"


def test_local_rumor_skill_pack_surfaces_existing_rumors_without_canon_write(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_taverns(client)

    client.put(
        f"/api/v1/taverns/{tavern_id}/skill-packs",
        headers={"X-User-Id": OWNER_ID},
        json={"skill_packs": [{"id": "local-rumor", "enabled": True}]},
    )
    rumor = client.post(
        "/api/v1/rumors/generate",
        headers={"X-User-Id": OWNER_ID},
        json={
            "source_tavern_id": tavern_id,
            "target_tavern_id": "skill-pack-target",
            "target_tavern_name": "雨巷电台",
            "character_id": character_id,
            "character_name": "灯芯",
            "trigger_type": "keyword",
            "trigger_keywords": ["附近", "传闻"],
        },
    )
    assert rumor.status_code == 200

    chat = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": character_id,
            "visitor_id": VISITOR_ID,
            "message": "附近有什么传闻可以听吗？",
        },
    )
    assert chat.status_code == 200
    payload = chat.json()
    assert "雨巷电台" in payload["response"]
    assert "传闻" in payload["response"]

    cards = client.get(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": OWNER_ID},
    )
    assert cards.status_code == 200
    assert cards.json()["state_cards"] == []
