# 春季基础玩法 v1：技术设计

状态：completed。用户于 2026-09-02 批准实施；2026-09-03 代码实现与相关自动检查完成，并要求提交推送 main。用户已确认真人验收全部完成，发布结果以流水线为准。

## 1. 设计目标

- 在一个 StoredGame/GameState v10 中交付 06:00–02:00 日程、体力、天气、动态农田、资源再生、六种作物、钓鱼、基础送礼和营业日程。
- 删除现有 Day 7 镜门伏笔，以普通钓鱼引导替代；不展开剧情、节庆或月度目标。
- 保持唯一调用链：Phaser/Vue → typed GameCommand → GameSession/domain → SaveRepository；实时玩法不访问后端或数据库。
- 继续由 Tiled 拥有地图位置和可耕/水域边界，由 domain 拥有规则和持久状态。

## 2. 单任务与单版本理由

这些能力共同改变 GameState、日结顺序、输入锁和 HUD，并且自由农田、天气、体力、送礼都依赖同一次 v9→v10 迁移。拆成可独立部署的子任务会产生多个过渡 schema 或半完成运行时，因此本任务保持一个发布边界，实施阶段按可回滚提交分段完成，但完整 v10 通过验收前不部署。

## 3. Owner 与调用边界

| 能力 | 唯一 owner | 客户端职责 |
|---|---|---|
| 时钟、午夜提醒、02:00 昏倒、日结 | GameSession + game-time/day-settlement 规则 | 显示时间、提醒和淡出/醒来表现 |
| 体力与晚睡恢复 | StaminaSystem | HUD 条与食用入口；不计算成本 |
| 今日/明日天气 | WeatherSystem | 天气图标、粒子、色调和环境声 |
| 可耕范围、水源、钓鱼点 | WorldCatalog，由 Tiled decoder 构建 | 把指针/面向转换成候选瓦片或区域 |
| 农田和作物 | FarmingSystem + crop definitions | 渲染稀疏农田 snapshot 和动作 |
| 树、树桩、再生、枯枝 | GatheringSystem/ForageSystem | 渲染资源阶段和点击反馈 |
| 钓鱼规则 | GameSession 内的 FishingSystem runtime | 发送按住/松开意图，渲染张力界面 |
| 送礼限制与偏好 | GiftSystem + FriendshipSystem | 发送当前手持物与 NPC ID，显示结果 |
| NPC 日程和营业 | schedule resolver | 渲染 domain 投影，不在 Vue 判断星期/天气 |

## 4. GameState v10

v10 在现有字段上增加或重塑以下状态：

| 字段 | 形态 | 说明 |
|---|---|---|
| worldSeed | uint32 | 新游戏一次生成；天气、鱼获和春土豆多产的稳定输入，枯枝另外使用日期/稳定候选 ID |
| minuteOfDay | 360..1560，10 分钟粒度 | 1440 以后显示为次日 00:00–02:00，但 absolute day 在结算前不变 |
| lateWarningDay | 非负 day | 保证午夜提醒刷新后不重复 |
| stamina | 0..MAX_STAMINA | 最大值由固定定义拥有，本版本没有永久升级 |
| fishingCastCount | 非负安全整数 | 抛竿立即递增并保存，不用当前体力值决定鱼获 |
| wateringCanWater | 0..capacity(level) | 水壶等级继续单独保存，容量由等级定义派生 |
| weather | day/current/next | 今天和明天的 closed weather kind，日结时原子推进 |
| resources | Record by stable entity ID | 树使用 standing/stump/cleared 和 nullable regrowOnDay；石头继续不可采 |
| farmTiles | sparse Record by farm:column:row | 只保存已开垦瓦片；包含 crop、growth、watered、plantedDay 和 harvestCount |
| dailyForage | day + collected IDs | 承载普通采集物与当日枯枝领取记录 |
| friendships | per NPC gift counters | 在既有 points/lastTalkedDay 上增加 lastGiftDay、giftWeekIndex、giftsThisWeek |

