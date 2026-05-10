# Design audit and polish of main product surfaces

## Goal

把 `设计问题/` 中关于 light / dark 首页与搜索页的审美问题，收敛成一次可执行、可验收的 UI/UX 打磨任务：让 FableMap 的主界面从“漂亮的概念图 / 内容瀑布流”进化为“真实坐标上的、正在运行的空间世界入口”。

本任务的核心不是继续加更多装饰，而是重建 **页面节奏、世界在线感、坐标探索动线、主题克制与工程可维护性**，同时严格保留 FableMap 的产品边界：真实坐标锚点、店主主权、AI NPC 对话与记忆回访，不做无边界访客社交、排行、传统地图功能或平台自动发布内容。

## Inputs reviewed

- 设计问题文档：
  - `设计问题/light版本的首页问题.md`
  - `设计问题/dark版本的首页问题.md`
  - `设计问题/light版本的搜索页问题.md`
  - `设计问题/dark版本的搜索页问题.md`
- 项目边界文档：
  - `README.md`
  - `docs/PRODUCT_BRIEF.md`
  - `docs/FABLEMAP_TAVERN_PLATFORM.md`
  - `docs/ARCHITECTURE.md`
  - `docs/WHAT_NOT_TO_BUILD.md`
  - `docs/AI参与开发协议.md`
  - `.trellis/workflow.md`
- 前端规范：
  - `.trellis/spec/frontend/index.md`
  - `.trellis/spec/frontend/component-guidelines.md`
  - `.trellis/spec/frontend/quality-guidelines.md`
  - `.trellis/spec/frontend/mobile-single-mainline.md`
  - `.trellis/spec/frontend/discovery-liveliness-signals.md`
- 已检查的候选实现文件：
  - `frontend/app/routes/home.tsx`
  - `frontend/app/routes/discover.tsx`
  - `frontend/app/routes/tavern.tsx`
  - `frontend/app/styles.css`
  - `frontend/app/components/home-light-real-dom.tsx`
  - `frontend/app/components/discover-light-real-dom.tsx`
  - `frontend/app/components/discover-black-reference.tsx`
  - `frontend/app/components/discover-black-sections.tsx`

## Product diagnosis

### 1. 当前真正的问题不是“美术不够”，而是“世界运行逻辑不够”

四份设计问题反复指向同一个核心：页面已经有较强的视觉资产和统一气质，但仍像概念稿、宣传海报或内容平台，而不是一个会回应用户的空间世界。

需要优先补足：

- 坐标正在被探索的感觉；
- NPC / 空间 / 记忆之间的关系；
- 最近回响、状态变化、异常坐标等“世界脉搏”；
- 用户点击前就能判断“这个空间值不值得进入”的入口信息。

### 2. Home 与 Discover 的角色必须分开

- **Home**：世界入口 / 产品承诺 / 第一眼情绪锚点。它应该回答“FableMap 是什么，我能进入哪里，我为什么想留下”。
- **Discover / Search**：长期使用的坐标探索工作台。它应该回答“哪里正在回应，哪里适合我，现在发生了什么，我下一步进哪个空间”。
- **Tavern**：关系与记忆是否成立的证明面。本轮只做一致性和回归检查，不在没有额外设计问题输入时重做 Tavern 主体验。

因此首页不应继续承担大量内容流，Discover 不应只是 Pinterest / 小红书式卡片瀑布。

### 3. Light 与 Dark 不是换皮，而是两个使用情境

- **Light**：白昼探索工作台。关键词是空气感、清晰、低噪、好筛、好点、好回访。避免灰蒙蒙的低对比蓝紫雾。
- **Dark**：深夜数字世界入口。关键词是留黑、孤独、微弱回应、系统在线。避免满屏 neon、全员发光和国产赛博 UI 病。

两套主题可以共享同一套语义：坐标、空间、NPC、记忆、回响、状态、入口；视觉表达不同，但产品语言不应割裂。

### 4. “异常”是世界真实感，但 MVP 先做展示层

设计问题多次提到异常坐标、信号缺失、坐标漂移、夜间开放、记忆不稳定。我的判断：这是 FableMap 的强差异化方向，但不能在本任务中直接新增后端 Schema 或全局状态系统。

MVP 做法：

