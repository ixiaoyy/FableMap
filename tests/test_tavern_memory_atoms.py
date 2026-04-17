from pathlib import Path
from tempfile import TemporaryDirectory

import pytest

from fablemap.memory import MemoryAtom


def test_memory_atom_normalizes_payload_defaults():
    atom = MemoryAtom.from_dict(
        {
            "id": "mem_x",
            "tavern_id": "tavern_x",
            "scope": "unknown",
            "dimension": "bad",
            "horizon": "forever",
            "visibility": "secret",
            "content": "Visitor likes jasmine tea.",
            "importance": "2.5",
            "confidence": "-1",
            "source_message_ids": "msg_1,msg_2",
        }
    )

    assert atom.scope == "visitor_tavern"
    assert atom.dimension == "fact"
    assert atom.horizon == "short"
    assert atom.visibility == "private"
    assert atom.importance == 1.0
    assert atom.confidence == 0.0
    assert atom.source_message_ids == ["msg_1", "msg_2"]


def test_memory_atoms_crud_filters_and_private_visibility():
    from fastapi import HTTPException
    from fablemap.web.config import ApiSettings
    from fablemap.web.service import WebService

    with TemporaryDirectory() as tmpdir:
        service = WebService(
            ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None)
        )
        owner_id = "owner_memory_atoms"
        alpha_id = "visitor_alpha"
        beta_id = "visitor_beta"

        tavern = service.create_tavern_payload(
            {
                "id": "tavern_memory_atoms",
                "name": "Memory Atom Tavern",
                "description": "A tavern for structured memory tests.",
                "lat": 31.23,
                "lon": 121.47,
            },
            owner_id=owner_id,
        )
        tavern_id = tavern["id"]

        service.add_character_payload(tavern_id, {"id": "char_keeper", "name": "Keeper"}, owner_id)

        private_atom = service.create_memory_atom_payload(
            tavern_id,
            {
                "scope": "visitor_character",
                "dimension": "preference",
                "horizon": "long",
                "subject": alpha_id,
                "character_id": "char_keeper",
                "content": "Alpha likes jasmine tea.",
                "importance": 0.9,
                "confidence": 0.8,
                "source_message_ids": ["msg_alpha_1"],
                "visibility": "private",
            },
            alpha_id,
        )["memory_atom"]
        private_id = private_atom["id"]
        assert private_atom["visitor_id"] == alpha_id

        alpha_list = service.list_memory_atoms_payload(
            tavern_id,
            alpha_id,
            dimension="preference",
            horizon="long",
        )
        assert alpha_list["count"] == 1
        assert alpha_list["memory_atoms"][0]["id"] == private_id

        owner_list = service.list_memory_atoms_payload(tavern_id, owner_id)
        assert owner_list["count"] == 0

        beta_list = service.list_memory_atoms_payload(tavern_id, beta_id)
        assert beta_list["count"] == 0

        with pytest.raises(HTTPException) as forbidden_private_create:
            service.create_memory_atom_payload(
                tavern_id,
                {
                    "scope": "visitor_tavern",
                    "subject": beta_id,
                    "content": "This should not be allowed.",
                    "visibility": "private",
                },
                alpha_id,
            )
        assert forbidden_private_create.value.status_code == 403

        with pytest.raises(HTTPException) as forbidden_owner_update:
            service.update_memory_atom_payload(
                tavern_id,
                private_id,
                {"content": "Owner should not edit private visitor memory."},
                owner_id,
            )
        assert forbidden_owner_update.value.status_code == 403

        with pytest.raises(HTTPException) as forbidden_beta_update:
            service.update_memory_atom_payload(
                tavern_id,
                private_id,
                {"content": "Beta should not edit Alpha memory."},
                beta_id,
            )
        assert forbidden_beta_update.value.status_code == 403

        updated_private = service.update_memory_atom_payload(
            tavern_id,
            private_id,
            {"content": "Alpha likes jasmine tea and quiet corners.", "pinned": True},
            alpha_id,
        )["memory_atom"]
        assert updated_private["pinned"] is True
        assert "quiet corners" in updated_private["content"]

        service.create_memory_atom_payload(
            tavern_id,
            {
                "scope": "visitor_tavern",
                "dimension": "event",
                "horizon": "mid",
                "subject": alpha_id,
                "visitor_id": alpha_id,
                "content": "Owner-visible note about Alpha's first return visit.",
                "visibility": "owner",
            },
            owner_id,
        )

        service.create_memory_atom_payload(
            tavern_id,
            {
                "scope": "tavern_public",
                "dimension": "fact",
                "horizon": "long",
                "subject": tavern_id,
                "content": "The back room clock always runs five minutes slow.",
                "visibility": "public",
            },
            owner_id,
        )

        owner_visible = service.list_memory_atoms_payload(tavern_id, owner_id)
        owner_contents = [item["content"] for item in owner_visible["memory_atoms"]]
        assert "Alpha likes jasmine tea and quiet corners." not in owner_contents
        assert any("Owner-visible note" in content for content in owner_contents)
        assert any("clock always runs" in content for content in owner_contents)

        anonymous_public = service.list_memory_atoms_payload(
            tavern_id,
            visibility="public",
        )
        assert anonymous_public["count"] == 1
        assert "clock always runs" in anonymous_public["memory_atoms"][0]["content"]

        deleted = service.delete_memory_atom_payload(tavern_id, private_id, alpha_id)
        assert deleted["ok"] is True

        alpha_after_delete = service.list_memory_atoms_payload(
            tavern_id,
            alpha_id,
            visitor_id=alpha_id,
        )
        remaining_ids = [item["id"] for item in alpha_after_delete["memory_atoms"]]
        assert private_id not in remaining_ids
