# World Foundation 区域地图与实体管线

## Goal

把当前代码绘制的 LOCAL/grid 技术页迁为可长期扩展的 Phaser/Tiled 2D RPG 世界：玩家从农场向右进入小镇，区域、实体、持久状态与交互动画都有稳定合同；完成 Visual Pass 后游戏世界成为默认主视图，Debug Shell 只保留为显式诊断入口。

## Background

- 单人规则主线已完成 `Phaser/Vue -> GameSession -> pure domain -> IndexedDB`，Colyseus active graph 已移除。
- Chrome 已实际跑通树木采集、制作、种田、收获与刷新继续；不同 Keycloak subject 的隔离人工证据仍待后续补齐，但用户明确要求不再阻塞地图开发。
- 当前玩家、树和农田均为 Phaser 代码图形，世界只有一张 512×512 grid；没有 Tiled 文件、区域切换、碰撞、正式实体或动作时序。
- 现有 `game-media-manifest.json` 已登记同一 Ninja Adventure CC0 固定提交中的地面、村庄、室内、墙体与角色素材；本任务不混用其他来源。

## Product boundaries

- 严格按 Commit A（Tilemap Foundation）→ Commit B（World Entities + Action Timeline）→ Commit C（Visual Pass）推进。
- 当前 LOCAL/grid 页面只作为 Debug Shell。Commit C 完成后默认入口直接展示游戏世界；Debug Shell 只能通过明确的开发/查询参数进入，不占据正式主视图。
- Keycloak 当前仅用于账号隔离验收。GameSession 继续只接收 opaque owner key；不得把“必须 Keycloak 登录”固化为未来单机产品不可替换的 domain 或地图前提。
- 本任务不新增昼夜、经济、NPC 日程、天气、钓鱼、战斗、科技、招募、剧情、书屋或《聊斋》内容。
- 不连接数据库、不新增 migration、不部署生产。

## Tiled map contract

- 使用 16×16 正交有限地图；整数坐标、整数相机缩放、NEAREST filtering。
- 每张 TMJ 必须内嵌 tileset metadata；Phaser 当前 Tiled parser 不支持外部 tileset `source`，因此不在运行时依赖 `.tsj`。
- 固定 Tile Layers，名称与职责不可漂移：
  - `Ground`
  - `GroundDetail`
  - `Water`
  - `Buildings`
  - `AbovePlayer`
  - `Collision`
- 固定 Object Layers：
  - `SpawnPoints`
  - `Exits`
  - `Interactions`
  - `ResourceSpawns`
  - `NpcSpawns`
- 对象 `name` 只供编辑器辨认，程序不得猜名字决定行为。行为只读取统一 decoder 验证过的 `type` 与 properties。
- 最低属性合同：
  - spawn：`spawnId`
  - exit：`exitId`、`targetRegion`、`targetSpawn`
  - resource：`entityId`、`resourceKind`
  - interaction：`entityId`、`interactionKind`
  - npc：`entityId`、`npcId`、`dialogueId`
- stable ID 在全世界范围唯一；地图拥有静态位置，存档只保存动态状态，不修改 TMJ 本体。

## Commit A — Tilemap Foundation

- 新增 `farm.tmj` 和 `town.tmj`，先用运行时代码生成的测试 tileset 建立管线，不提前绑定正式素材。
- 建立唯一 `TiledRegionDecoder`，从 unknown 验证地图尺寸、固定 layers、object types、properties、stable IDs 和跨区域 target。
- 建立 `RegionCatalog`、区域加载/销毁、出生点、Collision、相机边界和短淡入淡出切换。
- Farm 的东侧出口进入 Town 的西侧出生点；Town 西侧出口返回 Farm 的东侧出生点。
- GameSession 仍是玩家状态唯一 owner。地图加载结果投影为普通 TypeScript world definition，Phaser 不私自维护第二份持久玩家位置。
- 存档显式升级为 v2，加入当前 region 并把 v1 代码图形状态迁到稳定实体 ID；不得静默覆盖或丢弃已有 v1 存档。

## Commit B — World Entities and action timing

