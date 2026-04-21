import pytest

from fablemap.gameplay import (
    AIDirector,
    GameplaySession,
    choose_fallback_event,
    normalize_gameplay_definition,
)


def test_normalize_gameplay_definition_generates_safe_default_nodes():
    gameplay = normalize_gameplay_definition({
        "title": "今日小修补",
        "summary": "把一个大问题拆成今天能做的一件小事。",
        "owner_brief": {
            "goal": "帮助访客拆小行动",
            "tone": "温和、务实",
            "materials": ["工具箱", "旧伞"],
        },
    })

    assert gameplay["id"].startswith("gp_")
    assert gameplay["status"] == "draft"
    assert [node["id"] for node in gameplay["nodes"]] == ["start", "progress", "complete"]
    assert gameplay["nodes"][0]["choices"][0]["next_node_id"] == "progress"
    assert gameplay["nodes"][1]["fallback_events"]
    assert gameplay["completion"]["memory_atom"]["enabled"] is False


def test_normalize_gameplay_definition_rejects_unknown_choice_target():
    with pytest.raises(ValueError, match="不存在的节点"):
        normalize_gameplay_definition({
            "title": "坏节点",
            "nodes": [
                {
                    "id": "start",
                    "narration": "start",
                    "choices": [{"id": "bad", "label": "坏跳转", "next_node_id": "missing"}],
                }
            ],
        })


def test_fallback_event_is_reproducible_for_same_session_turn_and_node():
    gameplay = normalize_gameplay_definition({
        "id": "gp_seed_test",
        "title": "随机工具箱",
        "nodes": [
            {
                "id": "start",
                "narration": "打开工具箱。",
                "fallback_events": [
                    {"id": "needle", "text": "抽到针线。", "next_node_id": "start"},
                    {"id": "screw", "text": "抽到螺丝。", "next_node_id": "start"},
                ],
            }
        ],
    })
    session = GameplaySession.new(
        tavern_id="tavern_seed",
        gameplay_id="gp_seed_test",
        visitor_id="visitor_a",
        character_id="char_a",
        session_id="gps_seed",
    )
    session.current_node_id = "start"
    session.turn_count = 3

    first = choose_fallback_event(gameplay, session)
    second = choose_fallback_event(gameplay, session)

    assert first["id"] == second["id"]
    assert first["seed"] == "gps_seed:3:start"


def test_ai_director_accepts_structured_move_and_falls_back_on_invalid_json():
    gameplay = normalize_gameplay_definition({
        "id": "gp_director",
        "title": "线索登记",
        "nodes": [
            {
                "id": "start",
                "narration": "开始登记。",
                "choices": [{"id": "next", "label": "下一步", "next_node_id": "detail"}],
                "fallback_events": [{"id": "fallback", "text": "改用纸质标签。", "next_node_id": "detail"}],
            },
            {"id": "detail", "narration": "补充细节。", "choices": []},
        ],
    })
    session = GameplaySession.new(
        tavern_id="tavern_director",
        gameplay_id="gp_director",
        visitor_id="visitor_a",
        character_id="char_a",
        session_id="gps_director",
    )

    director = AIDirector(lambda _payload: '{"action":"move","next_node_id":"detail","event_type":"node_changed","narration":"写下第一条线索。","completed":false}')
    result = director.advance(gameplay, session, message="昨天傍晚")
    assert result["source"] == "ai"
    assert result["event"]["to_node_id"] == "detail"
    assert result["scene"]["narration"] == "补充细节。"

    bad_director = AIDirector(lambda _payload: '不是 JSON')
    fallback = bad_director.advance(gameplay, session, message="继续")
    assert fallback["source"] == "fallback"
    assert fallback["event"]["type"] == "random_event"
