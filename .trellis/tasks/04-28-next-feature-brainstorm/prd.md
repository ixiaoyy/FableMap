# brainstorm: 下一轮功能开发方向

## Goal

为 FableMap 下一轮“功能类”开发选择一个清晰、可落地、符合空间主线的功能方向，并在进入实现前收敛 MVP 范围、边界、验收标准和技术路径。

## What I already know

* 用户希望使用 Trellis 开启另一个功能类开发的头脑风暴。
* 当前没有 current task。
* 当前仓库还有较多未提交变更；新功能需要避免和未提交的美术/归档/清理变更互相污染。
* 当前产品主线是：真实坐标 / 地图发现 → 进入空间 → 配置 AI NPC → 对话互动 → 记忆写回 → 回访反馈。
* 产品原则：真实地图锚点、主人主权、AI 作为 NPC 对话引擎、Token 由店主承担、SillyTavern 兼容。
* 当前不应做：平台自动发布空间/NPC 内容、平台级 Token 充值结算、无锚点自由空间、访客泛社交、传统地图 App 功能、战斗/等级装备系统。
* 现有 active / in-progress 方向包括 Docker 部署、空间内景 UI、测试覆盖；本轮应尽量选择不和这些任务冲突的功能切片，或明确接续其中一个。

## Assumptions (temporary)

* 本轮先选功能方向，不直接写代码。
* 如果选择 UI/视觉相关功能，后续需要额外考虑浏览器/视觉验证。
* 如果选择 API / 数据模型 / 跨层协议，后续必须先做 code-spec 深度检查、测试和文档同步。

## Open Questions

* 用户希望这轮优先打磨哪一段产品闭环或哪类功能。

## Requirements (evolving)

* 功能必须服务空间主链路，不偏向传统地图或 RPG 系统。
* 不越过主人确认自动生成/发布内容。
* 不引入大型新依赖，除非后续单独确认理由。
* 先形成设计/PRD，再进入实现。

## Acceptance Criteria (evolving)

* [ ] 选定一个明确功能方向。
* [ ] 写清 MVP 目标、范围、非目标和验收标准。
* [ ] 标明可能涉及的前端/后端/数据/文档文件。
* [ ] 给出 2-3 个技术/产品方案并记录取舍。
* [ ] 用户确认设计后再进入实现计划。

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / build verification selected by actual change scope.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Out of Scope (explicit)

* 本阶段不改代码。
* 本阶段不新增 Schema 字段、不改 API 合约。
* 不处理 Docker / 测试覆盖这类非产品体验功能，除非用户明确把它选为本轮方向。
* 不删除或移动既有 docs 文档。

## Technical Notes

* Context inspected: .trellis/scripts/get_context.py, docs/INDEX.md, docs/PRODUCT_BRIEF.md, docs/WHAT_NOT_TO_BUILD.md, docs/FABLEMAP_TAVERN_PLATFORM.md headings.
* Suggested feature selection should align with current product chain: discovery, tavern entry, owner creation/config, NPC chat, memory/writeback, revisit/retention.

## User Direction Update

用户选择本轮重点：**优化页面设计，让页面更吸引人**。

初步理解：这不是单个按钮/样式问题，而是面向新访客与潜在店主的第一印象、视觉吸引力、信息层级和转化路径优化。后续需要明确优先页面（首页/发现页/空间详情/空间内页/创建页）与目标用户（探索者 vs 店主）。

## Visual Brainstorm Notes

页面设计优化属于强视觉问题。下一步将先确认是否使用浏览器视觉 companion 展示 mockup / layout 对比，再继续一问一答收敛页面范围与设计方向。

## Visual Companion Session

* URL: http://localhost:55690
* screen_dir: $screenDir
* state_dir: $stateDir
* First screen: page-priority.html asks user to choose the first page surface for attractiveness-focused redesign.

## User Correction

用户纠正：**项目不只是开空间**。

修正理解：当前页面设计不能只围绕“开空间”来做，必须重新确认 FableMap 的更大产品表达。空间可以是一个核心场景/示例/入口，但首页与整体视觉不应把产品误导成单一“开空间工具”。下一步应先梳理仓库里已经出现的非空间方向（Place/Home、多地点类型、真实地点上的 AI 场所等），再让用户选择更准确的产品叙事。

## Repository Context After Reframe

Evidence that FableMap has already moved beyond Tavern-only:

* `.trellis/tasks/archive/2026-04/04-27-place-type-home-concept/prd.md` explicitly says “空间只是现实店铺 / 场所的一种形式”，and frames the product as `Place + Home + Relationship Graph`.
* `.trellis/tasks/archive/2026-04/04-27-place-home-full-mvp/prd.md` defines a Tavern-compatible Place/Home MVP with `place_type`, Home, family members, school enrollment, and relationship graph.
* Current `frontend/app/routes/home.tsx` is still visually/copy-wise tavern-heavy: nav has “空间 / NPC / 记忆 / 开店”, metrics say “空间收录”, preview type is `TavernPreview`, and brand tagline says `Cyber taverns on real places`.

