# World Foundation map authoring

`farm.tmj`、`town.tmj`、`cottage.tmj` 与 `seed-shop.tmj` 是 Tiled 1.12.2 手工维护的正式地图。运行时和构建脚本不得生成或覆盖这些文件；`npm run generate:foundation-map-fixtures` 只会在仓库根目录的 ignored `artifacts/` 下生成一次性样例。

Tiled 保存后运行 `npm run format:tiled-maps`，只压缩 Tile Layer 的大型 `data` 数组以便 Git review，不生成地图或改变任何 GID、对象、属性与坐标。

## Editing contract

- 固定 Tile Layers：`Ground`、`GroundDetail`、`Water`、`Buildings`、`AbovePlayer`、`Collision`。
- 固定 Object Layers：`SpawnPoints`、`Exits`、`Interactions`、`ResourceSpawns`、`NpcSpawns`。
- 行为只由 object `type` 与 properties 决定，object `name` 仅供编辑器阅读。
- ID 是存档身份，坐标是地图布局。可以移动对象、重画 tile 或修改显示名，不能因移动而更换下列 ID。
- tileset metadata 必须继续内嵌在 TMJ 中；运行时不接受 external TSJ `source`。
- Farm 当前正式尺寸为 64×48，使用 VectoRaith v1.08 Original/16×16 的 compact production tilesets；Town、Cottage 与 Seed Shop 保持既有尺寸和占位功能。
- Farm v1 大构图和 Gate C 密度已由 `docs/checkpoints/farm-showcase-v1/` 冻结；只有实际游玩发现的明确碰撞、路径、树脚或院落问题允许小修。

## Frozen IDs

### Farm

- Spawns：`home-yard`、`east-gate`、`cottage-door`
- Exits：`farm-east-exit`、`farm-cottage-entry`
- Interactions：`farm-cottage-door`、`farm-plot-001` 至 `farm-plot-008`
- Resources：`farm-tree-001` 至 `farm-tree-008`、`farm-rock-001`

### Town

- Spawns：`west-gate`、`seed-shop-door`
- Exits：`town-west-exit`、`town-seed-shop-entry`
- Interactions：`town-seed-shop-door`

### Cottage

- Region-scoped spawn：`entry`
- Exit：`cottage-exit`

### Seed Shop

- Region-scoped spawn：`entry`
- Exit：`seed-shop-exit`
- Entity：`seed-shop-keeper`
- NPC：`seed-keeper`
- Dialogue：`seed-keeper-welcome`

新增持久对象时先登记新 ID；删除或更名已登记 ID 必须单独评审存档迁移影响。
