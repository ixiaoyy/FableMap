# Create Tavern Step-by-step Wizard MVP

## Goal

把 `/create` 从表单堆叠升级成店主可理解的分步开店向导：选真实坐标/地点类型 → 填空间设定 → 配置 NPC/导入/AI 草稿入口 → 检查访问与 LLM 状态。MVP 只做前端体验与已有能力聚合，不新增后端 Schema。

## Source Brainstorm

* Parent: `.trellis/tasks/04-28-new-features-brainstorm/brainstorm.md`
* Candidate B: Create Tavern 分步向导 + 创作质量提升
* Reason to claim now: Owner Dashboard 表现化 MVP 已拆出并进入 review；下一优先级是提升店主“开店”转化链路。

## Requirements

* 在现有 `/create` 路由内提供清晰的 stepper/阶段导航，突出开店流程而不是一次性表单堆叠。
* 保留真实坐标锚定：位置/坐标仍是创建流程的前置核心，不允许无锚点空间。
* 复用现有字段、服务和草稿入口；AI 生成内容必须保持“店主确认后保存/发布”的语义。
* 保持移动端可用：窄屏下阶段卡片、CTA 和表单内容不能依赖宽屏双栏。
* 不新增依赖、不改 API、不改持久化 Schema。

## Acceptance Criteria

* [x] `/create` 页面有明确的 3-4 步开店流程说明与当前阶段视觉反馈。
* [x] 现有创建表单能力仍可使用，字段含义不变。
* [x] 页面文案明确 AI 草稿只是辅助创作，需店主确认。
* [x] 页面仍强调真实地图/坐标锚定。
* [x] 移动端布局不出现明显桌面限定结构。
* [x] `npm --prefix .\frontend run build` 通过。

## Definition of Done

* 前端实现与文案更新完成。
* 任务 PRD 记录实现说明和验证输出。
* 不触碰后端 Schema/API；若实际发现必须改 API，则暂停并重新评审。

## Out of Scope

* 不新增 Tavern/Character/WorldInfo Schema 字段。
* 不实现 AI 自动发布空间/NPC。
* 不接入新的地图、UI、状态管理或表单依赖。
* 不做平台级 Token 计费、充值、抽成。
* 不做无真实坐标的自由空间或泛社交主页。

## Technical Notes

* Expected scope: `frontend/app/routes/create.tsx` plus possible colocated frontend helpers only if existing patterns require it.
* Relevant existing tasks: `04-29-04-29-owner-dashboard-presentational-mvp` (owner entry aggregation), `04-29-ai-assisted-tavern-drafts` (AI draft confirmation boundary), `04-28-place-type-expansion` (place type UI), `04-28-mobile-adaptation` (mobile layout baseline).

## Implementation Notes (2026-04-30)

### Trellis split / claim

* Split from parent brainstorm `.trellis/tasks/04-28-new-features-brainstorm/` together with follow-up discovery polish task.
* Claimed this P1 task for development: `/create` route wizard MVP.

### Changes

* Added route-level `CREATE_WIZARD_STEPS` metadata and accessible stepper (`aria-label="创建空间分步向导"`).
* Grouped the existing create form into four designed sections: real coordinate anchor, owner-authored tavern content, first NPC, owner-confirmed opening.
* Preserved existing form field names and service calls; no backend API or Schema changes.
* Made AI draft boundary explicit: draft text only fills editable form fields and does not persist/create taverns or characters.
* Added `frontend/scripts/create-wizard-route-test.mjs` and wired it into `frontend/package.json` test script.

### TDD / Verification

* RED: `node frontend/scripts/create-wizard-route-test.mjs` failed before implementation with `AssertionError: create route should define route-level wizard step metadata`.
* GREEN: `node frontend/scripts/create-wizard-route-test.mjs` → `create-wizard-route-test: ok`.
* `npm --prefix .\frontend test` → passed; all frontend script tests ended with `Affinity helpers ok`.
* `npm --prefix .\frontend run typecheck` → passed (exit 0).
* `npm --prefix .\frontend run build` → passed; React Router build completed successfully.

### Out of scope preserved

* No new dependency.
* No backend/API/schema change.
* No platform auto-publishing of AI-generated tavern/NPC content.
* No token billing, visitor social wall, ranking, or traditional map navigation feature.


## 2026-04-30 Parent Tracking Rehydration + Playwright Visual Self-Acceptance

This completed child task was rehydrated from `.trellis/tasks/archive/2026-04/create-tavern-step-wizard-mvp/` to `.trellis/tasks/04-30-create-tavern-step-wizard-mvp/` because parent task `.trellis/tasks/04-28-new-features-brainstorm/task.json` still referenced the dated child ID.

Fresh verification on current workspace:

* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `create-wizard-route-test: ok`.
* Playwright command: `$env:CREATE_WIZARD_URL='http://127.0.0.1:5183/create'; node .\.trellis\tmp\playwright-mainline\create-wizard-visual-acceptance.cjs` — passed.

Playwright evidence:

* `.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-desktop.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-mobile.png`
* `.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-visual-acceptance-report.json`

Checked: desktop create wizard, mobile create guide, accessible stepper, AI draft owner-confirmed boundary, real-coordinate anchor, and no horizontal overflow.
