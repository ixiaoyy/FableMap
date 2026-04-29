from fablemap_api.core.skill_packs import (
    LOCAL_RUMOR_SKILL_PACK_ID,
    available_skill_pack_definitions,
    build_local_rumor_prompt_block,
    is_skill_pack_enabled,
    normalize_skill_pack_settings,
)


def test_skill_pack_defaults_and_normalization_are_safe():
    definitions = available_skill_pack_definitions()
    assert [item["id"] for item in definitions] == [LOCAL_RUMOR_SKILL_PACK_ID]
    assert definitions[0]["default_enabled"] is False
    assert "ambient" in " ".join(definitions[0]["capabilities"] + definitions[0]["prompt_notes"]).lower()

    settings = normalize_skill_pack_settings([
        {"id": LOCAL_RUMOR_SKILL_PACK_ID, "enabled": "yes", "config": {"limit": 99, "unknown": "x"}},
        {"id": "unknown-pack", "enabled": True},
    ])

    assert settings == [{"id": LOCAL_RUMOR_SKILL_PACK_ID, "enabled": True, "config": {"limit": 3}}]
    assert is_skill_pack_enabled(settings, LOCAL_RUMOR_SKILL_PACK_ID) is True
    assert is_skill_pack_enabled([], LOCAL_RUMOR_SKILL_PACK_ID) is False


def test_local_rumor_prompt_block_marks_rumors_as_non_canon():
    prompt = build_local_rumor_prompt_block(
        [
            {
                "target_tavern_id": "target_1",
                "target_tavern_name": "雨巷电台",
                "rumor_text": "有旅人说那里的灯会回应晚归的人。",
            }
        ]
    )

    assert "邻里传闻" in prompt
    assert "雨巷电台" in prompt
    assert "有旅人说" in prompt
    assert "不是正史" in prompt
    assert "不要写入记忆" in prompt
