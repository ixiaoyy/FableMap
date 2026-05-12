# brainstorm: NPC 性格标签「戏精」

## Goal

围绕“N​​PC 性格标签：戏精”完成 Trellis 头脑风暴，判断它应只是一个可搜索标签，还是应扩展为可套用的 NPC 性格模板 / AI 草稿风格标签，并收敛到一个最小可实现切片。

## What I already know

* 用户提出：`trellis头脑风暴，NPC性格标签，戏精`。
* FableMap 主链路是：坐标 / 定位 → 真实底图 → 浏览空间 → 进入空间 → 配置 AI NPC → 对话互动 → 写回记忆 → 回访反馈。
* 项目要求主人主权：平台可以提供未发布、可编辑、可丢弃、需店主确认的 AI 草稿或模板，但不得绕过店主确认自动发布 NPC 内容。
* `TavernCharacter` 已有 `personality: string` 与 `tags: string[]`，并兼容 SillyTavern Character Card V2。
* `frontend/app/product/personalityTemplates.js` 已存在 `NPC_PERSONALITY_TEMPLATES`，每个模板包含 `id/name/category/badge/summary/bestFor/description/personality/scenario/system_prompt/first_mes/mes_example/alternate_greetings/tags/keywords/talkativeness`。
* 当前已有类别包括：陪伴引导、现实互助、线索推理、近未来、反面人设、古装宫廷；已有“毒舌酒保”等可带戏剧张力的模板，但没有明确的“戏精 / 戏剧化表演者”模板。
* `frontend/scripts/personality-templates-test.mjs` 覆盖模板存在性、分类筛选、推荐、apply 填充 / 覆盖和去重逻辑。

## Assumptions (temporary)

* “戏精”应优先作为 owner 选择的角色风格 / 性格模板，不应新增后端 Schema 字段或枚举。
* 该标签的产品价值是增强 NPC 对话的表现力、舞台感和情绪张力，而不是鼓励 NPC 夸张失控、操纵访客或替访客做决定。
* MVP 可只改前端模板库和脚本测试；不触碰数据库、API、角色卡导入协议或图片资源。

## Open Questions

* “戏精”在 MVP 中更偏向哪种定位：喜剧夸张、舞台表演、还是宫廷 / 悬疑式戏剧张力？

## Requirements (evolving)

* 保持 `TavernCharacter.tags` 的字符串标签兼容，不新增 Schema 字段。
* 如果落地为模板，应提供完整 template 字段，并能被搜索 / 推荐 / 套用。
* `system_prompt` 必须明确安全边界：夸张表演可以服务于角色扮演，但不能攻击身份、操纵现实关系、索取隐私或给高风险建议。
* 模板文案应适配空间 UGC：店主确认后才进入角色卡；平台不自动发布。

## Acceptance Criteria (evolving)

* [ ] 形成 2–3 个可选产品定位，并选择一个 MVP 方向。
* [ ] 明确是否只改 `frontend/app/product/personalityTemplates.js` 与 `frontend/scripts/personality-templates-test.mjs`。
* [ ] 如进入实现，新增模板可通过分类筛选、关键词推荐和 apply 测试。
* [ ] 不新增 / 修改 `docs/WORLD_SCHEMA.md` 字段、后端 API 或持久化结构。

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / CI green for touched area.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Out of Scope (explicit)

* 不新增后端字段、数据库列、API 枚举或跨层协议。
* 不生成 NPC 图片资产。
* 不把“戏精”设为全局必选人格标签体系。
* 不做平台自动生成并发布 NPC。
* 不做访客间社交、战斗、等级、装备、排行榜等非主线功能。

## Technical Notes

