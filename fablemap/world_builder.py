from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from .overpass import fetch_overpass_data

RULES: list[tuple[str, str, dict[str, Any]]] = [
    (
        "leisure",
        "park",
        {
            "fantasy_type": "whispering_grove",
            "suffix": "Grove",
            "theme": "verdant_district",
            "faction": "night_bloom",
            "satire": "green relief survives beside commuter pressure.",
            "emotion": "A calm pocket where private memories can settle.",
            "vibe": "ghibli_town",
            "palette": "moss_and_gold",
            "secret_slot": True,
            "sprite_spawn_hint": True,
        },
    ),
    (
        "amenity",
        "hospital",
        {
            "fantasy_type": "healing_sanctum",
            "suffix": "Sanctum",
            "theme": "healing_quarter",
            "faction": "clinic_circle",
            "satire": "Care feels sacred, but access is still rationed.",
            "emotion": "Anxious hope lingers around the doors.",
            "vibe": "quiet_rain",
            "palette": "ceramic_white",
            "secret_slot": False,
            "sprite_spawn_hint": False,
        },
    ),
    (
        "shop",
        "convenience",
        {
            "fantasy_type": "supply_outpost",
            "suffix": "Outpost",
            "theme": "market_quarter",
            "faction": "trade_guild",
            "satire": "Everything is available, just not equally affordable.",
            "emotion": "Small routines make the district feel survivable.",
            "vibe": "neon_nostalgia",
            "palette": "soda_neon",
            "secret_slot": False,
            "sprite_spawn_hint": True,
        },
    ),
    (
        "amenity",
        "police",
        {
            "fantasy_type": "judgement_tower",
            "suffix": "Tower",
            "theme": "bureau_district",
            "faction": "order_bureau",
            "satire": "Order is visible everywhere, comfort much less so.",
            "emotion": "You are watched before you are welcomed.",
            "vibe": "iron_blue",
            "palette": "steel_and_ash",
            "secret_slot": False,
            "sprite_spawn_hint": False,
        },
    ),
    (
        "amenity",
        "cafe",
        {
            "fantasy_type": "ember_parlor",
            "suffix": "Parlor",
            "theme": "market_quarter",
            "faction": "memory_collective",
            "satire": "Conversation is cozy, but time is always for sale.",
            "emotion": "Warmth, gossip and waiting quietly overlap here.",
            "vibe": "amber_evening",
            "palette": "coffee_and_rose",
            "secret_slot": True,
            "sprite_spawn_hint": True,
        },
    ),
    (
        "amenity",
        "school",
        {
            "fantasy_type": "lore_academy",
            "suffix": "Academy",
            "theme": "scholar_quarter",
            "faction": "memory_collective",
            "satire": "Knowledge promises mobility while reproducing hierarchy.",
            "emotion": "Ambition and fatigue share the same corridors.",
            "vibe": "chalk_dawn",
            "palette": "paper_and_ink",
            "secret_slot": False,
            "sprite_spawn_hint": False,
        },
    ),
]

ROAD_ROLES = {
    "motorway": "iron_lane",
    "primary": "trade_route",
    "secondary": "trade_route",
    "tertiary": "market_street",
    "residential": "lantern_lane",
    "footway": "ritual_path",
}

FACTION_DETAILS = {
    "trade_guild": ("Trade Guild", "trade_guild", "Secures supply, price and passage."),
    "order_bureau": ("Order Bureau", "order_bureau", "Turns circulation into a managed system."),
    "clinic_circle": ("Clinic Circle", "clinic_circle", "Protects fragile life and triage rituals."),
    "memory_collective": ("Memory Collective", "memory_collective", "Collects stories, grief and local rituals."),
    "night_bloom": ("Night Bloom", "night_bloom", "Protects hidden beauty and after-hours growth."),
}


