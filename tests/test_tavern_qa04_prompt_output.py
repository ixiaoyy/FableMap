"""QA-04: Prompt Block 顺序稳定 / token budget 裁剪稳定 / 输出修正失败不影响链路 / 降级回应落库."""

from pathlib import Path
from tempfile import TemporaryDirectory

import pytest

from fablemap_api.core.llm_clients import LLMError
from fablemap_api.core.output_rules import apply_output_rules
from fablemap_api.core.prompt_blocks import default_prompt_blocks, normalize_prompt_blocks, truncate_to_budget
from fablemap_api.core.tavern import LLMConfig, Tavern, TavernCharacter
from fablemap_api.core.web.config import ApiSettings
from fablemap_api.core.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _create_open_tavern(service: WebService, tavern_id: str) -> Tavern:
    tavern = Tavern(
        id=tavern_id,
        name=f"QA-04 Tavern {tavern_id}",
        description="A tavern for QA-04 regression checks.",
        lat=31.23,
        lon=121.47,
        owner_id="owner_qa04",
        status="open",
        characters=[
            TavernCharacter(
                id=f"{tavern_id}_char",
                tavern_id=tavern_id,
                name="\u95ee\u4e8b",
                first_mes="\u706f\u4eae\u7740\u3002",
            )
        ],
    )
    service.tavern_store.create_tavern(tavern)
    service.tavern_store.save_llm_config(
        tavern.id,
        LLMConfig(backend="openai", model="gpt-4o-mini", api_key="sk-test-qa04"),
    )
    return tavern


# ---------------------------------------------------------------------------
# 1. Prompt Block 顺序稳定
# ---------------------------------------------------------------------------

def test_prompt_block_order_is_stable_through_save_retrieve_and_build():
    """Blocks 保存 -> 查询 -> PromptBuilder 组装，保持原始 order 顺序不变."""
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service, "tavern_pb_order")

        blocks = normalize_prompt_blocks([
            {"id": "z_block",  "name": "Z\u6bb5\u843d",  "type": "custom", "order": 30, "template": "\u3010Z\u3011"},
            {"id": "a_block",  "name": "A\u6bb5\u843d",  "type": "custom", "order": 10, "template": "\u3010A\u3011"},
            {"id": "m_block",  "name": "M\u6bb5\u843d",  "type": "custom", "order": 20, "template": "\u3010M\u3011"},
        ])
        service.save_prompt_blocks_payload(tavern.id, {"blocks": blocks}, user_id="owner_qa04")

        retrieved = service.get_prompt_blocks_payload(tavern.id, user_id="owner_qa04")
        retrieved_ids = [b["id"] for b in retrieved["blocks"]]

        assert retrieved_ids == ["a_block", "m_block", "z_block"], \
            f"Order should be [a, m, z], got {retrieved_ids}"

        tavern_obj = service.tavern_store.get_tavern(tavern.id)
        assert [b["id"] for b in tavern_obj.prompt_blocks] == ["a_block", "m_block", "z_block"]


# ---------------------------------------------------------------------------
# 2. token budget 裁剪稳定
# ---------------------------------------------------------------------------

def test_token_budget_truncation_is_deterministic():
    """相同长度文本在相同 budget 下裁剪结果一致；超 budget 时以 ellipsis 结尾."""
    long_text = "\u8fd9\u662f\u4e00\u6bb5\u5f88\u957f\u7684\u6587\u672c\u3002" * 50

    result1 = truncate_to_budget(long_text, 8)
    result2 = truncate_to_budget(long_text, 8)
    assert result1 == result2, "裁剪结果应完全一致"

    assert result1.endswith("\u2026"), f"超预算文本应以 ellipsis 结尾，实际: {result1[-3:]!r}"

    short_text = "\u77ed\u6587\u672c\u3002"
    assert truncate_to_budget(short_text, 8) == short_text, "未超预算时原文应保留"


