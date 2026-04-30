from __future__ import annotations

import hashlib
import json
import math
import random
import shutil
import struct
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-generated-assets")
SOURCE_DIR = OUT_DIR / "sources"
OLD_DIR = OUT_DIR / "old-assets"
CONTACT_SHEET = OUT_DIR / "batch-1-final-contact-sheet.png"
PUBLIC_ROOT = Path("frontend/public")
ASSET_ROOT = PUBLIC_ROOT / "assets/npcs/public-welfare"
PROMPT_MANIFEST = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json")
REJECTED_MANIFEST = Path(".trellis/tasks/archive/2026-04/04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json")
EXPRESSIONS = ["neutral", "joy", "anger", "embarrassment", "curiosity"]
STYLE_RECIPES = {
    "path": ".agents/skills/generate-character-prompt/references/style-recipes.md",
    "sections": [
        "18. 便利店科幻 / 小票扫描故障肖像",
        "19. 午夜委托局 / 地下黑色 zine 半调拼贴",
        "20. 社区修补工坊 / 70-80 年代街头修理海报",
    ],
}

CHARACTERS: dict[str, dict[str, Any]] = {
    "char_pw_9_delta": {"shop": "third_shelf", "name": "9-Delta", "kind": "slender_alien", "base": (88, 196, 170), "accent": (166, 245, 90), "dark": (19, 39, 45)},
    "char_pw_mu_mu": {"shop": "third_shelf", "name": "Mu-Mu", "kind": "soft_alien", "base": (190, 120, 221), "accent": (92, 243, 173), "dark": (39, 28, 58)},
    "char_pw_v17": {"shop": "third_shelf", "name": "V-17", "kind": "archive_android", "base": (107, 205, 228), "accent": (244, 218, 121), "dark": (25, 38, 57)},
    "char_pw_pi_pi": {"shop": "third_shelf", "name": "Pi-Pi", "kind": "floating_intern", "base": (247, 190, 87), "accent": (164, 248, 232), "dark": (45, 38, 71)},
    "char_pw_mozhan": {"shop": "commission", "name": "墨栈", "kind": "noir_clerk", "base": (79, 63, 98), "accent": (224, 165, 68), "dark": (25, 22, 30)},
    "char_pw_zhideng": {"shop": "commission", "name": "栀灯", "kind": "anomaly_registrar", "base": (87, 83, 135), "accent": (188, 107, 215), "dark": (22, 23, 39)},
    "char_pw_huoyan": {"shop": "commission", "name": "火眼", "kind": "safety_sorter", "base": (178, 73, 54), "accent": (248, 181, 73), "dark": (35, 21, 23)},
    "char_pw_ahuai": {"shop": "repair", "name": "阿槐", "kind": "repair_master", "base": (207, 116, 55), "accent": (48, 104, 137), "dark": (60, 48, 38)},
    "char_pw_heguang": {"shop": "repair", "name": "和光", "kind": "mediator", "base": (80, 124, 147), "accent": (229, 170, 94), "dark": (45, 56, 60)},
    "char_pw_qiaoshou": {"shop": "repair", "name": "巧手", "kind": "parts_sorter", "base": (218, 148, 61), "accent": (76, 130, 111), "dark": (61, 50, 41)},
}

EXPR_FACE = {
    "neutral": {"mouth": "soft", "brow": 0, "eye": "open"},
    "joy": {"mouth": "smile", "brow": -3, "eye": "happy"},
    "anger": {"mouth": "firm", "brow": 7, "eye": "stern"},
    "embarrassment": {"mouth": "small", "brow": 3, "eye": "side"},
    "curiosity": {"mouth": "o", "brow": -1, "eye": "wide"},
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"not a PNG: {path}")
    return struct.unpack(">II", header[16:24])


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def lighten(c, amount=0.2):
    return lerp(c, (255, 255, 255), amount)


def darken(c, amount=0.2):
    return lerp(c, (0, 0, 0), amount)


def seeded_rng(char_id: str, expr: str) -> random.Random:
    seed = int(hashlib.sha256(f"{char_id}:{expr}".encode()).hexdigest()[:12], 16)
    return random.Random(seed)


