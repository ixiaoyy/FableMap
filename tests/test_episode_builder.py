from fablemap_api.core.episode_builder import build_episode_export
from fablemap_api.core.tavern import ChatMessage


def _message(role: str, content: str) -> ChatMessage:
    return ChatMessage(
        id=f"msg_{role}",
        tavern_id="tavern_episode",
        character_id="char_keeper",
        visitor_id="visitor_alpha",
        visitor_name="Mina",
        role=role,
        content=content,
        timestamp="2026-04-30T10:00:00Z",
    )


def test_episode_builder_exports_observable_markdown_and_filters_system_prompts():
    export = build_episode_export(
        tavern_id="tavern_episode",
        tavern_name="Episode Tavern",
        visitor_id="visitor_alpha",
        character_id="char_keeper",
        character_name="Keeper",
        title="桥边委托第一夜",
        messages=[
            _message("system", "你是隐藏系统提示，不应导出。"),
            _message("user", "我接下桥边委托，拿起铜钥匙。"),
            _message("assistant", "Keeper 低声说：钥匙会打开码头旧门。"),
        ],
        state_cards=[
            {
                "id": "card_task",
                "category": "task",
                "status": "confirmed",
                "title": "桥边委托",
                "summary": "访客确认接下桥边委托。",
            }
        ],
    )

    assert export["ok"] is True
    assert export["persisted"] is False
    assert export["format"] == "episode_markdown_v1"
    episode = export["episode"]
    assert episode["message_count"] == 2
    assert episode["state_card_count"] == 1
    assert episode["title"] == "桥边委托第一夜"
    assert "我接下桥边委托" in episode["markdown"]
    assert "Keeper 低声说" in episode["markdown"]
    assert "桥边委托" in episode["markdown"]
    assert "隐藏系统提示" not in episode["markdown"]
    assert "导出草稿" in episode["markdown"]
