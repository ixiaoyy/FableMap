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

## Failure behavior

- 缺 layer/property、重复 ID、无效 exit target 或素材加载失败：进入可见错误页，不启动空白 canvas。
- region transition 失败：保留原 region 与玩家位置，解除 transition lock，显示固定错误反馈。
- v1 migration 失败：保留原 IndexedDB record，不覆盖，向用户显示存档不兼容。

## Rollback

- Commit A/B/C 均独立提交；任一阶段可回滚到前一提交。
- `phaser-colyseus-checkpoint-2026-08-24` 与单人主线提交保持不变。
- 不提供双 runtime 开关；Debug Shell 只诊断当前单人 runtime。
