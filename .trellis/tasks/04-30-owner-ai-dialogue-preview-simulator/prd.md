# Owner AI Dialogue Preview Simulator

## Goal

让店主在发布前预览 NPC 回复效果，但不写入访客聊天历史或公开内容。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm 内容创作工具增强 / AI 对话模拟
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 预览必须 owner-only，不进入正式 chat history/writeback。
* 不暴露 API Key、隐藏 prompt 或其他访客记忆。
* 若调用 LLM，成本和 provider 设置仍由店主控制。

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

- `docs/WHAT_NOT_TO_BUILD.md`: confirmed no automatic publication, no platform token billing, no hidden social expansion.
- `docs/ARCHITECTURE.md`: confirmed chat history/writeback boundaries and existing preview-only API pattern language.
- `docs/WORLD_SCHEMA.md`: confirmed `ChatMessage`, token usage, and StateCard/writeback persistence boundaries; this MVP must not write any of them.
- `.trellis/spec/frontend/quality-guidelines.md`: confirmed Playwright visual self-acceptance requirement.
- `frontend/app/product/CharacterManagementModal.jsx`: chosen owner-only entry point so preview stays inside character management.

## 2026-04-30 Implementation Notes

- Added `frontend/app/product/dialoguePreviewSimulator.js` as a pure local helper.
  - Produces `preview_only=true`, `persisted=false`, `llm_called=false`, `history_written=false`, and `writeback_written=false` flags.
  - Does not expose `system_prompt`; only reports whether a boundary instruction exists.
  - Redacts obvious API-key / Authorization bearer patterns in preview text.
- Added `frontend/app/product/OwnerDialoguePreviewSimulator.jsx`.
  - Owner can select an existing NPC, type a simulated visitor line, and generate a local dialogue preview.
  - UI explicitly states it is owner-only / preview-only, no LLM call, no chat history, no memory, no writeback.
  - This MVP does not call `/chat` or any LLM endpoint; future real LLM preview must be a separate owner-only preview API task.
- Embedded the simulator into `CharacterManagementModal.jsx`, alongside character creation/import tools.
- Added responsive styles in `frontend/app/product/styles.css`.
- Added `frontend/scripts/owner-dialogue-preview-test.mjs` and wired it into `npm --prefix .\frontend test`.

## 2026-04-30 Verification

```powershell
node .rontend\scripts\owner-dialogue-preview-test.mjs
npm --prefix .rontend run typecheck
npm --prefix .rontend run build
npm --prefix .rontend test
```

Result: all commands passed. The full frontend test suite includes `owner-dialogue-preview-test: ok`.

## 2026-04-30 Playwright Visual Self-Acceptance

Browser visual/interaction acceptance was self-checked with Playwright before marking complete.

```powershell
$env:OWNER_DIALOGUE_PREVIEW_HARNESS_URL='http://127.0.0.1:5176'
node .\.trellis	mp\playwright-mainline\owner-dialogue-preview-visual-acceptance.cjs
```

Result: passed. Coverage included desktop and mobile simulator flow, preview-only/no-LLM/no-history/no-writeback flags, no API requests, no horizontal overflow, and no console/page/request failures.

Evidence files:

- `.trellis/tmp/playwright-mainline/evidence/04-30-owner-dialogue-preview-visual-acceptance/owner-dialogue-preview-desktop.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-owner-dialogue-preview-visual-acceptance/owner-dialogue-preview-mobile.png`
- `.trellis/tmp/playwright-mainline/evidence/04-30-owner-dialogue-preview-visual-acceptance/owner-dialogue-preview-visual-acceptance-report.json`

## 2026-04-30 Completion

Done: scoped MVP completed as a local owner-only dialogue preview simulator that does not call LLM, does not write chat history, does not write memory/writeback, and does not expose hidden prompts or provider keys.

Not done / intentionally deferred: real LLM-backed preview endpoint, provider-cost accounting for preview calls, saving preview transcripts, visitor-facing preview, or any publication/writeback flow.

