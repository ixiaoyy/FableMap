from __future__ import annotations

import argparse
from html import escape
import json
import sys
from pathlib import Path
from typing import Any, Callable, Sequence

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
    preview_html_path.write_text(_render_preview_html(world, showcase, manifest), encoding="utf-8")
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


def _localized_html(value: Any, fallback_key: str = "unknown") -> str:
    if value is None:
        return f'<span data-i18n="{fallback_key}"></span>'
    text = str(value).strip()
    if not text:
        return f'<span data-i18n="{fallback_key}"></span>'
    return escape(text)


def _position_or_none(value: Any) -> dict[str, float] | None:
    if not isinstance(value, dict):
        return None
    lat = value.get("lat")
    lon = value.get("lon")
    if lat is None or lon is None:
        return None
    try:
        return {"lat": float(lat), "lon": float(lon)}
    except (TypeError, ValueError):
        return None


def _build_map_projector(
    world: dict[str, Any],
    width: int = 880,
    height: int = 520,
    padding: int = 36,
) -> tuple[Callable[[Any], dict[str, float]], dict[str, int]]:
    points: list[dict[str, float]] = []
    for road in world.get("roads") or []:
        for point in road.get("points") or []:
            normalized = _position_or_none(point)
            if normalized is not None:
                points.append(normalized)
    for poi in world.get("pois") or []:
        normalized = _position_or_none(poi.get("position"))
        if normalized is not None:
            points.append(normalized)
    for landmark in world.get("landmarks") or []:
        normalized = _position_or_none((landmark.get("visual_hint") or {}).get("position"))
        if normalized is not None:
            points.append(normalized)

    source_position = _position_or_none(world.get("source") or {})
    if source_position is not None:
        points.append(source_position)
    if not points:
        points.append({"lat": 0.0, "lon": 0.0})

    min_lat = min(point["lat"] for point in points)
    max_lat = max(point["lat"] for point in points)
    min_lon = min(point["lon"] for point in points)
    max_lon = max(point["lon"] for point in points)
    lat_span = max(max_lat - min_lat, 0.0001)
    lon_span = max(max_lon - min_lon, 0.0001)
    inner_width = max(width - padding * 2, 1)
    inner_height = max(height - padding * 2, 1)

    def project(value: Any) -> dict[str, float]:
        default_point = source_position or {"lat": (min_lat + max_lat) / 2, "lon": (min_lon + max_lon) / 2}
        point = _position_or_none(value) or default_point
        x = padding + ((point["lon"] - min_lon) / lon_span) * inner_width
        y = padding + ((max_lat - point["lat"]) / lat_span) * inner_height
        return {"x": round(x, 2), "y": round(y, 2)}

    return project, {"width": width, "height": height}