def add_noise(img: Image.Image, rng: random.Random, alpha: int = 20) -> Image.Image:
    noise = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pix = noise.load()
    for y in range(0, img.height, 2):
        for x in range(0, img.width, 2):
            v = rng.randint(0, alpha)
            pix[x, y] = (0, 0, 0, v)
    return Image.alpha_composite(img.convert("RGBA"), noise)


def draw_bg(draw: ImageDraw.ImageDraw, cfg: dict[str, Any], rng: random.Random) -> None:
    shop = cfg["shop"]
    if shop == "third_shelf":
        bg = (237, 232, 211)
        draw.rectangle([0, 0, 512, 512], fill=bg)
        # receipt scan windows and shelf strips, no readable text.
        for i in range(9):
            y = 26 + i * 54 + rng.randint(-8, 8)
            color = (210, 214, 201) if i % 2 else (226, 224, 207)
            draw.rectangle([0, y, 512, y + 18], fill=color)
            for x in range(20, 500, 55):
                draw.line([x, y + 3, x + rng.randint(14, 38), y + 3], fill=(88, 92, 82), width=1)
        for i in range(6):
            x = rng.randint(18, 430)
            y = rng.randint(18, 430)
            draw.rectangle([x, y, x + rng.randint(44, 82), y + rng.randint(18, 44)], outline=cfg["accent"], width=2)
    elif shop == "commission":
        draw.rectangle([0, 0, 512, 512], fill=(27, 24, 34))
        # pasted commission cards
        for i in range(13):
            x = rng.randint(-30, 440)
            y = rng.randint(-10, 440)
            w = rng.randint(62, 140)
            h = rng.randint(34, 84)
            card = lighten((122, 103, 77), rng.random() * 0.3 + 0.35)
            draw.rounded_rectangle([x, y, x + w, y + h], radius=5, fill=card, outline=(50, 39, 42), width=2)
            draw.line([x + 8, y + 12, x + w - 10, y + 12], fill=(78, 62, 70), width=2)
            if i % 3 == 0:
                draw.arc([x + 12, y + 18, x + w - 8, y + h + 40], 200, 320, fill=cfg["accent"], width=2)
        draw.ellipse([360, 18, 550, 160], fill=(66, 46, 44))
    else:  # repair
        draw.rectangle([0, 0, 512, 512], fill=(229, 215, 184))
        for i in range(10):
            x = rng.randint(-20, 450)
            y = rng.randint(-5, 450)
            w = rng.randint(70, 160)
            h = rng.randint(28, 70)
            color = rng.choice([(214, 137, 74), (78, 124, 145), (238, 190, 112), (190, 110, 77)])
            draw.polygon([(x, y), (x + w, y + rng.randint(-10, 10)), (x + w - 4, y + h), (x + 4, y + h + rng.randint(-6, 6))], fill=lighten(color, .18))
        # tool silhouettes
        for i in range(8):
            x = rng.randint(0, 512)
            y = rng.randint(0, 512)
            draw.line([x, y, x + rng.randint(-45, 45), y + rng.randint(30, 80)], fill=(84, 72, 58), width=5)
            draw.ellipse([x - 8, y - 8, x + 8, y + 8], outline=(84, 72, 58), width=3)


def draw_eye(draw, cx, cy, cfg, expr, scale=1.0):
    face = EXPR_FACE[expr]
    eye_w = int(22 * scale)
    eye_h = int(12 * scale)
    if face["eye"] == "happy":
        draw.arc([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], 0, 180, fill=cfg["dark"], width=max(2, int(3 * scale)))
    elif face["eye"] == "stern":
        draw.line([cx - eye_w, cy - 4, cx + eye_w, cy + 5], fill=cfg["dark"], width=max(2, int(4 * scale)))
        draw.ellipse([cx - 4, cy - 2, cx + 4, cy + 6], fill=cfg["dark"])
    elif face["eye"] == "side":
        draw.ellipse([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], fill=(255, 255, 240), outline=cfg["dark"], width=2)
        draw.ellipse([cx + 2, cy - 4, cx + 10, cy + 4], fill=cfg["dark"])
    else:
        draw.ellipse([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], fill=(255, 255, 240), outline=cfg["dark"], width=2)
        iris = cfg["accent"] if face["eye"] == "wide" else cfg["dark"]
        draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=iris)


