from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_visual_souvenir"
VISITOR_ID = "visitor_visual_alpha"
OTHER_VISITOR_ID = "visitor_visual_beta"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient, *, access: str = "public") -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": f"visual-souvenir-tavern-{access}",
            "name": "Visual Souvenir Tavern",
            "description": "用于测试纪念图预览。",
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
        json={"id": "char_keeper", "name": "Keeper", "first_mes": "留下今晚的光。"},
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_visual_souvenir_preview_returns_prompt_without_image_generation(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    response = client.post(
        f"/api/v1/taverns/{tavern_id}/visual-souvenir/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "visitor_id": VISITOR_ID,
            "character_id": character_id,
            "user_message": "我接下桥边委托，拿起铜钥匙。",
            "assistant_message": "Keeper 说这是今晚的纪念瞬间。",
            "style": "warm cyber tavern postcard",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["preview_only"] is True
    assert payload["image_generated"] is False
    assert payload["requires_confirmation"] is True
    assert "Visual Souvenir Tavern" in payload["souvenir"]["prompt"]
    assert "Keeper" in payload["souvenir"]["prompt"]
    assert VISITOR_ID not in payload["souvenir"]["prompt"]
    assert "api_key" not in response.text.lower()


def test_visual_souvenir_preview_enforces_identity_scope_character_and_visibility(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)
    body = {
        "visitor_id": VISITOR_ID,
        "character_id": character_id,
        "user_message": "我接下委托。",
    }

    missing_identity = client.post(f"/api/v1/taverns/{tavern_id}/visual-souvenir/preview", json=body)
    assert missing_identity.status_code == 401

    forbidden = client.post(
        f"/api/v1/taverns/{tavern_id}/visual-souvenir/preview",
        headers={"X-User-Id": OTHER_VISITOR_ID},
        json=body,
    )
    assert forbidden.status_code == 403

    missing_character = client.post(
        f"/api/v1/taverns/{tavern_id}/visual-souvenir/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={**body, "character_id": "missing"},
    )
    assert missing_character.status_code == 404

    private_tavern_id, private_character_id = _create_tavern_with_character(client, access="private")
    hidden = client.post(
        f"/api/v1/taverns/{private_tavern_id}/visual-souvenir/preview",
        headers={"X-User-Id": VISITOR_ID},
        json={"visitor_id": VISITOR_ID, "character_id": private_character_id, "user_message": "我接下委托。"},
    )
    assert hidden.status_code == 403
