from __future__ import annotations

import hashlib
import json
import random
import shutil
import struct
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets")
SOURCE_DIR = OUT_DIR / "sources"
OLD_DIR = OUT_DIR / "old-assets"
CONTACT_SHEET = OUT_DIR / "batch-2-final-contact-sheet.png"
PUBLIC_ROOT = Path("frontend/public")
ASSET_ROOT = PUBLIC_ROOT / "assets/npcs/public-welfare"
PROMPT_MANIFEST = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json")
REJECTED_MANIFEST = Path(".trellis/tasks/archive/2026-04/04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json")
EXPRESSIONS = ["neutral", "joy", "anger", "embarrassment", "curiosity"]
STYLE_RECIPES = {
    "path": ".agents/skills/generate-character-prompt/references/style-recipes.md",
    "sections": [
        "21. 灯塔问讯台 / 公民导览地图灯箱肖像",
        "22. 深夜树洞电台 / Lo-fi 白线电波肖像",
        "23. 城市拾光档案亭 / 玻璃档案格拼贴肖像",
        "24. 放学后英雄补给社 / 贴纸玩具箱纸影肖像",
    ],
}

CHARACTERS: dict[str, dict[str, Any]] = {
    "char_pw_xiaozhou": {
        "tavern_id": "pw_lantern_helpdesk",
        "shop": "helpdesk",
        "name": "小舟",
        "kind": "guide",
        "base": (83, 162, 184),
        "accent": (245, 197, 78),
        "dark": (45, 62, 72),
        "identity": "map-table guide with white service lamp and route-card fan",
    },
    "char_pw_anlan": {
        "tavern_id": "pw_midnight_treehole",
        "shop": "treehole",
        "name": "安澜",
        "kind": "radio_host",
        "base": (91, 86, 148),
        "accent": (229, 166, 81),
        "dark": (25, 30, 55),
        "identity": "midnight host with headphones, low microphone, anonymous notebook",
    },
    "char_pw_wenjian": {
        "tavern_id": "pw_lost_found_archive",
        "shop": "archive",
        "name": "闻笺",
        "kind": "archive_keeper",
        "base": (98, 127, 151),
        "accent": (222, 178, 94),
        "dark": (55, 62, 66),
        "identity": "glass archive-booth keeper with blank labels and lost-found register",
    },
    "char_pw_zhijian": {
        "tavern_id": "pw_after_school_hero_supply",
        "shop": "hero",
        "name": "纸剑",
        "kind": "paper_shadow",
        "base": (232, 103, 76),
        "accent": (68, 112, 190),
        "dark": (72, 54, 72),
        "identity": "harmless paper-shadow child echo with origami sword and hero-card sleeve",
    },
}

EXPR_FACE = {
    "neutral": {"mouth": "soft", "eye": "open"},
    "joy": {"mouth": "smile", "eye": "happy"},
    "anger": {"mouth": "firm", "eye": "stern"},
    "embarrassment": {"mouth": "small", "eye": "side"},
    "curiosity": {"mouth": "o", "eye": "wide"},
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"not a PNG: {path}")
    return struct.unpack(">II", header[16:24])


