from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def test_v1_tokenizer_utilities_count_text_and_messages(tmp_path: Path) -> None:
    client = _client(tmp_path)

    listed = client.get("/api/v1/tokenizers")
    assert listed.status_code == 200
    assert "cl100k_base" in listed.json()["tokenizers"]

    counted = client.post("/api/v1/tokenizers/count", json={"text": "FableMap cyber tavern", "backend": "cl100k_base"})
    assert counted.status_code == 200
    assert counted.json()["backend"] == "cl100k_base"
    assert counted.json()["count"] > 0

    message_counted = client.post(
        "/api/v1/tokenizers/count_messages",
        json={
            "backend": "cl100k_base",
            "messages": [
                {"role": "system", "content": "你是酒馆 NPC。"},
                {"role": "user", "content": [{"type": "text", "text": "今晚有什么故事？"}]},
            ],
        },
    )
    assert message_counted.status_code == 200
    assert message_counted.json()["backend"] == "cl100k_base"
    assert message_counted.json()["count"] > 0


def test_v1_memory_utilities_truncate_importance_and_summarize_guard(tmp_path: Path) -> None:
    client = _client(tmp_path)

    messages = [
        {"role": "system", "content": "system"},
        {"role": "user", "content": "A" * 80},
        {"role": "assistant", "content": "B" * 80},
    ]
    truncated = client.post("/api/v1/memory/truncate", json={"messages": messages, "max_tokens": 4})
    assert truncated.status_code == 200
    assert truncated.json()["count"] < len(messages)
    assert truncated.json()["messages"][0]["role"] == "system"

    scored = client.post(
        "/api/v1/memory/importance",
        json={"messages": [{"content": "ok"}, {"content": "我很开心，也有一个新事实？"}]},
    )
    assert scored.status_code == 200
    scores = scored.json()["scores"]
    assert scores[0]["index"] == 0
    assert scores[1]["importance"] > scores[0]["importance"]

    summarized = client.post("/api/v1/memory/summarize", json={"messages": messages})
    assert summarized.status_code == 501
    assert summarized.json()["error"] == "LLM client not configured for summarization"