- 在前端展示层用现有字段组合出安全状态：`status` / open-closed、营业时间、`visit_count`、角色数量、玩法定义、`DiscoveryLivelinessStrip` 已有聚合信号等。
- 如需示例异常卡，只作为本地展示/种子 view model，不新增持久字段，不改变 `docs/WORLD_SCHEMA.md`。
- 后续若要正式引入 `active / quiet / unstable / archived` 一类坐标状态，必须另开 API / Schema 任务。

### 5. 角色不能压过“空间”

当前首页 hero 中角色容易把产品误导成 AI companion / AI girlfriend。应保留 NPC/IP 气质，但把角色放回空间系统：角色是引导者、居民或信号源，不是压倒真实坐标与空间探索的唯一主角。

## Scope

### In scope

- 首页 light / dark 的视觉节奏、Hero 信息架构、模块取舍、CTA 与世界脉搏呈现。
- Discover light / dark 的搜索框、状态筛选、卡片类型、右侧世界脉搏、侧边导航语言、空/弱活跃状态表达。
- 主题 token / glow 等级 / 颜色生态的收敛，减少硬编码样式和过量阴影。
- 将过大的展示组件/路由按语义拆分，提升可维护性。
- 桌面与窄屏/移动视口的浏览器自验收。

### Tavern scope guardrail

- 只检查 Tavern 是否仍满足移动主链路：进入空间后优先 NPC roster、聊天记录、composer 与必要公共信息。
- 不在本任务中重做 Tavern 管理、关系图谱、玩法系统、后端对话流或 owner-only 面板。

### Out of scope

- 新增或修改后端 API、数据库、Schema、`WORLD_SCHEMA.md` 字段。
- 平台自动生成并发布空间 / NPC / 故事内容。
- 全局访客在线状态、访客墙、好友、私信、排行榜、评分、战斗/等级装备。
- 平台级 Token 充值、结算或抽成。
- 传统地图路线规划、POI 评分、导航功能。
- 引入大型 UI 框架、状态管理库、地图渲染库或动效库；本任务默认不用 `framer-motion`，只用 CSS / Tailwind / 现有工具。
- 重做品牌 Logo、完整设计系统站点或 Storybook。
- 移动、删除、重命名既有 `docs/` 文档。

## Requirements

### P0 — 先让主链路“像一个活着的世界”

1. **Home Hero 重构为三层信息架构**
   - 左：清晰产品价值与主操作，至少包含进入/探索与创建空间两个方向。
   - 中：角色/IP 氛围，但缩小视觉支配力，避免“AI 女友产品”误读。
   - 右：动态地图 / 坐标状态 / 最近回响，不再只是静态装饰贴图。
   - Hero 关键标题、说明、CTA 必须是真 DOM 文本，不以整张图片承载主要信息。

2. **首页模块减负与节奏化**
   - 首页从内容堆叠改为“入口 + 精选坐标 + 正在等待的 NPC + 最近回响 + CTA”。
   - 删除或合并重复的区域推荐/仪表盘式统计，避免强强强强的视觉权重。
   - 至少一个模块承担“世界正在运行”的任务，例如最近回响、被点亮的坐标、安静等待的角色。

3. **Discover 从内容流改成坐标探索器**
   - 搜索 placeholder 从普通“搜索地点/故事”改成“输入一个想前往的地方 / 寻找会回应你的坐标”一类空间化语言。
   - 筛选标签从电商/内容分类改为状态筛选：正在被探索、刚刚出现、适合独处、低噪空间、信号微弱等。
   - 右侧栏从推荐位改为“世界脉搏”：今日回响、正在被探索、信号异常/安静等待等聚合状态。

4. **卡片生态差异化**
   - Discover 至少定义三种展示语气：普通坐标卡、人气/最近有人来过卡、异常/弱信号卡。
   - 卡片不再全部同尺寸、同阴影、同蓝紫；允许稀有状态色，但保持克制。
   - 卡片 hover / focus 时显示“最近一句回响 / 当前状态 / 关联 NPC / 进入按钮”中的至少一种点击前判断信息。

5. **Dark glow 等级制度**
   - 建立 glow 预算：CTA 强、当前连接/活跃坐标中、普通卡弱、普通边框/section/footer 无或极弱。
   - 目标是减少约 70% 泛用描边发光，把注意力留给主 CTA、关键坐标和少量异常信号。