Fishing run 不写入 StoredGame。开始抛竿时先原子扣除体力并保存；刷新或离开区域会取消当次 runtime，不产出鱼，也不退还已经消耗的体力。

## 5. v9→v10 迁移

- SaveRepository 新增且只新增一个显式 v9 migration；v1–v8 继续通过现有迁移路径补齐 v10 默认值。
- 旧 8 个 farm plot 使用发布时固定的一次性兼容表映射到 Farm 瓦片坐标：
  - farm-plot-001..004 → row 18, columns 27..30
  - farm-plot-005..008 → row 19, columns 27..30
- 兼容表只服务已发布存档；新位置仍由 Tiled Tillable mask 拥有，不把坐标复制到普通玩法定义。
- v9 resource available=true 映射为 standing；available=false 映射为 stump，保留玩家已经砍下的树。
- v9 的 day-7-mirror-teaser 从 seenEventIds 中移除；其余事件、对话、关系和宠物保持。
- 旧存档 worldSeed 从 day、gold、player region/x/y 经固定 uint32 hash 派生；同一原始记录重复迁移得到相同结果。新游戏以 ownerKey/创建时刻生成一次。
- IndexedDB 在首次成功写入 v10 前保留一份不可枚举的 v9 原始备份。v10 解码失败不得覆盖主记录或备份。

## 6. 时钟、昏倒与日结

- DAY_END_MINUTE 调整为 1560；格式化函数把 1440..1560 显示为 00:00..02:00。
- NPC night phase 从 21:00 延伸至 02:00，不增加第五时段。
- GameSession.tick 返回 `ActionFeedback | null`，包含午夜提醒、日结保存和异步结果。WorldScene 只消费反馈与已提交 snapshot。
- 主动床铺睡觉与 02:00 昏倒统一进入 `beginDaySettlement`：
  1. 加锁，拒绝重复输入。
  2. 计算屋外昏倒 Gold 扣除与次日体力。
  3. 在 clone 中结算关系与农作。
  4. day + 1，修剪对话历史，推进树再生、天气、采集与委托。
  5. minuteOfDay 设为 06:00，玩家放到 Cottage safe spawn。
  6. 保存完整候选，成功才发布新日 snapshot；失败保持旧日并显示重试，复用候选避免重复扣款。
- 24:00 前恢复满体力；之后按固定十分钟表单调下降，02:00 保底 50%。体力归零只阻止需体力动作，不触发另一种昏倒。
- 当前恢复表（00:00..02:00，每十分钟）：100、98、95、93、90、88、75、73、70、68、65、63、50。体力上限100；锄地/砍伐各2、浇水每有效格1、抛竿6。

## 7. 天气

- WeatherSystem 使用 worldSeed + absolute day 的固定 hash 选择晴、雨、风；Day 1 固定晴，Day 3 固定雨，其余为雨20%、风18%、晴62%的确定性权重。
- 保存 current/next，算法升级不会改变已经预告的次日天气。
- 雨天把所有已开垦室外土壤标记为已浇水，包含同日新开垦与采收后的土壤；睡眠时由 FarmingSystem 结算成长。
- 风天提高稳定枯枝候选数，并开放风天鱼池；晴天使用基础鱼池。
- NPC resolver 接收 day/weather/minuteOfDay，weekday 纯推导；按休息日 > 雨天 > 常规四时段 anchor 投影，避免雨天把休息居民重新判为营业。

## 8. 自由农田与浇水

- farm.tmj 的隐藏 Tillable mask 当前为492格；WorldScene 不渲染该层，decoder 将其变为与 collision 同尺寸的 boolean grid，不保留第二套矩形可耕 owner。
- WorldCatalog 提供 isTillable(regionId, column, row) 与 isWaterSource(...)；只有 Farm mask 允许种植，现有 Water layer 提供可补水边界。
- 使用锄头时，Phaser 只发送相邻候选瓦片坐标；FarmingSystem 再验证区域、距离、mask、占用和体力后创建 sparse tile。
- FarmTile key 固定为 farm:column:row。未开垦瓦片不写 save，避免保存整张 64×48 网格。
- 水壶补水不消耗体力；浇水只对实际变为 watered 的格子扣水与体力。Lv2 沿面向最多处理连续三格，遇到非法/不存在格停止。
- 容量 Lv1=20、Lv2=40；升级补满。目标限相邻瓦片，键盘/触摸朝向共用 snapshot 位移与 `facingFromVector`。
- 雨天自动浇水不消耗水壶水量或体力。

