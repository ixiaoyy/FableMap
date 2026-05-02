# NPC Expression Group Prompt Sidecars

## Goal

Reduce prompt sidecar noise for NPC expression sprite sets. Instead of requiring one prompt sidecar per expression image, allow one shared prompt sidecar for the whole expression set in a character directory.

## Requirements

- Keep project-image provenance traceable without duplicating nearly identical prompts for `neutral`, `joy`, `anger`, `embarrassment`, and `curiosity` sprites.
- For NPC expression sets under a single character directory, use a shared sidecar such as `expression-set.prompt.md` that lists all included image assets, expressions, dimensions, hashes, prompt type, Style DNA, and identity locks. The reusable `## Final prompt` should be the natural/neutral single-image prompt only; other expressions are provenance coverage, not prompt blocks to submit together.
- Single non-series images must still keep a same-directory `<image-stem>.prompt.md` sidecar.
- Update project docs/specs and task-local validator/generator logic to accept the shared expression-set sidecar.
- Collapse currently generated per-expression NPC sidecars into shared expression-set sidecars where applicable.

## Acceptance Criteria

- [x] `docs/IMAGE_ASSETS_SPEC.md` documents the expression-set sidecar exception.
- [x] `.trellis/spec/frontend/image-asset-guidelines.md` documents validation behavior for grouped NPC expression prompts.
- [x] `.trellis/spec/frontend/npc-art-guidelines.md` no longer requires five separate prompt sidecars per NPC expression set.
- [x] `artifacts/04-30-image-asset-prompt-sidecars` scripts and inventory reflect grouped NPC expression sidecars.
- [x] Existing public-welfare NPC expression prompt files are collapsed to one group sidecar per character directory where possible.
- [x] Validation passes for the updated convention.

## Verification Plan

```powershell
py -3 -m pytest -q artifacts/04-30-image-asset-prompt-sidecars/test_image_prompt_sidecars.py --tb=short
python artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py
python .\.trellis\scripts\task.py validate .\.trellis\tasks\05-02-npc-expression-group-prompt-sidecars
```

No frontend/backend build is expected because this is docs/tooling/provenance cleanup only and does not change runtime references.

## 2026-05-02 Implementation Notes

- Updated global rules in `AGENTS.md`, `docs/IMAGE_ASSETS_SPEC.md`, `.trellis/spec/frontend/image-asset-guidelines.md`, `.trellis/spec/frontend/npc-art-guidelines.md`, and both prompt-related skills.
- Updated `artifacts/04-30-image-asset-prompt-sidecars/image_prompt_sidecars.py` to detect NPC expression sets under `frontend/public/assets/npcs/`, write/validate one `expression-set.prompt.md`, and inventory unique sidecar counts.
- Collapsed `frontend/public/assets/npcs/public-welfare/**/{neutral,joy,anger,embarrassment,curiosity}.prompt.md` into 28 `expression-set.prompt.md` files.
- 2026-05-03 follow-up: `expression-set.prompt.md` now keeps only the neutral/natural single-image prompt in `## Final prompt` to avoid five-expression contact-sheet generation.
- Inventory now reports 211 scanned image assets, 99 unique prompt sidecar files, 28 NPC expression-set sidecars, and 0 missing sidecars.

## 2026-05-02 Verification Results

- `py -3 -m pytest -q artifacts/04-30-image-asset-prompt-sidecars/test_image_prompt_sidecars.py --tb=short` — passed; 4 tests.
- `python artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py` — passed; 211 scanned image assets, 0 missing sidecars.
- `python .\.trellis\scripts\task.py validate .\.trellis\tasks\05-02-npc-expression-group-prompt-sidecars` — passed.
- `python .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-image-asset-prompt-sidecars` — passed after the grouped-sidecar update.
- Count check: 28 `expression-set.prompt.md` files and 0 remaining per-expression `.prompt.md` files under `frontend/public/assets/npcs/`.
