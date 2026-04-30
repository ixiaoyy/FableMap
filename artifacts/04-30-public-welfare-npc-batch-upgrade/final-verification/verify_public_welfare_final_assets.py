from __future__ import annotations

import hashlib
import json
import struct
from collections import Counter, defaultdict
from pathlib import Path

OUT_DIR = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/final-verification")
REJECTED_MANIFEST = Path(".trellis/tasks/archive/2026-04/04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json")
JSON_PATH = OUT_DIR / "public-welfare-final-asset-verification.json"
MD_PATH = OUT_DIR / "public-welfare-final-asset-verification.md"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"not a PNG: {path}")
    return struct.unpack(">II", header[16:24])


def main() -> None:
    manifest = json.loads(REJECTED_MANIFEST.read_text(encoding="utf-8"))
    records = []
    by_status = Counter()
    by_status_matches = Counter()
    by_char = defaultdict(lambda: {"total": 0, "matches": 0, "expressions": []})
    for entry in manifest["entries"]:
        path = Path(entry["path"])
        current_sha = sha256(path)
        dims = png_dimensions(path)
        matches = current_sha == entry["sha256"]
        record = {
            "char_id": entry["char_id"],
            "expression": entry["expression"],
            "status": entry["status"],
            "path": entry["path"],
            "rejected_sha256": entry["sha256"],
            "current_sha256": current_sha,
            "dimensions": list(dims),
            "matches_rejected_hash": matches,
        }
        records.append(record)
        by_status[entry["status"]] += 1
        if matches:
            by_status_matches[entry["status"]] += 1
        by_char[entry["char_id"]]["total"] += 1
        by_char[entry["char_id"]]["matches"] += int(matches)
        by_char[entry["char_id"]]["expressions"].append(entry["expression"])
    data = {
        "version": 1,
        "created_at": "2026-04-30",
        "task": "04-30-public-welfare-npc-batch-upgrade",
        "source_rejected_manifest": str(REJECTED_MANIFEST).replace("\\", "/"),
        "summary": {
            "total_rejected_manifest_entries": len(records),
            "status_counts": dict(by_status),
            "matches_rejected_hash_total": sum(1 for r in records if r["matches_rejected_hash"]),
            "matches_rejected_hash_by_status": dict(by_status_matches),
            "all_manifest_entries_are_now_different_hashes": all(not r["matches_rejected_hash"] for r in records),
            "all_manifest_entry_dimensions_are_256": all(r["dimensions"] == [256, 256] for r in records),
        },
        "characters": {char_id: value for char_id, value in sorted(by_char.items())},
        "records": records,
    }
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Public-welfare final asset verification",
        "",
        "This report verifies every entry in the rejected public-welfare NPC asset manifest after Batch 1 and Batch 2 replacements.",
        "",
        "## Summary",
        "",
        f"- Source rejected manifest: `{str(REJECTED_MANIFEST).replace('\\', '/')}`",
        f"- Total entries checked: {len(records)}",
        f"- Status counts: {dict(by_status)}",
        f"- Entries still matching rejected hash: {data['summary']['matches_rejected_hash_total']}",
        f"- All checked assets are 256×256 PNG: {data['summary']['all_manifest_entry_dimensions_are_256']}",
        "",
        "## Character matrix",
        "",
        "| Character | Entries | Still matching rejected hash | Expressions |",
        "| --- | --- | --- | --- |",
    ]
    for char_id, value in sorted(by_char.items()):
        lines.append(f"| `{char_id}` | {value['total']} | {value['matches']} | {', '.join(sorted(value['expressions']))} |")
    MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(data["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
