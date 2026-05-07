# Tavern Short-drama Gameplay Template MVP

## Goal

把“显眼包式短剧情爽点”转译成空间内 3–5 步选择式玩法模板，复用 GameplayDefinition。

## Source Planning

* Parent task: `.trellis/tasks/04-30-ai-video-story-mini-game-brainstorm/`
* Source note: AI video story mini-game MVP 1 / Approach A
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 不新增 schema，不引入视频生成管线。
* 玩法必须由店主确认后发布。
* 不做广告复活、失败惩罚、战斗等级排行。

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

## 2026-04-30 Trellis Research Notes

### Relevant Specs / Docs

* `docs/WHAT_NOT_TO_BUILD.md`: 明确禁止平台绕过店主确认自动发布 AI 剧情/空间内容，禁止广告复活、排行榜、战斗/等级/装备等传统游戏化方向。
* `docs/WORLD_SCHEMA.md`: `GameplayDefinition` 已支持 `owner_brief`、`nodes`、`choices`、`fallback_events`、`completion`，本任务应复用既有字段，不新增 schema。
* `.trellis/spec/frontend/component-guidelines.md`: 店主编辑器应使用受控输入、清晰按钮、移动端可用；不要把平台生成内容伪装为店主内容。
* `.trellis/spec/frontend/quality-guidelines.md`: 前端 UI 改动至少运行 build；如果改服务/规则脚本则运行 frontend test。
* `.trellis/spec/frontend/type-safety.md`: JS payload 需要运行时规范化，不能假定后端对象总是完整。

### Code Patterns Found

* `frontend/app/product/GameplayDefinitionEditor.jsx`: 已有 `createBlankGameplay()`、高级 JSON 编辑、`owner_brief` 编辑模式，可扩展为“从模板创建草稿”。
* `frontend/app/product/GameplayManager.jsx`: 店主添加/保存玩法的主入口，适合增加模板选择入口；保存后才对访客可见，符合店主确认边界。
* `frontend/app/product/TavernGameplayLauncher.jsx`: 访客端玩法入口，只展示 `published` 定义，可增强短剧式 CTA 但不改变权限。
* `frontend/app/product/GameplaySessionPanel.jsx`: 已有 `scene.choices` 按钮和自由输入，可通过文案/样式更像 3–5 步短剧选择体验。
* `frontend/scripts/gameplay-test.mjs`: 已覆盖玩法管理/编辑/入口源码断言，适合加入模板与短剧 UI 回归断言。

### Files Likely To Modify

* `frontend/app/product/GameplayDefinitionEditor.jsx`: 增加短剧模板数据/生成函数，导出给管理器使用。
* `frontend/app/product/GameplayManager.jsx`: 添加“从短剧模板创建草稿”入口与店主确认提示。
* `frontend/app/product/TavernGameplayLauncher.jsx`: 强化有节点/选择玩法的短剧入口文案。
* `frontend/app/product/GameplaySessionPanel.jsx`: 强化目标/选择式体验的显示，不新增数据字段。
* `frontend/app/product/tavernGameplay.css`: 增加模板卡、竖屏短剧感、移动端触控样式。
* `frontend/scripts/gameplay-test.mjs`: 增加模板数量、导出函数、边界文案和样式断言。

### Verification Plan

* `npm --prefix .\frontend test`
* `npm --prefix .\frontend run build`

## 2026-04-30 Implementation Notes

* Added a frontend-only `SHORT_DRAMA_GAMEPLAY_TEMPLATES` helper that generates owner-editable `GameplayDefinition` drafts using existing fields only.
* Added 4 starter templates: “帮店主救场 4 次”, “听懂 NPC 的潜台词”, “处理深夜怪客”, “判断谁在说谎”.
* Templates default to `status: "draft"` and include owner-sovereignty / no-ad-revival / no-ranking / no-combat boundaries in `owner_brief.forbidden`.
* Updated `GameplayManager` so店主可从短剧模板生成本地草稿；必须检查、保存并发布后访客才可见。
* Updated visitor gameplay launcher/session UI to show short-drama style tags, objective text, and more mobile-friendly choice buttons without adding schema/API fields.

## 2026-04-30 Verification Results

* `node .\frontend\scripts\gameplay-test.mjs` — passed (`gameplay-test: ok`).
* `npm --prefix .\frontend test` — passed (all frontend script tests ok).
* `npm --prefix .\frontend run build` — passed (`✓ built`).
* `python .\.trellis\scripts\task.py validate .trellis\tasks\04-30-tavern-short-drama-gameplay-template-mvp` — passed after replacing stale auto-injected `.claude/commands/trellis/*.md` context paths with existing `.agents/skills/*/SKILL.md` paths.
