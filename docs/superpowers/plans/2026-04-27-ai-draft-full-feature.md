# AI Draft Full Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship the owner-confirmed AI NPC draft MVP and Mimi Nya project portrait assets without adding persistent draft schema.

**Architecture:** Add a native v1 owner-only preview endpoint, deterministic application service generation, typed frontend client/UI integration, and PNG assets referenced by the default seed.

**Tech Stack:** FastAPI, Pydantic, existing FableMap TavernApplicationService, React/Vite, TypeScript client, pytest, Node script tests.

---

### Task 1: Backend red/green for AI draft endpoint

**Files:**
- Create: `backend/tests/test_v1_character_ai_drafts.py`
- Modify: `backend/src/fablemap_api/contracts/characters.py`
- Modify: `backend/src/fablemap_api/api/v1/characters.py`
- Modify: `backend/src/fablemap_api/application/services/characters.py`

- [x] Write failing API tests for owner success, non-owner 403, non-persistence, and confirm-save conversion.
- [x] Run focused pytest and verify it fails because the route is missing.
- [x] Add `CharacterDraftRequest`, route, and `generate_character_draft` service method.
- [x] Re-run focused pytest and verify it passes.

### Task 2: Catgirl portrait assets red/green

**Files:**
- Modify: `tests/test_default_public_welfare_taverns.py`
- Modify: `backend/src/fablemap_api/core/default_taverns.py`
- Create: `frontend/public/assets/npcs/mimi-nya-neutral.png`
- Create: `frontend/public/assets/npcs/mimi-nya-joy.png`
- Create: `frontend/public/assets/npcs/mimi-nya-anger.png`
- Create: `frontend/public/assets/npcs/mimi-nya-embarrassment.png`
- Create: `frontend/public/assets/npcs/mimi-nya-curiosity.png`

- [x] Add failing assertions for avatar/sprites and PNG file existence.
- [x] Run default tavern focused pytest and verify it fails.
- [x] Generate original 256px PNG portrait variants and wire seed avatar/sprites.
- [x] Re-run focused pytest and verify it passes.

### Task 3: Frontend integration red/green

**Files:**
- Create: `frontend/app/product/aiCharacterDrafts.js`
- Create: `frontend/scripts/ai-character-drafts-test.mjs`
- Modify: `frontend/package.json`
- Modify: `frontend/app/lib/taverns.ts`
- Modify: `frontend/app/product/CharacterManagementModal.jsx`

- [x] Write Node script tests for draft input parsing and response-to-editor conversion.
- [x] Run `npm --prefix .\frontend test` and verify it fails until helpers exist / script is wired.
- [x] Add helpers, typed API client, and modal AI 草稿 panel.
- [x] Re-run frontend test and build.

### Task 4: Docs and final verification

**Files:**
- Modify: `docs/ARCHITECTURE.md`
- Check/update: `.trellis/tasks/04-27-ai-draft-full-feature/prd.md`

- [x] Add native endpoint to architecture API list.
- [x] Run backend compile, focused tests, frontend tests/build, and full pytest with NO_PROXY if feasible.
- [x] Report changed files, verification output, and remaining risks.
