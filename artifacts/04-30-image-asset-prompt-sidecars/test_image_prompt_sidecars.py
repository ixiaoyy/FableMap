# -*- coding: utf-8 -*-
"""Focused tests for the image prompt sidecar helper script."""

import hashlib
from pathlib import Path
import sys

from PIL import Image

TASK_DIR = Path(__file__).resolve().parent
if str(TASK_DIR) not in sys.path:
    sys.path.insert(0, str(TASK_DIR))

from image_prompt_sidecars import (  # noqa: E402
    ImageAsset,
    PromptRecord,
    build_expression_set_sidecar_markdown,
    build_sidecar_markdown,
    final_prompt_from_body,
    image_metadata,
    parse_sidecar,
    sidecar_path_for,
    validate_sidecar,
)


def _write_png(path: Path, color=(20, 40, 80)) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.new("RGB", (2, 3), color).save(path)
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_image_metadata_calculates_dimensions_and_sha(tmp_path):
    image_path = tmp_path / "frontend" / "public" / "assets" / "demo.png"
    expected_hash = _write_png(image_path)

    metadata = image_metadata(image_path, tmp_path)

    assert metadata["width"] == 2
    assert metadata["height"] == 3
    assert metadata["sha256"] == expected_hash
    assert metadata["asset"] == "frontend/public/assets/demo.png"


def test_build_and_parse_original_final_sidecar(tmp_path):
    image_path = tmp_path / "frontend" / "public" / "assets" / "npcs" / "demo" / "neutral.png"
    expected_hash = _write_png(image_path)
    asset = ImageAsset(
        path=image_path,
        relpath="frontend/public/assets/npcs/demo/neutral.png",
        width=2,
        height=3,
        sha256=expected_hash,
        references=["backend/src/fablemap_api/core/default_taverns.py"],
    )

    markdown = build_sidecar_markdown(
        asset,
        prompt_type="original-final",
        final_prompt="A finished original FableMap cyber-tavern NPC portrait with stable identity locks.",
        negative_constraints=["No logo.", "No watermark."],
        identity_locks=["same silhouette", "same signature prop"],
        source_type="prompt-manifest",
        source_manifest="artifacts/demo/manifest.json",
        character_id="char_demo",
        expression="neutral",
        can_regenerate=True,
    )
    parsed = parse_sidecar(markdown)

    assert parsed.frontmatter["asset"] == "frontend/public/assets/npcs/demo/neutral.png"
    assert parsed.frontmatter["prompt_type"] == "original-final"
    assert parsed.frontmatter["sha256"] == expected_hash
    assert "## Final prompt" in parsed.body
    assert "stable identity locks" in parsed.body


def test_validate_sidecar_rejects_hash_mismatch(tmp_path):
    image_path = tmp_path / "frontend" / "public" / "assets" / "demo.png"
    _write_png(image_path)
    sidecar = image_path.with_name("demo.prompt.md")
    sidecar.write_text(
        "---\n"
        "asset: frontend/public/assets/demo.png\n"
        "prompt_type: reverse-engineered\n"
        "width: 2\n"
        "height: 3\n"
        "sha256: wrong\n"
        "updated_at: 2026-05-02\n"
        "can_regenerate_higher_quality: true\n"
        "---\n\n"
        "## Final prompt\n\nA reverse-engineered prompt.\n",
        encoding="utf-8",
    )

    errors = validate_sidecar(image_path, sidecar, tmp_path)

    assert any("sha256 mismatch" in error for error in errors)


def test_expression_set_sidecar_covers_multiple_sprite_hashes(tmp_path):
    char_dir = tmp_path / "frontend" / "public" / "assets" / "npcs" / "public-welfare" / "char_demo"
    neutral = char_dir / "neutral.png"
    joy = char_dir / "joy.png"
    neutral_hash = _write_png(neutral, color=(20, 40, 80))
    joy_hash = _write_png(joy, color=(80, 40, 20))
    assets = [
        ImageAsset(neutral, "frontend/public/assets/npcs/public-welfare/char_demo/neutral.png", 2, 3, neutral_hash, []),
        ImageAsset(joy, "frontend/public/assets/npcs/public-welfare/char_demo/joy.png", 2, 3, joy_hash, []),
    ]
    records = [
        PromptRecord("original-final", "Base prompt.\nExpression suffix (neutral): calm.", ["No logo."], ["same face"], "prompt-manifest", character_id="char_demo", expression="neutral"),
        PromptRecord("original-final", "Base prompt.\nExpression suffix (joy): smiling.", ["No logo."], ["same face"], "prompt-manifest", character_id="char_demo", expression="joy"),
    ]

    sidecar = sidecar_path_for(neutral)
    sidecar.write_text(build_expression_set_sidecar_markdown(assets, records), encoding="utf-8")
    parsed = parse_sidecar(sidecar.read_text(encoding="utf-8"))
    final_prompt = final_prompt_from_body(parsed.body)

    assert sidecar.name == "expression-set.prompt.md"
    assert parsed.frontmatter["prompt_scope"] == "npc-expression-set"
    assert "neutral.png" in parsed.frontmatter["assets"]
    assert "joy.png" in parsed.frontmatter["assets"]
    assert "### joy" not in final_prompt
    assert "smiling" not in final_prompt
    assert "neutral" in final_prompt
    assert validate_sidecar(neutral, sidecar, tmp_path) == []
    assert validate_sidecar(joy, sidecar, tmp_path) == []
