# Tavern Short-drama Gameplay Template MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to execute this plan task-by-task. Subagent dispatch is intentionally not used here because the user did not request parallel/subagent work and the repo already contains the implementation slice.

**Goal:** Close the MVP1 short-drama gameplay-template task by verifying the existing implementation, preserving owner-confirmed boundaries, and recording evidence in Trellis.

**Architecture:** Reuse the existing `GameplayDefinition` payload and product-parity React components. Owner-side templates generate local `draft` gameplay definitions only; visitor-side launcher/session panels render published gameplay with short-drama affordances and large choice CTAs. No backend schema/API changes are planned.

**Tech Stack:** React 18 / React Router frontend, JavaScript ES modules, Vite/React Router build, Node script tests.

---

## File Map

- Existing implementation:
  - `frontend/app/product/shortDramaGameplayTemplates.js` — template catalog, draft factory, short-drama detector.
  - `frontend/app/product/GameplayManager.jsx` — owner-side template panel and local draft creation.
  - `frontend/app/product/TavernGameplayLauncher.jsx` — visitor-side short-drama teaser styling and CTA.
  - `frontend/app/product/GameplaySessionPanel.jsx` — visitor-side objective, narration, choices, free-text submit, completion.
  - `frontend/app/product/tavernGameplay.css` — mobile-safe cards, drama styling, and choice touch targets.
  - `frontend/scripts/gameplay-test.mjs` — service/template/source contract test.
- Trellis/task files:
  - `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/prd.md` — acceptance and verification notes.
  - `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/task.json` — task status/phase.
  - `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/implement.jsonl` / `check.jsonl` / `debug.jsonl` — injected context.

---

### Task 1: Confirm implementation coverage

**Files:**
- Read: `frontend/app/product/shortDramaGameplayTemplates.js`
- Read: `frontend/app/product/GameplayManager.jsx`
- Read: `frontend/app/product/TavernGameplayLauncher.jsx`
- Read: `frontend/app/product/GameplaySessionPanel.jsx`
- Read: `frontend/scripts/gameplay-test.mjs`
- Modify: `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/prd.md`

- [ ] **Step 1: Verify existing template factory behavior**

Inspect `frontend/app/product/shortDramaGameplayTemplates.js` and confirm:

```javascript
SHORT_DRAMA_GAMEPLAY_TEMPLATES.length === 4
createShortDramaGameplayFromTemplate(template).status === 'draft'
createShortDramaGameplayFromTemplate(template).mode === 'ai_directed_branch'
createShortDramaGameplayFromTemplate(template).completion.memory_atom.enabled === false
```

- [ ] **Step 2: Verify owner-confirmed boundary in manager UI**

Inspect `frontend/app/product/GameplayManager.jsx` and confirm:

```javascript
setStatus('短剧模板已生成本地草稿；请检查内容、按本酒馆调整，并保存/发布后访客才可见。')
```

The owner action must create a local draft, not auto-publish.

- [ ] **Step 3: Verify visitor-side short-drama affordance**

Inspect `frontend/app/product/TavernGameplayLauncher.jsx` and confirm it calls:

```javascript
isShortDramaCandidate(gameplay)
onStart?.(gameplay)
```

It must render a short-drama tag/goal without changing the gameplay API contract.

- [ ] **Step 4: Update PRD research section**

Append a short implementation evidence section to the task PRD listing the inspected files and scope decision: frontend-only, no schema/API changes.

### Task 2: Run TDD/script verification

**Files:**
- Test: `frontend/scripts/gameplay-test.mjs`
- Test: `frontend/package.json`
- Modify if failure reveals a real gap: only the minimum frontend source/test file required.

- [ ] **Step 1: Run focused gameplay contract test**

Run:

```powershell
node frontend/scripts/gameplay-test.mjs
```

Expected:

```text
gameplay-test: ok
```

- [ ] **Step 2: If the test fails, apply TDD**

If the failure is a real product gap, keep the failing assertion as RED evidence, implement the smallest source change needed, then rerun the same command until it passes.

- [ ] **Step 3: Run full frontend script suite**

Run:

```powershell
npm --prefix .\frontend test
```

Expected: every script prints its `...: ok` line and the process exits `0`.

### Task 3: Build and visual acceptance note

**Files:**
- Build: `frontend/`
- Modify: `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/prd.md`

- [ ] **Step 1: Run frontend build**

Run:

```powershell
npm --prefix .\frontend run build
```

Expected: React Router build completes with exit code `0`.

- [ ] **Step 2: Record Playwright status honestly**

If a Playwright dependency/script is available, run a desktop + mobile self-acceptance pass and record screenshot paths. If no Playwright setup is available in the repo, record that no browser self-acceptance was run in this session and do not claim visual acceptance.

### Task 4: Close Trellis task evidence

**Files:**
- Modify: `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/prd.md`
- Modify: `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/task.json`

- [ ] **Step 1: Update PRD checkboxes and verification log**

Update acceptance criteria that are satisfied by source inspection and test/build output. Add exact commands and results.

- [ ] **Step 2: Mark task completed if verification passes**

Patch `task.json`:

```json
{
  "status": "completed",
  "completedAt": "2026-05-03",
  "current_phase": 6
}
```

Do not archive or commit automatically.

- [ ] **Step 3: Final report**

Report:

```text
Files changed
Why
Verification commands and results
Not done / risks / user confirmation needed
```
