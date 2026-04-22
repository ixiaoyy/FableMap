from types import SimpleNamespace

from fablemap_api.domain.tavern_policy import (
    can_view_memory,
    can_view_tavern,
    clean_text,
    is_tavern_owner,
    relationship_stage_for,
)


def test_clean_text_collapses_whitespace_and_truncates() -> None:
    assert clean_text("  hello\r\n  cyber   tavern  ", max_length=14) == "hello cyber ta"


def test_relationship_stage_thresholds_are_stable() -> None:
    assert relationship_stage_for(0.0, 1) == "stranger"
    assert relationship_stage_for(0.15, 1) == "acquaintance"
    assert relationship_stage_for(0.1, 4) == "regular"
    assert relationship_stage_for(0.75, 1) == "confidant"


def test_private_tavern_visibility_requires_owner() -> None:
    tavern = SimpleNamespace(access="private", owner_id="owner-1")

    assert is_tavern_owner(tavern, "owner-1") is True
    assert can_view_tavern(tavern, "owner-1") is True
    assert can_view_tavern(tavern, "visitor-1") is False


def test_memory_visibility_allows_public_owner_and_subject_only() -> None:
    tavern = SimpleNamespace(access="public", owner_id="owner-1")
    private_atom = SimpleNamespace(
        visibility="private",
        visitor_id="visitor-1",
        subject="visitor-2",
        created_by="npc-1",
    )
    public_atom = SimpleNamespace(
        visibility="public",
        visitor_id="visitor-1",
        subject="visitor-2",
        created_by="npc-1",
    )

    assert can_view_memory(public_atom, tavern, "anonymous") is True
    assert can_view_memory(private_atom, tavern, "owner-1") is True
    assert can_view_memory(private_atom, tavern, "visitor-1") is True
    assert can_view_memory(private_atom, tavern, "visitor-2") is True
    assert can_view_memory(private_atom, tavern, "visitor-3") is False