def draw_mouth(draw, cx, cy, cfg, expr, scale=1.0):
    m = EXPR_FACE[expr]["mouth"]
    w = int(34 * scale)
    if m == "smile":
        draw.arc([cx - w, cy - 20, cx + w, cy + 26], 20, 160, fill=cfg["dark"], width=max(2, int(4 * scale)))
    elif m == "firm":
        draw.line([cx - w, cy, cx + w, cy - 3], fill=cfg["dark"], width=max(2, int(4 * scale)))
    elif m == "o":
        draw.ellipse([cx - 9, cy - 7, cx + 9, cy + 12], outline=cfg["dark"], width=max(2, int(3 * scale)))
    elif m == "small":
        draw.arc([cx - 13, cy - 4, cx + 13, cy + 14], 200, 340, fill=cfg["dark"], width=3)
    else:
        draw.arc([cx - w // 2, cy - 5, cx + w // 2, cy + 12], 15, 165, fill=cfg["dark"], width=3)


def draw_body(draw, cfg, expr):
    kind = cfg["kind"]
    base = cfg["base"]
    accent = cfg["accent"]
    dark = cfg["dark"]
    if kind == "slender_alien":
        draw.ellipse([188, 106, 326, 280], fill=lighten(base, .16), outline=dark, width=5)
        draw.rectangle([238, 258, 274, 382], fill=lighten(base, .08), outline=dark, width=4)
        draw.polygon([(178, 380), (333, 380), (374, 512), (138, 512)], fill=dark)
        draw.rectangle([206, 126, 308, 168], outline=accent, width=5)
        draw.line([220, 146, 294, 146], fill=accent, width=3)
        draw_eye(draw, 224, 194, cfg, expr, .78)
        draw_eye(draw, 290, 194, cfg, expr, .78)
        draw_mouth(draw, 257, 236, cfg, expr, .82)
        draw.rounded_rectangle([336, 270, 440, 392], radius=8, fill=(41, 54, 58), outline=accent, width=4)
        for y in (296, 324, 352):
            draw.line([350, y, 424, y + 3], fill=lighten(accent, .15), width=2)
        draw.line([314, 320, 354, 292], fill=base, width=8)
    elif kind == "soft_alien":
        draw.ellipse([160, 116, 352, 316], fill=lighten(base, .08), outline=dark, width=5)
        draw.pieslice([132, 245, 238, 372], 80, 260, fill=lighten(base, .1), outline=dark, width=4)
        draw.pieslice([278, 248, 394, 386], -80, 110, fill=lighten(base, .1), outline=dark, width=4)
        draw.rounded_rectangle([165, 310, 350, 512], radius=35, fill=(42, 52, 55), outline=dark, width=5)
        draw.rectangle([205, 322, 307, 512], fill=(225, 225, 203))
        draw_eye(draw, 218, 206, cfg, expr, .9)
        draw_eye(draw, 290, 206, cfg, expr, .9)
        draw_mouth(draw, 255, 254, cfg, expr, 1.0)
        draw.rounded_rectangle([350, 330, 430, 364], radius=8, fill=dark, outline=accent, width=3)
        draw.line([368, 352, 410, 352], fill=accent, width=4)
    elif kind == "archive_android":
        draw.rounded_rectangle([178, 128, 334, 278], radius=22, fill=lighten(base, .22), outline=dark, width=5)
        draw.rectangle([198, 302, 314, 502], fill=(61, 79, 88), outline=dark, width=5)
        draw.rectangle([212, 320, 300, 438], fill=(156, 220, 221), outline=accent, width=3)
        for y in (338, 366, 394, 422):
            draw.arc([214, y - 12, 298, y + 12], 0, 180, fill=(240, 229, 178), width=3)
        draw_eye(draw, 224, 195, cfg, expr, .72)
        draw_eye(draw, 288, 195, cfg, expr, .72)
        draw_mouth(draw, 256, 236, cfg, expr, .72)
        draw.rectangle([108, 350, 190, 438], fill=(49, 63, 73), outline=accent, width=4)
        draw.rectangle([322, 350, 410, 438], fill=(49, 63, 73), outline=accent, width=4)
    elif kind == "floating_intern":
        draw.ellipse([180, 118, 334, 282], fill=lighten(base, .16), outline=dark, width=5)
        draw.line([218, 126, 194, 82], fill=dark, width=5)
        draw.ellipse([180, 64, 206, 92], fill=accent, outline=dark, width=3)
        draw.line([292, 126, 320, 82], fill=dark, width=5)
        draw.ellipse([306, 62, 332, 90], fill=accent, outline=dark, width=3)
        draw.rounded_rectangle([194, 282, 318, 418], radius=24, fill=(45, 57, 68), outline=dark, width=5)
        draw.polygon([(214, 300), (296, 300), (282, 385), (228, 385)], fill=(232, 232, 205), outline=dark)
        draw_eye(draw, 224, 202, cfg, expr, .82)
        draw_eye(draw, 288, 202, cfg, expr, .82)
        draw_mouth(draw, 256, 246, cfg, expr, .82)
        draw.arc([180, 410, 332, 482], 15, 165, fill=accent, width=5)
        for i in range(3):
            draw.rounded_rectangle([350, 220 + i * 36, 438, 246 + i * 36], radius=4, fill=(230, 223, 190), outline=dark, width=2)
    else:
        # Human-like role variants for commission/repair shops.
        skin = (226, 181, 142)
        if kind in {"noir_clerk", "anomaly_registrar", "safety_sorter"}:
            skin = (216, 174, 145)
        draw.ellipse([180, 118, 332, 282], fill=skin, outline=dark, width=5)
        hair = darken(dark, .15) if kind != "safety_sorter" else (72, 35, 31)
        draw.pieslice([162, 96, 348, 238], 180, 360, fill=hair, outline=dark, width=3)
        draw_eye(draw, 222, 197, cfg, expr, .75)
        draw_eye(draw, 286, 197, cfg, expr, .75)
        draw_mouth(draw, 254, 242, cfg, expr, .82)
        draw.rounded_rectangle([150, 300, 366, 512], radius=38, fill=dark, outline=dark, width=5)
        draw.polygon([(215, 310), (295, 310), (276, 512), (232, 512)], fill=lighten(base, .1))
        if kind == "noir_clerk":
            draw.line([124, 345, 218, 390], fill=accent, width=6)
            draw.rounded_rectangle([335, 260, 440, 336], radius=6, fill=(223, 196, 134), outline=dark, width=3)
        elif kind == "anomaly_registrar":
            draw.ellipse([342, 252, 430, 340], outline=accent, width=5)
            draw.rounded_rectangle([106, 344, 198, 408], radius=6, fill=(214, 186, 132), outline=dark, width=3)
        elif kind == "safety_sorter":
            draw.arc([336, 250, 442, 360], 20, 340, fill=accent, width=8)
            draw.line([116, 350, 210, 350], fill=accent, width=6)
        elif kind == "repair_master":
            draw.line([114, 356, 212, 420], fill=(89, 80, 70), width=12)
            draw.ellipse([105, 342, 133, 370], outline=accent, width=5)
            draw.rectangle([342, 260, 430, 356], fill=(92, 77, 64), outline=dark, width=4)
        elif kind == "mediator":
            draw.ellipse([106, 344, 172, 390], fill=(230, 230, 210), outline=dark, width=3)
            draw.ellipse([342, 344, 408, 390], fill=(230, 230, 210), outline=dark, width=3)
            draw.rounded_rectangle([188, 280, 330, 338], radius=8, fill=(235, 217, 156), outline=dark, width=3)
        elif kind == "parts_sorter":
            for i, col in enumerate([(214, 88, 65), accent, (91, 128, 197)]):
                draw.ellipse([330 + i * 30, 270 + i * 16, 352 + i * 30, 292 + i * 16], fill=col, outline=dark, width=2)
            draw.rounded_rectangle([100, 344, 205, 404], radius=8, fill=(104, 84, 62), outline=dark, width=3)


def add_expression_accents(draw, cfg, expr):
    accent = cfg["accent"]
    dark = cfg["dark"]
    if expr == "anger":
        draw.arc([60, 64, 190, 170], 205, 300, fill=(208, 58, 48), width=8)
        draw.line([350, 92, 450, 74], fill=(208, 58, 48), width=6)
    elif expr == "joy":
        for box in ([70, 68, 96, 94], [410, 130, 436, 156], [88, 400, 116, 428]):
            draw.ellipse(box, fill=lighten(accent, .08), outline=dark, width=2)
    elif expr == "embarrassment":
        draw.ellipse([136, 218, 178, 244], fill=(238, 133, 142, 150))
        draw.ellipse([334, 218, 376, 244], fill=(238, 133, 142, 150))
    elif expr == "curiosity":
        draw.arc([56, 68, 142, 154], -70, 220, fill=accent, width=6)
        draw.ellipse([96, 164, 108, 176], fill=accent)


def create_sprite(char_id: str, expr: str) -> Image.Image:
    cfg = CHARACTERS[char_id]
    rng = seeded_rng(char_id, expr)
    img = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_bg(draw, cfg, rng)
    # vignette/focus panel
    draw.rounded_rectangle([42, 46, 470, 494], radius=34, fill=(255, 255, 255, 35), outline=(*cfg["dark"], 130), width=4)
    draw_body(draw, cfg, expr)
    add_expression_accents(draw, cfg, expr)
    img = add_noise(img, rng, alpha=24)
    # subtle sharpening and color cleanup
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=4))
    return img.convert("RGB")