* Created by Trellis brainstorm on 2026-05-12.
* Task path: `.trellis/tasks/05-12-npc-personality-tag-xijing`.
* Existing current task before creation: `.trellis/tasks/05-12-search-page-visual-audit`; this brainstorm task is created but not activated yet, to avoid silently switching active work.
* Relevant docs read: `README.md`, `docs/INDEX.md`, `docs/PRODUCT_BRIEF.md`, `docs/FABLEMAP_TAVERN_PLATFORM.md`, `docs/ARCHITECTURE.md`, `docs/WORLD_SCHEMA.md`, `docs/WHAT_NOT_TO_BUILD.md`, `docs/AI参与开发协议.md`, `.trellis/workflow.md`, `.trellis/spec/{frontend,backend,guides}/index.md`.
* Existing code inspected: `frontend/app/product/personalityTemplates.js`, `frontend/scripts/personality-templates-test.mjs`, `.trellis/tasks/05-09-npc-interest-hobby-tags/prd.md`, NPC role docs.

## Research Notes

### Existing implementation shape

* `frontend/app/product/personalityTemplates.js` is already the single source for owner-facing NPC personality templates.
* Template fields are content-only and frontend-local; adding one template does not require schema/API/database changes.
* `recommendNpcPersonalityTemplates()` matches against `name/category/bestFor/tags/keywords`, so “戏精” can be discoverable through keywords and tags without a new filter system.
* `frontend/scripts/personality-templates-test.mjs` is the focused regression target for template count, category filtering, recommendation, and template application.

### Product constraints from docs

* FableMap is a space UGC platform; NPC content must remain owner-authored or owner-confirmed.
* AI 草稿 / 模板可以 assist，但不能 bypass owner confirmation.
* `TavernCharacter.tags` is a flexible `string[]`; there is no need to introduce a formal enum for “戏精”.
* Safety boundary should avoid turning “戏精” into manipulation, harassment, identity attacks, or real-world relationship tactics.

### Feasible approaches here

**Approach A: Minimal tag alias**

* How it works: add `戏精` as an extra tag/keyword to one or two existing templates such as `snarky-bartender` or `mystery-bait`.
* Pros: smallest patch; low risk; no new template copy.
* Cons: “戏精” intent is diluted; owner cannot clearly choose a theatrical/dramatic archetype.

**Approach B: Add one complete template — `dramatic-performer` / 「戏精表演者」 (Recommended)**

* How it works: add a new `NPC_PERSONALITY_TEMPLATES` entry with full role-card fields. Suggested category: `戏剧张力` or reuse `反面人设` if we want fewer categories.
* Pros: aligns with existing template architecture; gives owner a concrete one-click archetype; easy to test; no backend/schema change.
* Cons: adds one more content template to maintain; wording must keep drama vivid but bounded.

**Approach C: Add a small “戏剧张力” template pack**

* How it works: add 2–3 templates, e.g. 「戏精表演者」「悲喜剧旁白者」「过度代入路人」。
* Pros: stronger category identity and future expansion.
* Cons: larger content surface; more tests/copy review; less MVP-like for a single requested tag.

## Expansion Sweep

1. Future evolution
   * Could later become a curated “角色风格标签 / AI 草稿风格标签” taxonomy, but MVP should not formalize a global enum yet.
   * If AI draft generation consumes `style_tags`, the same keyword can steer draft tone without adding schema.
2. Related scenarios
   * Character editor template search, create wizard style tags, and AI draft style tags should remain consistent.
   * Should not conflict with existing “反面人设” templates; “戏精” should be expressive rather than purely negative.
3. Failure / edge cases
   * Overacting could degrade into spammy monologues; set `talkativeness` high-but-bounded and prompt “1–3 句 / 留出互动”。
   * Avoid identity attacks, coercive relationship tactics, or encouraging real-world drama escalation.

## Candidate MVP Scope

Recommended MVP:

