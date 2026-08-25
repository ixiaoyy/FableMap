# Stardew Life Loop 第一批

## Goal

在当前 Phaser 4 + Vue 3 + GameSession + IndexedDB 单人世界上完成一个可重复的 10 分钟最小生活循环：买萝卜种子 → 种植/浇水 → 睡觉推进日期 → 作物按天成长 → 收获 → 在种子店出售 → 继续下一天。

## Preconditions

- `Farm Showcase Checkpoint` 已冻结视觉方向；用户于 2026-08-25 在生产入口完成真实浏览器清单并明确回复“通过”，实施门槛已解除。
- VectoRaith 最小派生图集已按用户批准发布到生产 Web runtime；本任务不新增或重新分发素材，作者若补充许可条件则 forward-fix。
- 旧 `.trellis/tasks/08-17-minimal-farming-loop` 基于退役 React/旧存档/无限种子假设，已被本任务取代，不作为实现依据。

## Confirmed baseline

- `GameState` v2 当前只有玩家、24 格背包、资源和 8 个 FarmPlot；没有日期或金币。
- `FarmingSystem` 当前使用 `readyAt = now + 5000ms` 成熟；必须替换为睡觉驱动的按天结算。
- 当前物品是 `alien-seed` / `alien-crop` 占位命名；新循环改为单一萝卜种子和萝卜。
- Cottage TMJ 没有 Interaction；Seed Shop 已有固定 `seed-shop-keeper` NPC 和一句 Vue Dialogue。
- `SaveRepository` 只暴露 `has/load/save/delete`，本任务保持该抽象和 IndexedDB adapter 不变。

## Requirements

### Day and sleep

- `GameState` 保存 1-based `day`，初始为 1；本轮不派生、不显示 Season、年份或日内时钟。
- 第一批不实现日内时钟、2:00 强制睡觉、昼夜光照或 stamina；主动与 Cottage 床交互是唯一 Day+1 入口。
- Cottage TMJ 新增一个 stable `bed` Interaction；玩家靠近后按 E 发送 typed sleep command。
- 有效睡觉原子完成：结算所有 watered crops → 清除每日浇水状态 → day + 1 → 单次保存 → 把玩家放回 Cottage 安全位置。任一步失败不得留下半完成日结，重复输入不得同一天结算两次。
- HUD 只显示 `Day 1`、`Day 2` 与 `Gold`；不展示 Season 或完整时钟。

### Day-based crop growth

- 只支持 1 种萝卜；内部正式 ID 使用 `turnip-seed` 与 `turnip`，不继续扩散 alien placeholder 命名。
- 农田仍为现有 8 个 stable FarmPlot，操作流程保持 `untilled → tilled → growing → mature → tilled`。
- 播种后需要 3 次“当日已浇水 + 睡觉”才成熟；未浇水睡觉时保持阶段不变。
- 每次睡觉最多增长 1 阶段，随后清除 `watered`；不再由 wall-clock tick、刷新等待或 `readyAt` 推进。
- 成熟收获向背包增加 1 个萝卜；背包满时不收获、不丢失作物。

### Gold and one-item shop

- `GameState` 保存非负整数 `gold`，新游戏初始 100g。
- 种子店第一批只有萝卜种子：单价 20g；每次购买 1 个，金币不足或背包无容量时原子失败。
- 种子店同时收购萝卜：单价 35g；每次出售 1 个，背包没有萝卜时不改变金币。
- 通过现有 Seed Keeper 按 E 打开独立 Vue ShopPanel；NPC 固定站位、Dialogue 基础能力和地图不精修。
- ShopPanel 显示金币、买种子和卖萝卜；Vue 只发送 typed commands 并渲染 snapshot，不计算价格、扣款或库存。
- 不新增 shipping bin、价格波动、批量交易、品质、订单或第二种商品。

### State, migration and boundaries

- `GameState`/StoredGame 显式升级为 v3；合法 v2 保存迁移为 day=1、gold=100，并把 inventory/FarmTile 中的 alien seed/crop ID 映射为 turnip ID。
- v2 `readyAt` 不迁移为 wall-clock 进度；保留合法 growing/mature phase 与 watered 状态，下一次睡觉按新规则结算。
- v2→v3 migration 必须幂等；已经是 v3 的存档重复 decode/load 不重复加钱、加天数或改变作物。
- 未来/损坏版本明确失败，不能静默覆盖或回退旧记录。
- GameSession 仍是唯一 mutable aggregate；Sleep/Shop/Farming domain 不导入 Phaser、Vue、IndexedDB、Keycloak 或 Tauri。
- SaveRepository、IndexedDB database/store/ownerKey/slot 不变；不连接数据库、不新增 Prisma migration。

## Acceptance Criteria

- [x] Farm Showcase 真实人工验收全部通过并记录后，任务才进入 implementation。
- [x] 新游戏显示 `Day 1` 与 `100g`；刷新继续后 day、gold、背包和农田一致。
- [x] Cottage 床边按 E 每次只推进 1 天；其他位置不能睡觉，快速重复输入不重复结算。
- [x] 萝卜只有在当日浇水后睡觉才增长一阶；3 次有效跨日后成熟，wall-clock 等待不再使其成熟。
- [x] Seed Keeper 打开 ShopPanel；20g 购买 1 个萝卜种子，金币/容量失败均无部分 mutation。
- [x] ShopPanel 打开期间 Phaser 世界移动、动作和地图交互输入全部锁定；关闭后恢复。
- [x] 成熟萝卜收获一次进入背包；35g 出售 1 个，库存不足时金币不变。
- [x] 玩家能真人连续完成“买 → 种 → 浇水/睡觉三轮 → 收 → 卖 → 再买”，并至少跨到下一天继续操作。
- [x] 合法 v2 存档迁移为 v3，alien 物品/作物映射为 turnip；损坏或 future save 明确失败。
- [x] Phaser/Vue 只发送命令和渲染 snapshot；GameSession/SaveRepository 抽象、Keycloak 与 IndexedDB 边界不被绕过。
- [x] 最小 typecheck、client build 和针对 day/sleep/growth/shop/migration 的窄确定性检查通过；无数据库连接、部署或大规模测试矩阵。

## Out of Scope

- 第二种作物、品质、随机产量、肥料、体力、工具升级或任意地块开垦。
- 完整时钟、2:00、昼夜光照、天气、季节美术或复杂跨季规则。
- NPC 日程、关系、任务、剧情、《聊斋》、Town 美术精修或新地图。
- Shipping bin、批量买卖、价格波动、订单、成就、排行榜或云存档。
- Tauri、Rust、Steam API、Unity/Godot 验证、多人或服务端实时玩法。
- Expedition、灵兽、肉鸽、撤离、塔防或东方志怪实现；它们只能在 Life Loop 真人验收通过后进入独立设计评审。

## Planning decision

第一批出售固定走 Seed Keeper ShopPanel，不新增 Farm shipping bin。这比新增地图对象和结算时点更窄，并复用现有 Seed Shop/NPC 路径；未来如需要夜间出货，可在独立里程碑增加。

Life Loop 完成后的下一候选里程碑为 `Expedition Prototype / 异域远征最小原型`，但本任务不创建其运行时代码或通用框架。届时只先验证“安全家园 → 小型远征 → 风险收益 → 成功撤离带回战利品 → 想再出去一次”的核心感觉。
