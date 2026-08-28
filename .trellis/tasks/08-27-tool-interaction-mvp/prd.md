# Tool Interaction MVP 工具选择与使用

## Goal

把当前“点击目标后系统自动猜工具”改为可理解的工具交互：玩家先通过 Hotbar/数字键选中工具或物品，角色持续拿在手里，再点击世界目标使用；GameSession 必须验证所选物品、目标和状态后才能改变世界。

## Confirmed Facts

- Hotbar 当前只投影前 8 个背包槽，没有 selected index、点击选择或数字键选择。
- Tree 点击直接发送 `gather`，GatheringSystem 不要求斧头。
- FarmPlot 点击只发送 `farm-primary`，FarmingSystem 根据 phase 自动选择锄地、播种、浇水或收获。
- 当前新游戏只有锄头和浇水壶；树可徒手获得 3 木材，再显示“制作木斧”按钮，木斧对砍树规则没有实际作用。
- Tool Art Gate A 已提供斧头、锄头、浇水壶和 Hotbar 图标候选；素材 frame 仍只属于 client 表现层。
- 用户确认新游戏直接配发基础斧头、锄头、浇水壶，删除当前“3 木材制作木斧”占位入口；昊天以后只负责工具升级，不在本任务实现。

## Requirements

### Selection and held item

- 点击非空 Hotbar 槽或按数字键 `1–8` 选择对应槽；选中槽有清晰边框/状态，选择空槽表示空手。
- 选择状态属于 client transient UI，不进入 GameState/StoredGame/IndexedDB；新游戏、继续游戏和刷新后的默认状态为 `selectedHotbarIndex=null`，即没有槽位高亮且角色空手。
- 点击当前已选槽可取消选择回到空手；点击空槽也进入空手状态，不携带已经移出背包的旧 item ID。
- 再次按当前槽对应的数字键同样取消选择；若所选物品被消费完、移走或槽位变空，client projection 自动清除选择并恢复空手。
- Phaser 订阅选中槽，只持续显示当前所选工具/种子的手持表现；切槽、开商店/对话、切图和动作完成后不得残留上一件工具。
- Vue/Phaser 不直接修改 Inventory 或世界状态；选中 item ID 只作为 GameSession command 输入。

### Typed use contract

- 世界目标点击必须携带玩家当前选择的 `itemId | ""` 与 stable target ID；GameSession/domain 验证背包确实拥有该物品。
- `axe + tree` 才能砍树；其他已选工具点击树仍播放手中工具动作，但树无命中反馈、资源和背包不变。
- `hoe + untilled plot` 才能锄地。
- `turnip-seed + tilled plot` 才能播种并消耗 1 粒种子。
- `watering-can + growing unwatered plot` 才能浇水；重复浇水继续返回 waiting，不重复成长。
- `empty hand + mature turnip` 才能收获；拿着工具或物品点击成熟作物时只播放当前手持动作，作物无反馈且不收获。
- 空手收获必须有独立 `windup → impact → recovery` 采摘动作：面向目标、俯身/伸手、impact 时只结算一次收获、随后恢复空手待机。背包满等失败仍可播放玩家动作，但作物不消失且不播放目标 impact。
- 错误物品、空槽、过远、物品已不存在或目标状态不匹配都必须全不变。错误工具/物品不弹系统提示；只有正确动作成功时目标才播放 impact 反馈。

### Starter tools and current crafting placeholder

- 新游戏 Hotbar 固定前三格：锄头、浇水壶、基础斧头；默认不选择任何槽位，角色空手。
- 移除 Hotbar 的“制作木斧”按钮，不再要求玩家先徒手砍树。
- 不在本任务建设工具品质、耐久、体力、升级、修理、材料成本或铁匠商店。
- 现有通用 CraftingSystem 是否保留为冻结代码由实现审查决定；不得顺手建立新制作系统。

### Development compatibility policy

- 用户确认当前仍处开发期，本功能不兼容任何既有本地存档、旧初始背包或旧自动交互行为。
- 只验收新游戏；已有存档若缺少新初始工具或命令合同，直接由开发者/玩家覆盖为新游戏，不增加 backfill、migration、补偿物品或恢复 UI。
- 本任务可移除 active client graph 中的旧 `farm-primary`、徒手 tree gather 和木斧制作入口，不为旧命令调用者保留兼容别名。
- 已发布的 v1/v2 decoder 与 IndexedDB v2 backup 代码不在本任务删除；全量历史存档链清理必须另立任务，避免把工具交互扩成持久化重构。

### Input and modal safety

- Shop/Dialogue 打开时数字键、Hotbar 点击和世界使用不得触发动作；关闭后恢复之前选中槽。
- 动作期间继续锁定移动/交互；快速点击不得让 ActionTimeline 或 GameSession 重复结算。
- 切换 region、睡觉或销毁 Scene 时清理手持/动作 sprite，但不需要把选择写入存档。

## Acceptance Criteria

- [x] 新游戏前三格为锄头、浇水壶、斧头，默认没有槽位高亮且角色空手；木斧制作按钮不再出现。
- [x] 点击 Hotbar 与数字键 1–8 都能选择非空/空槽，角色手持表现同步且不会残留旧工具。
- [x] 只有斧头能砍树，只有锄头能开垦，只有种子能播种，只有浇水壶能浇水，只有空手能收获萝卜；错误选择仍播放手持动作，但目标无反馈、无提示且原子不变。
- [x] 空手收获拥有可辨识的俯身采摘动作，mutation 仍只发生在 ActionTimeline impact 一次；失败不移除作物。
- [x] 选择状态不进入 v3 save，刷新/继续不会触发 migration，默认恢复空手而不是自动选择工具。
- [x] Shop/Dialogue/ActionTimeline 期间输入锁正确，快速点击不重复 mutation。
- [x] Life Loop、Town Population、v2→v3 backup、typecheck 和 client build 不回退。
- [x] 不新增图片二进制、TMJ、数据库 migration、铁匠功能、体力/耐久/品质系统。
- [x] 本轮只以新游戏验收，不新增旧存档工具补齐、命令兼容或 save migration。

## Out of Scope

- 工具升级、品质、耐久、体力、修理、铁匠商店或新经济。
- 第二种作物、Season/Clock、NPC 日程、战斗、Expedition、Tauri、Steam。
- 正式发布 Tool Art 候选 PNG/CDN；仍沿用前一任务的本地视觉边界。