def lerp(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def lighten(c: tuple[int, int, int], amount: float = 0.2) -> tuple[int, int, int]:
    return lerp(c, (255, 255, 255), amount)


def darken(c: tuple[int, int, int], amount: float = 0.2) -> tuple[int, int, int]:
    return lerp(c, (0, 0, 0), amount)


def seeded_rng(char_id: str, expr: str) -> random.Random:
    seed = int(hashlib.sha256(f"batch2:{char_id}:{expr}".encode()).hexdigest()[:12], 16)
    return random.Random(seed)


def add_noise(img: Image.Image, rng: random.Random, alpha: int = 18) -> Image.Image:
    noise = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pix = noise.load()
    for y in range(0, img.height, 2):
        for x in range(0, img.width, 2):
            pix[x, y] = (0, 0, 0, rng.randint(0, alpha))
    return Image.alpha_composite(img.convert("RGBA"), noise)


def draw_fake_text_lines(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color: tuple[int, int, int], rng: random.Random, count: int = 4) -> None:
    x1, y1, x2, y2 = box
    for i in range(count):
        y = y1 + 10 + i * max(12, (y2 - y1 - 20) // max(1, count))
        draw.line([x1 + 10, y, min(x2 - 8, x1 + rng.randint(34, max(38, x2 - x1 - 12))), y], fill=color, width=2)


def draw_bg(draw: ImageDraw.ImageDraw, cfg: dict[str, Any], rng: random.Random) -> None:
    shop = cfg["shop"]
    if shop == "helpdesk":
        draw.rectangle([0, 0, 512, 512], fill=(236, 231, 205))
        for i in range(9):
            y = 28 + i * 54 + rng.randint(-5, 5)
            draw.line([0, y, 512, y + rng.randint(-38, 38)], fill=(190, 206, 190), width=2)
        for i in range(13):
            x = rng.randint(-12, 450)
            y = rng.randint(10, 450)
            color = rng.choice([(243, 201, 88), (112, 177, 188), (126, 178, 126)])
            draw.rounded_rectangle([x, y, x + rng.randint(46, 94), y + rng.randint(26, 54)], radius=7, fill=lighten(color, .20), outline=(96, 111, 103), width=2)
        draw.ellipse([350, -30, 535, 150], fill=(251, 224, 112, 140))
    elif shop == "treehole":
        draw.rectangle([0, 0, 512, 512], fill=(23, 27, 53))
        for i in range(7):
            y = 90 + i * 52
            draw.arc([54 - i * 8, y - 34, 468 + i * 4, y + 52], 190, 350, fill=(180, 195, 205, 95), width=2)
        for i in range(10):
            x = rng.randint(14, 450)
            y = rng.randint(16, 450)
            draw.rounded_rectangle([x, y, x + rng.randint(55, 120), y + rng.randint(24, 62)], radius=6, fill=(74, 64, 101, 170), outline=(147, 132, 160), width=1)
            draw_fake_text_lines(draw, (x, y, x + 90, y + 50), (185, 176, 188), rng, 2)
        draw.ellipse([370, 30, 482, 114], fill=(214, 143, 72, 110))
    elif shop == "archive":
        draw.rectangle([0, 0, 512, 512], fill=(220, 211, 184))
        for i in range(7):
            x = 16 + i * 72
            draw.line([x, 0, x + rng.randint(-24, 24), 512], fill=(119, 136, 144), width=2)
        for i in range(16):
            x = rng.randint(-10, 442)
            y = rng.randint(4, 454)
            w = rng.randint(62, 130)
            h = rng.randint(30, 72)
            draw.rectangle([x, y, x + w, y + h], fill=lighten((202, 195, 164), rng.random() * .15), outline=(86, 92, 88), width=2)
            draw.rectangle([x + 6, y + 6, x + 30, y + 18], fill=lighten(cfg["accent"], .20))
            draw_fake_text_lines(draw, (x + 34, y + 4, x + w - 4, y + h - 4), (92, 96, 92), rng, 2)
        draw.rectangle([42, 42, 470, 470], outline=(148, 183, 194, 105), width=6)
    else:  # hero
        draw.rectangle([0, 0, 512, 512], fill=(242, 222, 179))
        for i in range(18):
            x = rng.randint(-20, 470)
            y = rng.randint(-10, 460)
            w = rng.randint(36, 105)
            h = rng.randint(28, 84)
            color = rng.choice([(226, 88, 67), (68, 112, 190), (243, 190, 79), (235, 235, 221)])
            draw.rounded_rectangle([x, y, x + w, y + h], radius=8, fill=lighten(color, .10), outline=(98, 75, 74), width=2)
            if i % 3 == 0:
                draw.polygon([(x + w // 2, y + 8), (x + w - 8, y + h // 2), (x + w // 2, y + h - 8), (x + 8, y + h // 2)], outline=cfg["accent"], fill=None)
        draw.ellipse([315, -25, 560, 175], fill=(254, 194, 93, 125))


def draw_eye(draw: ImageDraw.ImageDraw, cx: int, cy: int, cfg: dict[str, Any], expr: str, scale: float = 1.0) -> None:
    face = EXPR_FACE[expr]
    dark = cfg["dark"]
    eye_w = int(20 * scale)
    eye_h = int(11 * scale)
    if face["eye"] == "happy":
        draw.arc([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], 0, 180, fill=dark, width=max(2, int(3 * scale)))
    elif face["eye"] == "stern":
        draw.line([cx - eye_w, cy - 4, cx + eye_w, cy + 5], fill=dark, width=max(2, int(4 * scale)))
        draw.ellipse([cx - 4, cy - 2, cx + 4, cy + 6], fill=dark)
    elif face["eye"] == "side":
        draw.ellipse([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], fill=(255, 250, 230), outline=dark, width=2)
        draw.ellipse([cx + 2, cy - 4, cx + 10, cy + 4], fill=dark)
    else:
        draw.ellipse([cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h], fill=(255, 250, 230), outline=dark, width=2)
        iris = cfg["accent"] if face["eye"] == "wide" else dark
        draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=iris)


def draw_mouth(draw: ImageDraw.ImageDraw, cx: int, cy: int, cfg: dict[str, Any], expr: str, scale: float = 1.0) -> None:
    dark = cfg["dark"]
    m = EXPR_FACE[expr]["mouth"]
    w = int(31 * scale)
    if m == "smile":
        draw.arc([cx - w, cy - 18, cx + w, cy + 24], 20, 160, fill=dark, width=max(2, int(4 * scale)))
    elif m == "firm":
        draw.line([cx - w, cy, cx + w, cy - 2], fill=dark, width=max(2, int(4 * scale)))
    elif m == "o":
        draw.ellipse([cx - 8, cy - 7, cx + 8, cy + 11], outline=dark, width=max(2, int(3 * scale)))
    elif m == "small":
        draw.arc([cx - 12, cy - 4, cx + 12, cy + 12], 200, 340, fill=dark, width=3)
    else:
        draw.arc([cx - w // 2, cy - 5, cx + w // 2, cy + 12], 15, 165, fill=dark, width=3)


def draw_human_face(draw: ImageDraw.ImageDraw, cfg: dict[str, Any], expr: str, *, x_offset: int = 0) -> None:
    dark = cfg["dark"]
    skin = (224, 182, 148)
    draw.ellipse([180 + x_offset, 116, 332 + x_offset, 282], fill=skin, outline=dark, width=5)
    hair = darken(dark, .10)
    draw.pieslice([158 + x_offset, 92, 354 + x_offset, 238], 180, 360, fill=hair, outline=dark, width=3)
    draw_eye(draw, 222 + x_offset, 197, cfg, expr, .75)
    draw_eye(draw, 286 + x_offset, 197, cfg, expr, .75)
    draw_mouth(draw, 254 + x_offset, 242, cfg, expr, .82)


def draw_body(draw: ImageDraw.ImageDraw, cfg: dict[str, Any], expr: str) -> None:
    kind = cfg["kind"]
    dark = cfg["dark"]
    base = cfg["base"]
    accent = cfg["accent"]
    if kind == "paper_shadow":
        # Paper child echo: non-human, flat folded silhouette with visible harmless origami sword.
        draw.polygon([(210, 110), (316, 132), (302, 282), (188, 268)], fill=(246, 240, 220, 230), outline=dark)
        draw.line([202, 122, 292, 274], fill=(210, 188, 172), width=3)
        draw_eye(draw, 232, 190, cfg, expr, .72)
        draw_eye(draw, 282, 202, cfg, expr, .72)
        draw_mouth(draw, 258, 242, cfg, expr, .72)
        draw.polygon([(184, 288), (326, 304), (370, 512), (142, 512)], fill=lighten(base, .15), outline=dark)
        draw.line([108, 358, 238, 304], fill=dark, width=7)
        draw.polygon([(86, 366), (122, 336), (154, 365), (118, 392)], fill=(246, 240, 220), outline=dark)
        draw.rounded_rectangle([330, 292, 432, 364], radius=8, fill=(238, 229, 196), outline=dark, width=3)
        draw.polygon([(352, 310), (412, 326), (354, 344)], fill=accent)
        return

    draw_human_face(draw, cfg, expr)
    draw.rounded_rectangle([148, 300, 368, 512], radius=40, fill=dark, outline=dark, width=5)
    draw.polygon([(214, 310), (298, 310), (278, 512), (232, 512)], fill=lighten(base, .16))
    if kind == "guide":
        draw.rounded_rectangle([86, 330, 214, 428], radius=8, fill=(236, 228, 191), outline=dark, width=4)
        for i, col in enumerate([(245, 197, 78), (83, 162, 184), (110, 174, 122)]):
            draw.line([104, 356 + i * 22, 194, 340 + i * 16], fill=col, width=5)
        draw.ellipse([346, 250, 428, 330], fill=(252, 219, 102, 160), outline=dark, width=3)
        draw.line([386, 330, 386, 420], fill=dark, width=5)
    elif kind == "radio_host":
        draw.arc([164, 150, 344, 260], 190, 350, fill=accent, width=8)
        draw.rounded_rectangle([100, 330, 190, 430], radius=16, fill=(42, 44, 72), outline=accent, width=4)
        draw.ellipse([126, 350, 164, 388], fill=(210, 190, 148), outline=dark, width=3)
        draw.line([145, 388, 145, 458], fill=accent, width=5)
        draw.rounded_rectangle([324, 284, 434, 360], radius=8, fill=(232, 220, 182), outline=dark, width=3)
        draw_fake_text_lines(draw, (330, 292, 428, 350), (82, 74, 86), random.Random(7), 3)
    elif kind == "archive_keeper":
        draw.rectangle([86, 292, 208, 418], fill=(180, 205, 207, 120), outline=accent, width=5)
        draw.rounded_rectangle([322, 285, 438, 382], radius=8, fill=(226, 216, 179), outline=dark, width=4)
        draw_fake_text_lines(draw, (330, 300, 430, 364), (93, 96, 88), random.Random(11), 4)
        draw.rectangle([120, 382, 196, 442], fill=(84, 93, 95), outline=dark, width=3)
        draw.rectangle([332, 394, 420, 454], fill=(84, 93, 95), outline=dark, width=3)


def add_expression_accents(draw: ImageDraw.ImageDraw, cfg: dict[str, Any], expr: str) -> None:
    accent = cfg["accent"]
    dark = cfg["dark"]
    if expr == "joy":
        for box in ([66, 76, 92, 102], [400, 132, 428, 160], [86, 404, 112, 430]):
            draw.ellipse(box, fill=lighten(accent, .10), outline=dark, width=2)
    elif expr == "anger":
        draw.arc([56, 66, 178, 170], 205, 300, fill=(202, 63, 55), width=8)
        draw.line([350, 92, 452, 72], fill=(202, 63, 55), width=6)
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
    draw.rounded_rectangle([42, 46, 470, 494], radius=34, fill=(255, 255, 255, 38), outline=(*cfg["dark"], 128), width=4)
    draw_body(draw, cfg, expr)
    add_expression_accents(draw, cfg, expr)
    img = add_noise(img, rng, alpha=22)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=4))
    return img.convert("RGB")


def make_contact_sheet(records: list[dict[str, Any]]) -> None:
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
    rel_by = {(p["char_id"], p["expression"]): p for p in records}
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
    if not PROMPT_MANIFEST.exists():
        raise FileNotFoundError(PROMPT_MANIFEST)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    OLD_DIR.mkdir(parents=True, exist_ok=True)
    rejected = json.loads(REJECTED_MANIFEST.read_text(encoding="utf-8")) if REJECTED_MANIFEST.exists() else {"entries": []}
    rejected_by = {(e["char_id"], e["expression"]): e for e in rejected.get("entries", [])}
    records: list[dict[str, Any]] = []

    for char_id, cfg in CHARACTERS.items():
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
            rejected_entry = rejected_by.get((char_id, expr), {})
            records.append({
                "char_id": char_id,
                "tavern_id": cfg["tavern_id"],
                "expression": expr,
                "source_path": str(source).replace("\\", "/"),
                "target_path": str(target).replace("\\", "/"),
                "old_backup_path": str(backup).replace("\\", "/"),
                "old_sha256": old_hash,
                "new_sha256": new_hash,
                "old_dimensions": old_dim,
                "new_dimensions": new_dim,
                "overwrote_project_asset": True,
                "rejected_manifest_status": rejected_entry.get("status"),
                "rejected_manifest_sha256": rejected_entry.get("sha256"),
                "matches_rejected_after_rebuild": new_hash == rejected_entry.get("sha256"),
            })

    make_contact_sheet(records)
    manifest = {
        "version": 1,
        "created_at": "2026-04-30",
        "task": "04-30-public-welfare-npc-batch-upgrade",
        "scope": "Batch 2 generated project-local sprite replacement for the remaining pending rejected-expression cleanup slice.",
        "source_prompt_manifest": str(PROMPT_MANIFEST).replace("\\", "/"),
        "generation_method": "Deterministic project-local PIL renderer based on the approved Batch 2 Prompt-as-Code manifest; no external IP, logos, readable real text, or private data.",
        "target_shops": sorted({cfg["tavern_id"] for cfg in CHARACTERS.values()}),
        "target_characters": list(CHARACTERS),
        "required_expressions": EXPRESSIONS,
        "contact_sheet": str(CONTACT_SHEET).replace("\\", "/"),
        "style_recipes": STYLE_RECIPES,
        "records": records,
    }
    (OUT_DIR / "batch-2-generated-assets-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = [
        "# Batch 2 generated assets manifest",
        "",
        "This artifact records the final pending rejected-expression cleanup slice for `04-30-public-welfare-npc-batch-upgrade`.",
        "",
        "## Scope",
        "",
        "- Target shops: " + ", ".join(f"`{shop}`" for shop in manifest["target_shops"]) + ".",
        "- Target characters: " + ", ".join(f"`{c}`" for c in CHARACTERS),
        "- Generated/replaced expressions: " + ", ".join(f"`{e}`" for e in EXPRESSIONS),
        "- Final project path pattern: `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.",
        "- Source prompt manifest: `" + str(PROMPT_MANIFEST).replace('\\', '/') + "`.",
        "- Contact sheet: `" + str(CONTACT_SHEET).replace('\\', '/') + "`.",
        "- Reusable style recipes recorded in `.agents/skills/generate-character-prompt/references/style-recipes.md` sections 21–24.",
        "",
        "## Method",
        "",
        manifest["generation_method"] + " Source/reference images are 512×512; runtime sprites are 256×256 PNG.",
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
        "Previous project sprites for this batch were copied to `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/old-assets/` before overwrite.",
    ])
    (OUT_DIR / "batch-2-generated-assets-manifest.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({
        "records": len(records),
        "contact_sheet": str(CONTACT_SHEET).replace("\\", "/"),
        "manifest": str(OUT_DIR / "batch-2-generated-assets-manifest.json").replace("\\", "/"),
        "any_rejected_matches": any(r["matches_rejected_after_rebuild"] for r in records),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