6. **Light 空气感与颜色生态**
   - Light 背景避免灰蓝雾感过重；卡片保持清晰白底、轻阴影和足够对比。
   - 颜色生态不再全蓝紫：暖地点可用低饱和金，异常/弱信号可用低饱和橙/灰绿，回忆可用灰白雾色。

### P1 — 工程化收敛

1. **组件与配置拆分**
   - `discover.tsx` 已超过 50KB；若继续改动，应优先把视觉配置、卡片子组件、筛选面板或脉搏面板拆到命名清晰的组件/配置文件。
   - `home-light-real-dom.tsx` 仍大量依赖 artboard 坐标和图片切片；后续改动应逐步从固定切片模拟转向响应式 DOM 布局。

2. **主题 token 与硬编码样式收敛**
   - 常用色、背景、边框、阴影、glow 等级进入 `frontend/app/styles.css` 或局部主题 helper，避免在 route 文件散落硬编码色值。
   - 允许少量语义明确的稀有状态色，但必须通过命名配置集中管理。

3. **性能保护**
   - 减少大面积 `backdrop-filter`、多层 box-shadow、超大 blur。
   - 图片类卡片保持固定宽高、lazy loading、失败 fallback，避免 CLS。
   - 不新增运行时动效库；微动效以 CSS transition / keyframes 为主，频率低、面积小。

4. **移动优先复核**
   - 首页与 Discover 的主 CTA、搜索、筛选、进入空间按钮在窄屏上必须可触达。
   - 不允许固定底部导航遮住主要操作。

### P2 — 后续可拆任务，不在本轮实现

- 正式坐标状态系统：`active / quiet / unstable / archived` 等如果需要持久化，另开 Schema/API 任务。
- 世界生态分层：深夜都市、白昼海边、被遗忘区域、危险区域、记忆空间、信号异常区等运营体系。
- 用户与世界关系系统：某地点记住用户、NPC 熟悉用户、回访后世界变化等更深层机制。
- 长列表性能进一步优化：分页、虚拟列表或服务端过滤。

## Copy and terminology guidance

Canonical product terms remain：`空间 / Tavern`、`坐标`、`NPC / 角色`、`记忆`、`回响`、`店主`、`探索者`。可以在局部 UI 氛围中使用 “signal / node / echo” 等装饰词，但不能把它们提升为新的 Schema 或全局术语。

Recommended local copy direction:

| Current feeling | Better UI language |
| --- | --- |
| 搜索地点、氛围、故事 | 输入一个想前往的地方 / 寻找会回应你的坐标 |
| 热门 | 正在被探索 |
| 最新 | 刚刚出现 |
| 治愈 | 适合独处 / 低噪空间 |
| 推荐 | 今日被回应的坐标 |
| 消息 | 回响 |
| 日志 | 记忆流 |
| 书签 | 收藏碎片 |
| 我的地点 | 我的锚点 / 我的空间 |
| 创建 | 建立坐标 / 创建空间 |

需要注意：移动主导航在 `.trellis/spec/frontend/mobile-single-mainline.md` 中已有固定契约，不得随意改成与规范冲突的标签。

## Acceptance Criteria

### Product / UX

- [ ] Home light/dark 首屏能在 5 秒内让用户理解：这是“真实坐标上的空间世界”，并且有明确的“进入探索”和“创建空间”路径。
- [ ] Home Hero 的主要标题、说明和 CTA 为可选择、可访问的真实 DOM 文本，不再依赖图片切片表达核心信息。
- [ ] Home 模块数量和权重被压缩；页面不再像多组同权重宣传卡连续平铺。
- [ ] Discover light/dark 的搜索框、筛选标签、右侧栏都从普通内容平台语言转为坐标探索 / 世界脉搏语言。
- [ ] Discover 卡片至少包含普通、人气/回访、异常/弱信号三类视觉与文案语气，且不暴露访客身份或公共社交 feed。
- [ ] Dark 主题明显减少泛用 glow；页面存在主光源和安静留黑区域。
- [ ] Light 主题提升空气感与对比度，不再整体灰蓝脏雾；稀有状态色有语义而非随机装饰。
- [ ] Tavern 主链路未回退：访客进入空间后仍以 NPC 对话/记忆回访为中心，owner-only 管理面板不进入访客首屏。

### Accessibility / responsiveness

