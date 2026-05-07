# PRD: Owner Dashboard Presentational MVP

## 背景

`/owner` 已经是店主管理入口，并能聚合空间、访客状态、会话摘要与部分指标。最近完成的功能（Tavern Visitor Notes、通知 WebSocket、AI Assisted Tavern Drafts、地点类型视觉卡、移动底部导航）还没有在店主视角形成一个清晰的“下一步经营驾驶舱”。

本任务不重新发明 Owner Dashboard，而是在现有 `/owner` route 与 `owner-summary` 边界上做表现化与入口整合，让店主一眼知道：我有哪些空间正在营业 / 歇业；最近是否有访客回访、留言或会话；AI/LLM 配置是否阻塞开门；下一步应该去创建、配置、复盘或处理反馈。

## 目标

1. 强化 `/owner` 为高质量空间店主驾驶舱，而不是管理表格 MVP。
2. 聚合已有数据与入口：taverns、visitor states、chat sessions、visitor notes、notifications、owner default LLM / create draft 入口。
3. 保持移动端可用：窄屏下卡片、CTA、摘要信息不可挤压或被底部导航遮挡。
4. 保持产品边界：店主可见经营反馈，不做访客公开社交、排行、收费或复杂 BI。

## 非目标 / 禁止范围

- 不新增平台充值、Token 结算、账单、抽成或访客可见 token 消耗。
- 不做公开留言墙、主人公开回复、点赞、收藏、访客名单墙、关注/好友/私信。
- 不新增复杂统计口径或后端持久化 schema；本任务优先复用已有 API。
- 不让 AI 自动发布空间/NPC 内容；AI 草稿入口只能引导到店主确认流程。
- 不做传统地图 App 功能、路线规划、POI 评分或排行。

## 用户故事

### 店主：首次开店

作为新店主，我进入 `/owner` 后，如果还没有空间，应看到明确的第一步：创建真实坐标锚定的空间，并知道 AI 草稿只是辅助创作。

### 店主：已有空间但未开门

作为店主，如果有歇业空间或 LLM 配置缺失，我希望 dashboard 用明显但不恐吓的方式告诉我哪里阻塞，以及下一步去哪里修。

### 店主：已有访客互动

作为店主，我希望看到最近回访者、会话、owner-visible 访客反馈入口，用于复盘空间体验，而不是对访客进行公开展示或社交运营。

## 功能范围

### 1. 经营 Hero / 状态摘要

- 顶部提供视觉化 hero：店主 ID、经营状态一句话、主要 CTA。
- CTA 可包含：创建空间、查看发现页、进入第一个需要处理的空间。
- Hero 文案必须强调“真实坐标、店主确认、AI 草稿辅助”。

### 2. 经营卡片

保留或增强现有 metrics：空间数 / 营业数；访客数 / 回访者；会话数 / 消息量；AI/LLM 配置状态（若只能前端推断，则标注为配置入口，不承诺精确健康检查）；owner-visible feedback 状态（访客 notes 入口或待处理数量，如 API 可复用）。

### 3. 下一步建议

扩展 `owner-summary` 的 next actions，使其能表达：无空间 → 创建第一间空间；有歇业空间 → 检查 LLM / 营业状态；有回访者或会话 → 复盘最近互动；有访客 notes 能力 → 进入具体 tavern 的 owner-visible notes 区域或提示去 tavern 管理。

### 4. 入口整合

Dashboard 应提供清晰入口，但不重复完整管理功能：`/create` 开店 / AI 草稿辅助；`/tavern/:id` 单空间详情、访客 notes、关系/角色治理；通知入口可复用 `NotificationBell` 或以“通知中心入口”形式展示，不要求本任务新建通知中心。

### 5. 空态 / 错误态

- 无空间、无访客、无会话、API 局部失败都需要有高质量空态。
- 局部失败不能让整个 dashboard 白屏；继续展示可用数据。

## 数据与接口

优先复用：

- `listTaverns({ owner_id })`
- `listTavernVisitors(tavern.id, ownerId)`
- `listGlobalChatSessions({}, ownerId)`
- `getTavernMetrics(tavern.id, ownerId)`（如可用则展示，不作为硬依赖）
- `listVisitorNotes(tavern.id, ..., ownerId)`（如纳入待处理反馈摘要）
- `getOwnerDefaultLLM(ownerId)`（如纳入默认 LLM 配置状态）

如发现现有 API 不稳定，本任务优先降级为入口与可解释状态，不新增后端 schema。

## 文件范围（预计）

- `frontend/app/routes/owner.tsx`
- `frontend/app/lib/owner-summary.js`
- `frontend/scripts/owner-summary-test.mjs`
- 可能新增：`frontend/scripts/owner-dashboard-layout-test.mjs`
- 可能更新：`.trellis/spec/frontend/component-guidelines.md` 或 `type-safety.md`（如沉淀新约定）

## 验收标准

- `/owner` 首屏具备明确的视觉层级、CTA 和状态摘要，不只是数据表格。
- 空态、局部错误态、已有数据态都有可读文案。
- Dashboard 不展示 API Key、不展示访客私密记忆、不构成公开社交流。
- 移动端布局不依赖宽屏，主要 CTA 触摸目标符合移动规范。
- Frontend regression 脚本覆盖 owner summary / dashboard 关键文案或结构。

## 验证计划

- `node frontend/scripts/owner-summary-test.mjs`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend run build`
- 可行时浏览器手动查看 `/owner` 的桌面与移动宽度表现。

## 风险

- 现有 `/owner` 已经包含部分图表/指标，任务重点应是整合新能力入口和视觉质量，不要重写成另一个大面板。
- 若尝试精确统计 visitor notes / LLM health，可能诱发后端改动；本任务默认避免。
- 当前工作区已有大量未提交改动，实现时必须避免顺手格式化或改无关文件。