def build_world(
    lat: float,
    lon: float,
    radius: int = 300,
    seed: str | None = None,
    source_data: dict[str, Any] | None = None,
    provider: str = "overpass",
    fetch_timeout_seconds: int = 30,
    fetch_max_retries: int = 1,
    fetch_cache_dir: str | Path | None = None,
    refresh_cache: bool = False,
) -> dict[str, Any]:
    payload = source_data if source_data is not None else fetch_overpass_data(
        lat,
        lon,
        radius,
        timeout_seconds=fetch_timeout_seconds,
        max_retries=fetch_max_retries,
        cache_dir=fetch_cache_dir,
        refresh=refresh_cache,
    )
    elements = payload.get("elements", [])
    fallback = {"lat": lat, "lon": lon}
    world_id = f"world-{_digest(f'{lat:.5f}', f'{lon:.5f}', radius)[:12]}"
    stable_seed = seed or _digest(world_id, radius)[:12]

    pois = _build_pois(elements, fallback)
    roads = _build_roads(elements, fallback)
    landmarks = _build_landmarks(elements, fallback)
    theme = _pick_theme(pois)
    dominant_faction = _pick_faction(theme, pois)
    commerce_flux = round(min(1.0, len([p for p in pois if p["faction_alignment"] == "trade_guild"]) * 0.2 + len(roads) * 0.08), 2)
    anomaly_pressure = round(min(1.0, len(landmarks) * 0.25 + len([p for p in pois if p["secret_slot"]]) * 0.1), 2)
    comfort_level = round(min(1.0, len([p for p in pois if p["secret_slot"]]) * 0.18 + 0.2), 2)
    control_score = round(min(1.0, 0.25 + len(roads) * 0.08 + len(pois) * 0.03), 2)
    region_name = _region_name(world_id, pois)
    vibe_profile = _pick_vibe(pois)

    region = {
        "name": region_name,
        "theme": theme,
        "atmosphere": "charged" if len(roads) >= 3 else "quiet",
        "dominant_landuse": _dominant_landuse(elements),
        "narrative_summary": f"{region_name} is rendered as a {theme} with {len(pois)} mapped POIs and {len(roads)} traversable routes.",
        "visual_style": vibe_profile,
        "social_tension": round(min(1.0, 0.2 + len(roads) * 0.06), 2),
        "commerce_flux": commerce_flux,
        "anomaly_pressure": anomaly_pressure,
        "class_tone": "working" if commerce_flux >= 0.4 else "mixed",
        "satire_profile": _pick_satire(pois),
        "vibe_profile": vibe_profile,
        "palette_hint": _pick_palette(pois),
        "comfort_level": comfort_level,
        "dominant_faction": dominant_faction,
        "control_score": control_score,
        "strategic_value": round(min(1.0, 0.3 + len(roads) * 0.07 + len(landmarks) * 0.1), 2),
    }

    factions = _build_factions(dominant_faction, world_id, control_score)
    memory_anchors = _build_memory_anchors(pois)
    sprites = _build_sprites(pois)
    historical_echoes = _build_historical_echoes(landmarks)

    return {
        "world_id": world_id,
        "seed": stable_seed,
        "source": {
            "lat": lat,
            "lon": lon,
            "radius_m": radius,
            "provider": provider,
        },
        "region": region,
        "pois": pois,
        "roads": roads,
        "landmarks": landmarks,
        "factions": factions,
        "historical_echoes": historical_echoes,
        "memory_anchors": memory_anchors,
        "sprites": sprites,
        "state": {
            "version": "0.1",
            "visited": False,
            "poi_states": {
                poi["id"]: {
                    "status": (
                        "anomaly" if poi.get("secret_slot")
                        else "active" if poi.get("faction_alignment") == "trade_guild"
                        else "idle"
                    )
                }
                for poi in pois
            },
            "flags": [],
            "story_events": [],
            "faction_states": [{"faction_id": dominant_faction, "control_score": control_score}],
            "economy_state": {"market_pressure": commerce_flux},
            "disturbance_level": anomaly_pressure,
            "signal_snapshot": {
                "source_element_count": len(elements),
                "mapped_poi_count": len(pois),
                "road_count": len(roads),
            },
            "spawn_window": (
                "rare" if anomaly_pressure >= 0.7
                else "active" if anomaly_pressure >= 0.4
                else "stable"
            ),
            "mystery_progress": 0,
            "active_lens": vibe_profile,
            "collection_progress": {},
            "home_inventory": [],
            "home_style": "blank_slate",
            "private_marks": [],
            "reputation": {dominant_faction: 0},
            "route_impact": {"road_count": len(roads)},
            "resource_transfers": [],
        },
    }


def write_world(output_path: str | Path, world: dict[str, Any]) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(world, ensure_ascii=False, indent=2), encoding="utf-8")