def _render_map_observer_html(
    world: dict[str, Any],
    showcase: dict[str, Any],
    world_state: dict[str, Any],
) -> tuple[str, str]:
    roads = world.get("roads") or []
    pois = world.get("pois") or []
    landmarks = world.get("landmarks") or []
    state = world.get("state") or {}
    poi_states = state.get("poi_states") or {}
    project, viewport = _build_map_projector(world)

    road_shapes: list[str] = []
    for road in roads:
        projected_points: list[str] = []
        for point in road.get("points") or []:
            projected = project(point)
            projected_points.append(f"{projected['x']},{projected['y']}")
        if len(projected_points) >= 2:
            road_shapes.append(
                f'<polyline class="map-road" points="{" ".join(projected_points)}" '
                f'data-road-kind="{escape(str(road.get("kind") or ""))}" />'
            )

    feature_items: list[dict[str, Any]] = []
    for index, poi in enumerate(pois, start=1):
        position = _position_or_none(poi.get("position"))
        if position is None:
            continue
        feature_id = str(poi.get("id") or f"poi-{index}")
        marker_name = str(poi.get("fantasy_name") or poi.get("real_name") or "POI").strip() or "POI"
        poi_state = poi_states.get(poi.get("state_ref") or poi.get("id") or "") or {}
        feature_items.append(
            {
                "id": feature_id,
                "kind": "poi",
                "label": "P",
                "position": position,
                "marker_name": marker_name,
                "detail_body": (
                    '<p class="detail-kicker" data-i18n="detailPoiKicker"></p>'
                    f"<h3>{_localized_html(poi.get('fantasy_name'), 'unknownPoi')}</h3>"
                    f"<p>{_localized_html(poi.get('emotion_hook'), 'noHook')}</p>"
                    '<ul class="detail-list">'
                    f'<li><span data-i18n="detailType"></span>: {_localized_html(poi.get("fantasy_type"), "unknownType")}</li>'
                    f'<li><span data-i18n="detailRealName"></span>: {_localized_html(poi.get("real_name"))}</li>'
                    f'<li><span data-i18n="detailFaction"></span>: {_localized_html(poi.get("faction_alignment"), "unknownFaction")}</li>'
                    f'<li><span data-i18n="detailState"></span>: {_localized_html(poi_state.get("status"))}</li>'
                    "</ul>"
                ),
            }
        )
    for index, landmark in enumerate(landmarks, start=1):
        position = _position_or_none((landmark.get("visual_hint") or {}).get("position"))
        if position is None:
            continue
        feature_id = str(landmark.get("id") or f"landmark-{index}")
        marker_name = str(landmark.get("name") or "Landmark").strip() or "Landmark"
        feature_items.append(
            {
                "id": feature_id,
                "kind": "landmark",
                "label": "L",
                "position": position,
                "marker_name": marker_name,
                "detail_body": (
                    '<p class="detail-kicker" data-i18n="detailLandmarkKicker"></p>'
                    f"<h3>{_localized_html(landmark.get('name'), 'unknownLandmark')}</h3>"
                    f"<p>{_localized_html(landmark.get('description'), 'noDescription')}</p>"
                    '<ul class="detail-list">'
                    f'<li><span data-i18n="detailType"></span>: {_localized_html(landmark.get("type"), "unknownType")}</li>'
                    f'<li><span data-i18n="detailDescription"></span>: {_localized_html(landmark.get("description"), "noDescription")}</li>'
                    "</ul>"
                ),
            }
        )

    default_feature_id = feature_items[0]["id"] if feature_items else "map-overview"
    detail_cards = [
        (
            f'<article class="detail-card{" is-active" if default_feature_id == "map-overview" else ""}" '
            'data-feature-card="map-overview">'
            '<p class="detail-kicker" data-i18n="detailOverviewKicker"></p>'
            f"<h3>{_localized_html(showcase.get('title'), 'untitledDistrict')}</h3>"
            '<p data-i18n="mapDetailHint"></p>'
            '<ul class="detail-list">'
            f'<li><span data-i18n="detailRoadCount"></span>: {escape(str(len(roads)))}</li>'
            f'<li><span data-i18n="detailPoiCount"></span>: {escape(str(len(pois)))}</li>'
            f'<li><span data-i18n="detailLandmarkCount"></span>: {escape(str(len(landmarks)))}</li>'
            f'<li><span data-i18n="detailActiveLens"></span>: {_localized_html(world_state.get("active_lens"))}</li>'
            f'<li><span data-i18n="detailDisturbance"></span>: {_localized_html(world_state.get("disturbance_level"))}</li>'
            "</ul></article>"
        )
    ]
    feature_nodes: list[str] = []
    for item in feature_items:
        projected = project(item["position"])
        x = projected["x"]
        y = projected["y"]
        is_active = item["id"] == default_feature_id
        active_class = " is-active" if is_active else ""
        if item["kind"] == "poi":
            shape_html = (
                f'<circle cx="{x}" cy="{y}" r="10"></circle>'
                f'<text x="{x}" y="{y + 4}" text-anchor="middle">{escape(str(item["label"]))}</text>'
            )
        else:
            shape_html = (
                f'<rect x="{x - 9}" y="{y - 9}" width="18" height="18" rx="4"></rect>'
                f'<text x="{x}" y="{y + 4}" text-anchor="middle">{escape(str(item["label"]))}</text>'
            )
        feature_nodes.append(
            f'<g class="map-feature map-{escape(str(item["kind"]))}{active_class}" '
            f'data-feature-id="{escape(str(item["id"]))}" tabindex="0" role="button" '
            f'aria-pressed="{"true" if is_active else "false"}" aria-label="{escape(str(item["marker_name"]))}">'
            f"{shape_html}</g>"
        )
        detail_cards.append(
            f'<article class="detail-card{active_class}" data-feature-card="{escape(str(item["id"]))}">{item["detail_body"]}</article>'
        )

    observer_html = f"""
      <section class=\"observer-stage panel\" id=\"section-map-observer\">
        <div class=\"observer-header\">
          <div>
            <h2 data-i18n=\"sectionMapObserver\"></h2>
            <p data-i18n=\"mapObserverLead\"></p>
          </div>
          <div class=\"observer-legend\">
            <span class=\"legend-item\"><span class=\"legend-swatch road\"></span><span data-i18n=\"mapLegendRoads\"></span></span>
            <span class=\"legend-item\"><span class=\"legend-swatch poi\"></span><span data-i18n=\"mapLegendPois\"></span></span>
            <span class=\"legend-item\"><span class=\"legend-swatch landmark\"></span><span data-i18n=\"mapLegendLandmarks\"></span></span>
          </div>
        </div>
        <div class=\"observer-layout\">
          <div class=\"map-shell\">
            <svg id=\"observer-map\" viewBox=\"0 0 {viewport['width']} {viewport['height']}\" role=\"img\" aria-labelledby=\"observer-map-title observer-map-desc\">
              <title id=\"observer-map-title\">{escape(str(showcase.get('title') or 'FableMap Observer'))}</title>
              <desc id=\"observer-map-desc\">{escape(f'{len(roads)} roads, {len(pois)} POIs, {len(landmarks)} landmarks')}</desc>
              <rect class=\"map-backdrop\" x=\"0\" y=\"0\" width=\"{viewport['width']}\" height=\"{viewport['height']}\" rx=\"22\" ry=\"22\"></rect>
              {''.join(road_shapes)}
              {''.join(feature_nodes)}
            </svg>
            <p class=\"map-note\" data-i18n=\"mapObserverNote\"></p>
          </div>
          <aside class=\"detail-panel\" id=\"map-detail-panel\">
            <h3 data-i18n=\"mapDetailPanelTitle\"></h3>
            <div id=\"map-detail-cards\">{''.join(detail_cards)}</div>
          </aside>
        </div>
      </section>
    """
    return observer_html, default_feature_id


