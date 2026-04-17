from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


def test_owner_chat_session_listing_includes_all_visitors_and_names():
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient
    from fablemap.web.app import create_web_app
    from fablemap.web.config import ApiSettings

    with TemporaryDirectory() as tmpdir:
        app = create_web_app(
            ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None)
        )
        owner_headers = {"X-User-Id": "owner_chat_sessions"}

        with TestClient(app) as client:
            tavern_response = client.post(
                "/api/taverns",
                headers=owner_headers,
                json={
                    "id": "tavern_chat_sessions_api",
                    "name": "Chat Sessions API Tavern",
                    "description": "A tavern for chat session API checks.",
                    "lat": 31.23,
                    "lon": 121.47,
                },
            )
            assert tavern_response.status_code == 200
            tavern_id = tavern_response.json()["id"]

            character_response = client.post(
                f"/api/taverns/{tavern_id}/characters",
                headers=owner_headers,
                json={"id": "char_chat_sessions_api", "name": "Keeper"},
            )
            assert character_response.status_code == 200
            character_id = character_response.json()["id"]

            for visitor_id, visitor_name, content in (
                ("visitor_alpha", "Mina", "Hello from Mina."),
                ("visitor_beta", "Noah", "Hello from Noah."),
            ):
                save_response = client.post(
                    "/api/chats",
                    headers={"X-User-Id": visitor_id},
                    json={
                        "tavern_id": tavern_id,
                        "character_id": character_id,
                        "visitor_id": visitor_id,
                        "messages": [
                            {
                                "role": "user",
                                "content": content,
                                "visitor_name": visitor_name,
                            }
                        ],
                    },
                )
                assert save_response.status_code == 200

            owner_list = client.get(
                f"/api/chats?tavern_id={tavern_id}",
                headers=owner_headers,
            )
            assert owner_list.status_code == 200
            owner_chats = owner_list.json()["chats"]
            assert {chat["visitor_name"] for chat in owner_chats} == {"Mina", "Noah"}
            assert {chat["tavern_name"] for chat in owner_chats} == {"Chat Sessions API Tavern"}

            owner_filtered_list = client.get(
                f"/api/chats?tavern_id={tavern_id}&visitor_id=visitor_alpha",
                headers=owner_headers,
            )
            assert owner_filtered_list.status_code == 200
            owner_filtered_chats = owner_filtered_list.json()["chats"]
            assert [chat["visitor_name"] for chat in owner_filtered_chats] == ["Mina"]

            other_tavern_response = client.post(
                "/api/taverns",
                headers={"X-User-Id": "other_owner_chat_sessions"},
                json={
                    "id": "other_public_chat_sessions_api",
                    "name": "Other Public Tavern",
                    "description": "A public tavern not owned by the current owner.",
                    "lat": 31.24,
                    "lon": 121.48,
                },
            )
            assert other_tavern_response.status_code == 200

            owner_global_filter = client.get(
                "/api/chats?visitor_id=visitor_alpha",
                headers=owner_headers,
            )
            assert owner_global_filter.status_code == 200
            assert {chat["tavern_id"] for chat in owner_global_filter.json()["chats"]} == {tavern_id}

            visitor_list = client.get(
                f"/api/chats?tavern_id={tavern_id}",
                headers={"X-User-Id": "visitor_alpha"},
            )
            assert visitor_list.status_code == 200
            visitor_chats = visitor_list.json()["chats"]
            assert [chat["visitor_name"] for chat in visitor_chats] == ["Mina"]

            forbidden_filter = client.get(
                f"/api/chats?tavern_id={tavern_id}&visitor_id=visitor_alpha",
                headers={"X-User-Id": "visitor_beta"},
            )
            assert forbidden_filter.status_code == 403
