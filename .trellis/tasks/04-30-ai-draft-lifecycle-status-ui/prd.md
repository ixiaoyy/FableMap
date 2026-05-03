# AI Draft Lifecycle Status UI

## Goal

明确“草稿/待确认/已发布”的 UI 语义，防止 AI 辅助内容被误解为平台自动发布。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research NPC 是接待者，不是平台作者
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* AI draft 必须 owner-editable、owner-confirmed。
* 发布前不得进入公开 tavern payload。
* 适用于 tavern draft、character draft、future gameplay draft。

## Acceptance Criteria

* [ ] Relevant existing code/docs are inspected before implementation.
* [ ] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [ ] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [ ] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.

## 2026-05-03 Implementation Log

### Research Summary

* Relevant specs/docs: `.trellis/spec/frontend/type-safety.md` Create-page AI Tavern Draft Boundary, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/frontend/state-management.md`, `docs/WHAT_NOT_TO_BUILD.md`, `docs/WORLD_SCHEMA.md`, `docs/FABLEMAP_TAVERN_PLATFORM.md`.
* Existing code patterns: `/create` already separates `handleGenerateDraft` from `handleSubmit`; `CharacterManagementModal.jsx` sends AI NPC drafts into `CharacterEditor`; `GameplayManager.jsx` already distinguishes `draft/published/disabled` status.
* No backend/API/schema changes required. AI draft lifecycle is display-only and reuses existing local draft/edit/save flows.

### Implementation

* Added `frontend/app/lib/ai-draft-lifecycle.js` as shared display helper for `draft / review / published` semantics across tavern, NPC, and gameplay draft contexts.
* Added create-page lifecycle panel to make “AI 草稿 → 店主待确认 → 已发布内容” visible before generation.
* Added NPC draft lifecycle panel in `CharacterManagementModal.jsx` clarifying editor-only / no-overwrite / no-export-before-confirmation boundaries.
* Added gameplay draft lifecycle panel in `GameplayManager.jsx` for future gameplay-draft semantics and no-RPG/no-ranking boundary.
* Added `frontend/scripts/ai-draft-lifecycle-test.mjs` and included it in `npm --prefix .\frontend test`.

### TDD Evidence

* RED: `node frontend/scripts/ai-draft-lifecycle-test.mjs` failed because `frontend/app/lib/ai-draft-lifecycle.js` did not exist.
* GREEN: same test passed after adding helper and UI integrations.

### Verification Results

* `node frontend/scripts/ai-draft-lifecycle-test.mjs` passed.
* `node frontend/scripts/ai-draft-lifecycle-test.mjs; node frontend/scripts/ai-tavern-drafts-test.mjs; node frontend/scripts/ai-character-drafts-test.mjs; node frontend/scripts/create-wizard-route-test.mjs` passed.
* `npm --prefix .\frontend test` passed.
* `npm --prefix .\frontend run typecheck` passed.
* `npm --prefix .\frontend run build` passed.
* `git diff --check` passed with only CRLF warnings.

### Playwright Visual Self-Acceptance

Command:

```powershell
$env:AI_DRAFT_LIFECYCLE_URL='http://127.0.0.1:5173'; node .\.trellis\tmp\playwright-mainline\ai-draft-lifecycle-visual-acceptance.cjs
```

Result: passed.

Evidence:

* `.trellis/tmp/playwright-mainline/ai-draft-lifecycle-visual-acceptance.cjs`
* `.trellis/tmp/playwright-mainline/evidence/04-30-ai-draft-lifecycle-status-ui-visual-acceptance/ai-draft-lifecycle-create-desktop.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-ai-draft-lifecycle-status-ui-visual-acceptance/ai-draft-lifecycle-create-mobile.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-ai-draft-lifecycle-status-ui-visual-acceptance/ai-draft-lifecycle-visual-acceptance-report.json`

Checks covered: create route loads; lifecycle labels visible; public-payload/no-automatic-creation guardrails visible; draft generation fills editable form only; no raw `api_key`; no horizontal overflow on desktop/mobile.
