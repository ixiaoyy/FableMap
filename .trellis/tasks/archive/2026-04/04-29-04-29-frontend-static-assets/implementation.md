# Implementation Notes

## Completed
- Migrated default public-welfare NPC assets from flat filenames under `frontend/public/assets/npcs/` to per-role directories under `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.
- Updated default public-welfare seed asset URLs in `backend/src/fablemap_api/core/default_taverns.py`, including `char_pw_mimi_nya`.
- Updated default NPC tests to require nested per-character asset directories and no remaining flat NPC PNGs.
- Moved Vite-imported route reference images:
  - `frontend/app/assets/discover/reference/`
  - `frontend/app/assets/homepage/reference/`
- Moved map snapshot public files to `frontend/public/assets/map-snapshots/` and updated backend/frontend URL generation/loading to `/assets/map-snapshots/...`.
- Added asset directory README files and updated image/NPC asset guidelines.
- Checked all PRD acceptance criteria in `prd.md` after fresh validation.

## Fresh Verification (2026-04-29)
- `py -3 -m pytest -q --tb=short tests/test_default_public_welfare_taverns.py` -> 18 passed.
- `npm --prefix .\frontend test` -> passed.
- `py -3 -m compileall -q backend/src` -> passed.
- `npm --prefix .\frontend run build` -> passed.
- Asset audit -> `flat_npc_png_count=0`, `nested_npc_png_count=125`, `public_welfare_char_dirs=25`, `map_snapshot_manifest_exists=True`.
- `.codex/generated_images` audit was run; cached generated files remain external reference/draft material and are not runtime deliverables for this task.

## Notes
- Existing historical docs under `docs/superpowers/` may still mention old paths as archived plan/spec history; runtime docs/specs were updated to the new canonical paths.
- Existing `.codex/generated_images` files remain external generation cache/reference material, not runtime deliverables.