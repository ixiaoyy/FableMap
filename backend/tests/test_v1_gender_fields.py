from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-gender-fields"
VISITOR_ID = "visitor-gender-fields"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_open_tavern(client: TestClient, **payload: object) -> dict[str, object]:
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "Gender Test Tavern",
            "description": "A tavern for visitor and NPC gender contract tests.",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules"},
            **payload,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_character_gender_defaults_alias_and_update_round_trip(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern = _create_open_tavern(client)
    tavern_id = str(tavern["id"])

    created = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "性别字段 NPC",
            "description": "测试角色性别字段",
            "gender": "女",
        },
    )
    assert created.status_code == 200, created.text
    character = created.json()
    assert character["gender"] == "female"

    character_id = str(character["id"])
    updated = client.put(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}",
        headers={"X-User-Id": OWNER_ID},
        json={"gender": "non-binary"},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["gender"] == "nonbinary"

    listed = client.get(f"/api/v1/taverns/{tavern_id}/characters", headers={"X-User-Id": VISITOR_ID})
    assert listed.status_code == 200
    assert listed.json()["characters"][0]["gender"] == "nonbinary"

    legacy_default = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "旧角色默认值"},
    )
    assert legacy_default.status_code == 200, legacy_default.text
    assert legacy_default.json()["gender"] == "unspecified"


def test_visitor_gender_is_tavern_scoped_and_updates_from_enter_and_chat(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern = _create_open_tavern(client)
    tavern_id = str(tavern["id"])
    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "问候 NPC", "gender": "other"},
    )
    assert character.status_code == 200, character.text

    entered = client.post(
        f"/api/v1/taverns/{tavern_id}/enter",
        headers={"X-User-Id": VISITOR_ID},
        json={"visitor_gender": "男"},
    )
    assert entered.status_code == 200, entered.text
    assert entered.json()["visitor_state"]["gender"] == "male"

    chatted = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": character.json()["id"],
            "visitor_id": VISITOR_ID,
            "visitor_name": "测试旅人",
            "visitor_gender": "非二元",
            "message": "你好。",
        },
    )
    assert chatted.status_code == 200, chatted.text
    assert chatted.json()["visitor_state"]["gender"] == "nonbinary"

    visitors = client.get(f"/api/v1/taverns/{tavern_id}/visitors", headers={"X-User-Id": OWNER_ID})
    assert visitors.status_code == 200
    assert visitors.json()["visitors"][0]["gender"] == "nonbinary"


