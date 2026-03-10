from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

from .world_builder import build_world, write_world


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="fablemap", description="Generate a FableMap world JSON from coordinates.")
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
        "--source-file",
        type=Path,
        help="Optional local Overpass-style JSON fixture for offline generation and testing.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == "generate":
            return _run_generate(args)
    except Exception as exc:  # pragma: no cover - handled by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1
    parser.error(f"unsupported command: {args.command}")
    return 2


def _run_generate(args: argparse.Namespace) -> int:
    source_data = None
    provider = "overpass"
    if args.source_file:
        source_data = json.loads(args.source_file.read_text(encoding="utf-8"))
        provider = "fixture"

    world = build_world(
        lat=args.lat,
        lon=args.lon,
        radius=args.radius,
        seed=args.seed,
        source_data=source_data,
        provider=provider,
        fetch_timeout_seconds=args.request_timeout,
        fetch_max_retries=args.request_retries,
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
                "output": str(args.output),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


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