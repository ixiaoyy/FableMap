from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.app_factory import create_app


OWNER_ID = "owner-dynamic"
VISITOR_ID = "visitor-dynamic"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def test_character_hobbies_injection_in_runtime(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    captured_messages: list[list[dict[str, Any]]] = []

    class StubResponse:
        content = "I'm interested in your topic."
        model = "stub-model"
        usage = {"total_tokens": 10}

    class StubClient:
        def __init__(self, config: Any) -> None:
            pass

        def complete(self, messages: list[dict[str, Any]]) -> StubResponse:
            captured_messages.append(messages)
            return StubResponse()

    monkeypatch.setattr("fablemap_api.application.services.runtime.create_client", lambda cfg: StubClient(cfg))

    client = _client(tmp_path)
    
    # 1. Create tavern
    client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "t1",
            "name": "Dynamic Tavern",
            "llm_config": {"backend": "openai", "model": "gpt-4o", "api_key": "sk-test"},
        },
    )
    
    # 2. Create character with hobbies
    client.post(
        "/api/v1/taverns/t1/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "c1",
            "name": "Hobbyist",
            "personality": "Friendly",
            "first_mes": "Hello!",
            "hobbies": ["Astronomy", "Baking"],
        },
    )
    
    # 3. Chat
    response = client.post(
        "/api/v1/taverns/t1/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": "c1",
            "message": "What do you like?",
            "visitor_id": VISITOR_ID,
            "visitor_name": "Traveler",
        },
    )
    
    assert response.status_code == 200
    assert len(captured_messages) > 0
    
    # Check system prompt content
    system_prompt = captured_messages[0][0]["content"]
    assert "Astronomy" in system_prompt
    assert "Baking" in system_prompt


def test_state_cards_injection_in_runtime(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    captured_messages: list[list[dict[str, Any]]] = []

    class StubResponse:
        content = "Acknowledged."
        model = "stub-model"
        usage = {"total_tokens": 5}

    class StubClient:
        def __init__(self, config: Any) -> None:
            pass

        def complete(self, messages: list[dict[str, Any]]) -> StubResponse:
            captured_messages.append(messages)
            return StubResponse()

    monkeypatch.setattr("fablemap_api.application.services.runtime.create_client", lambda cfg: StubClient(cfg))

    client = _client(tmp_path)
    
    # 1. Create tavern
    client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "t2",
            "name": "State Tavern",
            "llm_config": {"backend": "openai", "model": "gpt-4o", "api_key": "sk-test"},
        },
    )
    
    # 2. Create character
    client.post(
        "/api/v1/taverns/t2/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "c2",
            "name": "StateKeeper",
            "personality": "Observant",
            "first_mes": "Welcome.",
        },
    )
    
    # 3. Create confirmed StateCard
    client.post(
        "/api/v1/taverns/t2/state-cards",
        headers={"X-User-Id": OWNER_ID},
        json={
            "title": "The Golden Key",
            "summary": "A mysterious key found in the garden.",
            "status": "confirmed",
            "canon_scope": "tavern",
        },
    )
    
    # 4. Chat
    client.post(
        "/api/v1/taverns/t2/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": "c2",
            "message": "Tell me a secret.",
            "visitor_id": VISITOR_ID,
            "visitor_name": "Traveler",
        },
    )
    
    assert len(captured_messages) > 0
    system_prompt = captured_messages[0][0]["content"]
    assert "The Golden Key" in system_prompt
    assert "mysterious key" in system_prompt


def test_rules_backend_hobby_injection(tmp_path: Path) -> None:
    client = _client(tmp_path)
    
    # 1. Create tavern with rules backend
    client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "t3",
            "name": "Rules Tavern",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    
    # 2. Create character with hobby
    client.post(
        "/api/v1/taverns/t3/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "c3",
            "name": "Bartender",
            "personality": "Friendly",
            "first_mes": "Hi!",
            "hobbies": ["Mixology"],
        },
    )
    
    # 3. Chat
    response = client.post(
        "/api/v1/taverns/t3/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": "c3",
            "message": "What are you doing?",
            "visitor_id": VISITOR_ID,
            "visitor_name": "Traveler",
        },
    )
    
    assert response.status_code == 200
    payload = response.json()
    # Rules backend with hobby should inject the hobby into the response prefix
    assert "Mixology" in payload["response"]