def _render_preview_html(world: dict[str, Any], showcase: dict[str, Any], manifest: dict[str, Any]) -> str:
    summary = showcase.get("summary") or {}
    reality = showcase.get("reality_skeleton") or {}
    world_state = showcase.get("world_state") or {}
    continuity = showcase.get("continuity_threads") or {}
    faction = showcase.get("faction_spotlight") or {}
    playable_hooks = showcase.get("playable_hooks") or []
    hooks = showcase.get("hooks") or {}
    localized_value = _localized_html

    translations = {
        "zh-CN": {
            "pageTitleSuffix": "FableMap 预览页",
            "languageLabel": "语言 / Language",
            "untitledDistrict": "未命名区域",
            "noNarrativeSummary": "暂时还没有叙事摘要。",
            "tagWorld": "世界",
            "tagTheme": "主题",
            "tagAtmosphere": "氛围",
            "tagBundleVersion": "包版本",
            "sectionMapObserver": "地图观察窗",
            "mapObserverLead": "主舞台直接复用当前 world.json 的真实空间关系：道路构成骨架，POI 与地标可点选查看详情。",
            "mapObserverNote": "当前采用局部经纬度归一化，只适用于 nearby 小范围世界观察，不等于完整 GIS 投影系统。",
            "mapLegendRoads": "道路骨架",
            "mapLegendPois": "POI 节点",
            "mapLegendLandmarks": "地标记忆点",
            "mapDetailPanelTitle": "地点详情",
            "detailOverviewKicker": "世界概览",
            "mapDetailHint": "点选地图上的 POI 或地标，右侧会切换为对应详情。",
            "detailRoadCount": "道路数",
            "detailPoiCount": "POI 数",
            "detailLandmarkCount": "地标数",
            "detailActiveLens": "观察镜头",
            "detailDisturbance": "扰动等级",
            "detailPoiKicker": "POI",
            "detailLandmarkKicker": "地标",
            "detailType": "类型",
            "detailRealName": "现实名称",
            "detailFaction": "阵营",
            "detailState": "当前状态",
            "detailDescription": "描述",
            "sectionReality": "现实骨架",
            "realityProvider": "来源",
            "realityCoordinates": "坐标",
            "realityRadius": "半径（米）",
            "realityLanduse": "主导用地",
            "realitySourceElements": "源元素数",
            "realityMappedPois": "已映射 POI",
            "realityRoads": "道路数",
            "sectionWorldState": "世界状态",
            "stateDominantFaction": "主导阵营",
            "stateControlScore": "控制度",
            "stateStrategicValue": "战略价值",
            "stateSocialTension": "社会张力",
            "stateCommerceFlux": "商业流动",
            "stateDisturbance": "扰动等级",
            "stateAnomalyPressure": "异常压力",
            "stateActiveLens": "观察镜头",
            "stateSpawnWindow": "生成窗口",
            "stateVisitStatus": "访问状态",
            "stateMysteryProgress": "谜团进度",
            "sectionContinuity": "持续线索",
            "continuityCounts": "记忆锚点 / 回响 / 精灵",
            "continuityMemory": "记忆",
            "continuityEcho": "历史回响",
            "continuitySprite": "精灵信号",
            "sectionFaction": "阵营聚焦",
            "factionInfluence": "影响力",
            "sectionPoiHighlights": "重点 POI",
            "sectionLandmarkHooks": "地标钩子",
            "sectionPlayableHooks": "可玩钩子",
            "sectionPresentation": "表现提示",
            "presentationVisualStyle": "视觉风格",
            "presentationPaletteHint": "色板提示",
            "presentationComfortLevel": "舒适度",
            "presentationAnomalyPressure": "异常压力",
            "sectionBundleFiles": "Bundle 文件",
            "primaryPreviewSlot": "主预览入口",
            "noHighlightedPois": "暂无重点 POI。",
            "noHighlightedLandmarks": "暂无重点地标。",
            "unknown": "未知",
            "unknownPoi": "未知 POI",
            "unknownLandmark": "未知地标",
            "unknownFaction": "未知阵营",
            "unknownArchetype": "未知原型",
            "unknownType": "未知类型",
            "noHook": "暂无钩子。",
            "noDescription": "暂无描述。",
            "noDoctrine": "暂无教义。",
        },
        "en": {
            "pageTitleSuffix": "FableMap Preview",
            "languageLabel": "Language / 语言",
            "untitledDistrict": "Untitled District",
            "noNarrativeSummary": "No narrative summary available.",
            "tagWorld": "world",
            "tagTheme": "theme",
            "tagAtmosphere": "atmosphere",
            "tagBundleVersion": "bundle v",
            "sectionMapObserver": "Map Observer",
            "mapObserverLead": "The main stage now reuses spatial relations from world.json directly: roads form the skeleton while POIs and landmarks can be selected for detail.",
            "mapObserverNote": "This view uses local lat/lon normalization for nearby-scale observation only; it is not a full GIS projection system.",
            "mapLegendRoads": "Road skeleton",
            "mapLegendPois": "POI nodes",
            "mapLegendLandmarks": "Landmark memory points",
            "mapDetailPanelTitle": "Location Details",
            "detailOverviewKicker": "World Overview",
            "mapDetailHint": "Select a POI or landmark on the map to switch the detail panel.",
            "detailRoadCount": "Road count",
            "detailPoiCount": "POI count",
            "detailLandmarkCount": "Landmark count",
            "detailActiveLens": "Active lens",
            "detailDisturbance": "Disturbance",
            "detailPoiKicker": "POI",
            "detailLandmarkKicker": "Landmark",
            "detailType": "Type",
            "detailRealName": "Real name",
            "detailFaction": "Faction",
            "detailState": "Current state",
            "detailDescription": "Description",
            "sectionReality": "Reality Skeleton",
            "realityProvider": "Provider",
            "realityCoordinates": "Coordinates",
            "realityRadius": "Radius (m)",
            "realityLanduse": "Dominant landuse",
            "realitySourceElements": "Source elements",
            "realityMappedPois": "Mapped POIs",
            "realityRoads": "Roads",
            "sectionWorldState": "World State",
            "stateDominantFaction": "Dominant faction",
            "stateControlScore": "Control score",
            "stateStrategicValue": "Strategic value",
            "stateSocialTension": "Social tension",
            "stateCommerceFlux": "Commerce flux",
            "stateDisturbance": "Disturbance",
            "stateAnomalyPressure": "Anomaly pressure",
            "stateActiveLens": "Active lens",
            "stateSpawnWindow": "Spawn window",
            "stateVisitStatus": "Visit status",
            "stateMysteryProgress": "Mystery progress",
            "sectionContinuity": "Continuity Threads",
            "continuityCounts": "Memory anchors / echoes / sprites",
            "continuityMemory": "Memory",
            "continuityEcho": "Echo",
            "continuitySprite": "Sprite signal",
            "sectionFaction": "Faction Spotlight",
            "factionInfluence": "Influence",
            "sectionPoiHighlights": "Highlight POIs",
            "sectionLandmarkHooks": "Landmark Hooks",
            "sectionPlayableHooks": "Playable Hooks",
            "sectionPresentation": "Presentation Hooks",
            "presentationVisualStyle": "Visual style",
            "presentationPaletteHint": "Palette hint",
            "presentationComfortLevel": "Comfort level",
            "presentationAnomalyPressure": "Anomaly pressure",
            "sectionBundleFiles": "Bundle Files",
            "primaryPreviewSlot": "Primary preview slot",
            "noHighlightedPois": "No highlighted POIs.",
            "noHighlightedLandmarks": "No highlighted landmarks.",
            "unknown": "unknown",
            "unknownPoi": "Unknown POI",
            "unknownLandmark": "Unknown Landmark",
            "unknownFaction": "Unknown faction",
            "unknownArchetype": "unknown archetype",
            "unknownType": "unknown type",
            "noHook": "No hook.",
            "noDescription": "No description.",
            "noDoctrine": "No doctrine.",
        },
    }
    translations_json = json.dumps(translations, ensure_ascii=False)
    map_observer_html, default_feature_id = _render_map_observer_html(world, showcase, world_state)
    default_feature_id_json = json.dumps(default_feature_id, ensure_ascii=False)

    poi_highlights = showcase.get("poi_highlights") or []
    poi_items = (
        "".join(
            f"<li><strong>{localized_value(item.get('fantasy_name'), 'unknownPoi')}</strong> "
            f"<span>{localized_value(item.get('fantasy_type'), 'unknownType')}</span><br>"
            f"<small>{localized_value(item.get('emotion_hook'), 'noHook')}</small></li>"
            for item in poi_highlights
        )
        if poi_highlights
        else '<li data-i18n="noHighlightedPois"></li>'
    )
    landmark_highlights = showcase.get("landmark_highlights") or []
    landmark_items = (
        "".join(
            f"<li><strong>{localized_value(item.get('name'), 'unknownLandmark')}</strong> "
            f"<span>{localized_value(item.get('type'), 'unknownType')}</span><br>"
            f"<small>{localized_value(item.get('description'), 'noDescription')}</small></li>"
            for item in landmark_highlights
        )
        if landmark_highlights
        else '<li data-i18n="noHighlightedLandmarks"></li>'
    )
    continuity_items: list[str] = [
        '<li><span data-i18n="continuityCounts"></span>: '
        f"{escape(str(continuity.get('memory_anchor_count') or 0))} / "
        f"{escape(str(continuity.get('historical_echo_count') or 0))} / "
        f"{escape(str(continuity.get('sprite_count') or 0))}</li>"
    ]
    for item in continuity.get("memory_threads") or []:
        linked = ", ".join(str(value) for value in (item.get("linked_pois") or []) if value)
        continuity_items.append(
            f'<li><strong><span data-i18n="continuityMemory"></span></strong>: '
            f"{localized_value(item.get('anchor_type'))} / {localized_value(item.get('tone'))} / {localized_value(item.get('visibility'))}"
            f"<br><small>{escape(linked) if linked else localized_value(None)}</small></li>"
        )
    for item in continuity.get("historical_threads") or []:
        continuity_items.append(
            f'<li><strong><span data-i18n="continuityEcho"></span></strong>: '
            f"{localized_value(item.get('source_type'))} / {localized_value(item.get('severity'))}"
            f"<br><small>{localized_value(item.get('summary'), 'noDescription')}</small></li>"
        )
    for item in continuity.get("sprite_signals") or []:
        drop_tags = ", ".join(str(value) for value in (item.get("drop_tags") or []) if value)
        detail = localized_value(item.get("linked_poi"))
        if drop_tags:
            detail = f"{detail} / {escape(drop_tags)}"
        continuity_items.append(
            f'<li><strong><span data-i18n="continuitySprite"></span></strong>: '
            f"{localized_value(item.get('species'))} / {localized_value(item.get('rarity'))}"
            f"<br><small>{detail}</small></li>"
        )
    continuity_html = "".join(continuity_items)
    playable_hook_items = (
        "".join(f"<li>{escape(str(item))}</li>" for item in playable_hooks)
        if playable_hooks
        else '<li data-i18n="noHook"></li>'
    )
    subtitle_html = f"<p>{escape(showcase.get('subtitle') or '')}</p>" if showcase.get("subtitle") else ""
    if showcase.get("narrative_summary"):
        narrative_html = f"<p>{escape(showcase.get('narrative_summary') or '')}</p>"
    else:
        narrative_html = '<p data-i18n="noNarrativeSummary"></p>'
    faction_html = ""
    if faction:
        faction_html = (
            '<section class="panel"><h2 data-i18n="sectionFaction"></h2>'
            f"<p><strong>{localized_value(faction.get('name'), 'unknownFaction')}</strong> "
            f"({localized_value(faction.get('archetype'), 'unknownArchetype')})</p>"
            f"<p>{localized_value(faction.get('doctrine'), 'noDoctrine')}</p>"
            f"<p><span data-i18n=\"factionInfluence\"></span>: {localized_value(faction.get('influence'))}</p></section>"
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
      .wrap {{ max-width: 1220px; margin: 0 auto; padding: 32px 20px 48px; }}
      .hero {{ padding: 24px; border-radius: 18px; background: linear-gradient(135deg, #1f2937, #111827); border: 1px solid #374151; }}
      .hero-top {{ display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }}
      .hero h1 {{ margin: 0 0 10px; font-size: 36px; }}
      .hero p {{ margin: 8px 0; line-height: 1.6; }}
      .language-switcher {{ min-width: 180px; display: flex; flex-direction: column; gap: 8px; }}
      .language-switcher label {{ font-size: 13px; color: #cbd5e1; }}
      .language-switcher select {{ border-radius: 10px; border: 1px solid #475569; background: #111827; color: #e5e7eb; padding: 10px 12px; font: inherit; }}
      .observer-stage {{ margin-top: 20px; }}
      .observer-header {{ display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 16px; }}
      .observer-header h2 {{ margin-bottom: 8px; }}
      .observer-header p {{ margin: 0; color: #cbd5e1; line-height: 1.5; max-width: 680px; }}
      .observer-layout {{ display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr); gap: 16px; }}
      .observer-legend {{ display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }}
      .legend-item {{ display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; background: #0f172a; border: 1px solid #334155; font-size: 12px; }}
      .legend-swatch {{ width: 10px; height: 10px; border-radius: 999px; display: inline-block; }}
      .legend-swatch.road {{ background: #7dd3fc; }}
      .legend-swatch.poi {{ background: #38bdf8; }}
      .legend-swatch.landmark {{ background: #fbbf24; }}
      .map-shell {{ background: linear-gradient(180deg, #0f172a, #111827); border: 1px solid #334155; border-radius: 18px; padding: 14px; }}
      #observer-map {{ width: 100%; height: auto; display: block; }}
      .map-backdrop {{ fill: #020617; stroke: #334155; stroke-width: 2; }}
      .map-road {{ fill: none; stroke: #67e8f9; stroke-opacity: 0.75; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }}
      .map-feature {{ cursor: pointer; outline: none; }}
      .map-feature text {{ fill: #0f172a; font-size: 10px; font-weight: 700; pointer-events: none; }}
      .map-poi circle {{ fill: #38bdf8; stroke: #e0f2fe; stroke-width: 2; transition: transform 0.15s ease, stroke-width 0.15s ease; }}
      .map-landmark rect {{ fill: #fbbf24; stroke: #fef3c7; stroke-width: 2; transition: transform 0.15s ease, stroke-width 0.15s ease; }}
      .map-feature.is-active circle, .map-feature:focus-visible circle {{ stroke-width: 4; transform: scale(1.08); transform-origin: center; transform-box: fill-box; }}
      .map-feature.is-active rect, .map-feature:focus-visible rect {{ stroke-width: 4; transform: scale(1.08); transform-origin: center; transform-box: fill-box; }}
      .map-note {{ margin: 12px 4px 0; color: #94a3b8; font-size: 13px; line-height: 1.5; }}
      .detail-panel {{ background: #0f172a; border: 1px solid #334155; border-radius: 18px; padding: 18px; }}
      .detail-panel h3 {{ margin-top: 0; margin-bottom: 14px; font-size: 18px; }}
      .detail-card {{ display: none; }}
      .detail-card.is-active {{ display: block; }}
      .detail-card h3 {{ margin: 0 0 8px; font-size: 22px; }}
      .detail-card p {{ margin: 8px 0; line-height: 1.6; }}
      .detail-kicker {{ margin: 0 0 8px; color: #93c5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }}
      .detail-list {{ padding-left: 18px; margin-top: 12px; }}
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
      @media (max-width: 720px) {{
        .hero-top {{ flex-direction: column; }}
        .language-switcher {{ min-width: 0; width: 100%; }}
        .observer-header {{ flex-direction: column; }}
        .observer-layout {{ grid-template-columns: 1fr; }}
        .observer-legend {{ justify-content: flex-start; }}
      }}
    </style>
  </head>
  <body>
    <div class=\"wrap\">
      <section class=\"hero\">
        <div class=\"hero-top\">
          <div>
            <h1 id=\"hero-title\"{' data-i18n="untitledDistrict"' if not showcase.get('title') else ''}>{escape(showcase.get('title') or '')}</h1>
            {subtitle_html}
            {narrative_html}
          </div>
          <div class=\"language-switcher\">
            <label for=\"language-select\" data-i18n=\"languageLabel\"></label>
            <select id=\"language-select\">
              <option value=\"zh-CN\">中文</option>
              <option value=\"en\">English</option>
            </select>
          </div>
        </div>
        <div class=\"meta\">
          <span class=\"tag\"><span data-i18n=\"tagWorld\"></span>: {localized_value(showcase.get('world_id'))}</span>
          <span class=\"tag\"><span data-i18n=\"tagTheme\"></span>: {localized_value(summary.get('theme'))}</span>
          <span class=\"tag\"><span data-i18n=\"tagAtmosphere\"></span>: {localized_value(summary.get('atmosphere'))}</span>
          <span class=\"tag\"><span data-i18n=\"tagBundleVersion\"></span>{escape(str(manifest.get('bundle_version') or '0'))}</span>
        </div>
      </section>

      {map_observer_html}

      <div class=\"grid\">
        <section class=\"panel\" id=\"section-reality\">
          <h2 data-i18n=\"sectionReality\"></h2>
          <ul>
            <li><span data-i18n=\"realityProvider\"></span>: {localized_value(reality.get('provider'))}</li>
            <li><span data-i18n=\"realityCoordinates\"></span>: {localized_value(f"{reality.get('lat')}, {reality.get('lon')}" if reality.get('lat') is not None and reality.get('lon') is not None else None)}</li>
            <li><span data-i18n=\"realityRadius\"></span>: {localized_value(reality.get('radius_m'))}</li>
            <li><span data-i18n=\"realityLanduse\"></span>: {localized_value(reality.get('dominant_landuse'))}</li>
            <li><span data-i18n=\"realitySourceElements\"></span>: {localized_value(reality.get('source_element_count'))}</li>
            <li><span data-i18n=\"realityMappedPois\"></span>: {localized_value(reality.get('mapped_poi_count'))}</li>
            <li><span data-i18n=\"realityRoads\"></span>: {localized_value(reality.get('road_count'))}</li>
          </ul>
        </section>
        <section class=\"panel\" id=\"section-world-state\">
          <h2 data-i18n=\"sectionWorldState\"></h2>
          <ul>
            <li><span data-i18n=\"stateDominantFaction\"></span>: {localized_value(world_state.get('dominant_faction'), 'unknownFaction')}</li>
            <li><span data-i18n=\"stateControlScore\"></span>: {localized_value(world_state.get('control_score'))}</li>
            <li><span data-i18n=\"stateStrategicValue\"></span>: {localized_value(world_state.get('strategic_value'))}</li>
            <li><span data-i18n=\"stateSocialTension\"></span>: {localized_value(world_state.get('social_tension'))}</li>
            <li><span data-i18n=\"stateCommerceFlux\"></span>: {localized_value(world_state.get('commerce_flux'))}</li>
            <li><span data-i18n=\"stateDisturbance\"></span>: {localized_value(world_state.get('disturbance_level'))}</li>
            <li><span data-i18n=\"stateAnomalyPressure\"></span>: {localized_value(world_state.get('anomaly_pressure'))}</li>
            <li><span data-i18n=\"stateActiveLens\"></span>: {localized_value(world_state.get('active_lens'))}</li>
            <li><span data-i18n=\"stateSpawnWindow\"></span>: {localized_value(world_state.get('spawn_window'))}</li>
            <li><span data-i18n=\"stateVisitStatus\"></span>: {localized_value(world_state.get('visit_status'))}</li>
            <li><span data-i18n=\"stateMysteryProgress\"></span>: {localized_value(world_state.get('mystery_progress'))}</li>
          </ul>
        </section>
        {faction_html}
        <section class=\"panel\" id=\"section-continuity\">
          <h2 data-i18n=\"sectionContinuity\"></h2>
          <ul>{continuity_html}</ul>
        </section>
        <section class=\"panel\">
          <h2 data-i18n=\"sectionPoiHighlights\"></h2>
          <ul>{poi_items}</ul>
        </section>
        <section class=\"panel\">
          <h2 data-i18n=\"sectionLandmarkHooks\"></h2>
          <ul>{landmark_items}</ul>
        </section>
        <section class=\"panel\" id=\"section-playable-hooks\">
          <h2 data-i18n=\"sectionPlayableHooks\"></h2>
          <ul>{playable_hook_items}</ul>
        </section>
        <section class=\"panel\">
          <h2 data-i18n=\"sectionPresentation\"></h2>
          <ul>
            <li><span data-i18n=\"presentationVisualStyle\"></span>: {localized_value(hooks.get('visual_style'))}</li>
            <li><span data-i18n=\"presentationPaletteHint\"></span>: {localized_value(hooks.get('palette_hint'))}</li>
            <li><span data-i18n=\"presentationComfortLevel\"></span>: {localized_value(hooks.get('comfort_level'))}</li>
            <li><span data-i18n=\"presentationAnomalyPressure\"></span>: {localized_value(hooks.get('anomaly_pressure'))}</li>
          </ul>
        </section>
      </div>

      <section class=\"panel links\" style=\"margin-top:20px;\">
        <h2 data-i18n=\"sectionBundleFiles\"></h2>
        <p>
          <a href=\"world.json\">world.json</a>
          <a href=\"summary.json\">summary.json</a>
          <a href=\"showcase.json\">showcase.json</a>
          <a href=\"showcase.md\">showcase.md</a>
          <a href=\"manifest.json\">manifest.json</a>
        </p>
        <p><small><span data-i18n=\"primaryPreviewSlot\"></span>: <code>{escape(manifest.get('entrypoints', {}).get('primary_preview') or 'index.html')}</code></small></p>
      </section>
    </div>
    <script>
      const translations = {translations_json};
      const defaultFeatureId = {default_feature_id_json};
      const languageSelect = document.getElementById("language-select");
      const heroTitle = document.getElementById("hero-title");
      const mapFeatures = Array.from(document.querySelectorAll("[data-feature-id]"));
      const detailCards = Array.from(document.querySelectorAll("[data-feature-card]"));

      function normalizeLanguage(value) {{
        if (!value) {{
          return "";
        }}
        return String(value).toLowerCase().startsWith("zh") ? "zh-CN" : "en";
      }}

      function readStoredLanguage() {{
        try {{
          return window.localStorage.getItem("fablemap-language") || "";
        }} catch (error) {{
          return "";
        }}
      }}

      function writeStoredLanguage(language) {{
        try {{
          window.localStorage.setItem("fablemap-language", language);
        }} catch (error) {{
          // Ignore storage failures for local preview files.
        }}
      }}

      function detectInitialLanguage() {{
        const params = new URLSearchParams(window.location.search);
        return (
          normalizeLanguage(params.get("lang")) ||
          normalizeLanguage(readStoredLanguage()) ||
          normalizeLanguage(window.navigator.language) ||
          "en"
        );
      }}

      let currentLanguage = detectInitialLanguage();

      function t(key) {{
        return translations[currentLanguage][key] || translations.en[key] || key;
      }}

      function updateUrlLanguage() {{
        try {{
          const url = new URL(window.location.href);
          url.searchParams.set("lang", currentLanguage);
          window.history.replaceState(null, "", url);
        }} catch (error) {{
          // Ignore URL rewriting failures in restricted contexts.
        }}
      }}

      function setActiveFeature(featureId) {{
        const resolvedFeatureId = detailCards.some((card) => card.dataset.featureCard === featureId)
          ? featureId
          : "map-overview";
        mapFeatures.forEach((node) => {{
          const isActive = node.dataset.featureId === resolvedFeatureId;
          node.classList.toggle("is-active", isActive);
          node.setAttribute("aria-pressed", isActive ? "true" : "false");
        }});
        detailCards.forEach((card) => {{
          card.classList.toggle("is-active", card.dataset.featureCard === resolvedFeatureId);
        }});
      }}

      function applyLanguage() {{
        document.documentElement.lang = currentLanguage;
        languageSelect.value = currentLanguage;
        document.querySelectorAll("[data-i18n]").forEach((node) => {{
          node.textContent = t(node.dataset.i18n);
        }});
        const visibleTitle = heroTitle.textContent.trim() || t("untitledDistrict");
        document.title = `${{visibleTitle}} · ${{t("pageTitleSuffix")}}`;
      }}

      languageSelect.addEventListener("change", (event) => {{
        currentLanguage = normalizeLanguage(event.target.value) || "en";
        writeStoredLanguage(currentLanguage);
        updateUrlLanguage();
        applyLanguage();
      }});

      mapFeatures.forEach((node) => {{
        node.addEventListener("click", () => {{
          setActiveFeature(node.dataset.featureId);
        }});
        node.addEventListener("keydown", (event) => {{
          if (event.key === "Enter" || event.key === " ") {{
            event.preventDefault();
            setActiveFeature(node.dataset.featureId);
          }}
        }});
      }});

      updateUrlLanguage();
      setActiveFeature(defaultFeatureId);
      applyLanguage();
    </script>
  </body>
</html>
"""


if __name__ == "__main__":
    raise SystemExit(main())