Updated design problem:

* The page redesign should likely reposition the public-facing UI from “开一间空间” toward a broader “真实地点上的 AI 场所 / 个人 Home / 角色关系” platform.
* Tavern can remain as one high-signal example, but not the whole product category.

## Narrative Decision

用户选择首页/页面设计的大叙事：**城市里的生活模拟器**。

Implications:

* 首页不应再只说“开空间”。
* 空间、Home、学校、便利店、咖啡店等应作为城市生活切片共同出现。
* 设计气质可以更沉浸、更幻想，但仍必须保留真实地图锚点和结构化关系边界。
* 后续页面设计应优先解决“第一眼吸引人 + 一眼看懂不是传统地图/不是单一空间工具”。

## Visual Direction Decision

用户选择：**A. 电影感城市入口**。

Working design direction:

* 首页第一眼优先做“城市海报”级吸引力，而不是工具型 dashboard。
* 主视觉表达：真实城市 + AI 生活切片 + 多种 Place/Home 节点。
* Tavern/空间只作为城市生活中的一种高情绪场景出现，不再作为唯一品类。
* 后续文案应从“开店/空间收录”改为更宽的“在真实城市里创建/发现 AI 场所、Home、角色关系”。

## Scope Decision

用户选择 MVP 范围：**全站视觉方向切换**。

Interpretation:

* This is no longer a single-page polish task; it is a product-level visual repositioning across homepage, discovery, creation, and Place/Tavern detail/interior surfaces.
* Because it can touch many files and concepts, it should be decomposed into design-system + staged rollout tasks rather than implemented as one broad unbounded edit.
* The chosen north star remains: “电影感城市入口” + enough product clarity to explain real-map AI places.

## Stage 1 Confirmation

用户确认节奏：**先做阶段 1：设计系统 + 首页壳**。

Stage 1 proposed boundary:

* Define a site-wide visual language for “城市里的生活模拟器”.
* Update homepage shell / hero / nav / key cards first.
* Establish reusable tokens/patterns for later pages: background treatment, cards, buttons, place chips, section rhythm, copy terminology.
* Do not yet deeply rebuild discovery/create/detail/interior pages; only prepare terminology/design direction so later tasks can follow.

Potential affected files for Stage 1:

* `frontend/app/routes/home.tsx`
* shared shell/nav/ui if needed, e.g. `frontend/app/ui/button`, route-level layout classes
* possibly `frontend/app/product/styles.css` or global Tailwind class patterns if the shell depends on product parity styles
* existing homepage assets under `frontend/app/assets/homepage-reference/modules/`

Open design decision:

* Whether Stage 1 should be CSS/HTML-only, use existing assets, or include a new project-local cinematic key visual asset.

## Stage 1 Visual Draft

* URL: http://localhost:52268
* session: $screenDir
* Screen: stage-1-home-shell-draft.html
* Shows proposed Stage 1 homepage shell: cinematic city hero, broader Place/Home/relationship copy, non-Tavern-only nav, reusable design tokens.

## User Feedback on Stage 1 Draft

用户反馈：当前草案不符合预期，**页面设计不够抓人，解释性文字太多**。

Revised design principle:

* 首屏不再承担完整产品解释；先用视觉钩子吸引人。
* 文案极简：一句主标题 + 一句短副标题 + 1-2 个 CTA。
* 产品解释下沉到第二屏/滚动后，不占据首屏情绪。
* 视觉气质应更像开屏海报、游戏登录页、城市夜景封面，而不是产品说明页。
* “AI 场所 / Home / 关系图”等概念用视觉符号暗示，而不是大量文字解释。

## User Feedback on Grabby Directions

用户选择方向：**A. 电影海报**，但反馈当前预览开屏很丑。

Interpretation:

* The narrative hook “这座城市开始记得你” / cinematic poster direction is acceptable.
* The visual execution of the mockup is not acceptable.
* Need refine composition, not go back to explanatory product design.
* Next visual iteration should focus on higher-end poster composition: depth, focal point, negative space, fewer toy-like UI symbols, more premium cinematic atmosphere.

## User Correction: Preserve Original Cyber Index Quality

用户指出：**原来的 index 设计很有感，不能越改越后退。**

Updated constraint:

* The original `设计参考/index.png` / index-style homepage visual should be treated as the visual quality baseline.
* Redesign should preserve or exceed its cyber atmosphere, density, glow, composition quality, and “wow” factor.
* The task is not to invent a lower-fidelity CSS mockup; it is to translate the stronger original cyber visual language into the new broader product narrative.
* Future mockups should compare against the original reference and avoid toy-like placeholder visuals.

## Design Draft Written

* Wrote task design draft: $designPath
* Design basis: preserve original index.png cyber visual quality, update homepage narrative to City Cyber Life, Stage 1 only.

## User Review Decisions

用户对设计草案的反馈：

1. 主标题 “这座城市开始记得你” 不合适；产品不只是“建造一座城市”。
2. Hero 可以复用现有 `neon-cyber-tavern-reference.png` 作为视觉基准。
3. 首屏不要露出 `Home / 学校 / 店铺 / 空间` 这类类型 chip。对探索者来说，它们应当是等价的、待探索的区域，而不是一开始就被分类解释。

