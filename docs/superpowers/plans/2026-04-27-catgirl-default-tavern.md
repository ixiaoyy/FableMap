# Catgirl Default Tavern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an approved default demo tavern anchored near Shanghai Jing'an Temple with one safe original catgirl NPC, preserving existing schema and local rules backend behavior.

**Architecture:** Reuse `backend/src/fablemap_api/core/default_taverns.py` seed helpers (`_tavern`, `_character`, `_world_info`, `_gameplay`) and existing public-welfare seed repair behavior. Add focused pytest coverage in existing default tavern tests before production code.

**Tech Stack:** Python standard library, pytest, existing FableMap core `WebService` / `TavernStore`.

---

### Task 1: Add failing tests for the catgirl default tavern

**Files:**
- Modify: `tests/test_default_public_welfare_taverns.py`
- Modify: `tests/test_default_public_welfare_gameplays.py`

- [ ] **Step 1: Write the failing tavern content test**

Add a test that loads `pw_jingan_catbell_refuge`, asserts it is public/open/rules-backed, contains exactly the approved catgirl NPC, includes Shanghai/Jing'an/catgirl/fukkoku keywords, and contains no disallowed jailbreak/private-address/explicit-force strings.

- [ ] **Step 2: Write the gameplay keyword expectation**

Add `"pw_jingan_catbell_refuge": ["猫铃", "复国", "静安"]` to `expected_keywords` in `test_default_public_welfare_taverns_have_theme_gameplays_and_rules_fallback_runs`.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `py -3 -m pytest -q tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py --tb=short`

Expected: FAIL because `pw_jingan_catbell_refuge` does not exist yet.

### Task 2: Implement the default tavern seed

**Files:**
- Modify: `backend/src/fablemap_api/core/default_taverns.py`

- [ ] **Step 1: Add a new `_tavern(...)` entry before the seed list closes**

Use:
- `tavern_id="pw_jingan_catbell_refuge"`
- `name="静安猫铃避难所"`
- `lat=31.2231`, `lon=121.4454`
- public/open/rules via existing helper defaults
- one character `char_pw_mimi_nya`
- safe tags including `公益`, `猫娘`, `傲娇`, `上海`, `静安寺`, `复国`

- [ ] **Step 2: Add safe world info**

Add entries for:
- catbell refuge constant boundary
- Mimi's isekai cat-princess background
- fukkoku trigger
- consent/safety boundary

- [ ] **Step 3: Add one lightweight published gameplay**

Add `gp_pw_catbell_fukkoku_minutes`, a low-risk council-minutes style roleplay around rebuilding a cat kingdom, with no combat/levels/equipment and no real dangerous action.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `py -3 -m pytest -q tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py --tb=short`

Expected: all focused tests pass.

### Task 3: Final verification and notes

**Files:**
- Check: `.trellis/tasks/04-27-new-catgirl-character/prd.md`
- Check: `.trellis/tasks/04-27-npc-rule-generation-boundary/prd.md`

- [ ] **Step 1: Run syntax verification**

Run: `py -3 -m compileall -q backend/src`

Expected: no output and exit code 0.

- [ ] **Step 2: Record implementation notes**

Update task PRD/notes with files changed, verification commands, and remaining product-doc follow-up.
