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
1. Open tavern page, click “进入酒馆” in TavernChat component
2. After entering, verify `VisitorStateSummary` component appears below “进入酒馆” button
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
