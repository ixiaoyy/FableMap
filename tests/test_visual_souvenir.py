from fablemap_api.core.visual_souvenir import build_visual_souvenir_preview


def test_visual_souvenir_preview_builds_safe_prompt_without_generating_image():
    preview = build_visual_souvenir_preview(
        tavern_id="tavern_visual",
        tavern_name="Neon Harbor",
        character_name="Keeper",
        visitor_id="visitor_alpha",
        user_message="visitor_alpha 接下桥边委托，拿起铜钥匙。",
        assistant_message="Keeper 把杯垫推近，提醒这只是今晚的纪念瞬间。",
        style="warm cyber tavern postcard",
    )

    assert preview["ok"] is True
    assert preview["preview_only"] is True
    assert preview["applied"] is False
    assert preview["image_generated"] is False
    assert preview["requires_confirmation"] is True
    assert "Neon Harbor" in preview["souvenir"]["prompt"]
    assert "Keeper" in preview["souvenir"]["prompt"]
    assert "visitor_alpha" not in preview["souvenir"]["prompt"]
    assert "traveler" in preview["souvenir"]["prompt"].lower()
    assert "real person likeness" in preview["souvenir"]["negative_prompt"]
    assert "api_key" not in str(preview).lower()
