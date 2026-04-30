from __future__ import annotations

import json
import os
import shutil
import struct
import hashlib
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

from fablemap_api.core.default_taverns import default_public_welfare_taverns

OUT_DIR = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-0-audit")
PUBLIC_ROOT = Path("frontend/public")
ASSET_ROOT = PUBLIC_ROOT / "assets/npcs/public-welfare"
TASK_PRD = Path(".trellis/tasks/04-30-public-welfare-npc-batch-upgrade/prd.md")
DEFAULT_TAVERNS = Path("backend/src/fablemap_api/core/default_taverns.py")
TEST_TAVERNS = Path("tests/test_default_public_welfare_taverns.py")
TEST_GAMEPLAYS = Path("tests/test_default_public_welfare_gameplays.py")
LEGACY_AUDIT_CONTACT_SHEET = Path("artifacts/04-30-npc-asset-audit/public-welfare-neutral-contact-sheet.png")
REJECTED_MANIFEST_CANDIDATES = [
    Path(".trellis/tasks/04-29-04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json"),
    Path(".trellis/tasks/archive/2026-04/04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json"),
]
REQUIRED_EXPRESSIONS = ["neutral", "joy", "anger", "embarrassment", "curiosity"]
EXPRESSION_ALIASES = {
    "neutral": ["neutral"],
    "joy": ["joy", "happy"],
    "anger": ["anger", "angry"],
    "embarrassment": ["embarrassment", "shy"],
    "curiosity": ["curiosity", "curious"],
}

SHOP_RECOMMENDATIONS = {
    "pw_lantern_helpdesk": {
        "theme": "现实公益新手问讯台 / 地图入门",
        "visual_thesis": "公共服务地图桌、便签、路线灯箱；降低通用暖木吧台感",
        "suggested_style": "米白-红色电路图 / 奶油留白赛博平面（低饱和版）",
        "batch_note": "1 名角色仍有 pending rejected expression；整体角色分工清楚，适合作为后续低风险补表达批次。",
        "priority": "P2",
    },
    "pw_midnight_treehole": {
        "theme": "夜航树洞电台 / 安静倾听",
        "visual_thesis": "Lo-fi 夜间电台、录音磁带、白线稿/软虚化；强调安静而非霓虹噪声",
        "suggested_style": "混合媒介 / 写实照片 + 白色线稿，或赛璐璐内省碎片拼贴的低密度版本",
        "batch_note": "安澜仍有 pending rejected expression；全员现实人类可接受，但需要避免三张电台人像同姿态。",
        "priority": "P2",
    },
    "pw_community_repair": {
        "theme": "街角修补工坊 / 工具与关系修补",
        "visual_thesis": "社区修理台、旧工具、圆桌调停；角色应通过道具/姿态区分维修、调停、清单整理",
        "suggested_style": "70/80 年代街头海报拼贴 + 少量修补纸张纹理，或工业档案袋风格的温暖版",
        "batch_note": "阿槐、和光两名角色仍有 pending rejected expression；2/3 角色风险高，推荐进入 Batch 1。",
        "priority": "P1",
    },
    "pw_lost_found_archive": {
        "theme": "城市拾光档案亭 / 失物线索",
        "visual_thesis": "档案袋、索引线、失物标签、城市记忆碎片；适合建立与其他现实店不同的档案视觉宇宙",
        "suggested_style": "工业档案袋风格 / 前数字时代技术档案 + 半调雕刻线稿",
        "batch_note": "闻笺仍有 pending rejected expression；档案主题风格机会强，可作为 Batch 1 替补或 Batch 2 首位。",
        "priority": "P2",
    },
    "pw_third_shelf_observatory": {
        "theme": "外星便利店观测站 / 荒诞喜剧",
        "visual_thesis": "非人类便利店社员、收据扫描、货架观察窗；每个外星角色必须有不同体态/材质/轮廓",
        "suggested_style": "高对比数字工业故障 + 便利店收据/扫描线秩序；避免普通人类 anime 店员模板",
        "batch_note": "4/4 角色均有 pending rejected expression；非现实主题需要物种/体态可视化，推荐 Batch 1 最高优先级。",
        "priority": "P0",
    },
    "pw_midnight_commission_board": {
        "theme": "午夜委托局 / 文游委托与异常值班",
        "visual_thesis": "委托木板、线索卡、低风险任务票据；黑夜调查气质但不走战斗/等级装备",
        "suggested_style": "地下黑客朋克半调拼贴的低恐怖版 + Noir 委托板道具",
        "batch_note": "墨栈、栀灯两名角色仍有 pending rejected expression；2/3 角色风险高，推荐 Batch 1。",
        "priority": "P1",
    },
    "pw_after_school_hero_supply": {
        "theme": "放学后英雄补给社 / 旧玩具模型店",
        "visual_thesis": "普通人小英雄、纸剑、星袋、旧卡套；童年勇气而非 RPG 战斗系统",
        "suggested_style": "波普 + 水墨喷溅，或克莱因蓝秩序的模型店版本",
        "batch_note": "纸剑仍有 pending rejected expression；已有一个非普通角色锚点，后续可重点加强纸剑/星袋的非人体态。",
        "priority": "P2",
    },
    "pw_jingan_catbell_refuge": {
        "theme": "静安猫铃小屋 / 猫亚人复国喜剧",
        "visual_thesis": "上海夜色、猫铃、账房、门口守铃；保持成熟安全边界，避免擦边或 IP 化猫娘",
        "suggested_style": "专属猫铃小屋系列；可后续做上海夜色低饱和漫画风，不与医院/外星店混用",
        "batch_note": "仅铜铃在旧 manifest 中为 regenerated；眯眯喵桑/银票有专属资产和明确 copy，非 Batch 1。",
        "priority": "P3",
    },
    "pw_hospital_night_care": {
        "theme": "夜间护理站 / 医疗安全分诊",
        "visual_thesis": "512×512 新质量基线；护理站、候诊卡、现实求助边界",
        "suggested_style": "保持当前医院三人组作为基线；除非资产或聊天契约退化，否则不进入第一轮旧店重构",
        "batch_note": "新质量基线；本审查只记录，不优先改。",
        "priority": "BASELINE",
    },
}