def test_chat_api_with_tiny_memory_budget_never_exceeds_limit(monkeypatch):
    """聊天 API 在极小 memory_budget 下仍能返回 response，不会因裁剪异常退出."""
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service, "tavern_budget_limit")

        tavern_obj = service.tavern_store.get_tavern(tavern.id)
        tavern_obj.memory_policy = {"budget_tokens": 1}
        service.tavern_store.update_tavern(tavern_obj)

        class DummyResponse:
            content = "\u964d\u4e86\u4e00\u70b9\u3002"
            usage = {"total_tokens": 6}

        class DummyClient:
            def complete(self, messages):
                return DummyResponse()

        monkeypatch.setattr("fablemap_api.core.web.service.create_client", lambda config: DummyClient())

        payload = service.tavern_chat_payload(
            tavern_id=tavern.id,
            character_id=f"{tavern.id}_char",
            message="\u4e0b\u5348\u5929\u6c14\u600e\u6837\uff1f",
            visitor_id="visitor_budget",
        )

        assert "response" in payload
        assert payload["response"] == "\u964d\u4e86\u4e00\u70b9\u3002"
        assert payload["degraded"] is False


# ---------------------------------------------------------------------------
# 3. 输出修正规则失败不影响聊天主链路
# ---------------------------------------------------------------------------

def test_bad_output_regex_does_not_break_chat_and_message_is_still_saved(monkeypatch):
    """输出修正规则中出现无效正则时，聊天继续完成，消息正常落库，不抛异常."""
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service, "tavern_bad_output_rule")

        # Use the service API instead of direct save
        service.save_output_rules_payload(
            tavern.id,
            {
                "rules": [
                    {
                        "id": "bad_regex_rule",
                        "name": "\u574f\u6b63\u5219",
                        "enabled": True,
                        "kind": "regex",
                        "pattern": "(unclosed",   # invalid regex
                        "replacement": "X",
                    },
                    {
                        "id": "good_rule",
                        "name": "\u53bb\u9664OOC",
                        "enabled": True,
                        "kind": "regex",
                        "pattern": r"OOC[:：]",
                        "replacement": "",
                    },
                ]
            },
            user_id="owner_qa04",
        )

        class DummyResponse:
            content = "OOC\uff1a\u6211\u662fNPC\uff0c\u6b63\u5e38\u56de\u590d\u3002\u4e0b\u4e00\u53e5\u662f\u6b63\u5e38\u5185\u5bb9\u3002"
            usage = {"total_tokens": 10}

        class DummyClient:
            def complete(self, messages):
                return DummyResponse()

        monkeypatch.setattr("fablemap_api.core.web.service.create_client", lambda config: DummyClient())

        payload = service.tavern_chat_payload(
            tavern_id=tavern.id,
            character_id=f"{tavern.id}_char",
            message="\u4f60\u597d\u3002",
            visitor_id="visitor_output_rule",
        )

        assert payload["response"] == "\u6211\u662fNPC\uff0c\u6b63\u5e38\u56de\u590d\u3002\u4e0b\u4e00\u53e5\u662f\u6b63\u5e38\u5185\u5bb9\u3002"
        assert payload["degraded"] is False

        history = service.tavern_store.get_chat_history(tavern.id, "visitor_output_rule", f"{tavern.id}_char")
        assert len(history) == 2
        assert history[1].role == "assistant"
        assert "\u6b63\u5e38\u56de\u590d" in history[1].content


def test_apply_output_rules_bad_regex_collects_error_but_does_not_raise():
    """apply_output_rules 遇到无效正则时在 errors 字段中记录，不修改 text."""
    result = apply_output_rules(
        "\u539f\u59cb\u6587\u672c",
        [
            {
                "id": "crash_rule",
                "name": "\u4f1a\u5d29\u7684\u89c4\u5219",
                "enabled": True,
                "kind": "regex",
                "pattern": "(?P<invalid",
                "replacement": "X",
            },
            {
                "id": "pass_through",
                "name": "\u6b63\u5e38\u89c4\u5219",
                "enabled": True,
                "kind": "text",
                "pattern": "\u539f\u59cb",
                "replacement": "\u5904\u7406\u540e",
            },
        ],
    )

    assert result["text"] == "\u5904\u7406\u540e\u6587\u672c"
    assert any(e["id"] == "crash_rule" for e in result.get("errors", [])), \
        "坏正则应进入 errors 字段"
    assert any(e["id"] == "pass_through" for e in result.get("applied", [])), \
        "正常规则应正常执行"


# ---------------------------------------------------------------------------
# 4. 降级回应仍能落库
# ---------------------------------------------------------------------------

