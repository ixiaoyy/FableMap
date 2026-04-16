from pathlib import Path
from tempfile import TemporaryDirectory

import pytest

from fablemap.tavern import Tavern, TavernService, TavernStore


def _service_with_tavern():
    tmpdir = TemporaryDirectory()
    store = TavernStore(Path(tmpdir.name))
    service = TavernService(store)
    tavern = Tavern(
        id="tavern_character_editor",
        name="Character Editor Tavern",
        description="A tavern for character editor checks.",
        lat=31.23,
        lon=121.47,
        owner_id="owner_character_editor",
    )
    store.create_tavern(tavern)
    return tmpdir, service, tavern


def test_character_editor_fields_persist_on_add_and_update():
    tmpdir, service, tavern = _service_with_tavern()
    with tmpdir:
        created = service.add_character(
            tavern.id,
            {
                "name": "Mira",
                "description": "The night desk keeper.",
                "alternate_greetings": ["Welcome back.", "The lamp is still on."],
                "tags": "keeper, night",
                "avatar": "https://example.test/mira.png",
                "sprites": {
                    "neutral": "https://example.test/mira-neutral.png",
                    "joy": "",
                    "anger": "https://example.test/mira-anger.png",
                },
            },
            user_id=tavern.owner_id,
        )

        assert created["avatar"] == "https://example.test/mira.png"
        assert created["tags"] == ["keeper", "night"]
        assert created["sprites"] == {
            "neutral": "https://example.test/mira-neutral.png",
            "anger": "https://example.test/mira-anger.png",
        }

        updated = service.update_character(
            tavern.id,
            created["id"],
            {
                "name": "Mira Vale",
                "alternate_greetings": "First line\nSecond line",
                "tags": ["keeper", "late shift"],
                "avatar": "https://example.test/mira-updated.png",
                "sprites": {
                    "neutral": "https://example.test/mira-neutral-v2.png",
                    "sadness": "https://example.test/mira-sadness.png",
                },
            },
            user_id=tavern.owner_id,
        )

        assert updated["name"] == "Mira Vale"
        assert updated["alternate_greetings"] == ["First line", "Second line"]
        assert updated["tags"] == ["keeper", "late shift"]
        assert updated["avatar"] == "https://example.test/mira-updated.png"
        assert updated["sprites"]["neutral"] == "https://example.test/mira-neutral-v2.png"
        assert updated["sprites"]["sadness"] == "https://example.test/mira-sadness.png"

        fetched = service.get_tavern(tavern.id, user_id=tavern.owner_id)
        assert fetched["characters"][0]["avatar"] == "https://example.test/mira-updated.png"
        assert fetched["characters"][0]["sprites"]["sadness"] == "https://example.test/mira-sadness.png"


def test_update_tavern_characters_payload_persists_sprites():
    tmpdir, service, tavern = _service_with_tavern()
    with tmpdir:
        created = service.add_character(
            tavern.id,
            {"name": "Sprite Tester"},
            user_id=tavern.owner_id,
        )

        tavern_payload = service.get_tavern(tavern.id, user_id=tavern.owner_id)
        character_payload = tavern_payload["characters"][0]
        character_payload["avatar"] = "https://example.test/sprite-avatar.png"
        character_payload["sprites"] = {
            "neutral": "https://example.test/sprite-neutral.png",
            "joy": "https://example.test/sprite-joy.png",
        }

        updated_tavern = service.update_tavern(
            tavern.id,
            {"characters": tavern_payload["characters"]},
            user_id=tavern.owner_id,
        )

        updated_character = updated_tavern["characters"][0]
        assert updated_character["id"] == created["id"]
        assert updated_character["avatar"] == "https://example.test/sprite-avatar.png"
        assert updated_character["sprites"]["neutral"] == "https://example.test/sprite-neutral.png"
        assert updated_character["sprites"]["joy"] == "https://example.test/sprite-joy.png"


def test_character_sprites_api_persists_through_web_service():
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient
    from fablemap.web.app import create_web_app
    from fablemap.web.config import ApiSettings

    with TemporaryDirectory() as tmpdir:
        app = create_web_app(
            ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None)
        )
        headers = {"X-User-Id": "owner_character_editor"}

        with TestClient(app) as client:
            tavern_response = client.post(
                "/api/taverns",
                headers=headers,
                json={
                    "id": "tavern_sprite_route",
                    "name": "Sprite Route Tavern",
                    "description": "A tavern for sprite route checks.",
                    "lat": 31.23,
                    "lon": 121.47,
                },
            )
            assert tavern_response.status_code == 200
            tavern_id = tavern_response.json()["id"]

            character_response = client.post(
                f"/api/taverns/{tavern_id}/characters",
                headers=headers,
                json={
                    "name": "Route Sprite Tester",
                    "sprites": {"neutral": "https://example.test/old-neutral.png"},
                },
            )
            assert character_response.status_code == 200
            character_id = character_response.json()["id"]

            update_response = client.put(
                f"/api/taverns/{tavern_id}/characters/{character_id}/sprites",
                headers=headers,
                json={
                    "sprites": {
                        "neutral": "https://example.test/new-neutral.png",
                        "joy": "https://example.test/new-joy.png",
                    }
                },
            )
            assert update_response.status_code == 200

            sprites_response = client.get(
                f"/api/taverns/{tavern_id}/characters/{character_id}/sprites",
                headers=headers,
            )
            assert sprites_response.status_code == 200
            sprites_payload = sprites_response.json()
            assert sprites_payload["sprites"]["neutral"] == "https://example.test/new-neutral.png"
            assert sprites_payload["sprites"]["joy"] == "https://example.test/new-joy.png"