def _build_pois(elements: list[dict[str, Any]], fallback: dict[str, float]) -> list[dict[str, Any]]:
    pois: list[dict[str, Any]] = []
    for element in elements:
        tags = element.get("tags") or {}
        mapping = _match_mapping(tags)
        if mapping is None:
            continue
        poi_id = f"{element.get('type', 'item')}-{element.get('id', 'unknown')}"
        real_name = tags.get("name")
        real_type = _infer_osm_type(tags)
        pois.append(
            {
                "id": poi_id,
                "osm_type": real_type,
                "real_name": real_name,
                "fantasy_name": _fantasy_name(real_name, mapping["suffix"], mapping["fantasy_type"]),
                "fantasy_type": mapping["fantasy_type"],
                "position": _extract_position(element, fallback),
                "description": f"A {real_type} recast as {mapping['fantasy_type']}.",
                "tags": _compact_tags(tags),
                "visual_hint": {
                    "style": mapping["vibe"],
                    "palette": mapping["palette"],
                },
                "state_ref": poi_id,
                "satire_hook": mapping["satire"],
                "faction_alignment": mapping["faction"],
                "emotion_hook": mapping["emotion"],
                "secret_slot": mapping["secret_slot"],
                "sprite_spawn_hint": mapping["sprite_spawn_hint"],
            }
        )
    return sorted(pois, key=lambda item: item["id"])[:12]


def _build_roads(elements: list[dict[str, Any]], fallback: dict[str, float]) -> list[dict[str, Any]]:
    roads = []
    for element in elements:
        tags = element.get("tags") or {}
        highway = tags.get("highway")
        if not highway:
            continue
        roads.append(
            {
                "id": f"{element.get('type', 'way')}-{element.get('id', 'unknown')}",
                "kind": highway,
                "points": _extract_points(element, fallback),
                "fantasy_role": ROAD_ROLES.get(highway, "threshold_path"),
            }
        )
    return sorted(roads, key=lambda item: item["id"])[:12]


def _build_landmarks(elements: list[dict[str, Any]], fallback: dict[str, float]) -> list[dict[str, Any]]:
    landmarks = []
    for element in elements:
        tags = element.get("tags") or {}
        if not (tags.get("tourism") or tags.get("historic")):
            continue
        landmarks.append(
            {
                "id": f"landmark-{element.get('type', 'item')}-{element.get('id', 'unknown')}",
                "name": tags.get("name") or "Unnamed Landmark",
                "type": tags.get("tourism") or tags.get("historic"),
                "description": "A place where the district's official story feels slightly unstable.",
                "visual_hint": {
                    "position": _extract_position(element, fallback),
                    "style": "memory_spire",
                },
            }
        )
    return sorted(landmarks, key=lambda item: item["id"])[:6]


def _build_factions(faction_id: str, world_id: str, control_score: float) -> list[dict[str, Any]]:
    name, archetype, doctrine = FACTION_DETAILS.get(
        faction_id,
        ("Memory Collective", "memory_collective", "Guards what the district refuses to forget."),
    )
    return [
        {
            "id": faction_id,
            "name": name,
            "archetype": archetype,
            "doctrine": doctrine,
            "influence": control_score,
            "resource_focus": ["attention", "movement"],
            "territories": [world_id],
            "relations": [],
        }
    ]


def _build_memory_anchors(pois: list[dict[str, Any]]) -> list[dict[str, Any]]:
    anchors = []
    for poi in pois:
        if not poi["secret_slot"]:
            continue
        anchors.append(
            {
                "id": f"anchor-{poi['id']}",
                "anchor_type": "secret_garden_slot",
                "tone": "tender",
                "visibility": "private",
                "linked_pois": [poi["id"]],
                "unlock_conditions": ["visit_poi"],
            }
        )
    return anchors[:3]


def _build_sprites(pois: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sprites = []
    for poi in pois:
        if not poi["sprite_spawn_hint"]:
            continue
        sprites.append(
            {
                "id": f"sprite-{poi['id']}",
                "species": f"{poi['fantasy_type']}_sprite",
                "rarity": "common",
                "spawn_conditions": ["visit_poi"],
                "linked_poi": poi["id"],
                "drop_tags": [poi["fantasy_type"]],
            }
        )
    return sprites[:3]


def _build_historical_echoes(landmarks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": f"echo-{landmark['id']}",
            "source_type": landmark["type"],
            "summary": f"{landmark['name']} carries a lingering public memory.",
            "trigger_hint": "inspect_landmark",
            "severity": "low",
            "linked_pois": [],
        }
        for landmark in landmarks[:2]
    ]


