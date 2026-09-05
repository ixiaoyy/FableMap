# Day 1-7 节奏与镜门预告

Parent: `08-31-day-1-7-retention-slice`

## Goal

按首周日期展示递进目标，并在 Day 7 交付只含视觉和叙事的镜门预告。

## Background

- v8 已持久化 `seenEventIds`，并预留 Day3/5/7 三个首周事件 ID；当前还没有消费这些 ID 的正式入口。
- 水壶、背包和每日委托已按 absolute day 解锁；Day6 确定性轮到 15 木材、320g、100 好感的高投入委托。
- Lakeshore 已有 `lakeshore-waystone` inspect anchor，可复用现有对话 modal，不需要新图片。
- 当前 LifeHud/CalendarPanel 仍调用 `calendarAt` 并展示春季结束，Day29 会产生错误的季节承诺，需要改成无上限 Day N 外显。

## Requirements

- compact `TodayHint` 与睡眠后一次性提示负责可发现性，不建立日志、任务链或教程引擎。
- Day1 种田/商店/小镇；Day2 委托板；Day3 昊天水壶升级；Day4 首次关系阶段反馈；Day5 背包目标；Day6 高承诺高奖励委托；Day7 镜门预告。
- 日期解锁由 absolute day 推导；`seenEventIds` 只防重复演出，不决定功能是否存在。
- Day7 复用 Lakeshore waystone anchor，增加代码绘制的像素镜面微光和短叙事；不新增图片二进制。
- Day3/5/7 一次性提示复用现有 action feedback，并通过窄 typed command 持久化已展示状态；刷新后不重复。
- HUD 和日历只显示 absolute `Day N` 与星期；日历按 28 天滚动页展示，不再标记“春季结束”或暗示完整四季。
- Day7 没有出口、传送、战斗、敌人、Cargo、捕获、掉落或 Expedition 状态。

## Out of Scope

- 教程引擎、任务日志、事件图、条件编辑器或可配置 timeline。
- 新音频、图片二进制、Tilemap 出口或任何 Expedition 运行时状态。
- Summer、季节迁移、天气、战斗和奖励掉落。

## Acceptance Criteria

- [ ] 从新游戏到 Day7，每一两天能发现表中对应的新内容，不依赖 debug 文案才能理解。
- [ ] 跳过某日 NPC 后，功能仍按日期解锁，相关一次性介绍在下一次合理交互补播而不丢失。
- [ ] Day4 积极路线得到清晰关系阶段变化；未满足关系条件时不伪造升级。
- [ ] Day6 委托的要求/收益明显高于普通日，但失败只有机会损失，没有虚构伤害/风险系统。
- [ ] Day7 湖岸有明确视觉与叙事异象，点击只预告镜门另一侧，不进入新玩法。
- [ ] 刷新后一次性提示不重复刷屏，Day7 异象的持续可见性符合设计。
