# 农场仓储与出货 v1：技术设计

## 1. Scope and existing chain

本任务只扩展 `apps/mirror-island/`，沿用 `Phaser/Vue -> typed GameCommand -> GameSession/domain -> SaveRepository -> IndexedDB`。不增加后端、数据库迁移、生产依赖或第二套可变状态。

前置 `09-04-surface-mining-v1` 已在 `15a7b61` 独立提交并合入本地 main；其真人验收与归档仍待完成。用户于 2026-09-06 确认开始本 child，现已在从本地 main 创建的 `codex/storage-shipping-v1` 分支实施并设为 active，不把前置待验收误记为通过。开发存档为 current v13，不实现 v12 迁移；IndexedDB object store 不变，因此数据库版本保持不变。

主要现有接线：

- `domain/state/game-state.ts`、`domain/persistence/SaveRepository.ts`
- `domain/session/commands.ts`、`domain/session/GameSession.ts`、`domain/session/day-settlement.ts`
- `domain/inventory/InventorySystem.ts`、`domain/crafting/CraftingSystem.ts`、`domain/recipes/definitions.ts`
- `domain/items/definitions.ts`、`domain/farming/crops.ts`
- `domain/world/regions.ts`、`domain/world/npc-schedules.ts`、`domain/world/npc-activities.ts`、`domain/world/npc-motions.ts`
- `client/src/persistence/IndexedDbSaveRepository.ts`、`client/src/session/local-game-session.ts`、`client/src/stores/game-store.ts`
- `client/src/game/world/tiled-region-decoder.ts`、`client/src/game/scenes/WorldScene.ts`、`client/src/game/entities/WorldEntities.ts`
- `client/src/ui/hotbar/Hotbar.vue`、`client/src/ui/inventory/BackpackPanel.vue`、`client/src/ui/sleep/DaySettlementPanel.vue`

## 2. Durable state

使用一个带判别字段的 `worldObjects` 集合统一保存玩家放置物与农场建筑的 identity/footprint，具体行为仍由窄 domain system 拥有。初始出货箱使用固定 ID，玩家创建对象使用持久递增序号；移动不换 ID。

```ts
type WorldObjectState = ChestWorldObject | ShippingBinWorldObject;

interface ChestWorldObject {
  readonly id: string;
  readonly kind: "chest";
  readonly regionId: string;
  readonly column: number;
  readonly row: number;
  readonly colorId: ChestColorId;
  readonly slots: readonly InventorySlot[]; // exactly 36
}

interface ShippingBinWorldObject {
  readonly id: string;
  readonly kind: "shipping-bin";
  readonly regionId: "farm";
  readonly column: number;
  readonly row: number;
}

interface ShippingEntry {
  readonly itemId: ItemId;
  readonly quantity: number;
}

interface WorldDropState {
  readonly id: string;
  readonly regionId: string;
  readonly originX: number;
  readonly originY: number;
  readonly stack: InventorySlot;
}

interface ShippingReport {
  readonly settledDay: number;
  readonly categories: readonly ShippingCategoryReport[];
  readonly totalGold: number;
}
```

`GameState` 新增 `worldObjects`、`worldDrops`、共用的 `nextWorldEntitySequence`、`shippingQueue` 与可空 `unacknowledgedShippingReport`。背包继续使用平铺 12/24/36 槽数组；切换 Hotbar 行通过 domain command 旋转完整 12 槽分组，因此槽序能自然保存，`selectedHotbarIndex` 始终限制为 0-11。

解码与 reconcile 必须检查：

- world object/drop ID 全局唯一、递增序号不倒退、判别类型与 region 合法；
- 普通箱恰有 36 槽，颜色属于 closed ID，所有 stack 符合 item-owned 上限；
- footprint 不越界、不重叠且符合目标 mask；
- 出货条目 item/quantity/资格合法，报告金额与条目结构合法；
- 新档从 Tiled 初始 spawn 创建唯一默认出货箱。

## 3. Domain ownership and commands

新增窄 owner：

- `domain/storage/ContainerSystem.ts`：容器指定槽转移、放入已有堆叠、整理、颜色。
- `domain/shipping/ShippingSystem.ts`：closed 出货资格、投入/撤回、分类和结算。
- `domain/world/WorldOccupancySystem.ts`：所有 mask 与动态 footprint 合法性。
- `domain/world/WorldObjectSystem.ts`：摆放、打开、回收、玩家/NPC 推箱。
- `domain/world/WorldDropSystem.ts`：危险终局掉落、完整拾取与持久 identity。
- `domain/building/BuildingServiceSystem.ts`：出货箱购买、移动、拆除与服务可用性。

`InventorySystem` 继续是 stack 和槽位转移的唯一实现；`ContainerSystem` 只编排两个 inventory。`sellPriceForItem()` 继续是售价 owner；`ShippingSystem` 不调用带 NPC/距离/即时加钱副作用的 `ShopSystem.sellItem()`。item definition 新增 `canShip`、`shippingCategory`、唯一 `inventorySortOrder` 与可选 `placement`，当前值严格采用 `research/current-item-shipping-matrix.md`，不从价格或 UI 分类反推。

