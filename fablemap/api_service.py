from __future__ import annotations

from pathlib import Path
from typing import Any


def build_health_payload(*, fixture_file: Path | None, frontend_root: Path | None, output_root: Path) -> dict[str, Any]:
    return {
        "status": "ok",
        "fixture_available": bool(fixture_file and fixture_file.exists()),
        "frontend_available": bool(frontend_root and frontend_root.exists()),
        "output_root": str(output_root),
    }


def build_meta_payload(*, base_url: str) -> dict[str, Any]:
    return {
        "project": "FableMap",
        "frontend_mode": "separated-shell",
        "api_base": base_url,
        "default_preview_base": f"{base_url}/generated",
        "default_coordinates": {
            "lat": 35.6580,
            "lon": 139.7016,
            "radius": 300,
        },
        "supported_modes": ["live", "fixture"],
        "default_mode": "live",
        "endpoints": {
            "health": "/api/health",
            "meta": "/api/meta",
            "nearby": "/api/nearby",
        },
    }


def build_nearby_payload(*, result: dict[str, Any], base_url: str, mode: str, run_id: str) -> dict[str, Any]:
    import json as _json
    payload = dict(result)
    world_path = Path(result["world"]) if result.get("world") else None
    world_data = _json.loads(world_path.read_text(encoding="utf-8")) if world_path and world_path.exists() else None
    payload.update(
        {
            "mode": mode,
            "run_id": run_id,
            "preview_url": f"{base_url}/generated/{run_id}/bundle/index.html",
            "manifest_url": f"{base_url}/generated/{run_id}/bundle/manifest.json",
            "world_url": f"{base_url}/generated/{run_id}/world.json",
            "frontend_url": f"{base_url}/",
            "world": world_data,
        }
    )
    return payload
