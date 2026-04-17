from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap.tavern import ChatMessage, TavernStore


def _message(
    tavern_id: str,
    visitor_id: str,
    character_id: str,
    role: str,
    content: str,
    timestamp: str,
) -> ChatMessage:
    return ChatMessage(
        id=f"msg_{visitor_id}_{character_id}_{role}_{timestamp}",
        tavern_id=tavern_id,
        visitor_id=visitor_id,
        character_id=character_id,
        role=role,
        content=content,
        timestamp=timestamp,
    )


def test_chat_sessions_are_listed_by_visitor_and_character():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        tavern_id = "tavern_chat_sessions"

        store.add_chat_message(_message(tavern_id, "visitor_a", "char_one", "user", "Hello one", "2026-04-17T10:00:00Z"))
        store.add_chat_message(_message(tavern_id, "visitor_a", "char_one", "assistant", "Welcome one", "2026-04-17T10:01:00Z"))
        store.add_chat_message(_message(tavern_id, "visitor_b", "char_two", "user", "Hello two", "2026-04-17T10:02:00Z"))

        all_sessions = store.list_chat_sessions(tavern_id)
        assert len(all_sessions) == 2
        assert all_sessions[0]["visitor_id"] == "visitor_b"
        assert all_sessions[0]["character_id"] == "char_two"
        assert all_sessions[1]["message_count"] == 2

        visitor_sessions = store.list_chat_sessions(tavern_id, visitor_id="visitor_a")
        assert len(visitor_sessions) == 1
        assert visitor_sessions[0]["character_id"] == "char_one"
        assert visitor_sessions[0]["last_message"].content == "Welcome one"

        character_sessions = store.list_chat_sessions(tavern_id, character_id="char_two")
        assert len(character_sessions) == 1
        assert character_sessions[0]["visitor_id"] == "visitor_b"


def test_chat_message_preserves_visitor_display_name():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        tavern_id = "tavern_chat_visitor_name"

        message = _message(
            tavern_id,
            "visitor_named",
            "char_keeper",
            "user",
            "Call me by name.",
            "2026-04-17T10:30:00Z",
        )
        message.visitor_name = "Mina"
        store.add_chat_message(message)

        history = store.get_chat_history(tavern_id, "visitor_named", "char_keeper")
        assert history[0].visitor_name == "Mina"

        sessions = store.list_chat_sessions(tavern_id)
        assert sessions[0]["visitor_name"] == "Mina"


def test_delete_chat_history_removes_matching_jsonl_files_only():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        tavern_id = "tavern_chat_delete"

        store.add_chat_message(_message(tavern_id, "visitor_a", "char_one", "user", "Keep?", "2026-04-17T11:00:00Z"))
        store.add_chat_message(_message(tavern_id, "visitor_a", "char_two", "user", "Keep this", "2026-04-17T11:01:00Z"))
        store.add_chat_message(_message(tavern_id, "visitor_b", "char_one", "user", "Remove all char one", "2026-04-17T11:02:00Z"))

        deleted = store.delete_chat_history(tavern_id, character_id="char_one")
        assert deleted == 2
        assert store.get_chat_history(tavern_id, "visitor_a", "char_one") == []
        assert store.get_chat_history(tavern_id, "visitor_b", "char_one") == []
        assert store.get_chat_history(tavern_id, "visitor_a", "char_two")[0].content == "Keep this"

        deleted = store.delete_chat_history(tavern_id, visitor_id="visitor_a", character_id="char_two")
        assert deleted == 1
        assert store.list_chat_sessions(tavern_id) == []


def test_replace_chat_history_overwrites_or_removes_session_file():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        tavern_id = "tavern_chat_replace"

        store.add_chat_message(_message(tavern_id, "visitor_a", "char_one", "user", "Old", "2026-04-17T12:00:00Z"))
        replaced = store.replace_chat_history(
            tavern_id,
            "visitor_a",
            "char_one",
            [
                _message(tavern_id, "visitor_a", "char_one", "assistant", "New answer", "2026-04-17T12:01:00Z"),
            ],
        )
        assert replaced == 1
        history = store.get_chat_history(tavern_id, "visitor_a", "char_one")
        assert len(history) == 1
        assert history[0].content == "New answer"

        replaced = store.replace_chat_history(tavern_id, "visitor_a", "char_one", [])
        assert replaced == 0
        assert store.get_chat_history(tavern_id, "visitor_a", "char_one") == []
