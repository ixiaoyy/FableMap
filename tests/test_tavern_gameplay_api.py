from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from fastapi import HTTPException

from fablemap_api.core.web.config import ApiSettings
from fablemap_api.core.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _create_tavern(service: WebService, owner_id: str = "owner_gameplay") -> dict:
    return service.create_tavern_payload(
        {
            "id": "tavern_gameplay",
            "name": "玩法测试空间",
            "description": "用于测试玩法系统。",
            "lat": 35.0,
            "lon": 139.0,
            "access": "public",
            "scene_prompt": "一个安全的玩法测试空间。",
            "characters": [
                {
                    "id": "char_host",
                    "name": "主持人",
                    "description": "负责主持玩法。",
                    "personality": "清楚",
                    "scenario": "吧台前。",
                    "system_prompt": "主持老少皆宜玩法。",
                    "first_mes": "来玩一局。",
                    "mes_example": "",
                    "tags": ["主持"],
                }
            ],
            "llm_config": {"backend": "rules", "model": "rules", "api_key": ""},
        },
        owner_id=owner_id,
    )


def _gameplay_payload(status: str = "published") -> dict:
    return {
        "id": "gp_test_route",
        "title": "三步测试玩法",
        "status": status,
        "summary": "测试 start 到 complete。",
        "entry_label": "开始测试",
        "owner_brief": {"goal": "验证结构化进度", "tone": "清楚"},
        "nodes": [
            {
                "id": "start",
                "narration": "第一步。",
                "choices": [{"id": "go", "label": "继续", "next_node_id": "complete"}],
                "fallback_events": [{"id": "fallback", "text": "规则兜底继续。", "next_node_id": "complete"}],
            },
            {"id": "complete", "kind": "complete", "narration": "完成。", "choices": []},
        ],
        "completion": {"complete_node_ids": ["complete"], "reward_text": "测试奖励", "memory_atom": {"enabled": False}},
    }


def test_owner_saves_gameplays_and_visitors_see_only_published_definitions():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        _create_tavern(service)

        saved = service.save_gameplays_payload(
            "tavern_gameplay",
            {"gameplays": [_gameplay_payload("published"), {**_gameplay_payload("draft"), "id": "gp_draft", "title": "草稿"}]},
            "owner_gameplay",
        )
        assert saved["ok"] is True
        assert len(saved["gameplays"]) == 2

        visitor_view = service.get_gameplays_payload("tavern_gameplay", "visitor_a")
        assert [item["id"] for item in visitor_view["gameplays"]] == ["gp_test_route"]

        with pytest.raises(HTTPException) as exc:
            service.save_gameplays_payload("tavern_gameplay", {"gameplays": []}, "visitor_a")
        assert exc.value.status_code == 403


def test_gameplay_session_start_advance_abandon_and_cross_visitor_permission():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        _create_tavern(service)
        service.save_gameplays_payload("tavern_gameplay", {"gameplays": [_gameplay_payload()]}, "owner_gameplay")

        started = service.start_gameplay_session_payload(
            "tavern_gameplay",
            {"gameplay_id": "gp_test_route", "character_id": "char_host"},
            "visitor_a",
        )
        assert started["ok"] is True
        assert started["resumed"] is False
        session_id = started["session"]["id"]
        assert started["session"]["state"] == "in_progress"
        assert started["scene"]["choices"][0]["id"] == "go"

        resumed = service.start_gameplay_session_payload(
            "tavern_gameplay",
            {"gameplay_id": "gp_test_route", "character_id": "char_host"},
            "visitor_a",
        )
        assert resumed["resumed"] is True
        assert resumed["session"]["id"] == session_id

        with pytest.raises(HTTPException) as exc:
            service.advance_gameplay_session_payload("tavern_gameplay", session_id, {"choice_id": "go"}, "visitor_b")
        assert exc.value.status_code == 403

        advanced = service.advance_gameplay_session_payload("tavern_gameplay", session_id, {"choice_id": "go"}, "visitor_a")
        assert advanced["ok"] is True
        assert advanced["source"] == "choice"
        assert advanced["session"]["state"] == "completed"
        assert advanced["session"]["completion"]["reward_text"] == "测试奖励"

        sessions = service.list_gameplay_sessions_payload("tavern_gameplay", "visitor_a")
        assert sessions["sessions"][0]["id"] == session_id

        abandoned = service.abandon_gameplay_session_payload("tavern_gameplay", session_id, "visitor_a")
        assert abandoned["session"]["state"] == "abandoned"


def test_gameplay_sessions_survive_tavern_metadata_update_and_export_excludes_sessions():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        _create_tavern(service)
        service.save_gameplays_payload("tavern_gameplay", {"gameplays": [_gameplay_payload()]}, "owner_gameplay")
        started = service.start_gameplay_session_payload("tavern_gameplay", {"gameplay_id": "gp_test_route"}, "visitor_a")
        session_id = started["session"]["id"]

        service.update_tavern_payload("tavern_gameplay", {"description": "更新后的描述"}, "owner_gameplay")
        sessions = service.list_gameplay_sessions_payload("tavern_gameplay", "visitor_a")
        assert [session["id"] for session in sessions["sessions"]] == [session_id]

        package = service.export_tavern_package_payload("tavern_gameplay", "owner_gameplay")
        assert package["gameplay_definitions"][0]["id"] == "gp_test_route"
        assert "_gameplay_sessions" not in package
        assert "gameplay_sessions" not in package
