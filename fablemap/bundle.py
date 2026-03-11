from __future__ import annotations

import argparse
from html import escape
import json
import sys
from pathlib import Path
from typing import Any, Sequence

from .cli import _build_inspect_summary, _validate_world_schema
from .showcase import _build_showcase, _render_showcase_markdown
from .world_builder import write_world


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m fablemap.bundle",
        description="Export a fixed-structure static bundle from a FableMap world JSON.",
    )
    parser.add_argument("--input", type=Path, required=True, help="Path to an existing world.json file.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory where the bundle will be written. Defaults to <input-dir>/bundle.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        input_path = args.input
        output_dir = args.output_dir or (input_path.parent / "bundle")
        world = _load_world(input_path)
        print(json.dumps(export_bundle(world, output_dir), ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:  # pragma: no cover - exercised by smoke tests
        print(f"error: {exc}", file=sys.stderr)
        return 1


def _load_world(input_path: Path) -> dict[str, Any]:
    return json.loads(input_path.read_text(encoding="utf-8"))


def export_bundle(world: dict[str, Any], output_dir: Path) -> dict[str, Any]:
    _validate_world_schema(world)
    output_dir.mkdir(parents=True, exist_ok=True)

    summary = _build_inspect_summary(world, Path("world.json"))
    showcase = _build_showcase(world, Path("world.json"))
    manifest = _build_bundle_manifest(summary, showcase)

    bundle_world_path = output_dir / "world.json"
    summary_path = output_dir / "summary.json"
    showcase_json_path = output_dir / "showcase.json"
    showcase_md_path = output_dir / "showcase.md"
    preview_html_path = output_dir / "index.html"
    manifest_path = output_dir / "manifest.json"

    write_world(bundle_world_path, world)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    showcase_json_path.write_text(json.dumps(showcase, ensure_ascii=False, indent=2), encoding="utf-8")
    showcase_md_path.write_text(_render_showcase_markdown(showcase), encoding="utf-8")
    preview_html_path.write_text(_render_preview_html(showcase, manifest), encoding="utf-8")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "world_id": manifest["world_id"],
        "title": manifest["title"],
        "output_dir": str(output_dir),
        "manifest": str(manifest_path),
        "preview": str(preview_html_path),
        "bundle_version": manifest["bundle_version"],
    }


def _build_bundle_manifest(summary: dict[str, Any], showcase: dict[str, Any]) -> dict[str, Any]:
    hooks = showcase.get("hooks") or {}
    slots = {
        "world_data": {"path": "world.json", "format": "json", "kind": "world", "required": True},
        "summary_data": {"path": "summary.json", "format": "json", "kind": "summary", "required": True},
        "showcase_data": {"path": "showcase.json", "format": "json", "kind": "showcase", "required": True},
        "showcase_markdown": {
            "path": "showcase.md",
            "format": "markdown",
            "kind": "document",
            "required": True,
        },
        "preview_html": {"path": "index.html", "format": "html", "kind": "preview", "required": True},
    }
    return {
        "bundle_version": "0.3",
        "world_id": summary.get("world_id"),
        "title": showcase.get("title"),
        "subtitle": showcase.get("subtitle"),
        "files": {
            "world": "world.json",
            "summary": "summary.json",
            "showcase_json": "showcase.json",
            "showcase_markdown": "showcase.md",
            "preview_html": "index.html",
        },
        "entrypoints": {
            "primary_world": "world.json",
            "primary_showcase": "showcase.json",
            "primary_readme": "showcase.md",
            "primary_preview": "index.html",
        },
        "slots": slots,
        "resources": [
            {
                "id": "world",
                "slot": "world_data",
                "path": slots["world_data"]["path"],
                "format": slots["world_data"]["format"],
                "kind": slots["world_data"]["kind"],
                "role": "primary_world",
            },
            {
                "id": "summary",
                "slot": "summary_data",
                "path": slots["summary_data"]["path"],
                "format": slots["summary_data"]["format"],
                "kind": slots["summary_data"]["kind"],
                "role": "inspect_summary",
            },
            {
                "id": "showcase_json",
                "slot": "showcase_data",
                "path": slots["showcase_data"]["path"],
                "format": slots["showcase_data"]["format"],
                "kind": slots["showcase_data"]["kind"],
                "role": "showcase_payload",
            },
            {
                "id": "showcase_markdown",
                "slot": "showcase_markdown",
                "path": slots["showcase_markdown"]["path"],
                "format": slots["showcase_markdown"]["format"],
                "kind": slots["showcase_markdown"]["kind"],
                "role": "showcase_document",
            },
            {
                "id": "preview_html",
                "slot": "preview_html",
                "path": slots["preview_html"]["path"],
                "format": slots["preview_html"]["format"],
                "kind": slots["preview_html"]["kind"],
                "role": "interactive_preview",
            },
        ],
        "presentation": {
            "theme": summary.get("theme"),
            "atmosphere": summary.get("atmosphere"),
            "dominant_faction": summary.get("dominant_faction"),
            "visual_style": hooks.get("visual_style"),
            "palette_hint": hooks.get("palette_hint"),
        },
        "signals": {
            "poi_count": summary.get("poi_count"),
            "road_count": summary.get("road_count"),
            "landmark_count": summary.get("landmark_count"),
            "sprite_count": summary.get("sprite_count"),
            "memory_anchor_count": summary.get("memory_anchor_count"),
            "historical_echo_count": summary.get("historical_echo_count"),
            "disturbance_level": summary.get("disturbance_level"),
        },
    }


def _render_preview_html(showcase: dict[str, Any], manifest: dict[str, Any]) -> str:
    summary = showcase.get("summary") or {}
    faction = showcase.get("faction_spotlight") or {}
    hooks = showcase.get("hooks") or {}
    poi_items = "".join(
        f"<li><strong>{escape(item.get('fantasy_name') or 'Unknown POI')}</strong> "
        f"<span>{escape(item.get('fantasy_type') or 'unknown type')}</span><br>"
        f"<small>{escape(item.get('emotion_hook') or 'No hook.')}</small></li>"
        for item in (showcase.get("poi_highlights") or [])
    ) or "<li>No highlighted POIs.</li>"
    landmark_items = "".join(
        f"<li><strong>{escape(item.get('name') or 'Unknown Landmark')}</strong> "
        f"<span>{escape(item.get('type') or 'unknown type')}</span><br>"
        f"<small>{escape(item.get('description') or 'No description.')}</small></li>"
        for item in (showcase.get("landmark_highlights") or [])
    ) or "<li>No highlighted landmarks.</li>"
    faction_html = ""
    if faction:
        faction_html = (
            "<section class=\"panel\"><h2>Faction Spotlight</h2>"
            f"<p><strong>{escape(faction.get('name') or 'Unknown faction')}</strong> "
            f"({escape(faction.get('archetype') or 'unknown archetype')})</p>"
            f"<p>{escape(faction.get('doctrine') or 'No doctrine.')}</p>"
            f"<p>Influence: {escape(str(faction.get('influence') or 'unknown'))}</p></section>"
        )

    return f"""<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
    <title>{escape(showcase.get('title') or 'FableMap Preview')}</title>
    <style>
      :root {{ color-scheme: dark; }}
      body {{ margin: 0; font-family: Segoe UI, Arial, sans-serif; background: #111827; color: #e5e7eb; }}
      .wrap {{ max-width: 980px; margin: 0 auto; padding: 32px 20px 48px; }}
      .hero {{ padding: 24px; border-radius: 18px; background: linear-gradient(135deg, #1f2937, #111827); border: 1px solid #374151; }}
      .hero h1 {{ margin: 0 0 10px; font-size: 36px; }}
      .hero p {{ margin: 8px 0; line-height: 1.6; }}
      .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }}
      .panel {{ background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 18px; }}
      .panel h2 {{ margin-top: 0; font-size: 20px; }}
      ul {{ padding-left: 18px; margin: 10px 0 0; }}
      li {{ margin: 10px 0; line-height: 1.5; }}
      .meta {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }}
      .tag {{ background: #312e81; border-radius: 999px; padding: 6px 10px; font-size: 12px; }}
      .links a {{ color: #93c5fd; text-decoration: none; margin-right: 12px; }}
      .links a:hover {{ text-decoration: underline; }}
      code {{ color: #c4b5fd; }}
    </style>
  </head>
  <body>
    <div class=\"wrap\">
      <section class=\"hero\">
        <h1>{escape(showcase.get('title') or 'Untitled District')}</h1>
        <p>{escape(showcase.get('subtitle') or '')}</p>
        <p>{escape(showcase.get('narrative_summary') or 'No narrative summary available.')}</p>
        <div class=\"meta\">
          <span class=\"tag\">world: {escape(showcase.get('world_id') or 'unknown')}</span>
          <span class=\"tag\">theme: {escape(summary.get('theme') or 'unknown')}</span>
          <span class=\"tag\">atmosphere: {escape(summary.get('atmosphere') or 'unknown')}</span>
          <span class=\"tag\">bundle v{escape(manifest.get('bundle_version') or '0')}</span>
        </div>
      </section>

      <div class=\"grid\">
        <section class=\"panel\">
          <h2>District Snapshot</h2>
          <ul>
            <li>POIs: {escape(str(summary.get('poi_count') or 0))}</li>
            <li>Roads: {escape(str(summary.get('road_count') or 0))}</li>
            <li>Landmarks: {escape(str(summary.get('landmark_count') or 0))}</li>
            <li>Sprites: {escape(str(summary.get('sprite_count') or 0))}</li>
            <li>Disturbance: {escape(str(summary.get('disturbance_level') or 'unknown'))}</li>
          </ul>
        </section>
        {faction_html}
        <section class=\"panel\">
          <h2>Highlight POIs</h2>
          <ul>{poi_items}</ul>
        </section>
        <section class=\"panel\">
          <h2>Landmark Hooks</h2>
          <ul>{landmark_items}</ul>
        </section>
        <section class=\"panel\">
          <h2>Presentation Hooks</h2>
          <ul>
            <li>Visual style: {escape(str(hooks.get('visual_style') or 'unknown'))}</li>
            <li>Palette hint: {escape(str(hooks.get('palette_hint') or 'unknown'))}</li>
            <li>Comfort level: {escape(str(hooks.get('comfort_level') or 'unknown'))}</li>
            <li>Anomaly pressure: {escape(str(hooks.get('anomaly_pressure') or 'unknown'))}</li>
          </ul>
        </section>
      </div>

      <section class=\"panel links\" style=\"margin-top:20px;\">
        <h2>Bundle Files</h2>
        <p>
          <a href=\"world.json\">world.json</a>
          <a href=\"summary.json\">summary.json</a>
          <a href=\"showcase.json\">showcase.json</a>
          <a href=\"showcase.md\">showcase.md</a>
          <a href=\"manifest.json\">manifest.json</a>
        </p>
        <p><small>Primary preview slot: <code>{escape(manifest.get('entrypoints', {}).get('primary_preview') or 'index.html')}</code></small></p>
      </section>
    </div>
  </body>
</html>
"""


if __name__ == "__main__":
    raise SystemExit(main())