- [ ] 关键按钮、搜索、筛选和进入空间链接都有可读文本或 `aria-label`。
- [ ] hover 才出现的信息在键盘 focus 或移动端也有等价可见路径。
- [ ] 375px 级窄屏无主要内容横向溢出；底部导航不遮挡关键 CTA。
- [ ] 桌面与移动都保留清晰信息层级。

### Engineering

- [ ] 不新增后端字段、API、数据库迁移或 `WORLD_SCHEMA.md` 承诺。
- [ ] 不新增 UI / 状态 / 动效 / 地图库依赖。
- [ ] 新增或调整的状态文案优先通过前端 view model / helper / 配置集中管理，不散落在多个 JSX 块中。
- [ ] 若修改 `discover.tsx` 大段 UI，应同步拆分组件或配置，避免继续堆大文件。
- [ ] 常用色与 glow 等级尽量走主题 token / CSS 变量；硬编码颜色只保留少量语义状态例外。
- [ ] 图片卡片具备固定尺寸、lazy loading 或等价加载保护；失败状态不让卡片完全失效。

### Verification

- [ ] 运行 `npm --prefix .\frontend run build` 并记录结果。
- [ ] 若触及服务/helper/脚本测试覆盖的规则，运行 `npm --prefix .\frontend test`。
- [ ] 若触及类型契约或新增 TS helper，运行 `npm --prefix .\frontend run typecheck`。
- [ ] 视觉/交互改动进入人工验收前，使用 Playwright 自验收至少保存桌面与窄屏/移动截图，并在任务记录或最终汇报中写明路径。

## Suggested implementation slices

### Slice 1 — Home rhythm and hero

- 重构 Home hero 文案、CTA、角色尺寸和右侧世界状态。
- 合并/删减重复首页模块，新增一段最近回响或世界脉搏。
- 调整 Light 空气感与 Dark glow 预算。

### Slice 2 — Discover coordinate explorer

- 重写搜索 placeholder 与筛选标签语义。
- 把右侧推荐区改为世界脉搏。
- 增加普通 / 人气 / 异常三类卡片语气与 hover/focus 判断信息。
- 复用 `DiscoveryLivelinessStrip` 和现有 tavern payload 聚合信号，不引入访客社交 feed。

### Slice 3 — Maintainability, mobile, verification

- 拆分过大的展示组件和视觉配置。
- 收敛 hardcoded color / glow / shadow。
- 做桌面 + 窄屏 Playwright 自验收，记录截图；运行 build/test/typecheck（按实际触及范围）。

## Risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| 过度赛博化 | 会削弱“数字孤独感”和长期可用性 | Dark 主题以留黑、微光、低频动效为主，砍掉泛用 glow |
| 变成 AI 女友/伴侣产品 | 角色压过空间会偏离 FableMap 定位 | 角色缩小并系统化；强调坐标、空间、记忆、NPC 群像 |
| 变成内容社区/Pinterest | 漂亮卡片会吞掉坐标探索主线 | Discover 以坐标状态、最近回响、进入价值为核心 |
| 假实时/假社交越界 | 可能违反 WHAT_NOT_TO_BUILD.md | 只展示聚合、空间级、无身份的安全信号；不做访客墙/好友/私信 |
| 设计稿式固定画布难维护 | 响应式和内容更新成本高 | 从 hero 与关键模块开始转真实 DOM / grid / flex，逐步替代切片模拟 |
| 动效和 blur 拖慢移动端 | 首页/搜索页是高频入口 | CSS-only、低频、少面积；减少 backdrop/box-shadow；图片 lazy/fallback |

## Decision (ADR-lite)

**Context**: 设计问题文档显示当前主界面已经有强视觉资产，但缺少产品节奏、世界在线感和长期探索动线。项目权威文档要求保持真实坐标、店主主权、SillyTavern 兼容和最小平台边界。

**Decision**: 本任务采用“世界运行感优先”的展示层打磨：先用现有前端数据和安全聚合信号重塑 Home / Discover 的信息架构、语言、卡片生态、主题克制与组件可维护性；不新增 Schema/API，不引入新依赖，不做社交化或游戏化系统。

**Consequences**: 这能快速提升产品气质和可验收视觉质量，但“正式坐标状态系统 / 世界生态 / 用户关系变化”仍需后续独立任务承接，不能在本轮 PRD 中伪装为已实现能力。

## Definition of Done

