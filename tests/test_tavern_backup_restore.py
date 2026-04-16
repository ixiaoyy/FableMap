from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from fastapi import HTTPException

from fablemap.tavern import ChatMessage
from fablemap.web.config import ApiSettings
from fablemap.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _message(tavern_id: str, visitor_id: str, character_id: str, content: str) -> ChatMessage:
    return ChatMessage(
        id=f"msg_{visitor_id}_{character_id}",
        tavern_id=tavern_id,
        visitor_id=visitor_id,
        character_id=character_id,
        role="user",
        content=content,
        timestamp="2026-04-17T13:00:00Z",
    )


def test_tavern_backup_restore_round_trips_metadata_and_chat_history():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.create_tavern_payload(
            {
                "id": "tavern_backup_restore",
                "name": "Backup Tavern",
                "description": "Original description.",
                "lat": 31.23,
                "lon": 121.47,
            },
            owner_id="owner_backup",
        )
        character = service.add_character_payload(
            tavern["id"],
            {"name": "Keeper"},
            user_id="owner_backup",
        )
        service.tavern_store.add_chat_message(
            _message(tavern["id"], "visitor_backup", character["id"], "Please remember this.")
        )

        backup = service.create_tavern_backup(tavern["id"], "owner_backup")
        assert backup["ok"] is True
        assert backup["chat_sessions"] == 1

        service.update_tavern(tavern["id"], {"name": "Changed Tavern"}, "owner_backup")
        service.tavern_store.delete_chat_history(tavern["id"])

        restored = service.restore_tavern_backup(
            backup["backup_name"],
            tavern_id=tavern["id"],
            user_id="owner_backup",
        )
        assert restored["ok"] is True
        assert restored["restored_messages"] == 1

        fetched = service.get_tavern(tavern["id"], "owner_backup")
        assert fetched["name"] == "Backup Tavern"
        history = service.tavern_store.get_chat_history(tavern["id"], "visitor_backup", character["id"])
        assert len(history) == 1
        assert history[0].content == "Please remember this."


def test_restore_backup_rejects_paths_outside_backup_directory():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        with pytest.raises(HTTPException) as exc_info:
            service.restore_tavern_backup("../outside.json", tavern_id="tavern_x", user_id="owner_x")
        assert exc_info.value.status_code == 400
