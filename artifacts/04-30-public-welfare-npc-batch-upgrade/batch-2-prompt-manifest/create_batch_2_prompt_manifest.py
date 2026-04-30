from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

OUT_DIR = Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest")
JSON_PATH = OUT_DIR / "public-welfare-batch-2-prompt-manifest.json"
MD_PATH = OUT_DIR / "public-welfare-batch-2-prompt-manifest.md"
EXPRESSIONS = ["neutral", "joy", "anger", "embarrassment", "curiosity"]

STYLES = {
    "pw_lantern_helpdesk": {
        "style_family": "civic lantern wayfinding anime/game portrait, clean map-table collage",
        "palette_light": "warm paper white, soft lighthouse yellow, civic cyan, leaf green, graphite linework / clear desk-lamp glow and gentle map reflection",
        "material_system": "paper map layers, sticky-note blocks without readable text, translucent route lines, clean cel-shaded character core",
        "anti_repetition": "no generic museum docent bust; must show map-table/lantern/helpdesk wayfinding cues and practical guidance posture",
    },
    "pw_midnight_treehole": {
        "style_family": "lo-fi midnight radio mixed-media portrait, quiet white-line overlay on soft dark room",
        "palette_light": "deep navy, muted violet, low amber equipment LEDs, desaturated teal highlights / low-key studio lamp and city-window rim light",
        "material_system": "soft photo-grain blur, radio waveform arcs, handwritten-but-unreadable note strips, delicate white linework",
        "anti_repetition": "not medical/therapy branding; not generic night platform; must keep microphone, anonymous notebook, boundary-safe radio mood",
    },
    "pw_lost_found_archive": {
        "style_family": "industrial archive glass-booth collage anime/game portrait, pre-digital records desk",
        "palette_light": "aged paper, smoky glass gray, muted denim blue, label-tag cream, small tungsten desk-lamp amber / readable face under glass reflection",
        "material_system": "file cards, blank labels, copier grain, glass booth reflections, thin catalog grid lines",
        "anti_repetition": "no generic librarian; must show lost-found register, safe public-clue sorting, non-private labels",
    },
    "pw_after_school_hero_supply": {
        "style_family": "after-school sticker toybox riso portrait, paper-shadow magical realism without horror",
        "palette_light": "sunset cream, hero-card red, schoolbag blue, paper-white silhouette, golden after-school glow / soft toy-shop light",
        "material_system": "sticker edges, riso grain, folded-paper shadow, old hero-card frames, abstract badge shapes",
        "anti_repetition": "not battle RPG; not ghost horror; paper sword must be harmless and childhood-memory oriented",
    },
}

CHARACTERS = [
    {
        "tavern_id": "pw_lantern_helpdesk",
        "char_id": "char_pw_xiaozhou",
        "name": "小舟",
        "species_body_plan": "ordinary human volunteer guide with crisp map-table posture, small lantern pin, route-card fan",
        "identity_locks": ["map-table guide posture", "white service lamp", "route-card fan", "calm step-by-step gesture"],
        "signature_prop": "blank route-step cards with abstract marks",
    },
    {
        "tavern_id": "pw_midnight_treehole",
        "char_id": "char_pw_anlan",
        "name": "安澜",
        "species_body_plan": "ordinary human midnight host with quiet shoulders, soft headphones, anonymous message notebook",
        "identity_locks": ["soft headphones", "low radio microphone", "anonymous notebook", "quiet boundary-safe expression"],
        "signature_prop": "low radio microphone and unreadable message notebook",
    },
    {
        "tavern_id": "pw_lost_found_archive",
        "char_id": "char_pw_wenjian",
        "name": "闻笺",
        "species_body_plan": "ordinary human archive keeper behind glass booth, careful hands, numbered clue-card rhythm",
        "identity_locks": ["glass archive booth", "lost-found register", "blank label strips", "careful cataloging hands"],
        "signature_prop": "three-column public-clue register with simulated marks",
    },
    {
        "tavern_id": "pw_after_school_hero_supply",
        "char_id": "char_pw_zhijian",
        "name": "纸剑",
        "species_body_plan": "small harmless paper-shadow child echo, folded-paper silhouette, translucent edge, origami sword",
        "identity_locks": ["folded-paper silhouette", "harmless origami sword", "old hero-card sleeve", "sunset drawer reflection"],
        "signature_prop": "folded paper sword and blank hero-card sleeve",
    },
]