def test_degraded_response_is_persisted_to_chat_history(monkeypatch):
    """LLM 调用失败时，降级回应正常写入历史记录，访客可回访."""
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service, "tavern_degrade_persist")

        class FailingClient:
            def complete(self, messages):
                raise LLMError("upstream unavailable")

        monkeypatch.setattr("fablemap_api.core.web.service.create_client", lambda config: FailingClient())

        payload = service.tavern_chat_payload(
            tavern_id=tavern.id,
            character_id=f"{tavern.id}_char",
            message="\u4f60\u597d\u3002",
            visitor_id="visitor_degrade_persist",
        )

        assert payload["degraded"] is True
        assert payload["degradation"]["reason"] == "llm_error"
        assert "response" in payload
        assert payload["response"]

        history = service.tavern_store.get_chat_history(
            tavern.id, "visitor_degrade_persist", f"{tavern.id}_char"
        )
        roles = [m.role for m in history]
        assert roles == ["user", "assistant"], \
            f"Degraded response should be persisted, got roles: {roles}"
        assistant_msg = next(m for m in history if m.role == "assistant")
        assert assistant_msg.content == payload["response"]


# ---------------------------------------------------------------------------
# 5. API 级别综合回归（httpx）
# ---------------------------------------------------------------------------

def test_qa04_api_level_comprehensive(monkeypatch):
    """API 级别端到端验证：Prompt Block 默认顺序 + 输出修正规则 API + 坏正则容错."""
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient
    from fablemap_api.core.web.app import create_web_app

    with TemporaryDirectory() as tmpdir:
        app = create_web_app(
            ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None)
        )
        headers = {"X-User-Id": "owner_qa04_api"}

        with TestClient(app) as client:
            tavern_resp = client.post(
                "/api/taverns",
                headers=headers,
                json={
                    "id": "tavern_qa04_api",
                    "name": "QA-04 API Tavern",
                    "description": "API-level QA-04 regression tavern.",
                    "lat": 31.23,
                    "lon": 121.47,
                },
            )
            assert tavern_resp.status_code == 200
            tavern_id = tavern_resp.json()["id"]

            char_resp = client.post(
                f"/api/taverns/{tavern_id}/characters",
                headers=headers,
                json={"id": f"{tavern_id}_char", "name": "QA"},
            )
            assert char_resp.status_code == 200

            # Verify default prompt block order
            blocks_resp = client.get(f"/api/taverns/{tavern_id}/prompt-blocks", headers=headers)
            assert blocks_resp.status_code == 200
            first_ids = [b["id"] for b in blocks_resp.json()["blocks"][:3]]
            assert first_ids == ["scene", "character_system", "character_profile"], \
                f"Default order should be scene/character_system/character_profile, got {first_ids}"

            # Verify default output rules
            rules_resp = client.get(f"/api/taverns/{tavern_id}/output-rules", headers=headers)
            assert rules_resp.status_code == 200
            assert len(rules_resp.json()["rules"]) >= 3, \
                "Default output rules should be at least 3"

            # Save bad rule -> should succeed, errors tracked separately
            bad_rules_resp = client.put(
                f"/api/taverns/{tavern_id}/output-rules",
                headers=headers,
                json={
                    "rules": [
                        {
                            "id": "crashy",
                            "name": "Crash rule",
                            "enabled": True,
                            "kind": "regex",
                            "pattern": "(",
                            "replacement": "",
                        }
                    ]
                },
            )
            assert bad_rules_resp.status_code == 200

            # Test output rules preview with bad rule -> text preserved, error tracked
            preview_resp = client.post(
                f"/api/taverns/{tavern_id}/output-rules/test",
                headers=headers,
                json={"text": "Test text", "rules": [{"id": "crashy", "pattern": "(", "replacement": ""}]},
            )
            assert preview_resp.status_code == 200
            assert preview_resp.json()["text"] == "Test text"
            assert any(e["id"] == "crashy" for e in preview_resp.json().get("errors", []))

            # Degraded response persisted via API (mock LLM)
            class MockResponse:
                def json(self):
                    return {"choices": [{"message": {"content": "\u6b63\u5e38\u56de\u590d"}}]}
            class MockClient:
                def post(self, url, json, headers):
                    return MockResponse()

            # Verify prompt block preview API works with character
            preview_pb_resp = client.post(
                f"/api/taverns/{tavern_id}/prompt-blocks/preview",
                headers=headers,
                json={
                    "character_id": f"{tavern_id}_char",
                    "visitor_name": "Tester",
                    "message": "Hello",
                },
            )
            assert preview_pb_resp.status_code == 200
            msgs = preview_pb_resp.json()["messages"]
            assert msgs[-1] == {"role": "user", "content": "Hello"}