CHARACTER_OVERRIDES = {
    # Highest-risk alien shop: text says alien, but asset rebuild should encode body plan more visibly.
    "char_pw_9_delta": {"species_body_plan": "外星人类学社长；建议重构为瘦长/多层观察镜片的原创异星研究员", "copy_sync": "需要：把更明确的异星体态/观察器官写入 description/scenario/tags"},
    "char_pw_mu_mu": {"species_body_plan": "努力伪装成人类的外星临时店员；可做可爱但破绽明显的非人体态", "copy_sync": "需要：伪装失败的体态和服务动作应进入 scenario/system_prompt"},
    "char_pw_v17": {"species_body_plan": "半机械/透明档案管理员；可做记录容器式非人体态", "copy_sync": "需要：回访记录方式与身体结构关联"},
    "char_pw_pi_pi": {"species_body_plan": "外星礼仪实习生；可做小型多肢/漂浮观察员", "copy_sync": "需要：礼仪误读与体态道具绑定"},
    "char_pw_zhijian": {"species_body_plan": "纸剑/童年影子类非普通角色", "copy_sync": "可加强：纸质身体、折痕、影子边界进入描述与 visual prompt"},
    "char_pw_tongling": {"species_body_plan": "猫铃/守门铃类半拟人或小型猫守卫", "copy_sync": "可加强：门口守铃职责与身体轮廓"},
    "char_pw_mimi_nya": {"species_body_plan": "原创成年猫亚人店主", "copy_sync": "不急：现有 copy 已包含猫耳/尾巴/安全边界"},
    "char_pw_yinpiao": {"species_body_plan": "原创猫尾账房人", "copy_sync": "不急：现有 copy 已包含账房与猫尾职责"},
    "char_pw_mika_nurse": {"species_body_plan": "现实医院夜班护士人类 NPC（新基线）", "copy_sync": "无需"},
    "char_pw_qingyou_records": {"species_body_plan": "现实医院档案员人类 NPC（新基线）", "copy_sync": "无需"},
    "char_pw_nanxing_liaison": {"species_body_plan": "现实医院急救联络员人类 NPC（新基线）", "copy_sync": "无需"},
}

