# Tavern Short-drama Gameplay Template MVP

## Goal

把现有 `GameplayDefinition` 包装成更像竖屏短剧小游戏的空间原生体验：店主可以选择轻量短剧玩法模板，访客在真实坐标空间内通过 2–3 个大按钮完成 3–5 步互动选择。

## Source Planning

* Parent task: `.trellis/tasks/04-30-ai-video-story-mini-game-brainstorm/`
* Source note: AI video story mini-game MVP 1 / Approach A
* Status: child task materialized on 2026-05-03 because the parent already referenced this direction but the task directory was missing.
* 2026-05-03 verification found the core MVP1 implementation already present in tracked frontend code; this task now records the implementation evidence and verification closure.

## Requirements

* 优先复用现有 `GameplayDefinition.nodes/choices/fallback_events`，默认不新增 Tavern schema。
* 模板必须挂接空间/真实地点，不做脱离地图锚点的泛短剧小游戏。
* 内容必须是店主可编辑/确认的玩法草稿或模板，不做平台自动生成并发布。
* 访客体验优先移动竖屏：目标、当前剧情、NPC/场景、2–3 个大按钮选择、完成/再来一次。
* 可提供 3–5 个短剧式模板，例如：
  * “帮店主救场 3 次”
  * “听懂 NPC 的潜台词”
  * “帮深夜便利店处理怪客”
  * “帮学校门卫判断谁在说谎”
* “再来一次”允许；不做广告复活、内购、排行榜、战斗/等级/装备。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation/closure.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; no contract change was made in this task closure.
* [x] Owner-side template creation/editing remains visibly owner-confirmed before public use.
* [x] Visitor-side UI works on narrow/mobile viewport with large choice CTAs by source/CSS inspection and build verification.
* [x] Verification commands are recorded in this PRD before moving to review/completed.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No AI video generation or external video asset pipeline in this MVP.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment.
* No schema/API changes unless explicitly re-scoped during research.

## Technical Notes

* Implementation evidence inspected on 2026-05-03:
  * `frontend/app/product/shortDramaGameplayTemplates.js`: defines 4 short-drama templates, `createShortDramaGameplayFromTemplate(...)`, `isShortDramaCandidate(...)`, shared forbidden guardrails, and `draft` output using existing `GameplayDefinition` fields.
  * `frontend/app/product/GameplayManager.jsx`: renders owner-side “短剧模板” panel and creates only local drafts with status copy: “请检查内容、按本空间调整，并保存/发布后访客才可见。”
  * `frontend/app/product/TavernGameplayLauncher.jsx`: tags short-drama gameplay as “竖屏短剧感”, shows the owner brief goal, and calls existing `onStart?.(gameplay)`.
  * `frontend/app/product/GameplaySessionPanel.jsx`: displays “本局目标”, narration, 2–3 choice CTAs, free-text submit, completion, and abandon control.
  * `frontend/app/product/tavernGameplay.css`: includes `.gameplay-session-panel__choice { min-height: 44px; }`, mobile grid collapse, and short-drama card styling.
  * `frontend/scripts/gameplay-test.mjs`: asserts template count/IDs, draft status, mode, memory disabled, forbidden guardrails, node/choice links, manager/launcher/session source contracts, and short-drama CSS selectors.
* Scope decision:
  * Frontend-only closure.
  * No backend, API, database, Tavern schema, or `GameplayDefinition` contract changes.
  * No image/video asset deliverable; no `.codex/generated_images` project asset check is needed for this task.
* Trellis context:
  * `implement.jsonl`, `check.jsonl`, and `debug.jsonl` were initialized.
  * Default check/debug entries referencing missing `.claude/commands/trellis/*.md` were replaced with existing `.agents/skills/check/SKILL.md` and `.agents/skills/finish-work/SKILL.md`.
  * `python ./.trellis/scripts/task.py validate '.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp'` passed.
* Relevant specs likely include:
  * `.trellis/spec/frontend/component-guidelines.md`
  * `.trellis/spec/frontend/state-management.md`
  * `.trellis/spec/frontend/quality-guidelines.md`
  * `.trellis/spec/frontend/mobile-single-mainline.md`
  * `.trellis/spec/backend/directory-structure.md`
  * `.trellis/spec/backend/quality-guidelines.md`
* Parent recommendation: start with “Approach A + 少量 Approach B”; this child covers Approach A only.

## Implementation Plan

* `.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp/implementation-plan.md`

## Verification Log

Run on 2026-05-03 from repo root:

```powershell
python ./.trellis/scripts/task.py validate '.trellis/tasks/04-30-tavern-short-drama-gameplay-template-mvp'
```

Result: passed; `implement.jsonl` 10 entries, `check.jsonl` 6 entries, `debug.jsonl` 1 entry.

```powershell
node frontend/scripts/gameplay-test.mjs
```

Result: passed with `gameplay-test: ok`.

```powershell
npm --prefix .\frontend test
```

Result: passed; full frontend script suite completed through `Affinity helpers ok`.

```powershell
npm --prefix .\frontend run typecheck
```

Result: passed; `react-router typegen && tsc --noEmit` exited 0.

```powershell
npm --prefix .\frontend run build
```

Result: passed; React Router/Vite client and SPA build completed.

### Browser / Playwright note

No Playwright self-acceptance screenshots were produced in this session. The repo does not currently have `playwright` or `@playwright/test` installed under `frontend/node_modules`, and no project Playwright script/config was found. Do not treat this as human visual acceptance; the task is closed by source inspection plus script/typecheck/build evidence.
