from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

from .bundle import export_bundle
from .cache import default_cache_dir
from .world_builder import build_world, write_world


def add_arguments(parser: argparse.ArgumentParser) -> argparse.ArgumentParser:
    parser.add_argument("--lat", type=float, required=True, help="Latitude")
    parser.add_argument("--lon", type=float, required=True, help="Longitude")
    parser.add_argument("--radius", type=_positive_int, default=300, help="Search radius in meters")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("nearby-output"),
        help="Directory where world.json and bundle output will be written.",
    )
    parser.add_argument("--seed", help="Optional stable seed override")
    parser.add_argument(
        "--request-timeout",
        type=_positive_int,
        default=30,
        help="Timeout in seconds for live Overpass requests.",
    )
    parser.add_argument(
        "--request-retries",
        type=_non_negative_int,
        default=1,
        help="Retry count for live Overpass requests.",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        help="Optional local cache directory for live Overpass payloads.",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Ignore cached live payloads and fetch fresh Overpass data.",
    )
    parser.add_argument(
        "--source-file",
        type=Path,
        help="Optional local Overpass-style JSON fixture for offline generation and testing.",
    )
    return parser


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m fablemap.nearby",
        description="Generate a nearby FableMap world and export a preview bundle.",
    )
    return add_arguments(parser)


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return run_nearby(args)


def run_nearby(args: argparse.Namespace) -> int:
    try:
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

        args.output_dir.mkdir(parents=True, exist_ok=True)
        world_path = args.output_dir / "world.json"
        bundle_dir = args.output_dir / "bundle"

        write_world(world_path, world)
        bundle_result = export_bundle(world, bundle_dir)

        print(
            json.dumps(
                {
                    "world_id": world["world_id"],
                    "provider": world["source"]["provider"],
                    "cache_status": cache_status,
                    "cache_dir": str(cache_dir) if cache_dir is not None else None,
                    "output_dir": str(args.output_dir),
                    "world": str(world_path),
                    "bundle_dir": str(bundle_dir),
                    "manifest": bundle_result["manifest"],
                    "preview": bundle_result["preview"],
                    "bundle_version": bundle_result["bundle_version"],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0
    except Exception as exc:  # pragma: no cover - exercised by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1


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


if __name__ == "__main__":
    raise SystemExit(main())