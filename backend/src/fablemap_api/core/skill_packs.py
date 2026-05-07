"""Tavern Skill Packs — explicit owner-enabled NPC capability bundles."""

from __future__ import annotations

from copy import deepcopy
from typing import Any


LOCAL_RUMOR_SKILL_PACK_ID = "local-rumor"

_SKILL_PACK_DEFINITIONS: tuple[dict[str, Any], ...] = (
    {
        "id": LOCAL_RUMOR_SKILL_PACK_ID,
        "label": "环境传闻",
        "description": "允许 NPC 在合适时机提及已有邻里传闻，帮助访客发现附近空间。",
        "category": "discovery",
        "default_enabled": False,
        "capabilities": [
            "Read existing NeighborhoodRumor records for this tavern.",
            "Mention at most a few ambient nearby tavern rumors when the visitor asks about rumors or nearby places.",
            "Treat rumors as optional discovery hints, not authoritative canon.",
        ],
        "prompt_notes": [
            "传闻只是环境建议，不是正史。",
            "没有给定传闻时不要编造目标空间或事实。",
        "不要写入记忆、状态卡或角色设定。",
        ],
        "config_schema": {
            "limit": {"type": "integer", "minimum": 1, "maximum": 5, "default": 3},
        },
    },
)

_SKILL_PACK_IDS = {definition["id"] for definition in _SKILL_PACK_DEFINITIONS}


def available_skill_pack_definitions() -> list[dict[str, Any]]:
    """Return public, owner-readable metadata for all supported skill packs."""

    return [deepcopy(definition) for definition in _SKILL_PACK_DEFINITIONS]


def skill_pack_ids() -> set[str]:
    return set(_SKILL_PACK_IDS)


def validate_skill_pack_ids(value: Any) -> None:
    """Raise ValueError if an explicit payload references unknown pack ids."""

    unknown: list[str] = []
    for item in _iter_skill_pack_items(value):
        pack_id = str(item.get("id") or item.get("pack_id") or "").strip()
        if pack_id and pack_id not in _SKILL_PACK_IDS:
            unknown.append(pack_id)
    if unknown:
        raise ValueError(f"未知技能包：{', '.join(sorted(set(unknown)))}")


def normalize_skill_pack_settings(value: Any) -> list[dict[str, Any]]:
    """Normalize persisted owner settings, dropping unknown packs safely."""

    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in _iter_skill_pack_items(value):
        pack_id = str(item.get("id") or item.get("pack_id") or "").strip()
        if pack_id not in _SKILL_PACK_IDS or pack_id in seen:
            continue
        seen.add(pack_id)
        result.append(
            {
                "id": pack_id,
                "enabled": _normalize_bool(item.get("enabled", False)),
                "config": _normalize_skill_pack_config(pack_id, item.get("config")),
            }
        )
    return result


def merged_skill_pack_settings(value: Any) -> list[dict[str, Any]]:
    """Return one setting row per supported pack, applying safe disabled defaults."""

    current = {item["id"]: item for item in normalize_skill_pack_settings(value)}
    merged: list[dict[str, Any]] = []
    for definition in _SKILL_PACK_DEFINITIONS:
        pack_id = definition["id"]
        if pack_id in current:
            merged.append(deepcopy(current[pack_id]))
            continue
        merged.append(
            {
                "id": pack_id,
                "enabled": bool(definition.get("default_enabled", False)),
                "config": _normalize_skill_pack_config(pack_id, {}),
            }
        )
    return merged


def is_skill_pack_enabled(settings: Any, pack_id: str) -> bool:
    for item in normalize_skill_pack_settings(settings):
        if item["id"] == pack_id:
            return bool(item.get("enabled"))
    return False


def build_local_rumor_prompt_block(rumors: list[dict[str, Any]] | None, *, limit: int = 3) -> str:
    """Build a runtime prompt block for the local-rumor pack.

    The wording deliberately marks rumor context as non-canon and forbids durable
    writes. This keeps the capability useful without silently altering tavern
    state, character cards, memory, or State Cards.
    """

    safe_limit = max(1, min(_safe_int(limit, 3), 5))
    lines = [
        "【空间技能包：邻里传闻 / local-rumor】",
        "你可以在访客询问附近、推荐、传闻、别的空间时，简短提及下面已有传闻。",
        "这些传闻只是环境建议，不是正史；不要写入记忆、状态卡、角色设定或空间事实。",
        "没有给定传闻时，不要编造目标空间、现实地点或事实。",
    ]
    normalized = _normalize_rumors(rumors or [], safe_limit)
    if not normalized:
        lines.append("当前没有可分享的邻里传闻。")
        return "\n".join(lines)

    lines.append("可用传闻：")
    for index, rumor in enumerate(normalized, start=1):
        target_name = rumor.get("target_tavern_name") or rumor.get("target_tavern_id") or "附近空间"
        rumor_text = rumor.get("rumor_text") or "有旅人提起过那里。"
        lines.append(f"{index}. {target_name}：{rumor_text}")
    return "\n".join(lines)


def _iter_skill_pack_items(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, dict):
        if isinstance(value.get("skill_packs"), list):
            return [item for item in value["skill_packs"] if isinstance(item, dict)]
        if isinstance(value.get("packs"), list):
            return [item for item in value["packs"] if isinstance(item, dict)]
        enabled_ids = value.get("enabled_pack_ids")
        if isinstance(enabled_ids, list):
            return [{"id": item, "enabled": True} for item in enabled_ids]
        return [
            {"id": key, "enabled": item}
            for key, item in value.items()
            if isinstance(key, str) and key in _SKILL_PACK_IDS
        ]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    return []


def _normalize_skill_pack_config(pack_id: str, value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        value = {}
    if pack_id == LOCAL_RUMOR_SKILL_PACK_ID:
        limit = _safe_int(value.get("limit"), 3)
        if limit < 1 or limit > 5:
            limit = 3
        return {"limit": limit}
    return {}


def _normalize_rumors(value: list[dict[str, Any]], limit: int) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        target_tavern_id = str(item.get("target_tavern_id") or "").strip()
        target_tavern_name = str(item.get("target_tavern_name") or "").strip()[:80]
        rumor_text = str(item.get("rumor_text") or "").strip()[:240]
        if not (target_tavern_id or target_tavern_name or rumor_text):
            continue
        result.append(
            {
                "target_tavern_id": target_tavern_id,
                "target_tavern_name": target_tavern_name,
                "rumor_text": rumor_text,
            }
        )
        if len(result) >= limit:
            break
    return result


def _normalize_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on", "enabled", "启用", "是"}
    return bool(value)


def _safe_int(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback
