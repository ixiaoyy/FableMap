# NPC Batch Import and Background Cast MVP

## Goal

为店主保留“批量导入/创建背景 NPC”的安全任务入口，降低配置多角色空间成本。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / NPC 批量创建
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 支持店主确认的批量导入或批量草稿，不自动发布平台生成角色。
* 保持 TavernCharacter / SillyTavern 字段兼容。
* 默认不做 NPC 关系图谱或自动剧情生成，除非另行设计。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.

## 2026-04-30 Existing Code / Docs Inspected

- `docs/WHAT_NOT_TO_BUILD.md`: confirmed batch creation must remain owner-confirmed and must not auto-publish platform-generated NPC content.
- `docs/WORLD_SCHEMA.md`: confirmed `TavernCharacter` / SillyTavern-compatible fields; no persistent draft schema added.
- `docs/ARCHITECTURE.md`: confirmed existing character endpoints and owner panel boundary.
- `frontend/app/product/CharacterManagementModal.jsx`: existing single-character create/edit/import/AI-draft panel extended instead of building a parallel manager.
- `frontend/app/product/CharacterEditor.jsx`: reused existing `TavernCharacter` field expectations.
- `frontend/app/lib/taverns.ts`: reused existing `addCharacter(...)` API helper for owner-confirmed saves.

## 2026-04-30 Implementation Notes

- Added `frontend/app/product/npcBatchImport.js` as a pure parser/normalizer for batch inputs.
  - Accepts JSON arrays / `characters` arrays / SillyTavern-style `{ data: ... }` records.
  - Accepts plain text lines: `名称 | 描述 | 标签`.
  - Caps one batch at 12 NPCs to avoid accidental mass creation.
  - Does not persist external IDs or introduce draft-status fields.
- Extended `CharacterManagementModal.jsx` with a “批量创建背景 NPC” panel.
  - Owners paste input, preview a pending list, then explicitly click “确认创建 N 个背景 NPC”.
  - Confirmation calls existing `addCharacter(tavern.id, draft, ownerId)` once per preview item.
  - Copy states “不自动发布、不会覆盖已有角色”.
- Added CSS for the batch panel, preview list, success state, and mobile-stacked actions in `frontend/app/product/styles.css`.
- Added `frontend/scripts/npc-batch-import-test.mjs` and wired it into `npm --prefix .\frontend test`.

## 2026-04-30 Verification

```powershell
node .rontend\scripts
pc-batch-import-test.mjs
npm --prefix .rontend run typecheck
npm --prefix .rontend run build
npm --prefix .rontend test
```

Result: all commands passed. The full frontend test suite includes `npc-batch-import-test: ok`.

## 2026-04-30 Playwright Visual Self-Acceptance

Browser visual/interaction acceptance was self-checked with Playwright before marking complete.

```powershell
$env:NPC_BATCH_HARNESS_URL='http://127.0.0.1:5175'
node .\.trellis	mp\playwright-mainline
pc-batch-visual-acceptance.cjs
```

Result: passed. Coverage included desktop and mobile batch preview, owner-confirmed creation, reuse of the existing character POST endpoint, no horizontal overflow, and no console/page/request failures.

Evidence files:

- `.trellis/tmp/playwright-mainline/evidence/04-30-npc-batch-visual-acceptance/npc-batch-desktop-preview.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-npc-batch-visual-acceptance/npc-batch-desktop-saved.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-npc-batch-visual-acceptance/npc-batch-mobile-preview.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-npc-batch-visual-acceptance/npc-batch-mobile-saved.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-npc-batch-visual-acceptance/npc-batch-visual-acceptance-report.json`

## 2026-04-30 Completion

Done: the scoped MVP is complete as an owner-confirmed batch creation/import entry for background NPCs, using existing `TavernCharacter` fields and the existing character creation API.

Not done / intentionally deferred: no NPC relationship graph, no automatic story generation, no auto-publishing AI output, no new backend batch endpoint, no persistent draft-history schema.

