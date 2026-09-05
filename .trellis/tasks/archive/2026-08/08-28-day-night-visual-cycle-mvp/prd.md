# 昼夜视觉变化 MVP

## Goal

让现有 06:00–24:00 游戏时间在画面上呈现晨曦、白天、黄昏与夜色，使玩家不只通过 HUD/NPC 日程感知时间，同时保持像素地图可读、交互 UI 清晰和室内生活空间温暖。

## Background

- `minuteOfDay` 已由 GameSession/StoredGame v4 唯一拥有，按 10 分钟步长推进；modal、动作和切图时暂停。
- WorldScene 使用单个 640×480 Phaser canvas、2× camera zoom；Vue 的 LifeHud、Hotbar、Dialogue/Shop/Sleep 面板叠在 canvas 之上。
- 当前没有 camera tint、光照或日夜 overlay；所有时段地图颜色完全相同。
- 正式室外区域固定为 Farm、Town、Foothills、Lakeshore；Cottage、Seed Shop、Blacksmith 与五栋住宅是室内。
- Impeccable 色彩策略：保留现有东方像素田园底色，以低剂量暖琥珀→暮紫→靛蓝表达时间；HUD 时间继续提供非颜色提示，夜色不能牺牲操作可读性。

## Confirmed Requirements

- 视觉只消费现有 `minuteOfDay` 和 `player.regionId`，不得建立第二套时钟或写入存档。
- 室外在 06:00 晨曦、约 07:00 恢复明亮白天、17:00 后进入暖黄昏、21:00 后进入靛蓝夜色，24:00 最深。
- 颜色和透明度按关键时间点线性插值，10 分钟 step 之间变化克制，不闪烁或硬切。
- 室内使用同一时间曲线但显著降低强度，夜间仍保持温暖可读；不假装实现真实窗灯/点光源。
- overlay 只覆盖 Phaser canvas；LifeHud、Hotbar、反馈、对话、商店和休息确认保持原色与清晰对比。
- 夜色采用清晰可游玩的中等强度：室外 24:00 最大约 44%，室内最大约 12%；本轮不以深黑遮罩换取沉浸感。
- `prefers-reduced-motion` 下取消 CSS 过渡，但时间状态仍即时正确。
- 不新增图片、着色器、第三方依赖、地图、GameState 字段、数据库、migration 或服务端逻辑。
- 每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] 06:00、正午、18:00、21:00、24:00 分别投影明确且连续的晨/昼/暮/夜视觉，夜晚仍能辨认道路、角色和交互目标。
- [x] Farm/Town/Foothills/Lakeshore 使用完整室外强度，所有室内区域使用较轻强度。
- [x] 区域切换立即采用目标区域强度；时间暂停时画面不自行继续变暗。
- [x] Vue HUD/modal 不受 tint 影响，HUD 时间继续作为非颜色时间提示。
- [x] StoredGame v4、GameSession clock、地图和素材均无变化。
- [x] 纯 daylight 投影合同、类型检查和客户端构建通过；Impeccable detector 只报告本轮未改的两项历史 CSS finding，daylight 改动行无新增 finding。

## Out of Scope

- 路灯、窗灯、火把、逐点光源、阴影、天气、月相、星空、太阳轨迹或季节色盘。
- WebGL shader/PostFX、Tilemap 重绘、图片素材或真实物理曝光。
- 夜间体力、昏倒、营业规则或 NPC 特殊日程。