新增或扩展 typed commands：

- `move-inventory`（整组/单件/半组与交换）、`sort-inventory`、`rotate-hotbar-row`、`buy-backpack-upgrade`
- `craft-item`，带数量和最终目标槽；拖到目标前只显示客户端预览，不扣材料
- `place-world-object`、`recover-empty-chest`、`push-chest`、`collect-world-drop`；只读打开经 `canInteractWorldObject()` 检查
- `transfer-container-item`、`move-container-item`、`add-to-existing-stacks`、`sort-container`、`set-chest-color`
- `ship-item`，数量只允许 `one | stack`；`reclaim-last-shipment`
- `build-shipping-bin`、`move-farm-building`、`demolish-farm-building`
- `dismiss-day-settlement`、`retry-storage-save`

旧 `craft`、`upgrade-backpack` 命令已移除，制作和背包购买只有上述候选保存入口。`StorageCommandSystem` 编排窄 owner，`GameSession` 保留候选、保存状态与重试；保存成功后才发布新状态。

所有命令先完整预检，再对一个 candidate 变更并调用一次既有关键保存链。指针拖拽、触摸选择和放置预览不改变 gameplay state；落槽/落地确认时只发一个命令，取消不会产生待补偿状态。

## 4. Atomic flows

### Inventory, crafting and containers

- 槽位转移先验证 source identity/quantity、destination compatibility 与完整容量，再同时改两端。
- 自动整理由 item catalog 的稳定 sort key 决定；工具保留原来的精确槽位，不能由 Vue 自排。
- 制作预览只读；确认目标槽时一次验证配方、材料总量和产物落位，再扣料并加入产物。这样保留产物附着光标的交互，同时避免客户端持有未保存物品。
- 摆放先验证 item placement、footprint 与动态占用，成功后一次消费箱体并新增对象。
- 空箱回收先验证背包可完整接收；非空箱推移只改位置，保持 ID、颜色和 slots。

### Chest push

把上游 `TryMoveToSafePosition` 写成一个共享的有界四向深度优先搜索：每个节点先随机排序，再将偏好方向、反方向置前，随后检查候选和可通行中间格。不要改写成广度优先搜索、固定最近格或硬编码三格半径。

玩家斧/镐/锄推动把 facing 作为偏好；失败返回 `blocked` 且状态不变。NPC 接触不提供玩家 facing，固定参考快照的缺省分支仍以南/北为优先；失败时先为每个非空 stack 创建持久 `WorldDropState`，再移除箱体，箱体不掉落。掉落拾取先验证背包可完整接收，再同时加入背包和删除 drop；失败或刷新保持原状。方向随机顺序只在 candidate 中决定，保存失败重试同一结果，不能重新抽取。

### Shipping and settlement

- 投入先从指定背包槽完整扣除，再向队列追加一个保持顺序的 entry；不同出货箱共用同一队列。
- 撤回先验证背包能接收队尾完整 stack，再 pop；失败不改两端。
- `beginDaySettlement()` clone candidate 后只调用一次 `ShippingSystem.settle(candidate)`，生成分类报告、加 Gold、清空队列，并把报告写入 `unacknowledgedShippingReport`。
- 保存失败继续保存同一 candidate；成功后发布新日状态并显示报告。刷新仍从 save 恢复报告；`dismiss-day-settlement` 保存清除报告后才恢复世界输入。

## 5. Map, occupancy and movement

`tiled-region-decoder.ts` 与 region contract 增加：

- `Placeable` tile layer：小型物件允许区，缺失时全 false；
- `Buildable` tile layer：Farm 建筑 footprint 允许区，其他 region 缺失时全 false；
- `farm-shipping-bin-default` point：只用于新档初始位置，不是固定建设槽；
- 华强店内背包陈列 interaction 与墨子西街住宅内木匠柜台 anchor。

普通箱的 closed region allowlist 是当前全部 12 个已加载 region；每张图仍只允许作者标出的 `Placeable` 格，未来普通矿洞不加入 allowlist。Farm 的 `Buildable` 只用于建筑。

`WorldOccupancySystem` 对每格统一收集 mask、Collision、Water、Exit、资源、农田、玩家、NPC、宠物、world object 和可清除地表物，并返回带 identity 的 `blocked | clear-on-place | relocate-on-place | free`。具体处置表以 `research/stardew-building-occupancy-1.6.15.md` 为准；World movement、NPC path、摆放和建筑移动消费同一事实源，但按操作类型解释结果，Phaser 不重复判断。

操作策略不能互换：普通箱可放在无作物的 HoeDirt 或标准路径上并保留底层状态，有作物即拒绝；标准出货箱建筑会清除空 HoeDirt/水/肥料、stage 0 树种、高草和路径，拒绝任意阶段作物、stage 1+ 树、debris 杂草/石块/树枝、玩家和其他 footprint，并把宠物移到预先计算的安全格。所有清除、移开、扣费与创建在同一个 candidate 中提交。