def _pick_theme(pois: list[dict[str, Any]]) -> str:
    scores: dict[str, int] = {}
    for poi in pois:
        theme = {
            "whispering_grove": "verdant_district",
            "healing_sanctum": "healing_quarter",
            "supply_outpost": "market_quarter",
            "judgement_tower": "bureau_district",
            "ember_parlor": "market_quarter",
            "lore_academy": "scholar_quarter",
        }.get(poi["fantasy_type"], "threshold_district")
        scores[theme] = scores.get(theme, 0) + 1
    return max(scores, key=scores.get) if scores else "threshold_district"


def _pick_faction(theme: str, pois: list[dict[str, Any]]) -> str:
    if pois:
        return max(
            {poi["faction_alignment"]: sum(1 for item in pois if item["faction_alignment"] == poi["faction_alignment"]) for poi in pois},
            key=lambda key: sum(1 for item in pois if item["faction_alignment"] == key),
        )
    return {
        "verdant_district": "night_bloom",
        "healing_quarter": "clinic_circle",
        "market_quarter": "trade_guild",
        "bureau_district": "order_bureau",
        "scholar_quarter": "memory_collective",
    }.get(theme, "memory_collective")


def _pick_vibe(pois: list[dict[str, Any]]) -> str:
    return pois[0]["visual_hint"]["style"] if pois else "quiet_rain"


def _pick_palette(pois: list[dict[str, Any]]) -> str:
    return pois[0]["visual_hint"]["palette"] if pois else "paper_and_ink"


def _pick_satire(pois: list[dict[str, Any]]) -> str:
    return pois[0]["satire_hook"] if pois else "Daily circulation shapes the district more than any single monument."


def _region_name(world_id: str, pois: list[dict[str, Any]]) -> str:
    named_poi = next((poi for poi in pois if poi["real_name"]), None)
    return f"Around {named_poi['real_name']}" if named_poi else f"Sector {world_id[-6:]}"


def _dominant_landuse(elements: list[dict[str, Any]]) -> str:
    counts: dict[str, int] = {}
    for element in elements:
        landuse = (element.get("tags") or {}).get("landuse")
        if landuse:
            counts[landuse] = counts.get(landuse, 0) + 1
    return max(counts, key=counts.get) if counts else "mixed_use"


def _match_mapping(tags: dict[str, Any]) -> dict[str, Any] | None:
    for key, value, mapping in RULES:
        if tags.get(key) == value:
            return mapping
    if "shop" in tags:
        return next(mapping for key, value, mapping in RULES if key == "shop" and value == "convenience")
    return None


def _infer_osm_type(tags: dict[str, Any]) -> str:
    for key in ("amenity", "shop", "leisure", "tourism", "historic", "building"):
        if key in tags:
            return str(tags[key])
    return "unknown"


def _fantasy_name(real_name: str | None, suffix: str, fantasy_type: str) -> str:
    base = real_name or fantasy_type.replace("_", " ").title()
    return base if base.endswith(suffix) else f"{base} {suffix}"


def _compact_tags(tags: dict[str, Any]) -> list[str]:
    keys = ("amenity", "shop", "leisure", "tourism", "historic", "highway", "landuse")
    return [f"{key}={tags[key]}" for key in keys if key in tags]


def _extract_position(element: dict[str, Any], fallback: dict[str, float]) -> dict[str, float]:
    if "lat" in element and "lon" in element:
        return {"lat": element["lat"], "lon": element["lon"]}
    if "center" in element:
        return {"lat": element["center"]["lat"], "lon": element["center"]["lon"]}
    geometry = element.get("geometry") or []
    if geometry:
        return {"lat": geometry[0]["lat"], "lon": geometry[0]["lon"]}
    return {"lat": fallback["lat"], "lon": fallback["lon"]}


def _extract_points(element: dict[str, Any], fallback: dict[str, float]) -> list[dict[str, float]]:
    geometry = element.get("geometry") or []
    if geometry:
        return [{"lat": point["lat"], "lon": point["lon"]} for point in geometry]
    position = _extract_position(element, fallback)
    return [position, position]


def _digest(*parts: Any) -> str:
    joined = "|".join(str(part) for part in parts)
    return hashlib.sha1(joined.encode("utf-8")).hexdigest()