from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner_engagement"
VISITOR_ID = "visitor_engagement"
OTHER_VISITOR_ID = "other_visitor_engagement"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern(client: TestClient) -> str:
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "engagement-demo",
            "name": "纪念币茶馆",
            "description": "完成轻玩法后可领纪念币，再送礼给 NPC。",
            "lat": 31.23,
            "lon": 121.47,
            "llm_config": {"backend": "rules", "model": "rules"},
            "gameplay_definitions": [
                {
                    "id": "gp_coin_intro",
                    "title": "招呼一声",
                    "status": "published",
                    "summary": "完成后可领取纪念币。",
                    "mode": "ai_directed_branch",
                    "owner_brief": {
                        "goal": "和 NPC 完成一轮轻互动",
                        "materials": [],
                        "forbidden": [],
                    },
                    "nodes": [
                        {
                            "id": "start",
                            "kind": "scene",
                            "narration": "店里的灯亮了起来。",
                            "choices": [
                                {"id": "wave", "label": "打个招呼", "next_node_id": "complete"},
                            ],
                            "fallback_events": [],
                        },
                        {
                            "id": "complete",
                            "kind": "complete",
                            "narration": "你完成了这次轻互动。",
                            "choices": [],
                            "fallback_events": [],
                        },
                    ],
                    "completion": {
                        "complete_node_ids": ["complete"],
                        "reward_text": "你获得了一枚纪念币。",
                        "memory_atom": {"enabled": False},
                    },
                }
            ],
        },
    )
    assert response.status_code == 200

    character = client.post(
        "/api/v1/taverns/engagement-demo/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "id": "npc_keeper",
            "name": "茶博士",
            "system_prompt": "温和回应访客。",
            "first_mes": "欢迎来到纪念币茶馆。",
        },
    )
    assert character.status_code == 200
    return response.json()["id"]


def test_engagement_config_owner_update_and_visitor_safe_read(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)

    visitor_config = client.get(
        f"/api/v1/taverns/{tavern_id}/engagement/config",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert visitor_config.status_code == 200
    assert "reward_rules" not in visitor_config.json()
    assert visitor_config.json()["gift_catalog"][0]["id"] == "warm_tea"

    owner_config = client.get(
        f"/api/v1/taverns/{tavern_id}/engagement/config",
        headers={"X-User-Id": OWNER_ID},
    )
    assert owner_config.status_code == 200
    assert owner_config.json()["reward_rules"][0]["source_id"] == "gp_coin_intro"

    updated = client.put(
        f"/api/v1/taverns/{tavern_id}/engagement/config",
        headers={"X-User-Id": OWNER_ID},
        json={
            "coin_label": "心意点",
            "reward_rules": [
                {
                    "source_type": "gameplay_completion",
                    "source_id": "gp_coin_intro",
                    "amount": 40,
                    "daily_claim_limit": 1,
                }
            ],
            "bonus_draw": {
                "enabled": True,
                "voucher_price": 30,
                "daily_limit": 1,
                "weekly_limit": 3,
                "hidden_unlock_allowed": False,
            },
        },
    )
    assert updated.status_code == 200
    assert updated.json()["engagement_config"]["coin_label"] == "心意点"

    reloaded = client.get(
        f"/api/v1/taverns/{tavern_id}/engagement/config",
        headers={"X-User-Id": OWNER_ID},
    )
    assert reloaded.status_code == 200
    assert reloaded.json()["coin_label"] == "心意点"
    assert reloaded.json()["reward_rules"][0]["amount"] == 40


def test_engagement_claim_reward_send_gift_and_redeem_voucher(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)

    saved = client.put(
        f"/api/v1/taverns/{tavern_id}/engagement/config",
        headers={"X-User-Id": OWNER_ID},
        json={
            "reward_rules": [
                {
                    "source_type": "gameplay_completion",
                    "source_id": "gp_coin_intro",
                    "amount": 40,
                    "daily_claim_limit": 1,
                }
            ]
        },
    )
    assert saved.status_code == 200

    started = client.post(
        f"/api/v1/taverns/{tavern_id}/gameplay-sessions",
        headers={"X-User-Id": VISITOR_ID},
        json={"gameplay_id": "gp_coin_intro", "character_id": "npc_keeper"},
    )
    assert started.status_code == 200
    session_id = started.json()["session"]["id"]

    advanced = client.post(
        f"/api/v1/taverns/{tavern_id}/gameplay-sessions/{session_id}/advance",
        headers={"X-User-Id": VISITOR_ID},
        json={"choice_id": "wave"},
    )
    assert advanced.status_code == 200
    assert advanced.json()["completed"] is True

    claimed = client.post(
        f"/api/v1/taverns/{tavern_id}/engagement/claim-reward",
        headers={"X-User-Id": VISITOR_ID},
        json={"session_id": session_id},
    )
    assert claimed.status_code == 200
    assert claimed.json()["success"] is True
    assert claimed.json()["amount"] == 40
    assert claimed.json()["balance"] == 40

    duplicate = client.post(
        f"/api/v1/taverns/{tavern_id}/engagement/claim-reward",
        headers={"X-User-Id": VISITOR_ID},
        json={"session_id": session_id},
    )
    assert duplicate.status_code == 200
    assert duplicate.json()["success"] is False
    assert "已领取" in duplicate.json()["reason"]

    me = client.get(
        f"/api/v1/taverns/{tavern_id}/engagement/me",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert me.status_code == 200
    assert me.json()["wallet"]["balance"] == 40
    assert me.json()["daily_earned"] == 40

    gifted = client.post(
        f"/api/v1/taverns/{tavern_id}/engagement/gifts/send",
        headers={"X-User-Id": VISITOR_ID},
        json={"gift_id": "warm_tea", "character_id": "npc_keeper"},
    )
    assert gifted.status_code == 200
    assert gifted.json()["success"] is True
    assert gifted.json()["balance"] == 30
    assert gifted.json()["affinity_delta"] == 2.0

    voucher = client.post(
        f"/api/v1/taverns/{tavern_id}/engagement/vouchers/redeem",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert voucher.status_code == 200
    assert voucher.json()["success"] is True
    assert voucher.json()["balance"] == 0

    me_after = client.get(
        f"/api/v1/taverns/{tavern_id}/engagement/me",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert me_after.status_code == 200
    assert me_after.json()["wallet"]["balance"] == 0
    assert me_after.json()["vouchers_available"] == 1


def test_engagement_requires_identity_and_claim_respects_visitor_scope(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id = _create_tavern(client)

    missing_identity = client.get(f"/api/v1/taverns/{tavern_id}/engagement/me")
    assert missing_identity.status_code == 401

    started = client.post(
        f"/api/v1/taverns/{tavern_id}/gameplay-sessions",
        headers={"X-User-Id": VISITOR_ID},
        json={"gameplay_id": "gp_coin_intro", "character_id": "npc_keeper"},
    )
    session_id = started.json()["session"]["id"]
    client.post(
        f"/api/v1/taverns/{tavern_id}/gameplay-sessions/{session_id}/advance",
        headers={"X-User-Id": VISITOR_ID},
        json={"choice_id": "wave"},
    )

    forbidden = client.post(
        f"/api/v1/taverns/{tavern_id}/engagement/claim-reward",
        headers={"X-User-Id": OTHER_VISITOR_ID},
        json={"session_id": session_id},
    )
    assert forbidden.status_code == 403
