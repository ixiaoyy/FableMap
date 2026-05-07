from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_voice_greeting"
VISITOR_ID = "visitor_voice_greeting"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient, *, access: str = "public") -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": f"voice-greeting-tavern-{access}",
            "name": "Voice Greeting Tavern",
            "description": "用于测试语音问候预览。",
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
        json={
            "id": "char_keeper",
            "name": "Keeper",
            "first_mes": "欢迎来到语音空间。",
            "alternate_greetings": ["备用问候一", "备用问候二"],
        },
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_voice_greeting_preview_returns_first_message_without_tts_side_effect(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    disabled = client.post(
        f"/api/v1/taverns/{tavern_id}/voice-greeting/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={"character_id": character_id},
    )
    assert disabled.status_code == 200
    payload = disabled.json()
    assert payload["preview_only"] is True
    assert payload["audio_generated"] is False
    assert payload["tts_ready"] is False
    assert payload["greeting"]["text"] == "欢迎来到语音空间。"
    assert payload["tts_request"] == {"text": "欢迎来到语音空间。", "character_id": character_id}
    assert "api_key" not in disabled.text.lower()

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/voice",
        headers={"X-User-Id": OWNER_ID},
        json={"enabled": True, "tts_provider": "edge_tts", "tts_voice": "zh-CN-XiaoxiaoNeural"},
    )
    assert saved.status_code == 200

    enabled = client.post(
        f"/api/v1/taverns/{tavern_id}/voice-greeting/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={"character_id": character_id, "greeting_index": 2},
    )
    assert enabled.status_code == 200
    payload = enabled.json()
    assert payload["tts_ready"] is True
    assert payload["greeting"]["source"] == "alternate_greetings[1]"
    assert payload["greeting"]["text"] == "备用问候二"
    assert payload["voice"]["tts_provider"] == "edge_tts"


def test_voice_greeting_preview_errors_for_unknown_character_and_private_visibility(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, _ = _create_tavern_with_character(client)

    missing_character = client.post(
        f"/api/v1/taverns/{tavern_id}/voice-greeting/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={"character_id": "missing"},
    )
    assert missing_character.status_code == 404

    private_tavern_id, private_character_id = _create_tavern_with_character(client, access="private")
    hidden = client.post(
        f"/api/v1/taverns/{private_tavern_id}/voice-greeting/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={"character_id": private_character_id},
    )
    assert hidden.status_code == 403