EXPRESSION_SUFFIXES = {
    "neutral": "neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language",
    "joy": "joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop",
    "anger": "angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop",
    "embarrassment": "embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop",
    "curiosity": "curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop",
}


def target_files(char_id: str) -> list[str]:
    return [f"frontend/public/assets/npcs/public-welfare/{char_id}/{expr}.png" for expr in EXPRESSIONS]


def base_prompt(character: dict[str, object]) -> str:
    style = STYLES[character["tavern_id"]]
    return (
        f"Create a finished original FableMap cyber-tavern NPC square portrait sprite for {character['name']} "
        f"({character['char_id']}). Subject identity: {character['species_body_plan']}. "
        f"Identity locks: {', '.join(character['identity_locks'])}. Signature prop: {character['signature_prop']}. "
        f"The portrait is visibly inside {character['tavern_id']} with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. "
        f"Style DNA: {style['style_family']}; palette and light: {style['palette_light']}; "
        f"medium/texture: {style['material_system']}. Anti-repetition rule: {style['anti_repetition']}. "
        "Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. "
        "No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys."
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    prompt_records = []
    for character in CHARACTERS:
        record = {
            **character,
            "style": STYLES[character["tavern_id"]],
            "target_files": target_files(character["char_id"]),
            "base_prompt": base_prompt(character),
            "expression_suffixes": EXPRESSION_SUFFIXES,
        }
        prompt_records.append(record)
    data = {
        "version": 1,
        "created_at": "2026-04-30",
        "task": "04-30-public-welfare-npc-batch-upgrade",
        "scope": "Batch 2 final pending rejected-expression cleanup for old public-welfare NPC assets.",
        "required_expressions": EXPRESSIONS,
        "characters": prompt_records,
        "style_recipes": {
            "path": ".agents/skills/generate-character-prompt/references/style-recipes.md",
            "sections": [
                "21. 灯塔问讯台 / 公民导览地图灯箱肖像",
                "22. 深夜树洞电台 / Lo-fi 白线电波肖像",
                "23. 城市拾光档案亭 / 玻璃档案格拼贴肖像",
                "24. 放学后英雄补给社 / 贴纸玩具箱纸影肖像",
            ],
        },
    }
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Batch 2 Prompt Manifest — Public-welfare pending rejected-expression cleanup",
        "",
        "This prompt-first manifest covers the remaining `pending_regeneration` rejected-expression assets not included in Batch 1.",
        "",
        "## Scope / guardrails",
        "",
        "- Target characters: " + ", ".join(f"`{c['char_id']}`" for c in CHARACTERS) + ".",
        "- Final project path pattern: `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.",
        "- Final sprite size: 256×256 PNG; 512×512 source/reference images are archived in Batch 2 generated assets.",
        "- Prompt-first only; generated/replaced files are recorded separately in Batch 2 generated assets manifest.",
        "- Reusable style recipes recorded in `.agents/skills/generate-character-prompt/references/style-recipes.md` sections 21–24.",
        "",
        "## Diversity matrix",
        "",
        "| Tavern | Style family | Palette / light | Material system | Anti-repetition rule |",
        "| --- | --- | --- | --- | --- |",
    ]
    for tavern_id, style in STYLES.items():
        lines.append(
            f"| `{tavern_id}` | {style['style_family']} | {style['palette_light']} | {style['material_system']} | {style['anti_repetition']} |"
        )
    lines.extend(["", "## Character prompt map", "", "| Character | Species/body plan | Identity locks | Target files |", "| --- | --- | --- | --- |"])
    for c in prompt_records:
        lines.append(
            f"| `{c['char_id']}` {c['name']} | {c['species_body_plan']} | {', '.join(c['identity_locks'])} | "
            + "<br>".join(f"`{p}`" for p in c["target_files"])
            + " |"
        )
    lines.extend(["", "## Copyable base prompts", ""])
    for c in prompt_records:
        lines.extend([
            f"### {c['name']} / `{c['char_id']}`",
            "",
            "Base prompt:",
            "",
            "```text",
            c["base_prompt"],
            "```",
            "",
            "Expression suffixes:",
        ])
        for expr, suffix in EXPRESSION_SUFFIXES.items():
            lines.append(f"- `{expr}`: {suffix}")
        lines.append("")
    MD_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"manifest": str(JSON_PATH).replace('\\', '/'), "characters": len(prompt_records)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
