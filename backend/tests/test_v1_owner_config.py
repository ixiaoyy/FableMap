from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-config"
VISITOR_ID = "visitor-config"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern(client: TestClient) -> str:
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "配置空间",
            "description": "用于测试店主配置迁移",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "scene_prompt": "吧台边有雨声和铜铃。",
            "llm_config": {
                "backend": "rules",
                "model": "rule-based",
                "api_key": "owner-secret",
            },
        },
    )
    assert response.status_code == 200
    return response.json()["id"]


def _add_character(client: TestClient, tavern_id: str) -> str:
    response = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "铃兰",
            "description": "吧台后的 NPC",
            "personality": "温和、谨慎",
            "scenario": "雨夜空间",
            "system_prompt": "保持空间 NPC 口吻。",
            "first_mes": "欢迎回来。",
        },
    )
    assert response.status_code == 200
    return response.json()["id"]


def test_v1_world_info_test_matches_temporary_owner_payload(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)

    response = client.post(
        f"/api/v1/taverns/{tavern_id}/world-info/test",
        headers={"X-User-Id": OWNER_ID},
        json={
            "message": "今晚雨声很近。",
            "recent_messages": [{"content": "铜铃刚刚响过。"}],
            "world_info": [
                {"id": "rain", "keys": ["雨声"], "content": "雨声会触发旧日传闻。"},
                {"id": "disabled", "keys": ["铜铃"], "content": "禁用条目", "disable": True},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["matched_count"] == 1
    assert payload["matches"][0]["id"] == "rain"
    assert payload["matches"][0]["matched_keys"] == ["雨声"]
    assert payload["entry_count"] == 2


def test_v1_output_rules_round_trip_and_diagnostic(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)
    rules = [
        {
            "id": "replace_ai",
            "name": "替换出戏词",
            "enabled": True,
            "kind": "literal",
            "pattern": "AI",
            "replacement": "NPC",
        }
    ]

    defaults = client.get(f"/api/v1/taverns/{tavern_id}/output-rules", headers={"X-User-Id": OWNER_ID})
    assert defaults.status_code == 200
    assert defaults.json()["default_rules"]

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/output-rules",
        headers={"X-User-Id": OWNER_ID},
        json={"rules": rules},
    )
    assert saved.status_code == 200
    assert saved.json()["rules"][0]["id"] == "replace_ai"

    checked = client.post(
        f"/api/v1/taverns/{tavern_id}/output-rules/test",
        headers={"X-User-Id": OWNER_ID},
        json={"text": "AI 正在说话"},
    )
    assert checked.status_code == 200
    assert checked.json()["text"] == "NPC 正在说话"
    assert checked.json()["changed"] is True


def test_v1_prompt_blocks_round_trip_and_preview(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)
    character_id = _add_character(client, tavern_id)

    defaults = client.get(f"/api/v1/taverns/{tavern_id}/prompt-blocks", headers={"X-User-Id": OWNER_ID})
    assert defaults.status_code == 200
    blocks = defaults.json()["default_blocks"][:2]

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/prompt-blocks",
        headers={"X-User-Id": OWNER_ID},
        json={"blocks": blocks},
    )
    assert saved.status_code == 200
    assert [block["id"] for block in saved.json()["blocks"]] == [block["id"] for block in blocks]

    preview = client.post(
        f"/api/v1/taverns/{tavern_id}/prompt-blocks/preview",
        headers={"X-User-Id": OWNER_ID},
        json={"character_id": character_id, "message": "这里有什么传闻？", "visitor_name": "测试旅人"},
    )
    assert preview.status_code == 200
    payload = preview.json()
    assert payload["character_id"] == character_id
    assert payload["character_name"] == "铃兰"
    assert payload["message_count"] == len(payload["messages"])
    assert payload["message_count"] >= 1


def test_v1_runtime_presets_round_trip_and_apply(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)
    custom_preset = {
        "id": "owner-rules",
        "name": "店主规则预设",
        "llm_config": {
            "backend": "rules",
            "model": "rule-based",
            "api_key": "must-not-persist-in-preset",
        },
        "memory_policy": {"mode": "visitor_state", "budget_tokens": 300},
        "output_rules": [
            {"id": "trim", "name": "压缩空行", "kind": "literal", "pattern": "  ", "replacement": " "}
        ],
    }

    defaults = client.get(f"/api/v1/taverns/{tavern_id}/runtime-presets", headers={"X-User-Id": OWNER_ID})
    assert defaults.status_code == 200
    assert "balanced-roleplay" in {preset["id"] for preset in defaults.json()["default_presets"]}

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/runtime-presets",
        headers={"X-User-Id": OWNER_ID},
        json={"presets": [custom_preset], "active_preset_id": "owner-rules"},
    )
    assert saved.status_code == 200
    assert saved.json()["custom_presets"][0]["id"] == "owner-rules"
    assert "api_key" not in saved.json()["custom_presets"][0]["llm_config"]

    applied = client.post(
        f"/api/v1/taverns/{tavern_id}/runtime-presets/apply",
        headers={"X-User-Id": OWNER_ID},
        json={"preset_id": "owner-rules"},
    )
    assert applied.status_code == 200
    payload = applied.json()
    assert payload["active_preset_id"] == "owner-rules"
    assert payload["tavern"]["active_preset_id"] == "owner-rules"
    assert payload["tavern"]["memory_policy"]["budget_tokens"] == 300
    assert payload["tavern"]["llm_config"]["api_key"] == "owner-secret"


@pytest.mark.parametrize(
    ("method", "path", "json_body"),
    [
        ("post", "world-info/test", {"message": "雨声", "world_info": []}),
        ("get", "output-rules", None),
        ("put", "output-rules", {"rules": []}),
        ("post", "output-rules/test", {"text": "AI"}),
        ("get", "prompt-blocks", None),
        ("put", "prompt-blocks", {"blocks": []}),
        ("post", "prompt-blocks/preview", {"message": "你好"}),
        ("get", "runtime-presets", None),
        ("put", "runtime-presets", {"presets": []}),
        ("post", "runtime-presets/apply", {"preset_id": "missing"}),
    ],
)
def test_v1_owner_config_endpoints_are_owner_only(
    tmp_path: Path,
    method: str,
    path: str,
    json_body: dict | None,
) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)
    _add_character(client, tavern_id)
    request = getattr(client, method)
    url = f"/api/v1/taverns/{tavern_id}/{path}"
    if json_body is None:
        response = request(url, headers={"X-User-Id": VISITOR_ID})
    else:
        response = request(url, headers={"X-User-Id": VISITOR_ID}, json=json_body)
    assert response.status_code == 403