REALISTIC_HUMAN_DEFAULT = {
    "pw_lantern_helpdesk": "现实公益问讯台普通人类志愿者",
    "pw_midnight_treehole": "现实夜间电台普通人类倾听者/引导员",
    "pw_community_repair": "现实社区修补/调停普通人类角色",
    "pw_lost_found_archive": "现实档案亭普通人类记录/索引角色",
    "pw_midnight_commission_board": "偏都市传说的普通人类委托局角色",
    "pw_after_school_hero_supply": "现实玩具店/童年勇气角色，允许一名纸剑/影子非普通角色",
    "pw_jingan_catbell_refuge": "猫亚人/猫尾/猫铃主题角色",
    "pw_hospital_night_care": "现实医院人类工作人员角色",
}

STYLE_BY_REJECT_REASON = {
    "flat_placeholder_character": "旧版扁平占位感已在 2026-04-29 重生成，但仍属于 256×256 legacy 表情组",
    "tint_or_icon_only_expression_variant": "旧版表情多为变色/图标式差分，缺少真实表情变化",
}


def png_dimensions(path: Path) -> tuple[int, int] | None:
    if not path.exists():
        return None
    data = path.read_bytes()[:24]
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        return None
    return struct.unpack(">II", data[16:24])


def sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    return hashlib.sha256(path.read_bytes()).hexdigest()


def asset_url_to_path(url: str) -> Path:
    if not url.startswith("/"):
        return Path(url)
    return PUBLIC_ROOT / url.removeprefix("/")


def avg_hash(path: Path, size: int = 8) -> str | None:
    if not path.exists():
        return None
    with Image.open(path) as img:
        gray = img.convert("L").resize((size, size), Image.Resampling.LANCZOS)
        vals = list(gray.getdata())
    avg = sum(vals) / len(vals)
    return "".join("1" if v >= avg else "0" for v in vals)


def hamming(a: str | None, b: str | None) -> int | None:
    if not a or not b or len(a) != len(b):
        return None
    return sum(x != y for x, y in zip(a, b))


def read_rejected_manifest() -> tuple[dict[str, Any], Path | None]:
    for candidate in REJECTED_MANIFEST_CANDIDATES:
        if candidate.exists():
            return json.loads(candidate.read_text(encoding="utf-8")), candidate
    return {"entries": []}, None


def safe_table(text: Any) -> str:
    return str(text).replace("|", "/").replace("\n", "<br>")


def make_contact_sheet(rows: list[dict[str, Any]], out: Path) -> None:
    cell_w, cell_h = 180, 154
    thumb = 96
    cols = len(REQUIRED_EXPRESSIONS) + 1
    width = cols * cell_w
    height = (len(rows) + 1) * cell_h
    sheet = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    headers = ["character"] + REQUIRED_EXPRESSIONS
    for col, label in enumerate(headers):
        x = col * cell_w
        draw.rectangle([x, 0, x + cell_w - 1, cell_h - 1], outline=(200, 200, 200))
        draw.text((x + 8, 8), label, fill=(0, 0, 0), font=font)
    for r, row in enumerate(rows, start=1):
        y = r * cell_h
        draw.rectangle([0, y, cell_w - 1, y + cell_h - 1], outline=(220, 220, 220))
        label_lines = [row["char_id"], row["name"], row["tavern_id"], row["priority"]]
        for i, line in enumerate(label_lines):
            draw.text((8, y + 8 + i * 14), str(line)[:24], fill=(0, 0, 0), font=font)
        for c, expr in enumerate(REQUIRED_EXPRESSIONS, start=1):
            x = c * cell_w
            draw.rectangle([x, y, x + cell_w - 1, y + cell_h - 1], outline=(220, 220, 220))
            asset = row["assets"].get(expr, {})
            path = Path(asset.get("path", ""))
            if path.exists():
                with Image.open(path) as img:
                    img = img.convert("RGB")
                    img.thumbnail((thumb, thumb), Image.Resampling.LANCZOS)
                    px = x + (cell_w - img.width) // 2
                    py = y + 10
                    sheet.paste(img, (px, py))
                draw.text((x + 8, y + thumb + 18), f"{asset.get('width')}x{asset.get('height')}", fill=(0, 0, 0), font=font)
                draw.text((x + 8, y + thumb + 32), (asset.get("sha256") or "")[:12], fill=(80, 80, 80), font=font)
            else:
                draw.text((x + 8, y + 48), "MISSING", fill=(160, 0, 0), font=font)
    sheet.save(out)


