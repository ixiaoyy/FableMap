# 技术设计

## Runtime data flow

```text
TMJ text
  -> client TiledRegionDecoder (unknown validation)
  -> plain WorldCatalog / RegionDefinition
       -> Phaser RegionRenderer / EntityFactory
       -> GameSession movement + interaction lookup

Phaser/Vue input
  -> typed GameCommand
  -> GameSession
  -> domain state mutation
  -> defensive snapshot
  -> RegionRenderer / Hotbar / Dialogue projection
  -> SaveRepository -> IndexedDB
```

- Tiled JSON 只在 client boundary 解析一次。renderer、transition、EntityFactory 和 interaction 不得各自读取 raw properties。
- WorldCatalog 是普通 TypeScript value，不包含 Phaser object、DOM、IndexedDB 或 Keycloak 对象。
- GameSession 继续拥有唯一 mutable GameState。Phaser object 只保存 ephemeral view state 与 animation state。

## Runtime portability boundary

```text
GameSession
  -> SaveRepository
       -> IndexedDB adapter (current Web Runtime)
       -> FileSystem adapter (future Tauri 2 Desktop Runtime)
```

- 当前只实现 IndexedDB adapter；不新增 Tauri package、Rust crate、Tauri command、filesystem path 或 Steam API。
- Phaser/Vue/Tiled 表现层和 SaveRepository adapter 都不得改变 GameSession、GameState 或 save schema 来识别运行平台。
- Unity/Godot 不进入当前技术选型；美术验证失败时先讨论素材定制，再单独评审引擎路线。

## Region contract

```typescript
interface RegionDefinition {
  id: string;
  mapKey: string;
  widthPixels: number;
  heightPixels: number;
  collision: CollisionGrid;
  spawns: Record<string, Point>;
  exits: ExitDefinition[];
  resources: ResourceSpawnDefinition[];
  interactions: InteractionDefinition[];
  npcs: NpcSpawnDefinition[];
}
```

- `RegionCatalog` 拒绝重复 region、spawn 或 entity ID，并在启动时验证每个 exit 的目标 region/spawn。
- Farm/Town 第一版同时 preload；区域切换只销毁当前 TilemapLayer/entity views，不销毁 GameSession。
- Transition 具有 `idle/fading-out/loading/fading-in` 状态，重复 overlap 在非 idle 阶段直接忽略。
- Collision layer 转换为纯 grid；movement reducer 以玩家脚底 hitbox 逐轴解析，保持滑墙而不是让 Phaser 私自改写最终位置。

## Map authoring ownership

- `public/map/*.tmj` 是正式地图的唯一来源，由 Tiled 1.12.2 手工编辑并直接提交；运行时与构建流程不生成或重写它们。
- `scripts/generate-foundation-maps.mjs` 只输出 ignored fixture，供管线诊断或重建最小样例，不得写入 `public/map`。
- ID 表达持久身份，坐标表达当前布局。Tiled 中允许移动对象、重画 tile 与修改编辑器显示名，不允许因移动而更换已登记 ID。
- Farm 首轮构图只围绕小屋、农田、水塘、东向道路与自然边界；Town 只围绕西门、种子店、主街/小广场与未来东向延伸，不用均匀撒满装饰填空。
- 正式地图是否合格以真人连续行走、碰撞、切图、交互和状态恢复为准，不以 decoder 通过替代视觉与操作验收。
- 世界相机固定 2× 整数 zoom，使 16px tile 在 640×480 画布中按 32px 呈现；不再用 1× 一次展示完整 40×30 地图。

## Farm showcase composition gate

- Farm 扩为 64×48，但第一轮只经营出生点周围约一个相机视野的核心三角：左上偏中的小屋、左侧不规则水塘、中部小农田与向右延伸的道路。
- 玩家出生点位于小屋门前下方 3–5 tile；2× 相机第一眼同时交代“家在哪里、能做什么、还能去哪”。
- 整体密度目标为 60% 安静区域、30% 结构场景、10% 后续细节；Gate A 不均匀撒花、不铺满资源，也不为填空新增 gameplay entity。
- 现有 `entityId`、`exitId`、`spawnId` 与 Town 目标合同保持不变；只移动坐标。旧存档坐标所在的原 40×30 范围保持大面积可通行，避免视觉重排强制清空存档。
- 当前登记素材只覆盖普通草地、普通树、住宅和基础水面。Gate A 只用这些已登记 CC0 素材形成构图；樱花、竹林、自然岸线与荷叶属于后续素材采用门槛，不用来源不明或风格冲突素材假装完成。

## Gate B structural pass

