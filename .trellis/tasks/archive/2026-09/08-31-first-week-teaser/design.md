# Day 1-7 节奏与镜门预告：技术设计

## Boundaries

- 新建窄 `FirstWeekMilestoneSystem`，只负责 Day3/5/7 三个预留 event ID 的日期校验、幂等写入与固定反馈；不建立通用事件系统。
- `GameSession` 增加 `acknowledge-retention-event` typed command。功能解锁仍由既有 absolute day 规则决定，`seenEventIds` 仅记录一次性介绍已展示。
- `TodayHint.vue` 从当前 snapshot 派生 Day1–7 文案；Day4 根据实际最高关系阶段显示“继续建立关系”或“已有熟悉反馈”，不伪造升级。
- `TodayHint.vue` 在 playing、无对应 seen ID 时自动 dispatch 当日已解锁 milestone；现有 feedback toast 承担睡眠后/继续游戏后的一次性提示。
- `LifeHud` 与 `CalendarPanel` 改用 `playableCalendarAt`/absolute day。日历只分页显示 Day N，不再向玩家承诺尚未实现的季节终点。
- `InspectEntity` 为 `lakeshore-waystone` 持有代码绘制的像素镜光，并按 `absoluteDay >= 7` 投影可见性；它是纯 presentation，不进入 GameState。
- waystone inspect 继续使用现有 dialogue catalog；WorldScene 传入 day/minute context，Day7+ 返回三句镜门传闻，Day1–6 保持原石标说明。

## Data Flow

1. sleep/continue 发布 snapshot → Vue `TodayHint` 观察 day 与 seen IDs。
2. milestone 可展示 → dispatch `acknowledge-retention-event` → domain 校验日期并写入 closed `seenEventIds` → 原子保存 → action feedback 显示一次。
3. WorldScene snapshot → `InspectEntity.projectRetentionDay(day)` → Day7+ 持续显示镜面微光。
4. 玩家点击 waystone → client dialogue resolver 根据 day 选择文本 → 现有 DialoguePanel 展示，不产生传送或玩法状态。

## Compatibility and Rollback

- 不修改 v8 schema、save version 或 migration；只开始消费已发布的 closed event IDs。
- 旧 v8 存档在 Day3/5/7+ 且 ID 未见时补播一次，已见则不播；Day7 视觉始终按日期可见。
- 回滚可分别移除 Vue 提示、typed command 与代码绘制视觉，不影响升级、委托、关系和 v8 decode。

## Dependency Decision

- 复用 Vue reactivity、Phaser Graphics/Tween、现有 action feedback/dialogue；这是项目内既有窄能力，不新增通用第三方依赖，也不存在需要引入的开源事件/教程框架。
