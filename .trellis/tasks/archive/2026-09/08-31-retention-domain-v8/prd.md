# 首周留存 Domain v8

Parent: `08-31-day-1-7-retention-slice`

## Goal

一次性升级本地存档合同并实现连续 Day N、工具/背包升级、每日委托、关系/对话历史和首周里程碑规则。

## Requirements

- `StoredGame`/`GameState` 升为 v8，显式迁移 v7：24 槽、水壶 Lv1、Day≥2 的确定性当日委托、空对话历史、空事件集。
- 背包容量只能是 24/32，数组长度必须匹配；升级追加八个空槽且不移动既有物品/Hotbar。
- 水壶 Lv2 价格 900g+15 木材；沿 typed facing 从合法点击地块开始最多原子浇 3 个连续注册农田。
- 背包 32 价格 1500g；两个消费目标失败时 Gold/材料/容量/等级保持不变。
- Day 2 起从八个模板按 absolute day 确定性保存一个委托；对应 NPC 提交时一次性扣物、发 Gold+Friendship、标记完成并保存。
- 对话定义与选择移到 domain 单一 owner；稳定 variant ID、三日排除、关系阶段 acknowledgement、感谢语和两心 event IDs 可持久化。
- 内部十心/2500 点合同和每日 +20/-2 保留；外显阶段阈值 250/500。
- Spring 28 不再阻断睡眠；Summer 实现前所有 absolute day 继续使用当前 spring content 规则和无上限 Day N 外显。
- 不增加数据库、服务端、Quest Graph、事件图、通用升级树或通用条件引擎。

## Acceptance Criteria

- [ ] 所有合法 v7 fixture 确定性迁移为 v8；损坏、未来版本、未知 request/dialogue/event ID 明确失败且不覆盖原记录。
- [ ] 24→32 保持前 24 槽逐项相同并追加八个空槽；重复购买不扣款。
- [ ] Lv1 一格、Lv2 朝向最多三格；地图边缘、竖向只有两格、已浇/非生长地块不越界、不重复结算。
- [ ] Day 2–7 请求固定、刷新不 reroll、完成只领奖一次、睡觉后刷新且未完成无惩罚。
- [ ] Day 2 华强请求+Day 1–4 每日交谈在 Day 4 恰好达到 familiar；其他奖励不破坏 2500 上限。
- [ ] 同 NPC 最近三日的 dialogueId 不重复；历史有界并在刷新后继续生效。
- [ ] 华强/昊天 2 心事件 ID 各最多记录/触发一次。
- [ ] Day 28 睡到 Day 29 只结算一次，作物/商店/关系/委托/升级/容量均不重置。
- [ ] 相关窄合同、typecheck 通过，无数据库访问。
