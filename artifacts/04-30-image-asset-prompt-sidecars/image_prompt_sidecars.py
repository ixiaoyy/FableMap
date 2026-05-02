# -*- coding: utf-8 -*-
"""Generate, inventory, and validate FableMap image prompt sidecars."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from PIL import Image

VALID_PROMPT_TYPES = {"original-final", "reverse-engineered", "reference-only", "unknown-needs-human"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
TEXT_EXTENSIONS = {".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".md", ".css", ".html", ".txt"}
DEFAULT_UPDATED_AT = "2026-05-03"
EXPRESSION_SET_SIDECAR_NAME = "expression-set.prompt.md"
EXPRESSION_ORDER = ["neutral", "joy", "happy", "anger", "angry", "embarrassment", "shy", "curiosity", "curious"]
EXPRESSION_NAMES = set(EXPRESSION_ORDER)
DEFAULT_ROOTS = [
    Path("frontend/public"),
    Path("frontend/app/assets"),
    Path("artifacts/04-30-public-welfare-npc-batch-upgrade"),
    Path("artifacts/04-30-hospital-nurse-npc-asset"),
    Path("artifacts/04-29-npc-expression-art-quality-rebuild"),
]
SKIP_PARTS = {
    ".git", "node_modules", "build", "dist", ".cache", "__pycache__", "old-assets", "sources",
    "pytest-tmp", "pytest-tmp-current", "pytest-basetemp-current", "pytest-tmp-group",
}
DEFAULT_NEGATIVE_CONSTRAINTS = [
    "No readable brand text, logo, watermark, or existing IP imitation.",
    "No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.",
    "Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.",
]
PLACE_ATMOSPHERE_LABELS = {
    "healing": "mystical healing sanctuary bathed in soft golden light",
    "supply": "bustling supply outpost at dusk with lanterns and crates",
    "judgement": "imposing stone judgement tower under dramatic storm light",
    "ember": "warm cozy tavern interior with firelight and steam",
    "lore": "ancient academy hall with bookshelves and floating candles",
    "grove": "enchanted forest grove with bioluminescent twilight plants",
    "spirit": "glowing spiritual nexus with blue-white energy",
    "shrine": "overgrown abandoned shrine reclaimed by moss and vines",
    "market": "grand indoor market hall with warm lively stalls",
    "transit": "mysterious transit hub with glowing pathways",
}


@dataclass(frozen=True)
class ImageAsset:
    path: Path
    relpath: str
    width: Optional[int]
    height: Optional[int]
    sha256: str
    references: List[str]


@dataclass(frozen=True)
class ParsedSidecar:
    frontmatter: Dict[str, object]
    body: str


@dataclass(frozen=True)
class PromptRecord:
    prompt_type: str
    final_prompt: str
    negative_constraints: List[str]
    identity_locks: List[str]
    source_type: str
    source_manifest: str = ""
    character_id: str = ""
    expression: str = ""
    style_source: str = ""
    notes: str = ""
    can_regenerate: bool = True


def normalize_path(path: Path | str) -> str:
    return str(path).replace("\\", "/")


def relpath(path: Path, root: Path) -> str:
    return normalize_path(path.resolve().relative_to(root.resolve()))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def svg_dimensions(path: Path) -> Tuple[Optional[int], Optional[int]]:
    text = path.read_text(encoding="utf-8", errors="ignore")[:2000]
    width = re.search(r"\bwidth=['\"]([0-9.]+)", text)
    height = re.search(r"\bheight=['\"]([0-9.]+)", text)
    if width and height:
        return int(float(width.group(1))), int(float(height.group(1)))
    viewbox = re.search(r"\bviewBox=['\"]\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)", text)
    if viewbox:
        return int(float(viewbox.group(1))), int(float(viewbox.group(2)))
    return None, None


def image_metadata(path: Path, repo_root: Path) -> Dict[str, object]:
    if path.suffix.lower() == ".svg":
        width, height = svg_dimensions(path)
    else:
        with Image.open(path) as image:
            width, height = image.size
    return {"asset": relpath(path, repo_root), "width": width, "height": height, "sha256": sha256_file(path)}


def sidecar_path_for(image_path: Path) -> Path:
    if is_npc_expression_set_member(image_path):
        return image_path.parent / EXPRESSION_SET_SIDECAR_NAME
    return image_path.with_name(f"{image_path.stem}.prompt.md")


def expression_sort_key(path: Path) -> Tuple[int, str]:
    try:
        return EXPRESSION_ORDER.index(path.stem), path.name
    except ValueError:
        return len(EXPRESSION_ORDER), path.name


def expression_assets_in_dir(directory: Path) -> List[Path]:
    if not directory.exists():
        return []
    return sorted(
        [
            path
            for path in directory.iterdir()
            if path.is_file()
            and path.suffix.lower() in IMAGE_EXTENSIONS
            and path.stem in EXPRESSION_NAMES
            and ".prompt" not in path.name
        ],
        key=expression_sort_key,
    )


def is_npc_expression_set_member(image_path: Path) -> bool:
    normalized = normalize_path(image_path)
    if "frontend/public/assets/npcs/" not in normalized:
        return False
    if image_path.stem not in EXPRESSION_NAMES:
        return False
    return len(expression_assets_in_dir(image_path.parent)) > 1


def markdown_list(items: Sequence[str]) -> str:
    cleaned = [item.strip() for item in items if item and item.strip()]
    return "\n".join(f"- {item}" for item in cleaned) if cleaned else "- None recorded."


def yaml_scalar(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return "" if value is None else str(value)


def build_sidecar_markdown(
    asset: ImageAsset,
    prompt_type: str,
    final_prompt: str,
    negative_constraints: Sequence[str],
    identity_locks: Sequence[str],
    source_type: str,
    source_manifest: str = "",
    character_id: str = "",
    expression: str = "",
    style_source: str = "",
    notes: str = "",
    can_regenerate: bool = True,
    updated_at: str = DEFAULT_UPDATED_AT,
) -> str:
    if prompt_type not in VALID_PROMPT_TYPES:
        raise ValueError(f"invalid prompt_type: {prompt_type}")
    fields: List[Tuple[str, object]] = [("asset", asset.relpath), ("prompt_type", prompt_type), ("source_type", source_type)]
    if source_manifest:
        fields.append(("source_manifest", source_manifest))
    if character_id:
        fields.append(("character_id", character_id))
    if expression:
        fields.append(("expression", expression))
    fields += [("width", asset.width), ("height", asset.height), ("sha256", asset.sha256), ("updated_at", updated_at), ("can_regenerate_higher_quality", can_regenerate)]
    header = "---\n" + "\n".join(f"{key}: {yaml_scalar(value)}" for key, value in fields) + "\n---"
    provenance = {
        "original-final": "This sidecar records the original final prompt or a prompt-manifest reconstruction used for project asset regeneration.",
        "reverse-engineered": "This sidecar was reverse-engineered from the current repository image and metadata; it is not the original generation prompt.",
        "reference-only": "This sidecar records reusable/reference design intent; it may not reproduce the asset exactly.",
        "unknown-needs-human": "The original generation prompt is unknown and needs human review before high-quality regeneration.",
    }[prompt_type]
    if notes:
        provenance = f"{provenance}\n\n{notes}"
    return (
        f"{header}\n\n"
        f"## Final prompt\n\n{final_prompt.strip()}\n\n"
        f"## Negative constraints\n\n{markdown_list(negative_constraints)}\n\n"
        f"## Style recipe / Style DNA source\n\n{style_source.strip() or 'Not separately recorded; see final prompt and provenance notes.'}\n\n"
        f"## Identity locks\n\n{markdown_list(identity_locks)}\n\n"
        f"## Provenance notes\n\n{provenance}\n"
    )


def unique_preserve_order(values: Iterable[str]) -> List[str]:
    seen = set()
    result: List[str] = []
    for value in values:
        cleaned = value.strip() if value else ""
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        result.append(cleaned)
    return result


def semicolon_join(values: Sequence[str]) -> str:
    return "; ".join(values)


def semicolon_map(values: Dict[str, object]) -> str:
    return "; ".join(f"{key}={value}" for key, value in values.items())


def parent_rel_group(rel: str) -> str:
    return "/".join(rel.split("/")[:-1]) + "/"


def choose_group_prompt_type(records: Sequence[PromptRecord]) -> str:
    types = {record.prompt_type for record in records}
    if len(types) == 1:
        return next(iter(types))
    if "unknown-needs-human" in types:
        return "unknown-needs-human"
    if "reverse-engineered" in types:
        return "reverse-engineered"
    if "reference-only" in types:
        return "reference-only"
    return "unknown-needs-human"


def choose_natural_expression_pair(
    pairs: Sequence[Tuple[ImageAsset, PromptRecord]],
) -> Tuple[ImageAsset, PromptRecord]:
    for preferred in ("neutral", "natural"):
        for asset, record in pairs:
            if asset.path.stem == preferred or record.expression == preferred:
                return asset, record
    return pairs[0]


def natural_expression_prompt(record: PromptRecord) -> str:
    prompt = record.final_prompt.strip()
    guardrail = (
        "Generate exactly one square NPC portrait image: one character, one natural/neutral expression, "
        "not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image."
    )
    return f"{guardrail}\n\n{prompt}"


def build_expression_set_sidecar_markdown(
    assets: Sequence[ImageAsset],
    records: Sequence[PromptRecord],
    updated_at: str = DEFAULT_UPDATED_AT,
) -> str:
    if not assets:
        raise ValueError("expression set sidecar requires at least one asset")
    if len(assets) != len(records):
        raise ValueError("assets and records length mismatch")
    sorted_pairs = sorted(zip(assets, records), key=lambda pair: expression_sort_key(pair[0].path))
    sorted_assets = [pair[0] for pair in sorted_pairs]
    sorted_records = [pair[1] for pair in sorted_pairs]
    prompt_type = choose_group_prompt_type(sorted_records)
    if prompt_type not in VALID_PROMPT_TYPES:
        raise ValueError(f"invalid prompt_type: {prompt_type}")
    character_id = unique_preserve_order(
        [record.character_id for record in sorted_records] + [asset.path.parent.name for asset in sorted_assets]
    )[0]
    expressions = [asset.path.stem for asset in sorted_assets]
    asset_rels = [asset.relpath for asset in sorted_assets]
    widths = {asset.path.stem: asset.width for asset in sorted_assets}
    heights = {asset.path.stem: asset.height for asset in sorted_assets}
    sha256s = {asset.path.stem: asset.sha256 for asset in sorted_assets}
    source_manifests = unique_preserve_order(record.source_manifest for record in sorted_records)
    source_types = unique_preserve_order(record.source_type for record in sorted_records)
    fields: List[Tuple[str, object]] = [
        ("prompt_scope", "npc-expression-set"),
        ("asset_group", parent_rel_group(sorted_assets[0].relpath)),
        ("assets", semicolon_join(asset_rels)),
        ("expressions", ", ".join(expressions)),
        ("asset_count", len(sorted_assets)),
        ("prompt_type", prompt_type),
        ("source_type", semicolon_join(source_types) if source_types else "mixed"),
    ]
    if source_manifests:
        fields.append(("source_manifest", semicolon_join(source_manifests)))
    fields += [
        ("character_id", character_id),
        ("widths", semicolon_map(widths)),
        ("heights", semicolon_map(heights)),
        ("sha256s", semicolon_map(sha256s)),
        ("updated_at", updated_at),
        ("can_regenerate_higher_quality", all(record.can_regenerate for record in sorted_records)),
    ]
    header = "---\n" + "\n".join(f"{key}: {yaml_scalar(value)}" for key, value in fields) + "\n---"
    natural_asset, natural_record = choose_natural_expression_pair(sorted_pairs)
    expression_prompt = natural_expression_prompt(natural_record)
    expression_notes = "\n".join(f"- `{asset.relpath}` — `{asset.path.stem}`" for asset in sorted_assets)
    negative_constraints = unique_preserve_order(
        constraint for record in sorted_records for constraint in record.negative_constraints
    )
    negative_constraints = unique_preserve_order(
        [
            *negative_constraints,
            "Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.",
        ]
    )
    identity_locks = unique_preserve_order(lock for record in sorted_records for lock in record.identity_locks)
    style_sources = unique_preserve_order(record.style_source for record in sorted_records)
    notes = unique_preserve_order(record.notes for record in sorted_records)
    provenance = {
        "original-final": "This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.",
        "reverse-engineered": "This expression-set sidecar was reverse-engineered from current repository images and metadata; it is not the original generation prompt unless a source manifest is cited.",
        "reference-only": "This expression-set sidecar records reusable/reference design intent for the grouped sprite set; it may not reproduce the assets exactly.",
        "unknown-needs-human": "The original expression-set generation prompt is unknown and needs human review before high-quality regeneration.",
    }[prompt_type]
    provenance = (
        f"{provenance}\n\n"
        f"The reusable generation prompt above intentionally uses only `{natural_asset.path.stem}` / natural expression. "
        "Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix."
    )
    if notes:
        provenance = f"{provenance}\n\n" + "\n".join(f"- {note}" for note in notes)
    return (
        f"{header}\n\n"
        f"## Final prompt\n\n{expression_prompt}\n\n"
        f"## Expression assets\n\n{expression_notes}\n\n"
        f"## Negative constraints\n\n{markdown_list(negative_constraints)}\n\n"
        f"## Style recipe / Style DNA source\n\n{markdown_list(style_sources)}\n\n"
        f"## Identity locks\n\n{markdown_list(identity_locks)}\n\n"
        f"## Provenance notes\n\n{provenance}\n"
    )


def parse_sidecar(text: str) -> ParsedSidecar:
    if not text.startswith("---\n"):
        raise ValueError("missing frontmatter")
    try:
        _, raw_frontmatter, body = text.split("---", 2)
    except ValueError as exc:
        raise ValueError("unterminated frontmatter") from exc
    frontmatter: Dict[str, object] = {}
    for line in raw_frontmatter.strip().splitlines():
        if not line.strip():
            continue
        if ":" not in line:
            raise ValueError(f"invalid frontmatter line: {line}")
        key, value = line.split(":", 1)
        value = value.strip()
        if value.lower() == "true":
            parsed: object = True
        elif value.lower() == "false":
            parsed = False
        elif value.isdigit():
            parsed = int(value)
        else:
            parsed = value
        frontmatter[key.strip()] = parsed
    return ParsedSidecar(frontmatter=frontmatter, body=body.strip())


def final_prompt_from_body(body: str) -> str:
    match = re.search(r"## Final prompt\s*(.*?)(?:\n## |\Z)", body, re.DOTALL)
    return match.group(1).strip() if match else ""


def parse_semicolon_list(value: object) -> List[str]:
    return [item.strip() for item in str(value or "").split(";") if item.strip()]


def parse_semicolon_map(value: object) -> Dict[str, str]:
    result: Dict[str, str] = {}
    for item in parse_semicolon_list(value):
        if "=" not in item:
            continue
        key, raw_value = item.split("=", 1)
        result[key.strip()] = raw_value.strip()
    return result


def validate_sidecar(image_path: Path, sidecar_path: Path, repo_root: Path) -> List[str]:
    if not image_path.exists():
        return [f"image missing: {normalize_path(image_path)}"]
    if not sidecar_path.exists():
        return [f"sidecar missing: {normalize_path(sidecar_path)}"]
    try:
        parsed = parse_sidecar(sidecar_path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"sidecar parse error: {exc}"]
    if parsed.frontmatter.get("prompt_scope") == "npc-expression-set":
        return validate_expression_set_sidecar(image_path, parsed, repo_root)
    metadata = image_metadata(image_path, repo_root)
    errors: List[str] = []
    if parsed.frontmatter.get("asset") != metadata["asset"]:
        errors.append(f"asset mismatch: expected {metadata['asset']}, got {parsed.frontmatter.get('asset')}")
    if parsed.frontmatter.get("prompt_type") not in VALID_PROMPT_TYPES:
        errors.append(f"invalid prompt_type: {parsed.frontmatter.get('prompt_type')}")
    for key in ["width", "height"]:
        if metadata[key] is not None and parsed.frontmatter.get(key) != metadata[key]:
            errors.append(f"{key} mismatch: expected {metadata[key]}, got {parsed.frontmatter.get(key)}")
    if parsed.frontmatter.get("sha256") != metadata["sha256"]:
        errors.append(f"sha256 mismatch: expected {metadata['sha256']}, got {parsed.frontmatter.get('sha256')}")
    if not final_prompt_from_body(parsed.body):
        errors.append("final prompt is empty")
    return errors


def validate_expression_set_sidecar(image_path: Path, parsed: ParsedSidecar, repo_root: Path) -> List[str]:
    metadata = image_metadata(image_path, repo_root)
    expression = image_path.stem
    errors: List[str] = []
    if parsed.frontmatter.get("prompt_type") not in VALID_PROMPT_TYPES:
        errors.append(f"invalid prompt_type: {parsed.frontmatter.get('prompt_type')}")
    assets = parse_semicolon_list(parsed.frontmatter.get("assets"))
    if metadata["asset"] not in assets:
        errors.append(f"asset missing from expression set: {metadata['asset']}")
    if parsed.frontmatter.get("asset_count") != len(assets):
        errors.append(f"asset_count mismatch: expected {len(assets)}, got {parsed.frontmatter.get('asset_count')}")
    expressions = [item.strip() for item in str(parsed.frontmatter.get("expressions", "")).split(",") if item.strip()]
    if expression not in expressions:
        errors.append(f"expression missing from expression set: {expression}")
    sha256s = parse_semicolon_map(parsed.frontmatter.get("sha256s"))
    if sha256s.get(expression) != metadata["sha256"]:
        errors.append(f"sha256 mismatch for {expression}: expected {metadata['sha256']}, got {sha256s.get(expression)}")
    widths = parse_semicolon_map(parsed.frontmatter.get("widths"))
    heights = parse_semicolon_map(parsed.frontmatter.get("heights"))
    if metadata["width"] is not None and widths.get(expression) != str(metadata["width"]):
        errors.append(f"width mismatch for {expression}: expected {metadata['width']}, got {widths.get(expression)}")
    if metadata["height"] is not None and heights.get(expression) != str(metadata["height"]):
        errors.append(f"height mismatch for {expression}: expected {metadata['height']}, got {heights.get(expression)}")
    final_prompt = final_prompt_from_body(parsed.body)
    if not final_prompt:
        errors.append("final prompt is empty")
    forbidden_prompt_markers = ["### joy", "### anger", "### embarrassment", "### curiosity"]
    for marker in forbidden_prompt_markers:
        if marker in final_prompt:
            errors.append(f"expression-set final prompt must not include grouped prompt block: {marker}")
    return errors


def should_skip(path: Path) -> bool:
    return bool(set(path.parts) & SKIP_PARTS)


def walk_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in SKIP_PARTS]
        current = Path(dirpath)
        if should_skip(current):
            continue
        for filename in filenames:
            yield current / filename


def iter_images(roots: Sequence[Path], repo_root: Path) -> Iterable[Path]:
    seen = set()
    for root in roots:
        abs_root = (repo_root / root).resolve() if not root.is_absolute() else root.resolve()
        if not abs_root.exists():
            continue
        for path in walk_files(abs_root):
            if should_skip(path):
                continue
            if path.suffix.lower() in IMAGE_EXTENSIONS and ".prompt" not in path.name:
                key = path.resolve()
                if key not in seen:
                    seen.add(key)
                    yield path


def public_url_for(rel: str) -> Optional[str]:
    return "/" + rel[len("frontend/public/") :] if rel.startswith("frontend/public/") else None


def collect_text_files(repo_root: Path) -> List[Path]:
    files: List[Path] = []
    for path in walk_files(repo_root):
        if should_skip(path) or not path.is_file():
            continue
        if (
            path.suffix.lower() in TEXT_EXTENSIONS
            and not path.name.endswith(".prompt.md")
            and "image-prompt-sidecar-inventory" not in path.name
        ):
            files.append(path)
    return files


def find_references(rel: str, text_files: Sequence[Path], repo_root: Path, cap: int = 30) -> List[str]:
    needles = {rel}
    if public_url_for(rel):
        needles.add(public_url_for(rel) or "")
    refs: List[str] = []
    for path in text_files:
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if any(needle and needle in text for needle in needles):
            refs.append(relpath(path, repo_root))
            if len(refs) >= cap:
                break
    return refs


def build_reference_map(asset_rels: Sequence[str], text_files: Sequence[Path], repo_root: Path, cap: int = 30) -> Dict[str, List[str]]:
    needles = {rel: [rel] + ([public_url_for(rel)] if public_url_for(rel) else []) for rel in asset_rels}
    refs: Dict[str, List[str]] = {rel: [] for rel in asset_rels}
    for path in text_files:
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        path_rel = relpath(path, repo_root)
        for rel, rel_needles in needles.items():
            if len(refs[rel]) >= cap:
                continue
            if any(needle and needle in text for needle in rel_needles):
                refs[rel].append(path_rel)
    return refs


def scan_assets(roots: Sequence[Path], repo_root: Path) -> List[ImageAsset]:
    text_files = collect_text_files(repo_root)
    assets_without_refs: List[ImageAsset] = []
    for image_path in sorted(iter_images(roots, repo_root), key=lambda p: normalize_path(p.relative_to(repo_root))):
        metadata = image_metadata(image_path, repo_root)
        asset_rel = str(metadata["asset"])
        assets_without_refs.append(ImageAsset(image_path, asset_rel, metadata["width"], metadata["height"], str(metadata["sha256"]), []))
    refs = build_reference_map([asset.relpath for asset in assets_without_refs], text_files, repo_root)
    return [
        ImageAsset(asset.path, asset.relpath, asset.width, asset.height, asset.sha256, refs.get(asset.relpath, []))
        for asset in assets_without_refs
    ]


def load_public_welfare_prompt_index(repo_root: Path) -> Dict[str, PromptRecord]:
    index: Dict[str, PromptRecord] = {}
    manifests = [
        Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json"),
        Path("artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json"),
    ]
    for rel_manifest in manifests:
        path = repo_root / rel_manifest
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        negative = data.get("negative_constraints") or DEFAULT_NEGATIVE_CONSTRAINTS
        characters: List[dict] = []
        if "shops" in data:
            for shop in data["shops"]:
                for character in shop.get("characters", []):
                    c = dict(character)
                    c.setdefault("style_source", shop.get("style_dna", ""))
                    characters.append(c)
        else:
            characters.extend(data.get("characters", []))
        for character in characters:
            base = character.get("base_prompt", "").strip()
            suffixes = character.get("expression_prompt_suffixes") or character.get("expression_suffixes") or {}
            targets = character.get("target_paths") or character.get("target_files") or {}
            path_map = {Path(item).stem: item for item in targets} if isinstance(targets, list) else dict(targets)
            style = character.get("style") or character.get("style_source") or character.get("prompt_envelope", {}).get("style_dna") or ""
            style_source = "; ".join(f"{k}: {v}" for k, v in style.items()) if isinstance(style, dict) else str(style)
            locks = list(character.get("identity_locks") or [])
            if character.get("signature_prop"):
                locks.append(f"signature prop: {character['signature_prop']}")
            for expression, target in path_map.items():
                suffix = suffixes.get(expression, "")
                prompt = f"{base}\n\nExpression suffix ({expression}): {suffix}" if suffix else base
                index[normalize_path(target)] = PromptRecord(
                    "original-final", prompt, list(negative), locks, "prompt-manifest", normalize_path(rel_manifest),
                    character.get("char_id", ""), expression, style_source,
                    "Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.", True,
                )
    return index


def slug_title(stem: str) -> str:
    return stem.replace("_", " ").replace("-", " ").strip()


def infer_prompt_record(asset: ImageAsset) -> PromptRecord:
    rel = asset.relpath
    stem = asset.path.stem
    parts = set(asset.path.parts)
    if rel.startswith("frontend/public/place-atmosphere/"):
        label = PLACE_ATMOSPHERE_LABELS.get(stem.replace("atmosphere-", ""), slug_title(stem))
        return PromptRecord("reference-only", f"A FableMap place atmosphere illustration: {label}, abstracted real-place tavern mood, visible tavern-entry or interior cues, fantasy watercolor or digital-painting finish, no readable brand signage, no private address details, no logo, no watermark, no existing IP.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"place atmosphere archetype: {stem}"], "docs-image-assets-spec", style_source="docs/IMAGE_ASSETS_SPEC.md place-atmosphere prompt table", notes="Reference prompt from the image asset spec; not guaranteed to be the exact final generation prompt.")
    if rel.startswith("frontend/public/faction-emblems/"):
        return PromptRecord("reference-only", f"A simple original FableMap vector faction emblem for {slug_title(stem)}, compact 64x64 icon composition, symbolic badge language, flat readable shapes, no brand logo, no copyrighted marks, no readable text.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"emblem semantic slug: {stem}"], "svg-reference", style_source="Existing SVG asset reverse note; vector icon semantics are more important than photoreal image style.")
    if "public-welfare" in parts and asset.path.parent.name.startswith("char_pw_"):
        char_id, expression = asset.path.parent.name, asset.path.stem
        return PromptRecord("reverse-engineered", f"Reverse-engineered FableMap public-welfare NPC expression sprite for {char_id}, expression {expression}. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"character_id: {char_id}", f"expression: {expression}", "same face/body plan/outfit/prop across expression set"], "reverse-engineered-current-asset", character_id=char_id, expression=expression, style_source="image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.", notes="Original prompt was not found in current manifests; do not relabel this as original-final.")
    if "npc-style-cast" in parts:
        return PromptRecord("reverse-engineered", f"Reverse-engineered FableMap fallback NPC portrait asset for {slug_title(stem)}. Create an original tavern-themed NPC portrait, bust or waist-up, with visible bar/counter/shelf/mug/lantern/map-table cues, readable role silhouette, anime/game-style rendering, distinct palette and material system, no placeholder icon treatment. Use the existing image as reference for broad role, silhouette, palette, and mood only; keep the result original and IP-safe.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"fallback portrait slug: {stem}"], "reverse-engineered-current-asset", style_source="image-style-prompt-extractor 15D framework summarized from current fallback asset path and visual purpose.", notes="Reverse-engineered sidecar for fallback art; not an original generation prompt.")
    if "homepage" in parts or "discover" in parts:
        surface = "homepage" if "homepage" in parts else "discover"
        return PromptRecord("reverse-engineered", f"Reverse-engineered FableMap {surface} reference illustration for {slug_title(stem)}. Create an original cyber-tavern product UI illustration anchored in the FableMap premise: real place to tavern entrance, owner-authored content, NPC conversation, memory/revisit. Preserve the current asset's broad composition, mood, lighting family, and module purpose while avoiding brand/logo/readable text imitation. Keep mobile-crop-safe focal hierarchy and avoid generic AI concept-art sameness.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"UI reference asset slug: {stem}", f"surface: {surface}"], "reverse-engineered-current-asset", style_source="image-style-prompt-extractor 15D framework summarized from current product reference path and UI purpose.", notes="Reverse-engineered sidecar for a product/reference UI asset; not an original generation prompt.")
    if "map-snapshots" in parts:
        return PromptRecord("reference-only", "Project map snapshot tile reference. Preserve as a non-generative map/reference artifact unless a separate map-snapshot pipeline regenerates it from approved data. Do not use AI image generation to invent exact private addresses or imitate official map-provider tiles.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"map snapshot file: {asset.path.name}"], "project-map-snapshot", style_source="Map snapshot provenance should come from map snapshot manifest/data, not AI art prompting.", notes="Reference-only because this asset should not be replaced by freeform AI art.", can_regenerate=False)
    if rel.startswith("artifacts/"):
        return PromptRecord("reference-only", f"Review/audit artifact image for {slug_title(stem)}. Preserve as task evidence or contact-sheet/reference output, not as a product UI asset. If a future task regenerates it, reconstruct it from the referenced project assets, manifests, or audit script rather than treating this as a standalone visual prompt.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"artifact evidence path: {rel}"], "task-artifact-reference", style_source="Task artifact evidence; regenerate from source assets/manifests/scripts where possible.", notes="Reference-only sidecar for formal audit/review image evidence.", can_regenerate=False)
    return PromptRecord("reverse-engineered", f"Reverse-engineered FableMap image asset for {slug_title(stem)}. Preserve the current asset's broad subject, composition, palette, lighting, medium texture, mood, and product purpose. Keep it original, tavern/real-coordinate compatible where relevant, and safe for project use; no logos, no existing IP, no private data.", DEFAULT_NEGATIVE_CONSTRAINTS, [f"asset path: {rel}"], "reverse-engineered-current-asset", style_source="image-style-prompt-extractor 15D framework summarized from current repository asset path and purpose.", notes="Fallback reverse-engineered sidecar; human review recommended before regeneration.")


def prompt_record_for(asset: ImageAsset, index: Dict[str, PromptRecord]) -> PromptRecord:
    return index.get(asset.relpath) or infer_prompt_record(asset)


def write_sidecar(asset: ImageAsset, record: PromptRecord, overwrite: bool = False) -> bool:
    if is_npc_expression_set_member(asset.path):
        raise ValueError("use write_expression_set_sidecar for NPC expression set assets")
    sidecar = sidecar_path_for(asset.path)
    if sidecar.exists() and not overwrite:
        return False
    sidecar.write_text(build_sidecar_markdown(asset, record.prompt_type, record.final_prompt, record.negative_constraints, record.identity_locks, record.source_type, record.source_manifest, record.character_id, record.expression, record.style_source, record.notes, record.can_regenerate), encoding="utf-8")
    return True


def group_expression_set_assets(assets: Sequence[ImageAsset]) -> Dict[Path, List[ImageAsset]]:
    groups: Dict[Path, List[ImageAsset]] = {}
    for asset in assets:
        if is_npc_expression_set_member(asset.path):
            groups.setdefault(asset.path.parent, []).append(asset)
    return {
        directory: sorted(group_assets, key=lambda asset: expression_sort_key(asset.path))
        for directory, group_assets in groups.items()
    }


def write_expression_set_sidecar(
    group_assets: Sequence[ImageAsset],
    prompt_index: Dict[str, PromptRecord],
    overwrite: bool = False,
) -> bool:
    if not group_assets:
        return False
    sidecar = group_assets[0].path.parent / EXPRESSION_SET_SIDECAR_NAME
    if sidecar.exists() and not overwrite:
        return False
    records = [prompt_record_for(asset, prompt_index) for asset in group_assets]
    sidecar.write_text(build_expression_set_sidecar_markdown(group_assets, records), encoding="utf-8")
    return True


def asset_priority(asset: ImageAsset) -> str:
    rel = asset.relpath
    if rel.startswith("frontend/public/assets/npcs/public-welfare/"):
        return "P0-A"
    if rel.startswith("artifacts/04-30-public-welfare-npc-batch-upgrade/"):
        return "P0-B"
    if rel.startswith("artifacts/"):
        return "P2"
    return "P1"


def inventory_rows(assets: Sequence[ImageAsset], prompt_index: Dict[str, PromptRecord], repo_root: Path) -> List[dict]:
    rows = []
    for asset in assets:
        sidecar = sidecar_path_for(asset.path)
        record = prompt_record_for(asset, prompt_index)
        actual_type = record.prompt_type
        if sidecar.exists():
            try:
                actual_type = str(parse_sidecar(sidecar.read_text(encoding="utf-8")).frontmatter.get("prompt_type", actual_type))
            except Exception:
                actual_type = "invalid"
        rows.append({"asset": asset.relpath, "format": asset.path.suffix.lower().lstrip("."), "width": asset.width, "height": asset.height, "sha256": asset.sha256, "sidecar": relpath(sidecar, repo_root), "sidecar_exists": sidecar.exists(), "sidecar_type": actual_type, "priority": asset_priority(asset), "references": asset.references})
    return rows


def write_inventory(rows: Sequence[dict], out_json: Path, out_md: Path) -> None:
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(list(rows), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    by_type: Dict[str, int] = {}
    by_priority: Dict[str, int] = {}
    missing = 0
    for row in rows:
        by_type[row["sidecar_type"]] = by_type.get(row["sidecar_type"], 0) + 1
        by_priority[row["priority"]] = by_priority.get(row["priority"], 0) + 1
        missing += 0 if row["sidecar_exists"] else 1
    unique_sidecars = sorted({row["sidecar"] for row in rows})
    grouped_sidecars = [sidecar for sidecar in unique_sidecars if sidecar.endswith(f"/{EXPRESSION_SET_SIDECAR_NAME}")]
    lines = ["# Image prompt sidecar inventory", "", f"Generated at: {DEFAULT_UPDATED_AT}", "", "## Summary", "", f"- Total image assets scanned: {len(rows)}", f"- Unique prompt sidecar files: {len(unique_sidecars)}", f"- NPC expression-set sidecars: {len(grouped_sidecars)}", f"- Missing sidecars: {missing}", f"- Prompt types: {by_type}", f"- Priorities: {by_priority}", "", "## Assets", "", "| Priority | Asset | Size | SHA-256 | Sidecar | Type | References |", "|---|---|---:|---|---|---|---:|"]
    for row in rows:
        lines.append(f"| {row['priority']} | `{row['asset']}` | {row['width']}×{row['height']} | `{row['sha256']}` | `{row['sidecar']}` | {row['sidecar_type']} | {len(row['references'])} |")
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")


def validate_assets(assets: Sequence[ImageAsset], repo_root: Path) -> Dict[str, List[str]]:
    failures: Dict[str, List[str]] = {}
    for asset in assets:
        errors = validate_sidecar(asset.path, sidecar_path_for(asset.path), repo_root)
        if errors:
            failures[asset.relpath] = errors
    return failures


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Generate and validate FableMap image prompt sidecars.")
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--root", action="append", default=[])
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--validate", action="store_true")
    parser.add_argument("--inventory-json", default="artifacts/04-30-image-asset-prompt-sidecars/image-prompt-sidecar-inventory.json")
    parser.add_argument("--inventory-md", default="artifacts/04-30-image-asset-prompt-sidecars/image-prompt-sidecar-inventory.md")
    args = parser.parse_args(argv)
    repo_root = Path(args.repo_root).resolve()
    roots = [Path(value) for value in args.root] if args.root else DEFAULT_ROOTS
    assets = scan_assets(roots, repo_root)
    prompt_index = load_public_welfare_prompt_index(repo_root)
    written = 0
    if args.write:
        expression_groups = group_expression_set_assets(assets)
        expression_group_dirs = set(expression_groups)
        for group_assets in expression_groups.values():
            if write_expression_set_sidecar(group_assets, prompt_index, overwrite=args.overwrite):
                written += 1
        for asset in assets:
            if asset.path.parent in expression_group_dirs:
                continue
            if write_sidecar(asset, prompt_record_for(asset, prompt_index), overwrite=args.overwrite):
                written += 1
    rows = inventory_rows(assets, prompt_index, repo_root)
    write_inventory(rows, repo_root / args.inventory_json, repo_root / args.inventory_md)
    print(f"Scanned {len(assets)} image assets")
    print(f"Wrote {written} sidecars")
    print(f"Inventory JSON: {normalize_path(args.inventory_json)}")
    print(f"Inventory MD: {normalize_path(args.inventory_md)}")
    if args.validate:
        failures = validate_assets(assets, repo_root)
        if failures:
            print("Validation failures:")
            for asset, errors in failures.items():
                print(f"- {asset}")
                for error in errors:
                    print(f"  - {error}")
            return 1
        print("All scanned image prompt sidecars are valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
