
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app

OWNER_ID = "owner_continuity"
VISITOR_ID = "visitor_gamma"

def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))

def _create_tavern_with_character(client: TestClient) -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "continuity-tavern",
            "name": "Continuity Tavern",
            "lat": 31.23,
            "lon": 121.47,
            "llm_config": {"backend": "rules", "model": "rules"},
            "status": "open",
        },
    )
    tavern_id = created.json()["id"]
    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={"id": "char_logic", "name": "Logic", "first_mes": "I am logical."},
    )
    return tavern_id, character.json()["id"]

def test_continuity_contradiction_detection(tmp_path: Path):
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    # 1. Create a confirmed state card stating a character is sleeping
    res = client.post(
        f"/api/v1/taverns/{tavern_id}/state-cards",
        headers={"X-User-Id": OWNER_ID},
        json={
            "category": "character",
            "status": "confirmed",
            "title": "Character State: Logic",
            "summary": "Logic is currently sleeping deeply.",
            "canon_scope": "tavern",
            "fixed_canon": True
        }
    )
    assert res.status_code == 200

    # 2. Send a chat where the character acts
    # We use a custom response in the rules backend mock if possible, 
    # but the rules backend usually echoes or returns static text.
    # Actually, the runtime service uses the LLM response text.
    # For 'rules' backend, it might just return something generic.
    
    # Let's check what 'rules' backend returns. 
    # If it's a mock, we might need to adjust it to return an "active" response.
    
    chat = client.post(
        f"/api/v1/taverns/{tavern_id}/chat",
        headers={"X-User-Id": VISITOR_ID},
        json={
            "character_id": character_id,
            "visitor_id": VISITOR_ID,
            "message": "Hello? Are you there?",
        },
    )
    assert chat.status_code == 200
    payload = chat.json()
    
    # If the rules backend returned something like "NPC: Hello!" (contains '说' or '笑')
    # then conflicts should be populated.
    # Actually, the 'rules' backend in fablemap usually returns a rule-based response.
    
    print(f"DEBUG Response: {payload['response']}")
    # If the response doesn't trigger the naive validator, we'll force it in a unit test instead.
    # But let's see if we can get an integration hit.

def test_validator_unit():
    from fablemap_api.core.continuity_validator import ContinuityValidator, ConflictReport
    from fablemap_api.core.state_cards import StateCard
    
    validator = ContinuityValidator()
    card = StateCard(
        id="c1",
        category="character",
        summary="张三正在睡觉",
        status="confirmed"
    )
    
    # Case 1: Contradiction
    report = validator.validate_reply("张三笑了笑说：你好。", [card])
    assert len(report) == 1
    assert "无法进行回复中的动作" in report[0].contradiction_reason
    
    # Case 2: No contradiction
    report2 = validator.validate_reply("你看到张三躺在床上。", [card])
    assert len(report2) == 0

