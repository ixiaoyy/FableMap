# 升级、背包与委托 UI

Parent: `08-31-day-1-7-retention-slice`

## Goal

把水壶升级、32 格背包和委托板做成可发现、可购买/提交、可恢复的正式玩家界面。

## Requirements

- 新增完整 BackpackPanel 展示 24/32 槽，第一排八格与现有 Hotbar 一致；只渲染 snapshot，不拥有容量规则。
- Day 3 后昊天对话提供水壶 Lv2 服务入口，显示 900g、15 木材、效果、当前持有与已升级状态。
- Day 5 后华强 ShopPanel 显示 1500g 背包扩容目标、当前容量与已购买状态。
- 现有 `town-notice-board` 显示 Day1 未开放、进行中、材料不足、已完成状态，含 NPC、物品、数量、持有、Gold 和 Friendship。
- 与目标 NPC 交谈时由 GameSession 自动提交；UI 显示一次性奖励和感谢，不提供“反复领取”按钮。
- 从开始菜单移除制作是正式可玩入口的文案；不删除制作底层。
- 新面板加入现有 modal 互斥、focus、Escape、world input lock 和触摸合同。

## Acceptance Criteria

- [ ] 玩家能在购买前清楚看到 24 槽、两个价格/效果与未达条件，购买后立即看到水壶等级或 32 槽。
- [ ] Gold/木材不足、已升级、已扩容、存档失败都有清晰且不误扣资源的反馈。
- [ ] 委托板与对应 NPC 的进行中/不足/完成状态一致，刷新不换任务，重复交谈不重复奖励。
- [ ] 正式 UI/菜单不再承诺可用制作按钮；底层 CraftingSystem 仍可通过合同检查。
- [ ] 桌面、640px、窄手机、200% zoom、键盘/触摸下关键操作可达且 modal 不重叠。
- [ ] typecheck/build 通过。