- Tiled 只放 entity spawn object，不把树、石头、NPC、作物或可交互门画进 Tile Layer。
- 建立 `EntityFactory`、`TreeEntity`、`RockEntity`、`FarmPlotEntity`、`NpcEntity`；相同 Tiled decoder 输出同时供 domain 规则和 Phaser renderer 使用。
- 树木、农田动态状态以 stable ID 保存。切换地图或刷新后，被砍树木与农田 phase 保持一致。
- 建立可复用 `ActionTimeline`：`windup -> impact -> recovery`。只有 impact 触发一次 GameSession mutation，动画期间拒绝重复交互。
- 砍树测试表现至少包含面向目标、挥击节奏、命中震动/闪烁、木材反馈和耗尽转换；锄地与浇水复用同一时序骨架。
- 新增玩家小屋与种子店室内 region，复用相同 exit/spawn transition。
- 只新增一个固定站位种子店老板；按 E 通过 Vue Dialogue 显示一句固定文本，不实现商店、日程或剧情。

## Commit C — Visual Pass

- 只使用 manifest 已登记的 Ninja Adventure 固定 CC0 子集，不混入第二套地图或角色素材。
- 16×16 source tile；角色、碰撞脚底、Y-depth、镜头和所有缩放保持整数像素合同。
- 替换测试 tileset、代码圆点、代码树和测试建筑；加入可用的行走/动作帧、树木命中效果、水面动画和克制的环境装饰。
- 正式主视图采用全屏游戏世界与最小 HUD，不继续显示大面积 LOCAL 终端框架。Debug controls 仅在显式 debug mode 出现。
- 视觉方向是安静、可长期扩展的田野与小镇，不使用通用紫色渐变、科幻终端或混杂素材包。

## Acceptance Criteria

- [x] 所有 TMJ 通过集中 decoder，固定 6 个 Tile Layer 与 5 个 Object Layer 完整存在。
- [x] 新游戏在农场小屋附近出生，正式角色可通过键盘与指针 Debug fallback 移动。
- [ ] 地面、水面、墙体和建筑碰撞正确，玩家不能穿越 Collision。
- [ ] Farm 东侧出口进入 Town，Town 西侧出口返回 Farm，短淡入淡出无黑屏或重复触发。
- [x] 玩家可以砍一棵由 `ResourceSpawns` 创建的树，命中时序只结算一次，木材进入 Hotbar。
- [ ] 切换地图并返回后，被砍树木仍保持耗尽；刷新继续后状态仍一致。
- [ ] 玩家可以进入种子店并通过 E 与唯一店主显示一句 Vue Dialogue。
- [x] Visual Pass 后正式世界是默认主视图，Debug Shell 只能显式开启。
- [x] GameSession/domain 不依赖 Phaser、Tiled、Vue、Keycloak 或 IndexedDB；Keycloak 不成为未来单机产品硬依赖。
- [x] 只采用 manifest 已登记的统一素材，无图片二进制进入 Git，无新数据库 migration 或生产部署。
- [x] 最小 typecheck 与 client build 通过；玩法、切图、碰撞、动画和视觉由实际浏览器人工验收。

## Remaining manual acceptance

- 实际键盘完成 Farm ↔ Town、户外 ↔ 小屋、Town ↔ 种子店往返，并确认淡入淡出与 Collision 体感。
- 在种子店靠近店主按 E，确认 Vue Dialogue；再切图/刷新确认实体状态。
- 窄屏与 200% zoom 需要人工浏览器复核；当前浏览器扩展的 viewport override 未实际改变窗口尺寸，因此不写成通过。
- 不同 Keycloak subject 的存档隔离继续保留为单独人工证据。

## Out of Scope

- 昼夜、睡觉、Day+1、金币、购买/出售和作物按天成长。
- NPC 日程、多 NPC、关系、任务、剧情、书屋、异闻和《聊斋》。
- 钓鱼、矿洞玩法、战斗、枪械、怪物、科技树、NPC 招募和多人。
- 大型连续地图、TilemapGPULayer、流式 chunk、天气或复杂光照。
