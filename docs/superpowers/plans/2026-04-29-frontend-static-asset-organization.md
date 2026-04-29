# Frontend Static Asset Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize frontend and public static asset directories by categorizing runtime resources and migrating default NPC assets into per-role folders.

**Architecture:** Public URL resources stay under `frontend/public/assets/` and are referenced by `/assets/...` URLs. Vite-imported route images live under `frontend/app/assets/<feature>/reference/`. Backend seed data remains schema-compatible but updates asset URL strings to the new canonical paths.

**Tech Stack:** Python/FastAPI seed data and pytest; React Router/Vite frontend; PowerShell file moves; Node script tests.

---

### Task 1: Lock expected nested NPC asset contract with tests

**Files:**
- Modify: `tests/test_default_public_welfare_taverns.py`

- [ ] Update hardcoded expected NPC asset URLs for Mimi, 银票, and repaired 小舟 from flat filenames to `/assets/npcs/public-welfare/<char_id>/<expression>.png`.
- [ ] Run `C:\Users\phpxi\miniconda3\python.exe -m pytest -q --tb=short tests/test_default_public_welfare_taverns.py` and expect failures while seed data and files are still flat.

### Task 2: Migrate public NPC assets and seed references

**Files:**
- Modify: `backend/src/fablemap_api/core/default_taverns.py`
- Move: `frontend/public/assets/npcs/*.png` -> `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`

- [ ] Add `char_pw_mimi_nya` to default public-welfare asset mapping.
- [ ] Change generated public-welfare NPC asset URL shape to nested role directories.
- [ ] Remove now-redundant flat explicit Mimi/银票 sprite URL literals by using the shared nested asset helper, or update literals consistently.
- [ ] Move all 125 public-welfare PNG files into per-role directories.
- [ ] Run focused pytest and expect the updated tests to pass.

### Task 3: Migrate app-imported route reference images

**Files:**
- Move: `frontend/app/assets/discover-reference/*` -> `frontend/app/assets/discover/reference/*`
- Move: `frontend/app/assets/homepage-reference/*` -> `frontend/app/assets/homepage/reference/*`
- Modify imports in `frontend/app/routes/*.tsx`, `frontend/app/features/tavern-layout-showcase/index.tsx`, `frontend/scripts/home-visual-density-test.mjs`, `frontend/scripts/discover-view-mode-test.mjs`.

- [ ] Move directories.
- [ ] Replace import paths and source-string assertions.
- [ ] Run `npm --prefix .\frontend test` and expect path-sensitive script tests to pass.

### Task 4: Migrate public map snapshots under assets

**Files:**
- Move: `frontend/public/map-snapshots/default/*` -> `frontend/public/assets/map-snapshots/default/*`
- Modify: `backend/src/fablemap_api/core/web/service.py`
- Modify: `frontend/app/product/WorldMap.jsx`

- [ ] Update backend snapshot directory and generated manifest file URL to `/assets/map-snapshots/<id>/<file>`.
- [ ] Update frontend fetch path to `/assets/map-snapshots/<id>/manifest.json`.
- [ ] Move existing default snapshot directory.

### Task 5: Document canonical asset directories and verify all layers

**Files:**
- Create: `frontend/public/assets/README.md`
- Create: `frontend/app/assets/README.md`
- Modify: `.trellis/spec/frontend/image-asset-guidelines.md`
- Modify: `.trellis/spec/frontend/npc-art-guidelines.md`
- Modify: `docs/IMAGE_ASSETS_SPEC.md`
- Modify: `docs/NPC角色素材生成说明.md`

- [ ] Document public assets, app assets, NPC per-role directory convention, map snapshots, and date-based artifact rule.
- [ ] Run focused pytest, frontend test, backend compileall, and frontend build.
- [ ] Audit `frontend/public/assets/npcs` to confirm no flat PNG files remain.
