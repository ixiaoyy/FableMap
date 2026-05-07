# Revisit Memory Feedback Surface

## Goal

让访客和店主感知“NPC 记住了什么”，增强回访理由。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 回访反馈
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 优先展示摘要/状态，不扩展记忆 schema。
* 不泄露私密 visitor memory 给错误用户。
* 可与 State Cards / VisitorState / owner dashboard 联动。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API; no new contract fields.
* [x] Verification commands are recorded in this PRD.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Verification Commands

### Visual check (after entering tavern with a visitor)
1. Open tavern page, click “进入空间” in TavernChat component
2. After entering, verify `VisitorStateSummary` component appears below “进入空间” button
3. Verify it shows: relationship stage label (陌生人/初识/熟悉/朋友/知己), visit count chip, relationship strength %, and last visit time
4. In tavern route desktop view, verify owner can see “重点回访者” panel with relationship metrics
5. Verify RevisitCuePanel in TavernChat shows appropriate cue based on visitor state

### Build check
1. `cd frontend && npm run build` — verify no TypeScript errors
2. Check browser console for any import errors

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* Uses existing `formatRelationshipStage`, `formatRevisitTime`, `VisitorStatePayload` — no new schema.
* Memory feedback is surfaced via RevisitCuePanel (already existed) + new VisitorStateSummary chip.
* Owner-side summary uses existing `buildOwnerOperatingSummary` returning visitor relationship data.
* No new API endpoints or schema fields required.

## 2026-05-03 Implementation Log

### Research Summary

* Relevant specs/docs: `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/frontend/type-safety.md`, `docs/WORLD_SCHEMA.md`, `docs/WHAT_NOT_TO_BUILD.md`.
* Existing code patterns: `frontend/app/lib/revisit-summary.js` builds visitor-facing cues from existing `VisitorStatePayload`; `frontend/app/lib/owner-summary.js` builds owner dashboard returning visitor summaries; `frontend/app/lib/affinity.js` is the canonical frontend affinity stage label/legacy-normalization helper.
* No API/schema/data contract expansion required.

### Implementation

* Reused `getAffinityStageMeta` for owner/revisit relationship labels so visitor and owner feedback surfaces match the current AffinityStage contract while keeping legacy `regular` / `confidant` inputs normalized.
* Passed relationship strength into relationship-label formatting when stage is missing or stale.
* Added script test coverage for canonical stages, legacy stage normalization, and strength fallback.

### Verification Results

* RED check: `node frontend/scripts/revisit-summary-test.mjs; node frontend/scripts/owner-summary-test.mjs` failed on old labels (`初访者` vs `陌生人`) before implementation.
* GREEN targeted checks: `node frontend/scripts/revisit-summary-test.mjs; node frontend/scripts/owner-summary-test.mjs` passed.
* `node frontend/scripts/owner-dashboard-layout-test.mjs` passed.
* `npm --prefix .\frontend test` passed.
* `npm --prefix .\frontend run typecheck` passed.
* `npm --prefix .\frontend run build` passed.
* `python .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-revisit-memory-feedback-surface` passed.

### Visual Acceptance

* Not run in browser: this change only centralizes label formatting and script/build/type checks passed. If human visual acceptance is requested, run Playwright desktop + mobile screenshots for tavern entry/chat and owner dashboard before review.

## 2026-05-03 Playwright Visual Self-Acceptance

Command:

```powershell
$env:REVISIT_MEMORY_URL='http://127.0.0.1:5173'; node .\.trellis\tmp\playwright-mainline\revisit-memory-visual-acceptance.cjs
```

Result: passed.

Evidence:

* `.trellis/tmp/playwright-mainline/revisit-memory-visual-acceptance.cjs`
* `.trellis/tmp/playwright-mainline/evidence/04-30-revisit-memory-feedback-surface-visual-acceptance/revisit-tavern-desktop.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-revisit-memory-feedback-surface-visual-acceptance/revisit-tavern-mobile.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-revisit-memory-feedback-surface-visual-acceptance/revisit-owner-desktop.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-revisit-memory-feedback-surface-visual-acceptance/revisit-owner-mobile.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-revisit-memory-feedback-surface-visual-acceptance/revisit-memory-visual-acceptance-report.json`

Checks covered: tavern route loads, visitor state summary appears after enter, canonical `friend` label/52% strength visible, returning revisit cue visible, owner returning visitor panel uses `close_friend` label, no raw `api_key`, and no horizontal overflow on desktop/mobile.