- Gate A v2 的主体坐标和稳定对象坐标冻结；Gate B 只能改已有 Tile Layer 的边缘、过渡、静态块面与对应 Collision。
- 水塘保持约 9×7 footprint，使用当前 floor atlas 的水面边/角/中心 tile 形成闭合岸线，不改变玩家可通行范围。
- 小院在门前保留至少 5×5 的生活缓冲；2 tile 小路与 3 tile 主路使用同一暖土 terrain 的边缘/中心 tile，保持 Gate A 曲线中心线。
- 农田保持 7×5，不增加互动 plot；只用 soil 边界和现有 8 个 plot 投影区分道路与田土。
- 林缘只用现有 4+4 资源树分组、forest-floor 块面及同一 village atlas 中的静态灌木/岩石结构；不得把静态装饰伪装成可采资源。
- Gate B 输出整图与正式 2× 出生镜头后停止，用户确认前不进入细节轮次。

## Save v2

```typescript
interface PlayerStateV2 {
  regionId: string;
  x: number;
  y: number;
}

interface ResourceStateV2 {
  id: string;
  kind: "tree" | "stone";
  available: boolean;
}
```

- 地图拥有 entity 静态坐标；save 不重复保存 spawn x/y。
- v1 decoder 独立保留，显式迁移 `tree-01 -> farm_tree_001`、`farm-01 -> farm_plot_001`、玩家 region=`farm`。
- v2 decoder 不接受 future version；迁移成功后下一次关键保存写回 v2。
- ownerKey/slot/IndexedDB store 不变化，因此账号存档仍落在原槽位。

## Entity and interaction

```text
ResourceSpawn object
  -> EntityFactory
  -> TreeEntity view
  -> interaction target
  -> ActionTimeline
       windup
       impact -> dispatch gather exactly once
       recovery
  -> snapshot update
  -> depleted visual
```

- EntityFactory 用 closed switch 处理 resource/interaction/npc 类型；未知类型在 region decode 时失败，不生成 silent placeholder。
- `ActionTimeline` 使用 Phaser scene clock驱动 ephemeral frame/tween，但 impact callback 只发送 typed GameCommand。
- GameSession 返回结果后才播放成功反馈；失败结果进入 recovery，不伪造掉落。
- RockEntity 本轮只验证 factory/collision/view，不新增采矿物品或经济。

## UI modes and identity

- `GameView`：Commit C 后默认，全屏 canvas + 最小 Hotbar/Dialogue。
- `DebugShell`：显式 `?debug=1` 或开发开关，包含 LOCAL 状态、调试方向盘和诊断反馈。
- Keycloak adapter 只产生 opaque ownerKey；WorldCatalog、GameSession、SaveRepository contract 不知道 Keycloak。
- 当前登录启动流保持用于验收，但不在本任务宣称未来离线单机一定强制登录。

## Media

- TMJ 内嵌 tileset metadata，Phaser 分别 preload 已登记 texture key；不使用 Phaser 不支持的 external tileset source。
- 运行时 URL 只来自集中 media catalog/manifest object key，不在 Scene 散落 CDN 地址。
- Git 只跟踪 TMJ 与 frame/tileset 文本配置，不跟踪 PNG/WebP。
- Ninja Adventure 只保留占位身份，不继续正式视觉精修。VectoRaith v1.08 的 Farm visual prototype 使用独立 ignored 候选目录，不改正式 manifest 或默认运行时。
- 候选 TMJ 从当前 Farm 派生，完整保留对象层、Collision、stable ID 与 target；只重映射 Tile Layer GID 和表现层 frame。候选通过 decoder 后再渲染整图与 2× 出生镜头。
- 官方许可未明确允许商业 Web/CDN 交付前，不把原始或裁切后的 VectoRaith PNG 放入公开对象存储。
- 正式 client 默认加载 compact Farm TMJ；Tilemap binding、player frame 与 EntityFactory media profile 由 `client/src/game/assets/visual-profile.ts` 统一拥有。
- Farm 生产 profile 只引用 manifest/CDN 最小派生图集；Town、Cottage 与 Seed Shop 继续作为占位区域，不进行本轮视觉迁移。
- Gate B 使用原始 16×16 PNG；Phaser 的 2× camera、NEAREST 与 roundPixels 负责放大。禁止加载包内 32×32/48×48 文件再当作 16px tileset。
- Gate C static detail 继续写入现有 GroundDetail/Buildings/AbovePlayer，不增加 layer kind、object kind 或 Collision；状态化作物只通过可选 `EntityMediaProfile.farmCrop` 投影 existing FarmTile phase。
- 视觉地标复用既有 static tree placement/collision，只切换为同 atlas 粉色树 frame；不创建新 entity ID 或交互。

## Failure behavior

- 缺 layer/property、重复 ID、无效 exit target 或素材加载失败：进入可见错误页，不启动空白 canvas。
- region transition 失败：保留原 region 与玩家位置，解除 transition lock，显示固定错误反馈。
- v1 migration 失败：保留原 IndexedDB record，不覆盖，向用户显示存档不兼容。

## Rollback

- Commit A/B/C 均独立提交；任一阶段可回滚到前一提交。
- `phaser-colyseus-checkpoint-2026-08-24` 与单人主线提交保持不变。
- 不提供双 runtime 开关；Debug Shell 只诊断当前单人 runtime。