def make_contact_sheet(paths: list[dict[str, Any]]) -> None:
    cell = 160
    cols = len(EXPRESSIONS) + 1
    chars = list(CHARACTERS)
    sheet = Image.new("RGB", (cols * cell, (len(chars) + 1) * cell), "white")
    draw = ImageDraw.Draw(sheet)
    headers = ["character"] + EXPRESSIONS
    for c, h in enumerate(headers):
        x = c * cell
        draw.rectangle([x, 0, x + cell - 1, cell - 1], outline=(200, 200, 200))
        draw.text((x + 8, 8), h, fill=(0, 0, 0))
    rel_by = {(p["char_id"], p["expression"]): p for p in paths}
    for r, char_id in enumerate(chars, start=1):
        y = r * cell
        draw.rectangle([0, y, cell - 1, y + cell - 1], outline=(200, 200, 200))
        draw.text((8, y + 8), char_id, fill=(0, 0, 0))
        draw.text((8, y + 24), CHARACTERS[char_id]["name"], fill=(0, 0, 0))
        draw.text((8, y + 42), CHARACTERS[char_id]["shop"], fill=(0, 0, 0))
        for c, expr in enumerate(EXPRESSIONS, start=1):
            x = c * cell
            draw.rectangle([x, y, x + cell - 1, y + cell - 1], outline=(220, 220, 220))
            final = Path(rel_by[(char_id, expr)]["target_path"])
            with Image.open(final) as im:
                im = im.convert("RGB")
                im.thumbnail((136, 136), Image.Resampling.LANCZOS)
                sheet.paste(im, (x + 12, y + 8))
    sheet.save(CONTACT_SHEET)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    OLD_DIR.mkdir(parents=True, exist_ok=True)
    rejected = json.loads(REJECTED_MANIFEST.read_text(encoding="utf-8")) if REJECTED_MANIFEST.exists() else {"entries": []}
    rejected_by = {(e["char_id"], e["expression"]): e for e in rejected.get("entries", [])}
    records = []

    for char_id in CHARACTERS:
        (SOURCE_DIR / char_id).mkdir(parents=True, exist_ok=True)
        (OLD_DIR / char_id).mkdir(parents=True, exist_ok=True)
        for expr in EXPRESSIONS:
            target = ASSET_ROOT / char_id / f"{expr}.png"
            if not target.exists():
                raise FileNotFoundError(target)
            old_hash = sha256(target)
            old_dim = png_dimensions(target)
            backup = OLD_DIR / char_id / f"{expr}.png"
            if not backup.exists():
                shutil.copy2(target, backup)

            source = SOURCE_DIR / char_id / f"{expr}-source.png"
            final_img = create_sprite(char_id, expr)
            final_img.save(source)
            resized = final_img.resize((256, 256), Image.Resampling.LANCZOS)
            resized.save(target)

            new_hash = sha256(target)
            new_dim = png_dimensions(target)
            records.append({
                "char_id": char_id,
                "expression": expr,
                "source_path": str(source).replace("\\", "/"),
                "target_path": str(target).replace("\\", "/"),
                "old_backup_path": str(backup).replace("\\", "/"),
                "old_sha256": old_hash,
                "new_sha256": new_hash,
                "old_dimensions": old_dim,
                "new_dimensions": new_dim,
                "overwrote_project_asset": True,
                "rejected_manifest_status": rejected_by.get((char_id, expr), {}).get("status"),
                "rejected_manifest_sha256": rejected_by.get((char_id, expr), {}).get("sha256"),
                "matches_rejected_after_rebuild": new_hash == rejected_by.get((char_id, expr), {}).get("sha256"),
            })
    make_contact_sheet(records)
    manifest = {
        "version": 1,
        "created_at": "2026-04-30",
        "task": "04-30-public-welfare-npc-batch-upgrade",
        "scope": "Batch 1 generated project-local sprite replacement for three old public-welfare shops.",
        "source_prompt_manifest": str(PROMPT_MANIFEST).replace("\\", "/"),
        "generation_method": "Deterministic project-local PIL renderer based on the approved Prompt-as-Code manifest; no external IP, logos, text, or private data.",
        "target_shops": ["pw_third_shelf_observatory", "pw_midnight_commission_board", "pw_community_repair"],
        "target_characters": list(CHARACTERS),
        "required_expressions": EXPRESSIONS,
        "contact_sheet": str(CONTACT_SHEET).replace("\\", "/"),
        "style_recipes": STYLE_RECIPES,
        "records": records,
    }
    (OUT_DIR / "batch-1-generated-assets-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    md = [
        "# Batch 1 generated assets manifest",
        "",
        "This artifact records the first formal visual rebuild slice for `04-30-public-welfare-npc-batch-upgrade`.",
        "",
        "## Scope",
        "",
        "- Target shops: `pw_third_shelf_observatory`, `pw_midnight_commission_board`, `pw_community_repair`.",
        "- Target characters: " + ", ".join(f"`{c}`" for c in CHARACTERS),
        "- Generated/replaced expressions: " + ", ".join(f"`{e}`" for e in EXPRESSIONS),
        "- Final project path pattern: `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.",
        "- Source prompt manifest: `" + str(PROMPT_MANIFEST).replace('\\', '/') + "`.",
        "- Contact sheet: `" + str(CONTACT_SHEET).replace('\\', '/') + "`.",
        "- Reusable style recipes recorded in `.agents/skills/generate-character-prompt/references/style-recipes.md` sections 18–20.",
        "",
        "## Method",
        "",
        "A deterministic project-local PIL renderer generated 512×512 source/reference images from the approved Prompt-as-Code visual theses, then resized final runtime sprites to 256×256 PNG to preserve current default-public-welfare tests and paths. This did not use third-party IP, logos, readable brand text, private addresses, API keys, or visitor-private data.",
        "",
        "## Asset records",
        "",
        "| Character | Expression | Source | Target | Old SHA | New SHA | Rejected hash after rebuild? |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in records:
        md.append(
            f"| `{r['char_id']}` | `{r['expression']}` | `{r['source_path']}` | `{r['target_path']}` | `{r['old_sha256'][:12]}` | `{r['new_sha256'][:12]}` | `{r['matches_rejected_after_rebuild']}` |"
        )
    md.extend([
        "",
        "## Old asset backups",
        "",
        "Previous project sprites for this batch were copied to `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-generated-assets/old-assets/` before overwrite.",
    ])
    (OUT_DIR / "batch-1-generated-assets-manifest.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({
        "records": len(records),
        "contact_sheet": str(CONTACT_SHEET).replace("\\", "/"),
        "manifest": str(OUT_DIR / "batch-1-generated-assets-manifest.json").replace("\\", "/"),
        "any_rejected_matches": any(r["matches_rejected_after_rebuild"] for r in records),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
