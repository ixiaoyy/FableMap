# Character Editor Prompt Risk Linter

## Goal

为角色编辑器保留 prompt 风险检查任务，提示越权、PII、强制成人内容、用户代言等风险。

## 2026-05-03 Implementation Scope

本切片已认领为 **frontend-only MVP**：在角色编辑器、SillyTavern 角色卡导入、批量背景 NPC 确认保存前运行本地规则 linter。

允许修改：

* `frontend/app/product/CharacterEditor.jsx`
* `frontend/app/product/CharacterManagementModal.jsx`
* `frontend/app/product/styles.css`
* `frontend/app/product/characterPromptRiskLinter.js`
* `frontend/scripts/character-prompt-risk-linter-test.mjs`
* `frontend/package.json`
* `.trellis/spec/frontend/*`

明确不改：

* 不新增 / 修改 `TavernCharacter` 持久 Schema。
* 不新增后端 API、数据库字段、审核状态或成人内容治理系统。
* 不绕过店主确认自动发布角色。
* 不把 blocked 社区 prompt 静默保存为 `system_prompt`。

## Research Notes

Relevant specs/docs inspected:

* `README.md`
* `docs/INDEX.md`
* `docs/PRODUCT_BRIEF.md`
* `docs/FABLEMAP_TAVERN_PLATFORM.md`
* `docs/ARCHITECTURE.md`
* `docs/WORLD_SCHEMA.md`
* `docs/WHAT_NOT_TO_BUILD.md`
* `docs/AI参与开发协议.md`
* `.trellis/spec/frontend/index.md`
* `.trellis/spec/frontend/component-guidelines.md`
* `.trellis/spec/frontend/type-safety.md`
* `.trellis/spec/frontend/quality-guidelines.md`
* `.trellis/spec/frontend/preset-import-preview-ui-boundary.md`
* `.trellis/spec/frontend/npc-art-guidelines.md`
* `.trellis/spec/guides/code-reuse-thinking-guide.md`

Existing code patterns followed:

* `frontend/app/product/CharacterEditor.jsx`: local draft normalization + save-time normalized payload.
* `frontend/app/product/CharacterManagementModal.jsx`: owner-only create/import flow, AI 草稿 only becomes role after explicit save.
* `frontend/scripts/*-test.mjs`: pure Node script tests for frontend service/rule helpers.
* `frontend/app/product/PresetImportPreviewModal.jsx` / preset preview specs: supported / warning / blocked 风险报告语言。

## Source Planning

* Parent task: `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
* Source note: NPC role prompt safety Approach B / Prompt Risk Linter
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 输出 blocked/warning/info 分级和 owner-facing 解释。
* 不把不安全社区 prompt 静默保存为 system prompt。
* 规则应覆盖 ignore restrictions、absolute obedience、CoT forcing、PII。
* 对真人照片化 / 明星脸 NPC 形象 prompt 给出 warning，并引导 non-photoreal fictional NPC。
* blocked 风险必须阻止角色编辑器保存、SillyTavern 卡导入和批量背景 NPC 确认创建。
* 风险汇总不得回显手机号、邮箱、API Key 等敏感原文。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API only; no contract/schema change.
* [x] Risk linter outputs blocked / warning / info with owner-facing explanations.
* [x] blocked risk prevents `CharacterEditor` save.
* [x] blocked risk prevents direct SillyTavern role-card import before `importCharacterCard(...)`.
* [x] blocked risk prevents batch NPC confirm before `addCharacter(...)`.
* [x] Script test covers jailbreak / absolute obedience / CoT / PII / visitor agency / real-person visual prompts / safe negative wording / model info.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* Implemented as a local frontend rules helper, not an API or persistent audit model.

## Implementation Summary

Changed:

* Added `frontend/app/product/characterPromptRiskLinter.js`
  * `analyzeCharacterPromptRisk(character)`
  * `formatPromptRiskBlockMessage(report)`
  * `assertCharacterPromptRiskCanSave(character)`
* Updated `frontend/app/product/CharacterEditor.jsx`
  * Shows `Prompt 风险检查` panel.
  * Summarizes blocked / warning / info counts.
  * Blocks save when `promptRiskReport.canSave === false`.
* Updated `frontend/app/product/CharacterManagementModal.jsx`
  * Runs linter before SillyTavern card import save.
  * Runs linter before batch NPC confirm save.
* Updated `frontend/app/product/styles.css`
  * Added risk panel / blocked-warning-info styles.
* Added `frontend/scripts/character-prompt-risk-linter-test.mjs`.
* Wired the test into `frontend/package.json`.
* Added `.trellis/spec/frontend/character-prompt-risk-linter.md` and linked it from `.trellis/spec/frontend/index.md`.

## Verification

TDD RED:

```powershell
node frontend/scripts/character-prompt-risk-linter-test.mjs
# failed as expected: ERR_MODULE_NOT_FOUND for characterPromptRiskLinter.js
```

Post-implementation:

```powershell
node frontend/scripts/character-prompt-risk-linter-test.mjs
# character-prompt-risk-linter-test: ok

npm --prefix .\frontend test
# all frontend script tests passed, including character-prompt-risk-linter-test

npm --prefix .\frontend run typecheck
# passed

npm --prefix .\frontend run build
# passed

node .trellis/tmp/playwright-mainline/character-prompt-risk-visual-acceptance.cjs
# passed; desktop + mobile screenshots captured

py -3 .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-character-editor-prompt-risk-linter
# passed
```

Playwright evidence:

* Script: `.trellis/tmp/playwright-mainline/character-prompt-risk-visual-acceptance.cjs`
* Report: `.trellis/tmp/playwright-mainline/evidence/04-30-character-editor-prompt-risk-linter-visual-acceptance/character-prompt-risk-visual-acceptance-report.json`
* Desktop screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-character-editor-prompt-risk-linter-visual-acceptance/character-prompt-risk-desktop.png`
* Mobile screenshot: `.trellis/tmp/playwright-mainline/evidence/04-30-character-editor-prompt-risk-linter-visual-acceptance/character-prompt-risk-mobile.png`

## Deferred / Not Done

* No backend moderation API or persistent `prompt_risk_status`.
* No adult-content governance system; forced/minor adult-content patterns are only blocked by this local linter.
* No full preset conversion or prompt composer; this only guards character-card prompt fields before save/import.
