from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Sequence

from .cache import default_cache_dir
from .world_builder import build_world, write_world


class WorldSchemaError(ValueError):
    """Raised when a world JSON file does not match the minimum expected schema."""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="fablemap", description="Generate and inspect FableMap world JSON.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser("generate", help="Generate a world JSON.")
    generate_parser.add_argument("--lat", type=float, required=True, help="Latitude")
    generate_parser.add_argument("--lon", type=float, required=True, help="Longitude")
    generate_parser.add_argument("--radius", type=_positive_int, default=300, help="Search radius in meters")
    generate_parser.add_argument("--output", type=Path, required=True, help="Output JSON file path")
    generate_parser.add_argument("--seed", help="Optional stable seed override")
    generate_parser.add_argument(
        "--request-timeout",
        type=_positive_int,
        default=30,
        help="Timeout in seconds for live Overpass requests.",
    )
    generate_parser.add_argument(
        "--request-retries",
        type=_non_negative_int,
        default=1,
        help="Retry count for live Overpass requests.",
    )
    generate_parser.add_argument(
        "--cache-dir",
        type=Path,
        help="Optional local cache directory for live Overpass payloads.",
    )
    generate_parser.add_argument(
        "--refresh",
        action="store_true",
        help="Ignore cached live payloads and fetch fresh Overpass data.",
    )
    generate_parser.add_argument(
        "--source-file",
        type=Path,
        help="Optional local Overpass-style JSON fixture for offline generation and testing.",
    )

    from .nearby import add_arguments as add_nearby_arguments

    nearby_parser = subparsers.add_parser(
        "nearby",
        help="Generate a nearby-world preview bundle from coordinates.",
    )
    add_nearby_arguments(nearby_parser)

    from .page import add_arguments as add_page_arguments

    page_parser = subparsers.add_parser(
        "page",
        help="Start the local page-driven nearby preview experience.",
    )
    add_page_arguments(page_parser)

    inspect_parser = subparsers.add_parser("inspect", help="Inspect an existing world JSON.")
    inspect_parser.add_argument("--input", type=Path, required=True, help="Input world JSON file path")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == "generate":
            return _run_generate(args)
        if args.command == "nearby":
            from .nearby import run_nearby

            return run_nearby(args)
        if args.command == "page":
            from .page import run_page

            return run_page(args)
        if args.command == "inspect":
            return _run_inspect(args)
    except WorldSchemaError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 4
    except Exception as exc:  # pragma: no cover - handled by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1
    parser.error(f"unsupported command: {args.command}")
    return 2


def _run_generate(args: argparse.Namespace) -> int:
    source_data = None
    provider = "overpass"
    cache_dir = None
    cache_status = "disabled"
    if args.source_file:
        source_data = json.loads(args.source_file.read_text(encoding="utf-8"))
        provider = "fixture"
        cache_status = "fixture"
    else:
        cache_dir = args.cache_dir or default_cache_dir()
        cache_status = "refreshed" if args.refresh else "enabled"

    world = build_world(
        lat=args.lat,
        lon=args.lon,
        radius=args.radius,
        seed=args.seed,
        source_data=source_data,
        provider=provider,
        fetch_timeout_seconds=args.request_timeout,
        fetch_max_retries=args.request_retries,
        fetch_cache_dir=cache_dir,
        refresh_cache=args.refresh,
    )
    write_world(args.output, world)
    print(
        json.dumps(
            {
                "world_id": world["world_id"],
                "provider": world["source"]["provider"],
                "poi_count": len(world["pois"]),
                "road_count": len(world["roads"]),
                "landmark_count": len(world["landmarks"]),
                "cache_status": cache_status,
                "cache_dir": str(cache_dir) if cache_dir is not None else None,
                "output": str(args.output),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def _run_inspect(args: argparse.Namespace) -> int:
    world = json.loads(args.input.read_text(encoding="utf-8"))
    _validate_world_schema(world)
    print(json.dumps(_build_inspect_summary(world, args.input), ensure_ascii=False, indent=2))
    return 0


def _build_inspect_summary(world: dict[str, Any], input_path: Path) -> dict[str, Any]:
    region = world.get("region") or {}
    state = world.get("state") or {}
    source = world.get("source") or {}
    return {
        "world_id": world.get("world_id"),
        "seed": world.get("seed"),
        "provider": source.get("provider"),
        "theme": region.get("theme"),
        "atmosphere": region.get("atmosphere"),
        "dominant_faction": region.get("dominant_faction"),
        "poi_count": len(world.get("pois") or []),
        "road_count": len(world.get("roads") or []),
        "landmark_count": len(world.get("landmarks") or []),
        "faction_count": len(world.get("factions") or []),
        "historical_echo_count": len(world.get("historical_echoes") or []),
        "memory_anchor_count": len(world.get("memory_anchors") or []),
        "sprite_count": len(world.get("sprites") or []),
        "state_version": state.get("version"),
        "disturbance_level": state.get("disturbance_level"),
        "active_lens": state.get("active_lens"),
        "input": str(input_path),
    }


def _validate_world_schema(world: Any) -> None:
    if not isinstance(world, dict):
        raise WorldSchemaError("world schema validation failed: root JSON value must be an object.")

    required_top_level_fields = {
        "world_id": str,
        "seed": str,
        "source": dict,
        "region": dict,
        "pois": list,
        "roads": list,
        "landmarks": list,
        "factions": list,
        "historical_echoes": list,
        "memory_anchors": list,
        "sprites": list,
        "state": dict,
    }
    for field_name, expected_type in required_top_level_fields.items():
        if field_name not in world:
            raise WorldSchemaError(f"world schema validation failed: missing top-level field '{field_name}'.")
        if not isinstance(world[field_name], expected_type):
            raise WorldSchemaError(
                f"world schema validation failed: field '{field_name}' must be a {_type_label(expected_type)}."
            )

    source = world["source"]
    if "provider" not in source:
        raise WorldSchemaError("world schema validation failed: missing required field 'source.provider'.")
    if not isinstance(source["provider"], str):
        raise WorldSchemaError("world schema validation failed: field 'source.provider' must be a string.")

    state = world["state"]
    if "version" not in state:
        raise WorldSchemaError("world schema validation failed: missing required field 'state.version'.")
    if not isinstance(state["version"], str):
        raise WorldSchemaError("world schema validation failed: field 'state.version' must be a string.")


def _type_label(expected_type: type[Any]) -> str:
    return {
        str: "string",
        dict: "object",
        list: "list",
    }.get(expected_type, expected_type.__name__)


def _positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("value must be a positive integer")
    return parsed


def _non_negative_int(value: str) -> int:
    parsed = int(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("value must be a non-negative integer")
    return parsed