## 9. 作物与采集

- CropDefinition 增加 optional regrowDays、yield strategy 和 edible stamina restore。
- 六种作物：
  - 萝卜：短周期低门槛。
  - 小白菜：中短周期稳定收益。
  - 花椰菜：长周期高单价。
  - 青豌豆：首次成熟较慢，之后固定间隔再生。
  - 春土豆：单次收获 1+受控额外数量，结果由 seed/day/tile/harvestCount 决定。
  - 油菜花：普通收获和出售，并作为部分居民喜欢的礼物。
- 没有浇水的作物不成长但不死亡；本版本没有季末枯萎，因为 Day 29 继续 spring-content。
- 山坡春笋仅在每轮28天的第4–14天参与刷新；Farm/Town/Lakeshore 保持零星来源。三处 Farm 枯枝候选沿用每日稳定子集，风天全开，不刷入已经开垦的农田。

六作物当前参数：

| 作物 | 成长天数 | 种子/售价 | 差异 |
|---|---|---|---|
| 萝卜 | 3 | 20/35g | 短周期 |
| 小白菜 | 5 | 45/80g | 稳定收益 |
| 花椰菜 | 8 | 80/170g | 高单价 |
| 青豌豆 | 7 | 70/48g | 采收后3天再生 |
| 春土豆 | 5 | 50/72g | 稳定hash：1份基础，55%再加1，15%再加1 |
| 油菜花 | 6 | 35/68g | 部分居民喜欢的礼物 |

## 10. 树木再生

- standing 使用斧头后变为 stump 并产出主体木材；再次使用斧头清桩并产出少量木材。
- 树干产3木材、树桩产1；Farm 清桩后保持 cleared，Farm 外写入 day+7，到期日结恢复 standing。
- 重新载入只投影保存状态，不重新抽取再生日或枯枝。
- 石头仍是表现型不可采目标；本任务不借资源重构引入采矿。

## 11. 钓鱼

- lakeshore.tmj 增加 FishingZones 定义可交互区域；Day7起向祥子免费领一支鱼竿，旧存档同样可领。新游戏不提前发鱼竿，提示不假定 NPC 在码头，雨天指向东岸民宅。
- FishingSystem phases：idle → casting → waiting → reeling → caught/escaped/inventory-full；咬钩按下立即进入 reeling，不另建 hooked 帧。
- 单一输入语义：
  - casting：按住累计、松开确定距离。
  - waiting：900ms 咬钩窗口内按下进入 reeling；等待约1.8–4秒。
  - reeling：按住提高张力、松开降低张力；张力在安全区时增加收线进度。
- 鱼定义至少覆盖基础全天、晨间、夜间、雨天、风天和远投稀有六种角色；名称、美术和数值使用镜像岛原创内容。
- 开始合法抛竿扣一次体力；失败不产出，成功向 Inventory 原子增加鱼。容量不足时保留鱼获结算界面直到玩家放弃该鱼，不覆盖物品。
- 收线安全区22–78，过紧100断线、过松0脱钩。casting/waiting 继续岛上计时，reeling/结果暂停，隐藏页面冻结两者。
- caught 另由 GameSession 投影 saving/saved/failed；失败只能重试同一背包，不能先收竿或重复加鱼；escaped 不显示未获得的鱼名。
- Phaser/Vue 只渲染进度、张力、提示和结果；鱼池选择、难度曲线、成功/失败由 domain runtime 决定。

## 12. 送礼与营业

