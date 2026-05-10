from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.app_factory import create_app


OWNER_ID = "owner-stress"
VISITOR_ID = "visitor-stress"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def test_hobby_context_persistence_in_long_conversation(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """
    压力测试：验证在多轮对话中，爱好标签 (Hobbies) 是否能持续稳定地注入系统 Prompt。
    """
    captured_prompts: list[str] = []

    class StubResponse:
        content = "That's interesting. Tell me more."
        model = "stub-model"
        usage = {"total_tokens": 10}

    class StubClient:
        def __init__(self, config: Any) -> None:
            pass

        def complete(self, messages: list[dict[str, Any]]) -> StubResponse:
            # 捕获所有系统提示词
            system_content = "\n".join([m["content"] for m in messages if m["role"] == "system"])
            captured_prompts.append(system_content)
            return StubResponse()

    monkeypatch.setattr("fablemap_api.application.services.runtime.create_client", lambda cfg: StubClient(cfg))

    client = _client(tmp_path)
    
    # 1. 创建酒馆
    client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "stress-t1",
            "name": "Stress Test Tavern",
            "llm_config": {"backend": "openai", "model": "gpt-4o", "api_key": "sk-test"},
        },
    )
    
    # 2. 创建带有特定爱好的 NPC
    client.post(
        "/api/v1/taverns/stress-t1/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "stress-c1",
            "name": "AstronomyFan",
            "personality": "Nerd",
            "hobbies": ["Astronomy", "Astrophotography", "Telescopes"],
        },
    )
    
    # 3. 模拟 10 轮对话
    for i in range(10):
        response = client.post(
            "/api/v1/taverns/stress-t1/chat",
            headers={"X-User-Id": VISITOR_ID},
            json={
                "character_id": "stress-c1",
                "message": f"Turn {i}: What's in the sky today?",
                "visitor_id": VISITOR_ID,
                "visitor_name": "Traveler",
            },
        )
        assert response.status_code == 200
        
    # 4. 验证每一轮的 Prompt 都包含了爱好
    assert len(captured_prompts) == 10
    for idx, prompt in enumerate(captured_prompts):
        assert "Astronomy" in prompt, f"Turn {idx} missing Astronomy"
        assert "Astrophotography" in prompt, f"Turn {idx} missing Astrophotography"
        assert "Telescopes" in prompt, f"Turn {idx} missing Telescopes"
        
    print(f"\n[PASS] Hobby context persisted across {len(captured_prompts)} turns.")

if __name__ == "__main__":
    # 方便手动运行
    import sys
    pytest.main([__file__])
