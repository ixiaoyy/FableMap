from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Sequence

from .cli import _build_inspect_summary, _validate_world_schema
from .world_builder import build_world, write_world


DEMO_SOURCE_PATH = Path(__file__).resolve().parent / "demo_assets" / "overpass_demo.json"
DEMO_LAT = 35.6580
DEMO_LON = 139.7016
DEMO_RADIUS = 300


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m fablemap.demo",
        description="Generate a reproducible local FableMap demo output.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("demo-output"),
        help="Directory where demo world.json and summary.json will be written.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        payload = _load_demo_source()
        args.output_dir.mkdir(parents=True, exist_ok=True)

        world = build_world(
            lat=DEMO_LAT,
            lon=DEMO_LON,
            radius=DEMO_RADIUS,
            source_data=payload,
            provider="demo_fixture",
        )
        _validate_world_schema(world)

        world_path = args.output_dir / "world.json"
        summary_path = args.output_dir / "summary.json"

        write_world(world_path, world)
        summary = _build_inspect_summary(world, world_path)
        summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

        print(
            json.dumps(
                {
                    "demo": "shibuya_fixture_v1",
                    "world_id": world["world_id"],
                    "provider": world["source"]["provider"],
                    "theme": world["region"]["theme"],
                    "output_dir": str(args.output_dir),
                    "world": str(world_path),
                    "summary": str(summary_path),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0
    except Exception as exc:  # pragma: no cover - exercised by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1


def _load_demo_source() -> dict[str, Any]:
    return json.loads(DEMO_SOURCE_PATH.read_text(encoding="utf-8"))


if __name__ == "__main__":
    raise SystemExit(main())