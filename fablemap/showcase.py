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
    source = world.get("source") or {}
    state = world.get("state") or {}
    signal_snapshot = state.get("signal_snapshot") or {}
    pois = world.get("pois") or []
    landmarks = world.get("landmarks") or []
    memory_anchors = world.get("memory_anchors") or []
    historical_echoes = world.get("historical_echoes") or []
    sprites = world.get("sprites") or []
    poi_lookup = {poi.get("id"): poi for poi in pois if poi.get("id")}
    faction = _faction_spotlight(world.get("factions") or [])
    poi_highlights = [_poi_highlight(poi) for poi in pois[:3]]
    landmark_highlights = [_landmark_highlight(item) for item in landmarks[:2]]

    title = region.get("name") or summary["world_id"] or "Untitled District"
    faction_name = faction.get("name") or summary.get("dominant_faction") or "Unknown faction"
    subtitle = " · ".join(
        part for part in [summary.get("theme"), summary.get("atmosphere"), f"held by {faction_name}"] if part
    )

    reality_skeleton = {
        "provider": source.get("provider"),
        "lat": source.get("lat"),
        "lon": source.get("lon"),
        "radius_m": source.get("radius_m"),
        "dominant_landuse": region.get("dominant_landuse"),
        "source_element_count": signal_snapshot.get("source_element_count"),
        "mapped_poi_count": signal_snapshot.get("mapped_poi_count"),
        "road_count": signal_snapshot.get("road_count"),
    }
    world_state = {
        "dominant_faction": region.get("dominant_faction"),
        "control_score": region.get("control_score"),
        "strategic_value": region.get("strategic_value"),
        "social_tension": region.get("social_tension"),
        "commerce_flux": region.get("commerce_flux"),
        "anomaly_pressure": region.get("anomaly_pressure"),
        "disturbance_level": state.get("disturbance_level"),
        "active_lens": state.get("active_lens"),
        "spawn_window": state.get("spawn_window"),
        "market_pressure": (state.get("economy_state") or {}).get("market_pressure"),
        "mystery_progress": state.get("mystery_progress"),
        "visit_status": "visited" if state.get("visited") else "unvisited",
        "home_style": state.get("home_style"),
    }
    continuity_threads = {
        "memory_anchor_count": summary.get("memory_anchor_count"),
        "historical_echo_count": summary.get("historical_echo_count"),
        "sprite_count": summary.get("sprite_count"),
        "memory_threads": [_memory_thread(anchor, poi_lookup) for anchor in memory_anchors[:2]],
        "historical_threads": [_historical_thread(echo) for echo in historical_echoes[:2]],
        "sprite_signals": [_sprite_signal(sprite, poi_lookup) for sprite in sprites[:3]],
    }

    return {
        "world_id": summary["world_id"],
        "title": title,
        "subtitle": subtitle,
        "narrative_summary": region.get("narrative_summary") or "No narrative summary available.",
        "summary": summary,
        "reality_skeleton": reality_skeleton,
        "world_state": world_state,
        "continuity_threads": continuity_threads,
        "faction_spotlight": faction,
        "poi_highlights": poi_highlights,
        "landmark_highlights": landmark_highlights,
        "playable_hooks": _build_playable_hooks(world_state, faction, continuity_threads),
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


def _build_playable_hooks(
    world_state: dict[str, Any],
    faction: dict[str, Any],
    continuity_threads: dict[str, Any],
) -> list[str]:
    hooks: list[str] = []
    faction_name = faction.get("name") or world_state.get("dominant_faction")
    if faction_name:
        hooks.append(
            f"{faction_name} currently holds the district at control {world_state.get('control_score')} "
            f"with strategic value {world_state.get('strategic_value')}."
        )
    if world_state.get("commerce_flux") is not None or world_state.get("social_tension") is not None:
        hooks.append(
            f"Commerce flux {world_state.get('commerce_flux')} and social tension {world_state.get('social_tension')} "
            "show how governable or combustible the district feels right now."
        )
    if continuity_threads.get("memory_threads") or continuity_threads.get("historical_threads"):
        hooks.append(
            f"{continuity_threads.get('memory_anchor_count')} memory anchors and "
            f"{continuity_threads.get('historical_echo_count')} historical echoes mean the district keeps traces "
            "of earlier visits and public memory."
        )
    if continuity_threads.get("sprite_signals"):
        hooks.append(
            f"{continuity_threads.get('sprite_count')} sprite signals are already tied to visitable POIs, "
            "hinting at collection and return-play loops."
        )
    if world_state.get("disturbance_level") is not None or world_state.get("active_lens"):
        hooks.append(
            f"Disturbance {world_state.get('disturbance_level')} under lens {world_state.get('active_lens')} "
            f"with spawn window {world_state.get('spawn_window')} frames the district as a live state snapshot."
        )
    return hooks[:4]


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


def _memory_thread(anchor: dict[str, Any], poi_lookup: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "anchor_type": anchor.get("anchor_type"),
        "tone": anchor.get("tone"),
        "visibility": anchor.get("visibility"),
        "linked_pois": _linked_poi_names(anchor.get("linked_pois") or [], poi_lookup),
        "unlock_conditions": anchor.get("unlock_conditions") or [],
    }


def _historical_thread(echo: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_type": echo.get("source_type"),
        "summary": echo.get("summary"),
        "trigger_hint": echo.get("trigger_hint"),
        "severity": echo.get("severity"),
    }


def _sprite_signal(sprite: dict[str, Any], poi_lookup: dict[str, dict[str, Any]]) -> dict[str, Any]:
    linked_poi = sprite.get("linked_poi")
    linked_name = poi_lookup.get(linked_poi, {}).get("fantasy_name") if linked_poi else None
    return {
        "species": sprite.get("species"),
        "rarity": sprite.get("rarity"),
        "linked_poi": linked_name or linked_poi,
        "drop_tags": sprite.get("drop_tags") or [],
    }


def _linked_poi_names(linked_pois: list[str], poi_lookup: dict[str, dict[str, Any]]) -> list[str]:
    names: list[str] = []
    for poi_id in linked_pois:
        names.append(poi_lookup.get(poi_id, {}).get("fantasy_name") or poi_id)
    return names


def _render_showcase_markdown(showcase: dict[str, Any]) -> str:
    summary = showcase.get("summary") or {}
    reality = showcase.get("reality_skeleton") or {}
    world_state = showcase.get("world_state") or {}
    continuity = showcase.get("continuity_threads") or {}
    faction = showcase.get("faction_spotlight") or {}
    hooks = showcase.get("hooks") or {}
    lines = [
        f"# {showcase.get('title')}",
        "",
        f"> {showcase.get('subtitle')}",
        "",
        showcase.get("narrative_summary") or "",
        "",
        "## Reality Skeleton",
        f"- World ID: `{showcase.get('world_id')}`",
        f"- Source: `{reality.get('provider')}` @ `{reality.get('lat')}`, `{reality.get('lon')}` radius `{reality.get('radius_m')}`m",
        f"- Dominant landuse: `{reality.get('dominant_landuse')}`",
        f"- Source elements / mapped POIs / roads: {reality.get('source_element_count')} / {reality.get('mapped_poi_count')} / {reality.get('road_count')}",
        "",
        "## World State",
        f"- Theme / atmosphere: `{summary.get('theme')}` / `{summary.get('atmosphere')}`",
        f"- Dominant faction: `{world_state.get('dominant_faction')}`",
        f"- Control / strategic value: `{world_state.get('control_score')}` / `{world_state.get('strategic_value')}`",
        f"- Social tension / commerce flux: `{world_state.get('social_tension')}` / `{world_state.get('commerce_flux')}`",
        f"- Disturbance / anomaly pressure: `{world_state.get('disturbance_level')}` / `{world_state.get('anomaly_pressure')}`",
        f"- Active lens / spawn window: `{world_state.get('active_lens')}` / `{world_state.get('spawn_window')}`",
        f"- Visit status / mystery progress: `{world_state.get('visit_status')}` / `{world_state.get('mystery_progress')}`",
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

    lines.extend(
        [
            "## Continuity Threads",
            f"- Memory anchors / echoes / sprites: {continuity.get('memory_anchor_count')} / {continuity.get('historical_echo_count')} / {continuity.get('sprite_count')}",
        ]
    )
    for thread in continuity.get("memory_threads") or []:
        lines.append(
            f"- Memory: `{thread.get('anchor_type')}` / `{thread.get('tone')}` / `{thread.get('visibility')}` -> {', '.join(thread.get('linked_pois') or [])}"
        )
    for thread in continuity.get("historical_threads") or []:
        lines.append(
            f"- Echo: `{thread.get('source_type')}` / `{thread.get('severity')}` -> {thread.get('summary')}"
        )
    for sprite in continuity.get("sprite_signals") or []:
        lines.append(
            f"- Sprite: `{sprite.get('species')}` / `{sprite.get('rarity')}` -> {sprite.get('linked_poi')}"
        )
    lines.append("")

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

    if showcase.get("playable_hooks"):
        lines.append("## Playable Hooks")
        for item in showcase["playable_hooks"]:
            lines.append(f"- {item}")
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