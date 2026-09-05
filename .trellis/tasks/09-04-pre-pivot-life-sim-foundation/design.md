# 转型前生活模拟基础盘：技术设计

## 1. Task-tree ownership

父任务不直接修改生产代码。它拥有十个子阶段的顺序、共享不变量和最终转型门禁；每个子任务单独确定 GameState 增量、命令、地图/表现、验证和回滚边界。

```text
surface resources closeout
  -> storage / shipping / placement
  -> skills / recipe unlocks
  -> shallow mine / smelting / tool upgrades
  -> full 120-floor mine / combat / guild
  -> four-season minimum
  -> farm automation
  -> chicken / hay
  -> processing
  -> kitchen / cooking
  -> town community ledger
  -> transformation-readiness review
```

`town-community-ledger-v1` 保持一个可独立实施的嵌套子树；其 `surface-mining-v1` 子任务仍先独立收尾。父任务不复制采矿、种田、钓鱼、加工或畜牧状态。

## 2. Shared architecture

- GameSession 继续是唯一 mutable aggregate，按 target/kind/command 路由到窄 domain owner。
- GameState/StoredGame 每阶段整体提升 current version；Tiled 拥有静态区域、mask、出口与 authored 身份，save 同时保存动态状态和玩家选择的 placeable/building tile/footprint。
- 摆放需要一个共享 occupancy/validation owner：1×1 小型物件按 item 的允许区域落在合法格；鸡舍/筒仓等建筑用同一占用源校验多格 footprint，但保存为独立 building state，而不是伪装成小物件。
- 日结继续先克隆 candidate，在一次保存成功后发布；出货、作物、机器、动物、天气和日常资格的结算顺序必须由各子任务显式定义。
- 解锁条件由技能/日期/建设状态的 domain owner 决定，Vue 不复制等级或配方判定。

## 3. Cross-stage durable contract

每个子任务启动前必须提交完整 current shape，至少说明：

- 新增 closed IDs 与字段；
- 新建/继续/日结的数据流；
- 与现有 inventory、farmTiles、resources、friendships、weather 的关系；
- 保存失败、背包满、位置冲突和重复命令的原子边界；
- 旧开发存档的明确 unsupported 行为；
- 下一阶段可以依赖的最小稳定接口。

## 4. Stardew-reference placement contract

- 小型 crafted objects 不是 authored 固定插槽：玩家选中物品后选择合法空格放置。不同 item 可以有不同 location allowlist；具体限制必须来自参考资料或经用户确认，不能由实现方便反推产品规则。
- 箱子可放在多种地点；非空箱子不能直接收回物品栏，移动/阻挡 NPC 的规则需要在仓储 child 中按当前参考版本单独记录。
- Coop、Silo 等农场建筑由建造服务进入 placement mode；完整 footprint 必须无阻挡并显示合法/非法预览，位置由玩家选择。建成后可从同一服务移动，不能改成固定建设点。
- Farm 的 Tiled grid/mask 仍拥有静态边界，GameState 保存 player-chosen tile/footprint 和动态内容；占用判断由 domain 单一提供给 Farming、movement、NPC path 与 presentation。
- 参考依据：[Chest](https://stardewvalleywiki.com/Chest)、[Carpenter's Shop / Farm Buildings](https://stardewvalleywiki.com/Carpenter%27s_Shop)、[Furniture placement](https://stardewvalleywiki.com/Furniture)。

## 5. Validation strategy

- 每个子阶段只扩展与自身规则直接相关的现有 contract；默认门禁仍为 typecheck、client build、必要窄测试和真实浏览器路线。
- 跨阶段集成点在依赖方启动前复查，不建立覆盖十个系统的全排列 E2E。
- 每阶段验证 current save round-trip、原子失败、同日/同 tick 幂等、地图 stable IDs 和媒体二进制为零。
- 人工验收负责玩法理解、布局、手感、声音、桌面/手机和 200% zoom；Agent 不代签主观结果。

## 6. Rollback and transition

子任务必须能按自身 current version 和 closed IDs 精确回滚，不撤销之前已验收阶段。父任务只有全部子阶段通过后才完成；任何阶段被用户否决时，先重排或缩减该子任务，不用占位实现伪造完成。

最终转型审查只读取当前玩法与反馈并产出新任务，不在本父任务中修改世界观或玩法。