- PRD 中明确目标、范围、不可改边界、验收标准与验证方式。
- 实现阶段只认领本 PRD 中的一个或多个 slice，不夹带后端/Schema/社交/地图/计费方向。
- 所有完成项都有新鲜验证输出支撑；未做的 P2 能力必须报告为 deferred / not done。
- 最终汇报列出：改了哪些文件、为什么改、验证命令与结果、未做事项/风险/需要用户确认的点。

## Implementation note — 2026-05-10 reference-backed 1:1 pass

User added four final reference artboards under `设计问题/` and requested Trellis archival plus 1:1 reproduction for Home and Discover.

### Reference artboards archived in Trellis

- `reference-designs/index_light.png` — light Home, 1536x1024
- `reference-designs/index_black.png` — dark Home, 1536x1024
- `reference-designs/search_light.png` — light Discover/Search, 1536x1024
- `reference-designs/search_black.png` — dark Discover/Search, 1545x1018
- Hashes and dimensions are recorded in `reference-designs/README.md`.

### Implementation decision for this slice

To satisfy the explicit “1:1” requirement, this slice uses the four artboards as frontend reference-backed surfaces and overlays real interactive hotspots/search controls on top. This is an exact visual reproduction pass, not the final fully decomposed real-DOM design-system pass.

- Home and Discover route selection remains theme-driven.
- Primary navigation, CTA cards, create/explore entry points, theme toggle, and Discover search input have real DOM hotspots.
- The screenshots are copied into `frontend/app/assets/ui-reference/05-10-design-audit/` with a README manifest because they are now referenced by frontend code.
- No backend API, Schema, database, social feed, ranking, combat, token billing, or map-navigation behavior is introduced.

### Follow-up technical debt

- If the reference design is accepted, progressively decompose the artboards into real DOM panels while preserving the same visual coordinates.
- Compress or convert the four large PNG artboards to WebP/AVIF before production release.
- Revisit existing static source tests that still assert older 958x1642 / 1448x1086 reference contracts if this 1536x1024 design becomes canonical.

## Completion record — 2026-05-10

### Completed in this implementation slice

- Archived the four user-provided final artboards from `设计问题/` into Trellis:
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/index_light.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/index_black.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/search_light.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/search_black.png`
- Copied the same accepted runtime references into `frontend/app/assets/ui-reference/05-10-design-audit/` and recorded dimensions / SHA-256 in the README manifests.
- Added `frontend/app/components/soul-link-reference-artboards.tsx` as the canonical reference-backed Home / Discover renderer for this pass.
- Rewired `frontend/app/routes/home.tsx` and `frontend/app/routes/discover.tsx` so light / dark theme selection renders the matching final artboard 1:1.
- Preserved real interaction paths on top of the artboards:
  - Home exploration / create / featured tavern / theme toggle hotspots.
  - Discover controlled search input and card / map / filter / theme-toggle hotspots.
  - Mobile-safe `min-h-11` / `touch-manipulation` affordances for the new overlay controls.
- Kept product guardrails: no backend API, Schema, database, social feed, ranking, combat, token billing, or map-navigation behavior was added.
- Updated frontend regression scripts where the new implementation moved touch-target evidence into the shared reference-artboard component, and made the mobile single-mainline source test line-ending tolerant.

### Verification evidence

- `npm --prefix .\frontend run build` — passed.
- `npm --prefix .\frontend run typecheck` — passed.
- `npm --prefix .\frontend test` — passed.
- Asset verification — all four Trellis references and all four frontend runtime references exist, dimensions match the user-provided files, and SHA-256 hashes match.
- Playwright self-acceptance — passed for desktop and narrow/mobile viewports; report:
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/soul-link-reference-check.md`
  - Screenshots are saved in `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/`.

### Deferred / explicit non-goals after this pass

- Full DOM decomposition of the accepted artboards is intentionally deferred; this pass prioritizes the user-requested pixel-level 1:1 reproduction.
- The large PNG artboards should be converted to WebP/AVIF before a production performance hardening pass if this design becomes the long-term canonical UI.
- Formal persistent coordinate status / anomaly systems remain out of scope and require a future Schema/API task.

## Correction record — 2026-05-10 real DOM implementation

User clarified that the four images are design drafts only and must not be treated as completed pages by rendering the whole image. This supersedes the previous reference-backed prototype note.

### Corrected implementation

