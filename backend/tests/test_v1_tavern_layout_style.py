from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-layout-style"
VISITOR_ID = "visitor-layout-style"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern(client: TestClient, **payload: object) -> dict[str, object]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "Layout Test Tavern",
            "description": "A tavern for layout style contract tests.",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            **payload,
        },
    )
    assert created.status_code == 200
    return created.json()


def test_layout_style_defaults_and_round_trips_through_v1_tavern_api(tmp_path: Path) -> None:
    client = _client(tmp_path)

    defaulted = _create_tavern(client)
    assert defaulted["layout_style"] == "lobby"

    created = _create_tavern(client, name="Quest Board Tavern", layout_style="quest-play")
    assert created["layout_style"] == "quest-play"
    tavern_id = str(created["id"])

    visitor_view = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": VISITOR_ID})
    assert visitor_view.status_code == 200
    assert visitor_view.json()["layout_style"] == "quest-play"

    updated = client.put(
        f"/api/v1/taverns/{tavern_id}",
        headers={"X-User-Id": OWNER_ID},
        json={"layout_style": "hybrid-room"},
    )
    assert updated.status_code == 200
    assert updated.json()["layout_style"] == "hybrid-room"

    reloaded = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": OWNER_ID})
    assert reloaded.status_code == 200
    assert reloaded.json()["layout_style"] == "hybrid-room"


def test_invalid_layout_style_falls_back_to_lobby(tmp_path: Path) -> None:
    client = _client(tmp_path)

    created = _create_tavern(client, layout_style="platform-generated-theme")
    assert created["layout_style"] == "lobby"
    tavern_id = str(created["id"])

    updated = client.put(
        f"/api/v1/taverns/{tavern_id}",
        headers={"X-User-Id": OWNER_ID},
        json={"layout_style": "combat-arena"},
    )
    assert updated.status_code == 200
    assert updated.json()["layout_style"] == "lobby"
