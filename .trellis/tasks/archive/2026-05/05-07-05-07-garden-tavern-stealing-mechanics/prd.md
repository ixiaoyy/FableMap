# 05-07-garden-tavern-stealing-mechanics

## Goal
在菜园酒馆基础种植/交易所之上，增加前端 MVP 的“偷菜/邻田顺手摘”薄层：访客可以在酒馆内查看 NPC 管家维护的邻田成熟作物，有限次数顺走 1 个作物，并由管家生成通知/提醒文案。

## Requirements
- 在菜园酒馆面板中增加偷菜/邻田区域，展示若干成熟可偷作物。
- 每日偷菜次数有限（MVP 前端本地计数），达到上限后按钮禁用并显示说明。
- 同一邻田目标当天只能偷一次，避免无限刷库存。
- 成功偷菜后，把作物加入访客本地库存，并记录当日偷菜次数。
- NPC 管家 prompt 需要播报偷菜结果，并包含“被偷访客收到管家通知/补偿提示”的轻量文案。
- 不新增后端表/API，不实现跨酒馆好友系统、公开社交墙、排行榜或付费加速。

## Acceptance Criteria
- [x] 菜园酒馆 UI 能看到“邻田/偷菜”区域。
- [x] 偷菜区域展示成熟作物、今日剩余次数和已偷状态。
- [x] 成功偷菜会让库存增加，并让今日次数减少。
- [x] 同一目标当天重复偷菜不可用；达到每日上限后所有偷菜按钮不可用。
- [x] 管家 prompt 包含偷菜结果与被偷通知边界。
- [x] `npm --prefix .\frontend test` 与 `npm --prefix .\frontend run build` 通过。

## Technical Notes
- 开发类型：frontend。
- 复用 `frontend/app/product/tavernFarmModes.js` 的本地 progress/localStorage 边界。
- 邻田数据使用确定性前端配置，作为 NPC 管家维护的酒馆内模拟邻田，不作为真实访客社交关系。
