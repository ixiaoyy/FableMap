# Public Welfare NPC Asset Normalization

## Goal

Restore the default public-welfare NPC asset contract after regression tests found runtime sprite files that were named `.png` but contained JPEG bytes, plus oversized PNG sprites that no longer matched accepted dimensions.

## Root Cause

Recent NPC asset import/regeneration copied generated image outputs directly into the canonical `frontend/public/assets/npcs/public-welfare/<character>/<expression>.png` paths without consistently converting to PNG bytes and resizing to the runtime dimensions expected by tests and sidecar provenance.

## Scope

- Normalize `frontend/public/assets/npcs/public-welfare/**/{neutral,joy,anger,embarrassment,curiosity}.png`.
- Keep hospital nurse-station NPC assets at `512x512`, matching the existing hospital acceptance tests and sidecars.
- Keep the remaining public-welfare NPC expression assets at `256x256`, matching the general NPC portrait spec and public-welfare asset regression tests.
- Regenerate/update same-directory `expression-set.prompt.md` sidecars so dimensions and SHA-256 hashes match current bytes.

## Acceptance Criteria

- [x] Every public-welfare NPC expression file has a PNG file signature.
- [x] Non-hospital public-welfare NPC expression assets are `256x256`.
- [x] Hospital night-care NPC expression assets are `512x512`.
- [x] Public-welfare default tavern asset tests pass.
- [x] Image prompt sidecar validation passes after hash/dimension changes.
- [x] Frontend build still passes because these assets are public runtime resources.

## Verification Plan

```powershell
py -3 -m pytest -q tests/test_default_public_welfare_taverns.py --tb=short
py -3 artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py
npm --prefix .\frontend run build
```

Run broader pytest if focused tests reveal non-local failures.

## 2026-05-04 Implementation Notes

- Normalized all 140 public-welfare NPC expression sprite files to real PNG bytes.
- Resized non-hospital public-welfare NPC expression sprites to `256x256`.
- Resized hospital night-care NPC expression sprites to `512x512`, matching existing hospital acceptance coverage.
- Regenerated grouped `expression-set.prompt.md` sidecars and image prompt sidecar inventory so hashes and dimensions match the current project assets.

## 2026-05-04 Verification Results

- `py -3 -m pytest -q tests/test_default_public_welfare_taverns.py --tb=short` — passed; 25 tests.
- `py -3 artifacts/04-30-image-asset-prompt-sidecars/validate_image_prompt_sidecars.py` — passed; 211 scanned image assets, 0 sidecar failures.
- `py -3 -m pytest -q --tb=short` — passed; 540 tests, 103 warnings.
- `npm --prefix .\frontend run build` — passed.