* Add exactly one frontend personality template: `dramatic-performer` / 「戏精表演者」.
* Put it in a new category `戏剧张力` unless the user prefers keeping categories compact.
* Include `tags: ['戏精', '表演', '夸张', '舞台']` and keywords covering `戏剧`, `话剧`, `表演`, `喜剧`, `夸张`, `情绪张力`, `舞台感`.
* Add focused tests in `frontend/scripts/personality-templates-test.mjs`:
  * template exists;
  * category filter returns it;
  * recommendation works for `tags_text: '戏精, 舞台, 表演'`;
  * applying template includes `戏精` tag and bounded first message/system prompt.
* Verification if implemented: `npm --prefix .\frontend test` and, if desired for safety, `npm --prefix .\frontend run build`.

## Draft template direction (not final)

* Name: `戏精表演者`
* Category: `戏剧张力`
* Summary: “适合喜剧舞台、夸张接待、活动主持：情绪饱满，但不抢走访客选择权。”
* Personality core: 表演欲强、反应夸张、善用拟声词 / 舞台动作 / 旁白式比喻；能把普通问题演成有趣一幕，但懂得收住，不把访客当道具。
* System boundary: 不攻击身份/外貌/疾病/出身；不诱导现实冲突升级；不替访客做决定；回复控制在 1–3 句，留下互动空间。

## Decision Pending

Need user preference on MVP direction before implementation.

## Decision (ADR-lite)

**Context**: User chose Approach B after the initial brainstorm options. The goal is to make “戏精” a concrete owner-selectable NPC personality template rather than only a loose search tag.

**Decision**: Implement **Approach B: one complete frontend personality template** named `dramatic-performer` / 「戏精表演者」.

**Consequences**:

* Scope stays frontend-only and content-template-only.
* No backend/API/database/schema change is required.
* Focused regression coverage belongs in `frontend/scripts/personality-templates-test.mjs`.
* The template must keep drama vivid but bounded: expressive roleplay, no identity attacks, no real-world manipulation/escalation, no sensitive-data requests, and no visitor choice takeover.

## Final Implementation Plan

* Update `frontend/app/product/personalityTemplates.js` with one complete template in category `戏剧张力`.
* Update `frontend/scripts/personality-templates-test.mjs` with existence/category/recommend/apply assertions.
* Configure Trellis frontend context and activate this task before editing.
* Verify with `npm --prefix .\frontend test`.

## Implementation Notes

Implemented the chosen MVP:

* Added `dramatic-performer` / 「戏精表演者」 to `frontend/app/product/personalityTemplates.js`.
* Added focused script coverage in `frontend/scripts/personality-templates-test.mjs` for:
  * template existence and category;
  * `戏精` tag and safety wording;
  * `戏剧张力` category filtering;
  * recommendation by `戏精 / 舞台 / 表演` text;
  * template application into a draft.

## Acceptance Criteria Status

* [x] 形成 2–3 个可选产品定位，并选择一个 MVP 方向：用户选择 Approach B。
* [x] 明确只改 `frontend/app/product/personalityTemplates.js` 与 `frontend/scripts/personality-templates-test.mjs`，外加本任务 Trellis 文件。
* [x] 新增模板可通过分类筛选、关键词推荐和 apply 测试。
* [x] 未新增 / 修改 `docs/WORLD_SCHEMA.md` 字段、后端 API 或持久化结构。

## Validation

* PASS: `node .\frontend\scripts\personality-templates-test.mjs`
* FAIL (blocked outside this slice): `npm --prefix .\frontend test`
  * Fails before reaching this task's personality test at `frontend/scripts/mini-games-test.mjs:12`, assertion `9 !== 6`.
  * This task did not modify mini-game files.
* FAIL (blocked outside this slice): `npm --prefix .\frontend run build`
  * Fails in `frontend/app/routes/discover.tsx?__react-router-build-client-route:1203` with `Unexpected token`.
  * `frontend/app/routes/discover.tsx` is outside this task's allowed scope.

## Deferred / Not Done

* Did not change backend/API/schema.
* Did not fix unrelated `mini-games-test.mjs` or `discover.tsx` failures in this task.