### 日结资源再生的整合准备（2026-09-06）

`GatheringSystem.settleDay()`、`MiningSystem.settleDay()`、`WeedCuttingSystem.settleDay()` 与 `ForageSystem` 已接入持久 footprint；依据和候选处理记录在 [资源再生占用研究](research/resource-regeneration-occupancy.md)。树受占时保留原再生日期并在后续日结重试；石块/杂草在既有排序和上限截取前排除受占点，不累计欠额；野采只过滤当天派生候选，不伪造已采标记。保留既定数量、周期、确定性和失败重试合同。

宠物位置、方向、运动与等待计时已下沉到 domain snapshot；`WorldEntities.PetEntity` 只投影。建筑放置遇宠物时先计算安全目标，再与允许清除项和建筑创建在同一 candidate 提交；小物件目标被宠物占用时拒绝。

NPC motion 遇箱子只返回 push intent；`GameSession` 调用 `WorldObjectSystem` 修改并保存，表现 runtime 不直接写 `GameState`。

## 6. Vue and Phaser projection

新增：

- `client/src/ui/crafting/CraftingPanel.vue`
- `client/src/ui/storage/ContainerPanel.vue`
- `client/src/ui/shipping/ShippingBinPanel.vue`
- `client/src/ui/building/BuildingServicePanel.vue`
- `client/src/ui/building/FarmPlacementPanel.vue`

`game-store.ts` 只保存面板开关、焦点、当前 object ID、拖拽预览与 placement preview。所有内容和合法性从 snapshot/result 读取。

`WorldScene` 按 stable ID 投影普通箱、出货箱和可拾取 world drops，并处理靠近箱盖、投入/回收/推动/掉落/拾取动画与声音。候选位置颜色与清除/移开提示只显示 domain 返回值。复用已登记 VectoRaith Buildings 图集中的 16x16 箱与 32x32 带盖木箱，不新增图片二进制。

所有面板接入统一暂停与输入锁、日结强制关闭、清档清理、Escape/返回、焦点循环和焦点恢复。Hotbar 改为 12 格，数字键补齐 `1-0`、`-`、`=`。世界获得焦点时 `Tab` 向前、`Shift+Tab` 向后旋转完整 12 槽行；面板打开时不旋转，保留焦点导航。移动端保持全部 12 格可达并提供前后行按钮，不要求一次平铺在窄屏。

## 7. Backpack and carpenter services

背包升级由种子店独立 Tiled interaction 开启，只购买下一档：12->24 为 2,000g，24->36 为 10,000g。无日期锁；第二档在第一档前不可见，两档完成后背包陈列标识消失，按 PRD 不保留可交互的售罄入口。`ItemDefinition.inventorySortOrder` 是唯一稳定排序键，当前值与 catalog 既有展示顺序一致且不得重复；工具不参加移动。

墨子建筑入口要求：

- identity 为 `town-resident-mozi`；
- NPC resolution 当前标记 `building-service` 且处于西街住宅正式柜台；
- 玩家在同 region、交互距离内；
- 当前 schedule context 允许营业。

把 schedule、activity 和 service availability 合并消费同一个精确分钟 resolution，并以 NPC 实际 motion tile 是否处于柜台服务范围决定短暂过柜服务。当前 child 实现普通、周二 09:40/20:00、周五离柜和普通雨分支；雨天优先于星期来自 Robin 参考日程，周五雨天因此映射到 17:00。特殊日日历由 `four-seasons-minimum-v1` 接入，真实施工 job 由鸡舍/筒仓和农舍升级 child 接入。当前不增加永远为空的施工持久状态，也不虚构诊所、节庆或绿雨坐标。

## 8. Open-source decision

已评估 SortableJS、vue.draggable.next、FormKit Drag and Drop 与 Atlassian Pragmatic Drag and Drop，证据见 `research/open-source-inventory-ui.md`。它们主要解决列表排序，不能同时提供本任务的 stack 语义、domain 原子命令与键盘等价入口。

v1 不新增依赖：使用标准 Pointer Events 做拖动预览，并提供点击/轻触两段选择与键盘按钮式等价操作；所有入口只派发同一 typed command。若实现阶段出现经测量的自动滚动/拖动复杂度，再单独评审并锁定 Pragmatic Drag and Drop，不预装备用包。

## 9. Verification and rollback

默认自动检查：`npm --prefix .\apps\mirror-island run typecheck`、`npm --prefix .\apps\mirror-island run build:client` 和 `git diff --check`。不默认扩展/全跑历史 contract tests 或建设 E2E；稳定复现的高风险真实缺陷才按价值补单个低成本检查。人工路线覆盖新档、背包升级、制作/箱子、跨日资源再生占用、NPC 极端推箱、双入口出货、保存失败、日结报告、桌面/移动/200% zoom。用户已确认本 child 暂不增加手柄输入，验证不包含手柄路线。

回滚只撤销本 child 新增的 current state、domain owners、commands、map contracts、panels 和投影；不恢复旧开发存档 migration，不触碰已独立提交的地表采矿代码。
