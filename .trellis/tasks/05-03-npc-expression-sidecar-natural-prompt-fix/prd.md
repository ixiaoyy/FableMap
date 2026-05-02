# NPC Expression Sidecar Natural Prompt Fix

## Goal

Fix grouped NPC expression sidecar templates so copying `## Final prompt` into an image model generates one natural/neutral portrait, not a five-expression contact sheet.

## Root Cause

The previous grouped `expression-set.prompt.md` template stored five expression prompt blocks under `## Final prompt` (`neutral`, `joy`, `anger`, `embarrassment`, `curiosity`). This preserved provenance but made the reusable prompt ambiguous: image models may interpret the block as a request to put all five expressions into one image.

## Requirements

- For `prompt_scope: npc-expression-set`, `## Final prompt` must contain only the neutral/natural single-image prompt.
- Expression-set sidecars may still list covered assets, expressions, dimensions, and SHA-256 values for provenance.
- Do not include per-expression prompt blocks as generation prompt text.
- Add an explicit negative constraint against contact sheets, multi-panel grids, five faces, or multiple expressions in one image.
- Update docs/specs/skills to say expression-set sidecars keep only the natural/neutral prompt.
- Regenerate existing grouped public-welfare sidecars with the safer template.

## Acceptance Criteria

- [x] `expression-set.prompt.md` files under `frontend/public/assets/npcs/public-welfare/` contain one neutral/natural prompt in `## Final prompt`.
- [x] No grouped sidecar contains `### joy`, `### anger`, `### embarrassment`, or `### curiosity` under `## Final prompt`.
- [x] Docs/specs describe neutral/natural prompt-only behavior for grouped sidecars.
- [x] Tests cover the regression.
- [x] Sidecar validation passes.

## Verification Plan

```powershell
py -3 -m pytest -q artifacts/04-30-image-asset-prompt-sidecars/test_image_prompt_sidecars.py --tb=short
python artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py
python .\.trellis\scripts\task.py validate .\.trellis\tasks\05-03-npc-expression-sidecar-natural-prompt-fix
```

No frontend/backend build is expected because this changes prompt provenance docs/tooling only, not runtime code or asset references.

## 2026-05-03 Implementation Notes

- Updated `build_expression_set_sidecar_markdown()` so `## Final prompt` selects only the neutral/natural prompt and adds a clear one-image guardrail.
- Added negative constraints and validator checks against contact sheets, multi-panel grids, expression sheets, five faces, and grouped expression prompt blocks.
- Regenerated existing public-welfare `expression-set.prompt.md` files with the safer template.
- Updated docs/specs/skills and the prior grouped-sidecar task notes to reflect the neutral-only prompt convention.

## 2026-05-03 Verification Results

- `py -3 -m pytest -q artifacts/04-30-image-asset-prompt-sidecars/test_image_prompt_sidecars.py --tb=short` — passed; 4 tests.
- `python artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py` — passed; 211 scanned image assets, 0 missing sidecars.
- `python .\.trellis\scripts\task.py validate .\.trellis\tasks\05-03-npc-expression-sidecar-natural-prompt-fix` — passed after replacing stale `.claude/commands/trellis/*.md` context entries with existing `.agents/skills/*/SKILL.md` paths.
- `Select-String -Path frontend/public/assets/npcs/public-welfare/*/expression-set.prompt.md -Pattern '### joy|### anger|### embarrassment|### curiosity|Expression suffix \(joy\)|Expression suffix \(anger\)|Expression suffix \(embarrassment\)|Expression suffix \(curiosity\)'` — no matches.
