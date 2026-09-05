# Town 世界元素扩展 v1：技术设计

## Architecture

```text
Town TMJ exits
  ├─ blacksmith.tmj
  ├─ town-house-west.tmj
  ├─ town-house-north.tmj
  ├─ town-house.tmj
  ├─ town-house-southwest.tmj
  ├─ town-house-east.tmj
  ├─ foothills.tmj
  └─ lakeshore.tmj
          ↓
decodeTiledRegion → WorldCatalog → existing transition-region command
          ↓
WorldScene renders VectoRaith outdoor or Ninja interior profile
```

新增区域继续使用固定六个 Tile Layer 与五个 Object Layer。Town 只增加四组双向入口所需的 spawn/exit 和极少量入口碰撞调整；既有 stable ID、NPC 与建筑 tile 不重命名。

## Region design

- `blacksmith`：复用 interior tileset，单一房间、炉子、工作台、工具架和返回出口。没有商店或升级状态。
- 五栋 Town House：复用 mixed interior tileset，每栋由可行走公共起居区、两处生活化 inspect、可见但阻挡的私人内屋和精确返回出口组成；任何床铺都不具备睡觉能力，避免复制 Cottage 日结入口。
- `foothills`：VectoRaith 户外 profile，48×36；南侧连接 Town，主路向北抵达矿洞口，侧路经过小水池与可砍树林。
- `lakeshore`：VectoRaith 户外 profile，48×36；北侧连接 Town，主路沿湖岸抵达木码头，水面与岸线通过 Collision 阻挡。

## Residential availability

```text
Town homes
  ├─ west orange door      → town-house-west.tmj
  ├─ north brown door      → town-house-north.tmj
  ├─ center orange door    → town-house.tmj
  ├─ southwest brown door  → town-house-southwest.tmj
  └─ east orange door      → town-house-east.tmj

Each home: exterior entry → public living room → blocked private-room door
```

- 四张新增住宅 TMJ 与现有住宅共同复用 mixed interior tileset profile，不复制 decoder、切图命令或 UI。
- 每栋开放住宅使用独立 region ID、return exit、Town spawn 与 inspect entity ID，保证返回精确门口。
- 每栋私人内屋使用静态 Collision + `inspect` 门口；内屋访问不进入任何持久状态。
- `blacksmith-door` spawn/exit 从西南小棕屋迁移到红色工坊侧院，stable ID 保持不变，只调整坐标。

## Inspect contract

`InteractionDefinition` 扩展为判别联合：

```typescript
type InteractionDefinition =
  | ExistingInteraction
  | {
      readonly kind: "inspect";
      readonly dialogueId: string;
      readonly entityId: string;
      readonly regionId: string;
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
    };
```

Decoder 只在 `interactionKind=inspect` 时要求合法 `dialogueId`。WorldScene 为 active region 创建透明命中区，hover 显示“查看”，点击后再次检查当前 region、距离、modal/action/transition 锁，再用现有 `getDialogueDefinition` 和 `setDialogue` 打开 DialoguePanel。

## Persistence and compatibility

- 新 region ID 会自然写入现有 `player.regionId`；StoredGame 结构不变。
- WorldCatalog 在加载时验证所有新旧出口目标与 spawn；旧存档继续落在原 region，不需要迁移。
- 新山麓树木进入现有 `resources` 状态映射，首次加载时由 reconcile 补齐，沿用现有 tree availability 合同。
- Inspect 没有状态，不写入 save。

## Media and maps

- `foothills`、`lakeshore` 与 Town 使用现有 VectoRaith 三张完整 tileset；工坊与五栋民宅使用现有 Ninja interior + VectoRaith Props mixed profile。
- 不新增、裁剪、重排或重编码图片。
- 正式 TMJ 仍是运行时文本资产；`format-tiled-maps.mjs` 只登记新增文件并进行机械格式化。

## Risk and rollback

- 当前 WorldScene/WorldEntities 含未提交的 Tool Interaction 与 NPC Hit Reaction 改动；所有修改必须局部叠加，不整文件恢复。
- Town 的入口碰撞改动只允许落在新增门/边界通道；若路线异常，精确恢复对应 tile 和 object，不重画整张 Town。
- 删除新区域即可回滚内容；没有数据库或 save migration 需要逆转。
