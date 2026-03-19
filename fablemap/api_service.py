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
            "lat": 31.2304,
            "lon": 121.4737,
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
    pois = world_data.get("pois") or [] if isinstance(world_data, dict) else []
    map2d = world_data.get("map2d") or {} if isinstance(world_data, dict) else {}
    encounter_zones = map2d.get("encounter_zones") or [] if isinstance(map2d, dict) else []
    primary_poi_id = pois[0].get("id") if pois and isinstance(pois[0], dict) else None
    primary_zone_id = encounter_zones[0].get("id") if encounter_zones and isinstance(encounter_zones[0], dict) else None

    payload.update(
        {
            "mode": mode,
            "run_id": run_id,
            "preview_url": f"{base_url}/generated/{run_id}/bundle/index.html",
            "manifest_url": f"{base_url}/generated/{run_id}/bundle/manifest.json",
            "world_url": f"{base_url}/generated/{run_id}/world.json",
            "frontend_url": f"{base_url}/",
            "world": world_data,
            "primary_poi_id": primary_poi_id,
            "primary_zone_id": primary_zone_id,
        }
    )
    return payload