- 玩家选中可送物品点击近距离 NPC 时优先进入送礼确认；工具或空手维持原交谈/商店行为，避免误送。
- GiftSystem 在同一命令中验证 NPC、距离、每日/每周限制、偏好、库存和关系上限，再原子扣物品并改变 friendship。
- 没有全镇总限制；每名普通居民每天一份、每周两份，周日重置。喜欢/普通/不喜欢分别+45/+20/-20点，范围仍受原好感上限约束。
- 首版偏好只有 liked、neutral、disliked 三档，不加入 loved/hated、生日倍率、品质倍率、配偶规则或礼物图鉴。
- NPC schedule 增加工作/休息日和天气 override。ShopSystem 继续以当前活跃 NPC 投影决定能否营业，不复制营业判断。
- 服务时间09:00–17:00；华强周三、昊天/阿禾/墨子/昊美丽周日、浩南周五、阿澜/祥子周一休息。雨天昊天在铁匠铺仍可升级，其余外出居民回家。

## 13. 客户端表现

- LifeHud 增加体力条、天气图标和午夜后时间显示；Hotbar 的水壶显示当前/最大水量。
- WorldScene 增加动态农田实体、补水反馈、天气粒子/环境层、枯枝、树桩清除、FishingZones 交互和昏倒淡出。
- 新增 FishingPanel 作为唯一钓鱼交互 UI；复用现有 modal/input lock 规则，支持鼠标、键盘与单指触摸。
- 送礼使用轻量确认和现有 action feedback，不建立礼物日志或角色资料页。
- 背包任意槽可手持，不移动存档堆叠；DOM 模态事件与 Phaser 全局键盘隔离，Tab 焦点循环、钓鱼失焦释放输入。Phaser FIT canvas margin 通过 flow-root 隔离，恢复焦点不滚动 HUD。
- 天气声音由现有 AudioDirector 下的原生 Web Audio 薄层合成，跟随 master/SFX、室内外和隐藏状态；不新增媒体文件或依赖。
- 删除 MirrorTeaserView、Day 7 镜门 dialogue/milestone/TodayHint 和对应活动测试；Lakeshore waystone 永远返回普通说明。

## 14. 影响文件

主要修改范围：

- domain/state/game-state.ts、domain/persistence/SaveRepository.ts
- domain/time、domain/calendar、domain/session/GameSession.ts、domain/session/commands.ts
- domain/farming、domain/gathering、domain/items、domain/shop、domain/social、domain/world
- 新增 domain/weather、domain/stamina、domain/fishing、domain/social/GiftSystem.ts
- client Tiled decoder、world catalog、WorldScene、WorldEntities、game-store、LifeHud、Hotbar
- 新增 FishingPanel 与必要天气/体力表现组件
- farm.tmj、lakeshore.tmj 及必要的资源候选点
- 当前产品文档、Trellis spec、现有窄合同测试

不修改 server、Prisma、数据库、Keycloak、论坛 SSO 或 Docker 拓扑。

## 15. 兼容、发布与回滚

- v10 是单一发布单元。任何一部分失败都不部署半完成 schema。
- 发布前以 v9 真实形状样本验证迁移、备份和刷新恢复；不连接数据库。
- v10 写入生产浏览器后，旧客户端不能理解新存档，因此发布后的缺陷以 forward-fix 为主；v9 备份只用于人工恢复，不作为第二可玩槽。
- 历史 checkpoint 保持原记录；只更新当前状态、产品边界和 spec，说明 Day 7 镜门伏笔在后续版本被明确移除。

## 16. 主要风险

- 02:00 tick 与床铺确认竞态造成双日结：由单一 settlement lock 和一次状态发布防止。
- 动态农田命令伪造任意坐标：WorldCatalog mask、相邻距离和 Farm region 三重验证。
- 随机结果刷新重抽：所有结果使用 v10 seed 与稳定键，不使用 Math.random。
- v9 固定 plot 迁移漂移：一次性兼容表配合当前 TMJ 坐标断言。
- 六作物与自由农田破坏经济：在 Day 1–7、Day 8–28 和 Day 29 三段人工路线中核对体力、种子成本、售价和木材供给。
- 手机钓鱼不可控：同一按住/松开语义、较宽安全区和 200% zoom/单指验收。
