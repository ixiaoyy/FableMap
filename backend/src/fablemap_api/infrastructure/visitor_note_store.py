from __future__ import annotations

import json
import secrets
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def _now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _text(value: Any, *, limit: int = 500) -> str:
    return str(value or "").strip()[:limit]


class VisitorNoteStore:
    """JSON-backed owner-visible visitor notes store.

    This store is intentionally separate from Tavern public payloads so visitor
    feedback cannot leak into public tavern responses or become a social feed.
    """

    def __init__(self, path: Path):
        self.path = path

    def _read_all(self) -> dict[str, list[dict[str, Any]]]:
        if not self.path.exists():
            return {}
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
        return payload if isinstance(payload, dict) else {}

    def _write_all(self, payload: dict[str, list[dict[str, Any]]]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def create_note(self, tavern_id: str, visitor_id: str, data: dict[str, Any]) -> dict[str, Any]:
        note = {
            "id": f"note_{secrets.token_hex(8)}",
            "tavern_id": _text(tavern_id, limit=128),
            "visitor_id": _text(visitor_id, limit=128),
            "visitor_nickname": _text(data.get("visitor_nickname") or "旅人", limit=64) or "旅人",
            "content": _text(data.get("content"), limit=500),
            "created_at": _now_iso(),
            "visibility": "owner_only",
        }
        all_notes = self._read_all()
        all_notes.setdefault(note["tavern_id"], []).append(note)
        self._write_all(all_notes)
        return dict(note)

    def list_notes(self, tavern_id: str, *, limit: int = 20, offset: int = 0) -> tuple[list[dict[str, Any]], int]:
        notes = [dict(item) for item in self._read_all().get(str(tavern_id), [])]
        notes.sort(key=lambda item: str(item.get("created_at") or ""), reverse=True)
        total = len(notes)
        safe_limit = max(1, min(int(limit or 20), 100))
        safe_offset = max(0, int(offset or 0))
        return notes[safe_offset : safe_offset + safe_limit], total

    def get_note(self, tavern_id: str, note_id: str) -> dict[str, Any] | None:
        for note in self._read_all().get(str(tavern_id), []):
            if note.get("id") == note_id:
                return dict(note)
        return None

    def delete_note(self, tavern_id: str, note_id: str) -> bool:
        all_notes = self._read_all()
        notes = all_notes.get(str(tavern_id), [])
        kept = [note for note in notes if note.get("id") != note_id]
        if len(kept) == len(notes):
            return False
        all_notes[str(tavern_id)] = kept
        self._write_all(all_notes)
        return True