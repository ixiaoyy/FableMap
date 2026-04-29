from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap_api.core.state_cards import (
    StateCard,
    extract_state_card_candidates_from_turn,
)
from fablemap_api.core.web.config import ApiSettings
from fablemap_api.core.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _create_tavern(service: WebService, owner_id: str = "owner_state_cards") -> dict:
    tavern = service.create_tavern_payload(
        {
            "id": "tavern_state_cards",
            "name": "Continuity Tavern",
            "description": "A tavern for continuity tests.",
            "lat": 31.23,
            "lon": 121.47,
            "llm_config": {"backend": "rules", "model": "rules"},
        },
        owner_id=owner_id,
    )
    service.add_character_payload(
        tavern["id"],
        {"id": "char_keeper", "name": "Keeper", "first_mes": "把今晚的事记清楚。"},
        owner_id,
    )
    return tavern


def test_state_card_normalization_and_candidate_extraction_cover_mvp_categories():
    cards = extract_state_card_candidates_from_turn(
        tavern_id="tavern_state_cards",
        visitor_id="visitor_alpha",
        character_id="char_keeper",
        user_message="我接下桥边委托，找到了铜钥匙和一张旧照片。",
        assistant_message="Keeper 记录：桥边委托还要回访，铜钥匙是已确认线索。今晚发生的变化先等待你确认。",
        source_message_ids=["msg_user", "msg_assistant"],
        proposed_by="visitor_alpha",
    )

    categories = {card.category for card in cards}
    assert {"task", "resource", "event_log"}.issubset(categories)
    assert all(card.status == "pending" for card in cards)
    assert all(card.canon_scope == "visitor" for card in cards)
    assert all(card.fixed_canon is False for card in cards)
    assert all(card.visitor_id == "visitor_alpha" for card in cards)
    assert all(card.source_message_ids == ["msg_user", "msg_assistant"] for card in cards)

    normalized = StateCard.from_dict(
        {
            "id": "card_bad",
            "tavern_id": "tavern_state_cards",
            "category": "unknown",
            "status": "done",
            "canon_scope": "global",
            "title": "x" * 120,
            "summary": "y" * 1200,
            "metadata": {"flag": True},
        }
    )
    assert normalized.category == "event_log"
    assert normalized.status == "pending"
    assert normalized.canon_scope == "visitor"
    assert len(normalized.title) <= 80
    assert len(normalized.summary) <= 600


def test_state_cards_survive_tavern_updates_and_export_excludes_private_bucket():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        _create_tavern(service)

        cards = extract_state_card_candidates_from_turn(
            tavern_id="tavern_state_cards",
            visitor_id="visitor_alpha",
            character_id="char_keeper",
            user_message="我接下桥边委托，拿到了铜钥匙。",
            assistant_message="Keeper 把委托和铜钥匙先记为待确认变化。",
            source_message_ids=["msg_user", "msg_assistant"],
            proposed_by="visitor_alpha",
        )
        for card in cards:
            service.tavern_store.save_state_card("tavern_state_cards", card)

        service.update_tavern_payload("tavern_state_cards", {"description": "Updated."}, "owner_state_cards")
        stored = service.tavern_store.list_state_cards("tavern_state_cards")
        assert {card.category for card in stored} >= {"task", "resource", "event_log"}

        exported = service.export_tavern_package_payload("tavern_state_cards", "owner_state_cards")
        assert "_state_cards" not in exported
        assert "state_cards" not in exported