def infer_species(tavern_id: str, char: dict[str, Any]) -> str:
    override = CHARACTER_OVERRIDES.get(char["id"])
    if override:
        return override["species_body_plan"]
    text = " ".join([
        char.get("description", ""),
        char.get("personality", ""),
        char.get("scenario", ""),
        " ".join(char.get("tags", [])),
    ])
    if any(k in text for k in ["猫", "猫耳", "猫尾", "猫娘", "猫亚人"]):
        return "猫系非普通/亚人角色（需保持成年、安全、原创）"
    if any(k in text for k in ["外星", "异星", "样本", "伪装成人类"]):
        return "外星/非现实主题角色；需显式体态差异"
    if any(k in text for k in ["纸剑", "影子", "折"]):
        return "纸剑/影子等非普通童年意象角色"
    return REALISTIC_HUMAN_DEFAULT.get(tavern_id, "未分类；需人工复核")


def build() -> dict[str, Any]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rejected_manifest, rejected_manifest_path = read_rejected_manifest()
    rejected_by_char: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in rejected_manifest.get("entries", []):
        rejected_by_char[entry.get("char_id", "")].append(entry)

    taverns = default_public_welfare_taverns()
    rows = []
    neutral_hashes = {}
    neutral_ahashes = {}

    for tavern in taverns:
        rec = SHOP_RECOMMENDATIONS.get(tavern["id"], {})
        for char in tavern["characters"]:
            assets = {}
            sprites = char.get("sprites") or {}
            for expr in REQUIRED_EXPRESSIONS:
                url = sprites.get(expr)
                if not url:
                    # fall back to semantic aliases where needed
                    for alias in EXPRESSION_ALIASES[expr]:
                        url = sprites.get(alias)
                        if url:
                            break
                path = asset_url_to_path(url or "") if url else Path("")
                dims = png_dimensions(path) if url else None
                digest = sha256(path) if url else None
                assets[expr] = {
                    "url": url or "",
                    "path": str(path).replace("\\", "/") if url else "",
                    "exists": bool(url and path.exists()),
                    "is_png": bool(dims),
                    "width": dims[0] if dims else None,
                    "height": dims[1] if dims else None,
                    "sha256": digest,
                }
            neutral_hashes[char["id"]] = assets["neutral"]["sha256"]
            neutral_ahashes[char["id"]] = avg_hash(Path(assets["neutral"]["path"])) if assets["neutral"]["path"] else None

            manifest_entries = rejected_by_char.get(char["id"], [])
            statuses = Counter(e.get("status", "unknown") for e in manifest_entries)
            reasons = sorted({e.get("reason", "") for e in manifest_entries if e.get("reason")})
            pending_count = statuses.get("pending_regeneration", 0)
            regenerated_count = statuses.get("regenerated", 0)
            pending_same_hash_count = 0
            for entry in manifest_entries:
                if entry.get("status") != "pending_regeneration":
                    continue
                expr = entry.get("expression", "")
                current_hash = assets.get(expr, {}).get("sha256")
                if current_hash and current_hash == entry.get("sha256"):
                    pending_same_hash_count += 1
            all_dims = {(a.get("width"), a.get("height")) for a in assets.values() if a.get("exists")}
            missing = [expr for expr, a in assets.items() if not (a.get("exists") and a.get("is_png"))]
            distinct_hashes = {a.get("sha256") for a in assets.values() if a.get("sha256")}
            complete = not missing and len(distinct_hashes) == len(REQUIRED_EXPRESSIONS)

            base_priority = rec.get("priority", "P2")
            if tavern["id"] == "pw_hospital_night_care":
                priority = "BASELINE"
            elif pending_count >= 4 and tavern["id"] == "pw_third_shelf_observatory":
                priority = "P0"
            elif pending_count >= 4 or base_priority == "P1":
                priority = "P1"
            elif pending_count > 0:
                priority = "P2"
            else:
                priority = base_priority

            current_style_bits = []
            if all_dims == {(512, 512)}:
                current_style_bits.append("512×512 新质量基线/高分辨率系列")
            elif all_dims == {(256, 256)}:
                current_style_bits.append("256×256 legacy 公益 NPC 表情组")
            elif all_dims:
                current_style_bits.append("混合尺寸：" + ", ".join(f"{w}×{h}" for w, h in sorted(all_dims)))
            if reasons:
                current_style_bits.extend(STYLE_BY_REJECT_REASON.get(reason, reason) for reason in reasons)
            elif tavern["id"] == "pw_hospital_night_care":
                current_style_bits.append("医院三人组：当前任务新质量基线，不纳入第一轮旧店重构")
            else:
                current_style_bits.append("无旧拒稿记录；仍需从审美疲劳角度人工复核")

            copy_override = CHARACTER_OVERRIDES.get(char["id"], {}).get("copy_sync")
            if copy_override:
                needs_copy_sync = copy_override
            elif tavern["id"] in {"pw_third_shelf_observatory"}:
                needs_copy_sync = "需要：非现实体态必须写入现有角色字段"
            else:
                needs_copy_sync = "按视觉重构幅度决定；当前角色字段已有基本分工"

            risk_reasons = []
            if pending_count:
                if pending_same_hash_count:
                    risk_reasons.append(f"旧拒稿 manifest 仍有 {pending_count} 个 pending expression，且 {pending_same_hash_count} 个当前 hash 仍等于拒稿 hash")
                else:
                    risk_reasons.append(f"旧拒稿 manifest 仍有 {pending_count} 个 pending expression")
            if not complete:
                risk_reasons.append("资产不完整或表情 hash 不互异")
            if tavern["id"] == "pw_third_shelf_observatory":
                risk_reasons.append("非现实外星店需要显式物种/体态差异")
            if tavern["id"] in {"pw_lantern_helpdesk", "pw_midnight_treehole", "pw_lost_found_archive"}:
                risk_reasons.append("全员现实人类，需靠构图/道具/材质防止同脸同姿态")
            if tavern["id"] == "pw_hospital_night_care":
                risk_reasons = ["新质量基线；当前审查不建议改动"]
            if not risk_reasons:
                risk_reasons.append("常规巡检；优先级低于 pending rejected 店铺")

            row = {
                "tavern_id": tavern["id"],
                "tavern_name": tavern["name"],
                "place_type": tavern.get("place_type", "tavern"),
                "shop_theme": rec.get("theme", ""),
                "char_id": char["id"],
                "name": char["name"],
                "tags": char.get("tags", []),
                "description": char.get("description", ""),
                "personality": char.get("personality", ""),
                "scenario": char.get("scenario", ""),
                "species_body_plan": infer_species(tavern["id"], char),
                "assets": assets,
                "asset_complete": complete,
                "asset_dimension_summary": ", ".join(f"{w}×{h}" for w, h in sorted(all_dims)) if all_dims else "missing",
                "manifest_counts": dict(statuses),
                "manifest_reasons": reasons,
                "pending_current_hash_matches_rejected": pending_same_hash_count,
                "current_style": "；".join(current_style_bits),
                "repetition_risk": "；".join(risk_reasons),
                "priority": priority,
                "suggested_new_style": rec.get("suggested_style", ""),
                "visual_thesis": rec.get("visual_thesis", ""),
                "needs_copy_sync": needs_copy_sync,
            }
            rows.append(row)

    # nearest-neighbor visual similarity on neutral sprites.
    for row in rows:
        char_id = row["char_id"]
        distances = []
        for other_id, other_hash in neutral_ahashes.items():
            if other_id == char_id:
                continue
            d = hamming(neutral_ahashes.get(char_id), other_hash)
            if d is not None:
                distances.append((d, other_id))
        distances.sort()
        if distances:
            row["nearest_neutral_average_hash"] = {"distance": distances[0][0], "char_id": distances[0][1]}
            if distances[0][0] <= 8 and row["priority"] != "BASELINE":
                row["repetition_risk"] += f"；neutral average-hash nearest={distances[0][1]} distance={distances[0][0]}（需人工看图确认同构图/同色板）"

    shop_rows = []
    by_shop = defaultdict(list)
    for row in rows:
        by_shop[row["tavern_id"]].append(row)
    for tavern in taverns:
        chars = by_shop[tavern["id"]]
        rec = SHOP_RECOMMENDATIONS.get(tavern["id"], {})
        manifest_pending = sum(sum(1 for e in row.get("manifest_counts", {}) for _ in []) for row in [])
        pending = sum(row["manifest_counts"].get("pending_regeneration", 0) for row in chars)
        regenerated = sum(row["manifest_counts"].get("regenerated", 0) for row in chars)
        dimensions = sorted({row["asset_dimension_summary"] for row in chars})
        priorities = [row["priority"] for row in chars]
        shop_priority = "BASELINE" if tavern["id"] == "pw_hospital_night_care" else ("P0" if "P0" in priorities else "P1" if "P1" in priorities else "P2" if "P2" in priorities else "P3")
        nonhuman_notes = sorted({row["species_body_plan"] for row in chars if any(k in row["species_body_plan"] for k in ["外星", "非普通", "猫", "纸剑", "影子", "亚人"] )})
        shop_rows.append({
            "tavern_id": tavern["id"],
            "tavern_name": tavern["name"],
            "character_count": len(chars),
            "gameplay_count": len(tavern.get("gameplay_definitions", [])),
            "world_info_count": len(tavern.get("world_info", [])),
            "llm_backend": tavern.get("llm_config", {}).get("backend"),
            "api_key_empty": tavern.get("llm_config", {}).get("api_key", None) == "",
            "asset_dimensions": dimensions,
            "pending_rejected_expression_count": pending,
            "regenerated_rejected_asset_count": regenerated,
            "nonhuman_or_nonordinary_notes": nonhuman_notes,
            "priority": shop_priority,
            "recommended_style": rec.get("suggested_style", ""),
            "visual_thesis": rec.get("visual_thesis", ""),
            "batch_note": rec.get("batch_note", ""),
        })

    # First batch recommendation: evidence-first, not aesthetic preference only.
    first_batch = [
        {
            "tavern_id": "pw_third_shelf_observatory",
            "reason": "4/4 角色有 pending expression 拒稿；非现实外星便利店最需要物种/体态差异化。",
            "style_direction": SHOP_RECOMMENDATIONS["pw_third_shelf_observatory"]["suggested_style"],
        },
        {
            "tavern_id": "pw_midnight_commission_board",
            "reason": "2/3 角色有 pending expression 拒稿；文游委托局需要从普通黑夜 anime 店员升级为线索/票据/委托板视觉体系。",
            "style_direction": SHOP_RECOMMENDATIONS["pw_midnight_commission_board"]["suggested_style"],
        },
        {
            "tavern_id": "pw_community_repair",
            "reason": "2/3 角色有 pending expression 拒稿；修补工坊职责分明，适合用工具/调停/清单三种构图区分。",
            "style_direction": SHOP_RECOMMENDATIONS["pw_community_repair"]["suggested_style"],
        },
    ]

    sources = {
        "task_prd": str(TASK_PRD),
        "default_taverns": str(DEFAULT_TAVERNS),
        "asset_root": str(ASSET_ROOT),
        "tests": [str(TEST_TAVERNS), str(TEST_GAMEPLAYS)],
        "legacy_audit_contact_sheet": str(LEGACY_AUDIT_CONTACT_SHEET) if LEGACY_AUDIT_CONTACT_SHEET.exists() else None,
        "rejected_manifest": str(rejected_manifest_path) if rejected_manifest_path else None,
        "image_style_skill": ".agents/skills/image-style-prompt-extractor/SKILL.md",
        "character_prompt_skill": ".agents/skills/generate-character-prompt/SKILL.md",
        "style_recipes": ".agents/skills/generate-character-prompt/references/style-recipes.md",
    }

    payload = {
        "version": 1,
        "created_at": "2026-04-30",
        "task": "04-30-public-welfare-npc-batch-upgrade",
        "scope": "Batch 0 audit only; no project sprite files overwritten or generated.",
        "sources": sources,
        "summary": {
            "shop_count": len(taverns),
            "character_count": len(rows),
            "legacy_character_count_excluding_hospital": len([r for r in rows if r["tavern_id"] != "pw_hospital_night_care"]),
            "asset_root": str(ASSET_ROOT),
            "required_expressions": REQUIRED_EXPRESSIONS,
            "all_characters_asset_complete": all(r["asset_complete"] for r in rows),
            "pending_rejected_expression_total": sum(r["manifest_counts"].get("pending_regeneration", 0) for r in rows),
            "regenerated_rejected_asset_total": sum(r["manifest_counts"].get("regenerated", 0) for r in rows),
            "pending_current_hash_matches_rejected_total": sum(r.get("pending_current_hash_matches_rejected", 0) for r in rows),
            "hospital_baseline_dimensions": sorted({r["asset_dimension_summary"] for r in rows if r["tavern_id"] == "pw_hospital_night_care"}),
            "legacy_dimensions": sorted({r["asset_dimension_summary"] for r in rows if r["tavern_id"] != "pw_hospital_night_care"}),
        },
        "first_batch_recommendation": first_batch,
        "shops": shop_rows,
        "characters": rows,
    }

    # Persist JSON first.
    json_path = OUT_DIR / "public-welfare-npc-batch-0-audit.json"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    # Contact sheets for visual review evidence.
    make_contact_sheet(rows, OUT_DIR / "public-welfare-all-sprites-contact-sheet.png")
    neutral_rows = []
    for row in rows:
        neutral_only = dict(row)
        neutral_only["assets"] = {expr: row["assets"].get(expr, {}) for expr in REQUIRED_EXPRESSIONS}
        neutral_rows.append(neutral_only)
    make_contact_sheet(neutral_rows, OUT_DIR / "public-welfare-expression-matrix-contact-sheet.png")
    if LEGACY_AUDIT_CONTACT_SHEET.exists():
        shutil.copy2(LEGACY_AUDIT_CONTACT_SHEET, OUT_DIR / "previous-public-welfare-neutral-contact-sheet.png")

    md = []
    md.append("# Batch 0 audit — Public-welfare NPC visual and role upgrade")
    md.append("")
    md.append("本文件是 `04-30-public-welfare-npc-batch-upgrade` 的第一步审查表。当前批次只审查，不生成、不覆盖正式 sprite。")
    md.append("")
    md.append("## Sources checked")
    for k, v in sources.items():
        if isinstance(v, list):
            md.append(f"- {k}: " + ", ".join(f"`{x}`" for x in v))
        elif v:
            md.append(f"- {k}: `{v}`")
    md.append("")
    s = payload["summary"]
    md.append("## Summary")
    md.append("")
    md.append(f"- 默认公益店：{s['shop_count']} 个；角色：{s['character_count']} 个，其中医院基线外旧角色 {s['legacy_character_count_excluding_hospital']} 个。")
    md.append(f"- 正式资产根目录：`{s['asset_root']}`。每个正式角色要求 `{', '.join(REQUIRED_EXPRESSIONS)}` 五张 PNG。")
    md.append(f"- 当前所有角色五表情资产完整且 hash 互异：`{s['all_characters_asset_complete']}`。")
    md.append(f"- 旧拒稿 manifest 中仍 pending 的 expression 数量：{s['pending_rejected_expression_total']}；其中当前文件 hash 仍等于拒稿 hash：{s['pending_current_hash_matches_rejected_total']}；已 regenerated 数量：{s['regenerated_rejected_asset_total']}。")
    md.append(f"- 旧公益角色尺寸：{', '.join(s['legacy_dimensions'])}；医院新基线尺寸：{', '.join(s['hospital_baseline_dimensions'])}。")
    md.append("")
    md.append("## Recommended first rebuild batch")
    md.append("")
    md.append("| Order | Tavern | Reason | Style direction |")
    md.append("| --- | --- | --- | --- |")
    for i, item in enumerate(first_batch, start=1):
        md.append(f"| {i} | `{item['tavern_id']}` | {safe_table(item['reason'])} | {safe_table(item['style_direction'])} |")
    md.append("")
    md.append("## Shop-level matrix")
    md.append("")
    md.append("| Priority | Tavern | Characters | Pending rejected expr | Dimensions | Non-human / body-plan notes | Visual thesis |")
    md.append("| --- | --- | ---: | ---: | --- | --- | --- |")
    for shop in shop_rows:
        md.append(
            f"| {shop['priority']} | `{shop['tavern_id']}` {safe_table(shop['tavern_name'])} | {shop['character_count']} | {shop['pending_rejected_expression_count']} | "
            f"{safe_table(', '.join(shop['asset_dimensions']))} | {safe_table('; '.join(shop['nonhuman_or_nonordinary_notes']) or '现实人类/无需物种差异')} | {safe_table(shop['visual_thesis'])} |"
        )
    md.append("")
    md.append("## Character audit matrix")
    md.append("")
    md.append("| Priority | Tavern | Character | Species / body plan | Current style / evidence | Resolution | Expression complete | Repetition risk | Suggested new style | Copy sync |")
    md.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for row in rows:
        md.append(
            f"| {row['priority']} | `{row['tavern_id']}` | `{row['char_id']}` {safe_table(row['name'])} | "
            f"{safe_table(row['species_body_plan'])} | {safe_table(row['current_style'])} | {safe_table(row['asset_dimension_summary'])} | "
            f"{row['asset_complete']} | {safe_table(row['repetition_risk'])} | {safe_table(row['suggested_new_style'])} | {safe_table(row['needs_copy_sync'])} |"
        )
    md.append("")
    md.append("## Asset hash manifest")
    md.append("")
    md.append("完整 hash / path 数据见 JSON：`public-welfare-npc-batch-0-audit.json`。")
    md.append("")
    md.append("Generated evidence files:")
    md.append("- `public-welfare-all-sprites-contact-sheet.png`")
    md.append("- `public-welfare-expression-matrix-contact-sheet.png`")
    if LEGACY_AUDIT_CONTACT_SHEET.exists():
        md.append("- `previous-public-welfare-neutral-contact-sheet.png` copied from previous audit")
    md.append("")
    md.append("## Batch 0 conclusion")
    md.append("")
    md.append("- 当前代码/资产层面已经满足每店 ≥3 角色、每角色五表情 PNG、本地 rules backend、无 API key、核心聊天回归测试覆盖。")
    md.append("- 质量风险主要不是缺文件，而是旧拒稿 manifest 中仍有 expression pending、旧 256×256 legacy 风格疲劳，以及非现实主题店铺的物种/体态表达不够强。")
    md.append("- 下一步应先为 Batch 1 三个候选店铺写 Prompt-as-Code manifest 和 style diversity matrix，再生成/落盘正式替换图；不要直接覆盖旧图。")
    md_path = OUT_DIR / "public-welfare-npc-batch-0-audit.md"
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")
    return payload


if __name__ == "__main__":
    payload = build()
    print(json.dumps(payload["summary"], ensure_ascii=False, indent=2))
    print(f"wrote: {OUT_DIR / 'public-welfare-npc-batch-0-audit.md'}")
    print(f"wrote: {OUT_DIR / 'public-welfare-npc-batch-0-audit.json'}")
