from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Sequence

from .cli import _build_inspect_summary, _validate_world_schema


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m fablemap.showcase",
        description="Build a presentation-friendly showcase bundle from a FableMap world JSON.",
    )
    parser.add_argument("--input", type=Path, required=True, help="Path to an existing world.json file.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory where showcase.json and showcase.md will be written. Defaults to the input directory.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        input_path = args.input
        output_dir = args.output_dir or input_path.parent
        world = _load_world(input_path)
        _validate_world_schema(world)
        output_dir.mkdir(parents=True, exist_ok=True)

        showcase = _build_showcase(world, input_path)
        showcase_json_path = output_dir / "showcase.json"
        showcase_md_path = output_dir / "showcase.md"

        showcase_json_path.write_text(json.dumps(showcase, ensure_ascii=False, indent=2), encoding="utf-8")
        showcase_md_path.write_text(_render_showcase_markdown(showcase), encoding="utf-8")

        print(
            json.dumps(
                {
                    "world_id": showcase["world_id"],
                    "title": showcase["title"],
                    "output_dir": str(output_dir),
                    "showcase_json": str(showcase_json_path),
                    "showcase_markdown": str(showcase_md_path),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0
    except Exception as exc:  # pragma: no cover - exercised by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1


def _load_world(input_path: Path) -> dict[str, Any]:
    return json.loads(input_path.read_text(encoding="utf-8"))


def _build_showcase(world: dict[str, Any], input_path: Path) -> dict[str, Any]:
    summary = _build_inspect_summary(world, input_path)
    region = world.get("region") or {}
    faction = _faction_spotlight(world.get("factions") or [])
    poi_highlights = [_poi_highlight(poi) for poi in (world.get("pois") or [])[:3]]
    landmark_highlights = [_landmark_highlight(item) for item in (world.get("landmarks") or [])[:2]]

    title = region.get("name") or summary["world_id"] or "Untitled District"
    faction_name = faction.get("name") or summary.get("dominant_faction") or "Unknown faction"
    subtitle = " · ".join(
        part for part in [summary.get("theme"), summary.get("atmosphere"), f"held by {faction_name}"] if part
    )

    return {
        "world_id": summary["world_id"],
        "title": title,
        "subtitle": subtitle,
        "narrative_summary": region.get("narrative_summary") or "No narrative summary available.",
        "summary": summary,
        "faction_spotlight": faction,
        "poi_highlights": poi_highlights,
        "landmark_highlights": landmark_highlights,
        "hooks": {
            "satire_profile": region.get("satire_profile"),
            "visual_style": region.get("visual_style"),
            "palette_hint": region.get("palette_hint"),
            "comfort_level": region.get("comfort_level"),
            "anomaly_pressure": region.get("anomaly_pressure"),
            "memory_anchor_count": summary.get("memory_anchor_count"),
            "sprite_count": summary.get("sprite_count"),
            "historical_echo_count": summary.get("historical_echo_count"),
        },
    }


def _faction_spotlight(factions: list[dict[str, Any]]) -> dict[str, Any]:
    if not factions:
        return {}
    faction = factions[0]
    return {
        "id": faction.get("id"),
        "name": faction.get("name"),
        "archetype": faction.get("archetype"),
        "doctrine": faction.get("doctrine"),
        "influence": faction.get("influence"),
    }


def _poi_highlight(poi: dict[str, Any]) -> dict[str, Any]:
    return {
        "fantasy_name": poi.get("fantasy_name"),
        "fantasy_type": poi.get("fantasy_type"),
        "real_name": poi.get("real_name"),
        "emotion_hook": poi.get("emotion_hook"),
        "faction_alignment": poi.get("faction_alignment"),
    }


def _landmark_highlight(landmark: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": landmark.get("name"),
        "type": landmark.get("type"),
        "description": landmark.get("description"),
    }


def _render_showcase_markdown(showcase: dict[str, Any]) -> str:
    summary = showcase.get("summary") or {}
    faction = showcase.get("faction_spotlight") or {}
    hooks = showcase.get("hooks") or {}
    lines = [
        f"# {showcase.get('title')}",
        "",
        f"> {showcase.get('subtitle')}",
        "",
        showcase.get("narrative_summary") or "",
        "",
        "## District Snapshot",
        f"- World ID: `{showcase.get('world_id')}`",
        f"- Theme: `{summary.get('theme')}`",
        f"- Atmosphere: `{summary.get('atmosphere')}`",
        f"- POIs / Roads / Landmarks: {summary.get('poi_count')} / {summary.get('road_count')} / {summary.get('landmark_count')}",
        f"- Active lens: `{summary.get('active_lens')}`",
        f"- Disturbance level: `{summary.get('disturbance_level')}`",
        "",
    ]

    if faction:
        lines.extend(
            [
                "## Faction Spotlight",
                f"- **{faction.get('name')}** (`{faction.get('archetype')}`) with influence `{faction.get('influence')}`",
                f"- Doctrine: {faction.get('doctrine')}",
                "",
            ]
        )

    if showcase.get("poi_highlights"):
        lines.append("## Highlight POIs")
        for poi in showcase["poi_highlights"]:
            real_name = poi.get("real_name") or poi.get("fantasy_type") or "unknown place"
            lines.append(
                f"- **{poi.get('fantasy_name')}** (`{poi.get('fantasy_type')}`) ← {real_name}: {poi.get('emotion_hook')}"
            )
        lines.append("")

    if showcase.get("landmark_highlights"):
        lines.append("## Landmark Hooks")
        for landmark in showcase["landmark_highlights"]:
            lines.append(f"- **{landmark.get('name')}** (`{landmark.get('type')}`): {landmark.get('description')}")
        lines.append("")

    lines.extend(
        [
            "## Presentation Hooks",
            f"- Visual style: `{hooks.get('visual_style')}` / palette `{hooks.get('palette_hint')}`",
            f"- Comfort vs anomaly: `{hooks.get('comfort_level')}` / `{hooks.get('anomaly_pressure')}`",
            f"- Memory anchors / sprites / echoes: {hooks.get('memory_anchor_count')} / {hooks.get('sprite_count')} / {hooks.get('historical_echo_count')}",
            f"- Satire profile: {hooks.get('satire_profile')}",
            "",
        ]
    )
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())