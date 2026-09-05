# World Foundation map authoring

`farm.tmj`、`town.tmj`、`cottage.tmj`、`seed-shop.tmj`、`blacksmith.tmj`、五张 `town-house*.tmj`、`foothills.tmj` 与 `lakeshore.tmj` 是 Tiled 1.12.2 手工维护的正式地图。运行时和构建脚本不得生成或覆盖这些文件；`npm run generate:foundation-map-fixtures` 只会在仓库根目录的 ignored `artifacts/` 下生成一次性样例。

Tiled 保存后运行 `npm run format:tiled-maps`，只压缩 Tile Layer 的大型 `data` 数组以便 Git review，不生成地图或改变任何 GID、对象、属性与坐标。

## Editing contract

- 固定 Tile Layers：`Ground`、`GroundDetail`、`Water`、`Buildings`、`AbovePlayer`、`Collision`。
- 固定 Object Layers：`SpawnPoints`、`Exits`、`Interactions`、`ResourceSpawns`、`NpcSpawns`。
- 行为只由 object `type` 与 properties 决定，object `name` 仅供编辑器阅读。
- ID 是存档身份，坐标是地图布局。可以移动对象、重画 tile 或修改显示名，不能因移动而更换下列 ID。
- tileset metadata 必须继续内嵌在 TMJ 中；运行时不接受 external TSJ `source`。
- Farm 当前正式尺寸为 64×48；Town 保持 40×30；Foothills 与 Lakeshore 为 48×36。四张户外图直接使用 VectoRaith v1.08 Original/16×16 完整 tilesets 与原始 GID；Cottage 使用源码定义的 `cottage-woodwork`，Seed Shop 与 Blacksmith 使用共享木作的 `shop-interiors`，Town House 保留已登记室内占位图集。
- Farm v1 大构图和 Gate C 密度已由 `docs/checkpoints/farm-showcase-v1/` 冻结；只有实际游玩发现的明确碰撞、路径、树脚或院落问题允许小修。

## Frozen IDs

### Farm

- Spawns：`home-yard`、`east-gate`、`cottage-door`
- Exits：`farm-east-exit`、`farm-cottage-entry`
- Interactions：`farm-cottage-door`、`farm-plot-001` 至 `farm-plot-008`
- Resources：`farm-tree-001` 至 `farm-tree-008`、`farm-rock-001`

### Town

- Spawns：`west-gate`、`seed-shop-door`、`north-road`、`south-road`、`blacksmith-door` 与五个 `town-house*-door`
- Exits：`town-west-exit`、`town-seed-shop-entry`、`town-north-exit`、`town-south-exit`、`town-blacksmith-entry` 与五个 `town-house*-entry`
- Interactions：`town-seed-shop-door`、`town-blacksmith-door`、五个住宅 door 和 `town-notice-board`

### Cottage

- Region-scoped spawn：`entry`
- Exit：`cottage-exit`
- Interaction：`cottage-bed`
- 新增只供客户端固定镜头读取的 spawn：`cottage-room-view`；三处 `pet-cottage-*` 点位保留。
- 床、门槛、家具与 Collision 同步维护；旧存档落在新障碍时由既有 GameState reconcile 回到 `entry`。
- `cottage-woodwork.runtime.png` 是供 Tiled 显示的 ignored 缓存，来源为 `client/src/game/presentation/cottage-art.ts` 的 `paintCottageAtlas()`；浏览器直接注册同一配方生成的 256×128 Canvas texture，不请求该 PNG。布局仍只由本 TMJ 拥有。

### Seed Shop

- Region-scoped spawn：`entry`
- Exit：`seed-shop-exit`
- Entity：`seed-shop-keeper`
- NPC：`seed-keeper`
- Dialogue：`seed-keeper-welcome`
- Camera spawn：`seed-shop-room-view`；home/counter/shelves 保留 ID，柜台前须在 42px NPC 交谈范围内。
- Town 返回点 `seed-shop-door` 当前为 `(496,208)`，留出门入口的边界与脚部净空；不要放回入口下边界 `(496,192)`。

### Refined shop interiors

- Blacksmith camera spawn：`blacksmith-room-view`；forge/tool-rack 的查看 bounds 必须匹配陈设，架前/炉前留出 48px 内可达站位。
- 两图使用 `shop-interiors` 内嵌 tileset，GID 范围 5001–5256。Collision 层的非零 GID 也必须属于该范围。
- `shop-interiors.runtime.png` 是 `shop-interiors-art.ts` 绘制配方导出的 ignored Tiled 缓存；生产由源码生成 256×256 Canvas texture，不请求该 PNG。
- 共享固定镜头仍由各自 TMJ 中的 camera spawn 拥有，视口保持 2×，门槛与主要交互留在 HUD 之外。

### Town expansion

- Blacksmith：spawn `entry`；exit `blacksmith-exit`；inspect `blacksmith-forge`、`blacksmith-tool-rack`
- Town Houses：`town-house-west`、`town-house-north`、`town-house`、`town-house-southwest`、`town-house-east` 各有 spawn `entry`、精确 return exit、两处公共区 inspect、一处 `*-private-room` inspect 和一名固定住户；住户依次为墨子、浩南、阿澜、昊美丽、祥子，私人内屋门 Collision 固定阻挡
- NPC 日程：所有 `npc-*` SpawnPoints 只拥有四段日程坐标；`domain/world/npc-schedules.ts` 只引用 region/spawn IDs。不得把 schedule 像素坐标写入代码、NpcSpawns 或 save。
- Foothills：spawn `town-gate`；exit `foothills-town-exit`；resources `foothills-tree-001` 至 `018`、`foothills-rock-001` 至 `004`
- Lakeshore：spawn `town-gate`；exit `lakeshore-town-exit`；resources `lakeshore-tree-001` 至 `012`、`lakeshore-rock-001` 至 `002`

新增持久对象时先登记新 ID；删除或更名已登记 ID 必须单独评审存档迁移影响。
