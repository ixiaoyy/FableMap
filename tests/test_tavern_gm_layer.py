from fablemap_api.core.gm_layer import GmLayerPreviewError, preview_gm_layer_candidates


def test_gm_layer_preview_reuses_state_card_candidates_without_persistence():
    preview = preview_gm_layer_candidates(
        tavern_id="tavern_gm_layer",
        visitor_id="visitor_alpha",
        character_id="char_keeper",
        user_message="我接下码头委托，拿到了铜钥匙和线索，但有强敌竞争者盯上我们。",
        assistant_message="Keeper 提醒：今晚这个机会也有风险，下次回访前先记录下来。",
        source_message_ids=["msg_user", "msg_assistant"],
        proposed_by="visitor_alpha",
        now="2026-04-30T00:00:00Z",
    )

    assert preview["ok"] is True
    assert preview["preview_only"] is True
    assert preview["applied"] is False
    assert preview["gm_mode"] == "structured_conflict_v1"
    assert preview["tavern_id"] == "tavern_gm_layer"
    assert preview["summary"]["total"] == len(preview["candidates"])

    categories = {card["category"] for card in preview["candidates"]}
    assert {"task", "resource", "conflict", "event_log"}.issubset(categories)

    for card in preview["candidates"]:
        assert card["status"] == "pending"
        assert card["canon_scope"] == "visitor"
        assert card["fixed_canon"] is False
        assert card["visitor_id"] == "visitor_alpha"
        assert card["character_id"] == "char_keeper"
        assert card["source_message_ids"] == ["msg_user", "msg_assistant"]
        assert card["metadata"]["requires_confirmation"] is True
        assert card["metadata"]["preview_only"] is True
        assert card["metadata"]["gm_layer"] == "structured_conflict_v1"


def test_gm_layer_preview_requires_observable_turn_text():
    try:
        preview_gm_layer_candidates(
            tavern_id="tavern_gm_layer",
            visitor_id="visitor_alpha",
            user_message=" ",
            assistant_message="",
        )
    except GmLayerPreviewError as exc:
        assert "回合文本" in str(exc)
    else:
        raise AssertionError("expected missing turn text to raise GmLayerPreviewError")