- The four user-provided images remain archived only as Trellis design references under `reference-designs/`.
- Runtime full-page artboard copies under `frontend/app/assets/ui-reference/05-10-design-audit/` were removed.
- `frontend/app/components/soul-link-reference-artboards.tsx` now renders Home and Discover as real DOM / CSS:
  - real text hierarchy, sidebar navigation, top search/user bar, CTA links, cards, filters, timeline panels, right rail, stats, and create-entry CTA;
  - real Discover search input wired to `onSearchChange`;
  - real filter buttons wired to existing place/special/category/public/open filters;
  - real tavern links derived from current tavern IDs when available;
  - mobile-safe `min-h-11` / `min-h-14` touch targets.
- Design images are no longer imported by runtime code as full-page backgrounds or full-page screenshots.
- Existing project-local content images are used only as component/card/hero visual assets, not as page shells.

### Corrected verification evidence

- `npm --prefix .\frontend run build` — passed.
- `npm --prefix .\frontend run typecheck` — passed.
- `npm --prefix .\frontend test` — passed.
- `node frontend/scripts/soul-link-reference-artboards-test.mjs` — passed; asserts Trellis-only reference archive, route usage, real-DOM markers, no runtime full-artboard imports, and real input/filter wiring.
- `npm --prefix .\frontend run test:soul-link-reference-ux` — passed; Playwright checks desktop and mobile surfaces, real-DOM markers, Discover search input typing, no horizontal overflow, and no page/console errors.
- Updated Playwright report:
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/soul-link-reference-check.md`


## Final correction record — 2026-05-10 owner design 1:1 lock

This record supersedes the earlier two implementation notes above. The previous approximate DOM redraw was not visually acceptable and must not be treated as complete.

### Owner requirement captured as hard rule

- The four owner-provided design drafts are the visual source of truth.
- For this task, `1:1` means no free redesign, no style reinterpretation, no new visual direction, and no claim of completion without fresh viewport screenshots against the reference dimensions.
- This rule was added to `.trellis/spec/frontend/image-asset-guidelines.md` under **Owner Design Draft 1:1 Reproduction** and referenced from `.trellis/spec/frontend/index.md`.

### Final implementation state

- Runtime assets now live under `frontend/app/assets/soul-link-05-10/` as project-local section/column slices generated from the four Trellis reference designs.
- Old homepage/search runtime design asset directories were removed:
  - `frontend/app/assets/homepage/`
  - `frontend/app/assets/discover/`
- The full design drafts remain archived only under `reference-designs/` for audit and comparison.
- `frontend/app/components/soul-link-reference-artboards.tsx` renders the locked Home/Discover artboards from section slices and overlays real DOM controls for navigation, CTA links, tavern links, theme toggles, Discover search, and filter handlers.
- `frontend/app/routes/home.tsx` and `frontend/app/routes/discover.tsx` route light/dark themes to the matching owner reference surface.
- Compatibility wrappers for previous reference components now delegate to the canonical SoulLink renderer and no longer import deleted assets.
- `frontend/app/product/SkillPackManager.jsx` received a small boundary-copy fix required by an existing regression test: skill packs are described as dialogue reference only and “不会写入正史”.

### Asset manifest

- `frontend/app/assets/soul-link-05-10/manifest.json` records source draft, crop box, dimensions, and SHA-256 for every runtime slice.
- `frontend/app/assets/soul-link-05-10/README.md` documents that these are section/column slices, not full-page runtime artboards, and that interactive controls are DOM overlays.

### Verification evidence

- `npm --prefix .\frontend run typecheck` — passed.
- `npm --prefix .\frontend run build` — passed after final code/test updates.
- `npm --prefix .\frontend test` — passed after updating the reference-contract tests to the new 1:1 asset set.
- `npm --prefix .\frontend run test:soul-link-reference-ux` — passed.
- Playwright report and screenshots:
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/soul-link-reference-check.md`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/home-light-desktop.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/home-black-desktop.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/discover-light-desktop.png`
  - `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/artifacts/playwright/discover-black-desktop.png`
  - mobile/narrow screenshots in the same directory.

### Remaining acceptance note

This pass prioritizes exact visual acceptance against the supplied drafts. The interactive layer is real DOM, but much of the visual layer is intentionally slice-backed to preserve 1:1 fidelity. Any future full DOM decomposition must be judged against the same design-lock rule and must not visually drift from the owner drafts.