Updated design constraints:

* 首屏避免“城市建造 / 类型枚举 / 说明书”语感。
* 面向探索者时，所有 Home / 学校 / 店铺 / 空间等都先统一表达为“待探索区域 / 入口 / 坐标上的空间”。
* 类型可以在进入后或详情层出现，但不应破坏首屏的一体化神秘感。
* Stage 1 hero visual should use existing high-quality cyber index reference as baseline.

## Hero Headline Decision

用户选择主标题：**每个坐标，都可能藏着一个世界**。

Rationale:

* 强调真实地图坐标。
* 暗示每个区域都可探索，不预先区分 Home / 学校 / 店铺 / 空间。
* 有神秘感和开屏吸引力，且不把产品误解成“建造一座城市”。

## Implementation Plan Written

* Plan path: $planPath
* Scope: homepage visual shell only.
* Next step: choose execution mode before code changes.

## Implementation Notes (2026-04-28)

* Changed `frontend/app/routes/home.tsx` as Stage 1 homepage visual shell only; no backend/API/schema changes.
* Reused existing project-local hero asset `frontend/app/assets/homepage-reference/neon-cyber-tavern-reference.png` as the cyber index visual baseline.
* Updated hero headline to “每个坐标，都可能藏着一个世界”, with manual line breaks for desktop/mobile readability.
* Removed first-screen type chips and old Tavern-only framing; Home / 学校 / 店铺 / 空间 are not enumerated on the first screen.
* Reframed homepage labels toward broader explorable regions / coordinates / spaces: “开始探索”, “创建我的空间”, “主人入口”, “正在发光的区域”.
* Verification:
  * `npm --prefix .\frontend run typecheck`: exit 0 (`react-router typegen && tsc --noEmit`).
  * `npm --prefix .\frontend test`: exit 0; all frontend script tests reported ok, including `home-links-test`, `place-home-contract-test`, `place-types`, `gender-fields`, and `affinity`.
  * `npm --prefix .\frontend run build`: exit 0; Vite / React Router production build completed and generated SPA client output.
  * Copy boundary scan: `No old Tavern-only hero/category framing found in home.tsx.`
  * Browser visual check: Chrome headless screenshots captured at `artifacts/dev-server/home-desktop.png` (1440x1000) and `artifacts/dev-server/home-mobile.png` (390x844). Desktop and mobile first screen show the cyber hero, headline, CTAs, and no first-screen type chips.
* Known follow-up: lower routes and data still use existing `/tavern/:id` entry points until a future route/model expansion task; this implementation intentionally does not alter those contracts.

## Visual Quality Follow-up (2026-04-28)

User feedback on the shipped homepage screenshot:

* Top hero image looked pixelated / low-quality.
* First screen felt loose and not compact; too much empty vertical space.

Fix applied:

* Replaced homepage hero from the older screenshot-like `homepage-reference/neon-cyber-tavern-reference.png` to the high-resolution project-local radar asset `frontend/app/assets/discover-reference/discover-radar-surface.png` (`1672x941`, SHA256 `027996A79CD31F8D93BC884CCC49D4196E20656962D6078C3F41FC4B17C351E6`).
* Kept the high-quality bitmap as atmosphere only; overlaid labels, coordinate pills, grid lines, and signal dots as crisp HTML/CSS so the hero no longer depends on text baked into a blurry screenshot.
* Tightened first-screen layout in `frontend/app/routes/home.tsx`: removed `min-h-[calc(100vh-88px)]`, reduced hero padding to compact `py-6` / `lg:py-8`, lowered visual height from the old `lg:min-h-[640px]` to `lg:min-h-[500px]`, and made the metrics band immediately follow the hero.
* Replaced featured-card images with the new high-quality project-local discover cover assets under `frontend/app/assets/discover-reference/`.
* Added `frontend/scripts/home-visual-density-test.mjs` and wired it into `npm --prefix .\frontend test` to protect against reverting to the old blurry asset or viewport-height blank layout.

Verification:

* RED: `node .\frontend\scripts\home-visual-density-test.mjs` failed before implementation on missing high-quality hero import.
* GREEN: `node .\frontend\scripts\home-visual-density-test.mjs`: exit 0, `home-visual-density-test: ok`.
* `npm --prefix .\frontend run typecheck`: exit 0.
* `npm --prefix .\frontend test`: exit 0; all frontend script tests ok, including `home-links-test`, `home-visual-density-test`, and `discover-view-mode-test`.
* `npm --prefix .\frontend run build`: exit 0; React Router/Vite production build completed.
* `git diff --check -- frontend/app/routes/home.tsx frontend/package.json frontend/scripts/home-visual-density-test.mjs`: exit 0; only LF→CRLF warnings from Git.
* Browser screenshots captured from local dev server:
  * `artifacts/dev-server/home-compact-desktop.png` (1440x1000)
  * `artifacts/dev-server/home-compact-mobile.png` (390x844)
