# 地表采矿与镰刀 v1：技术设计

## 1. 边界与依赖

本子任务交付基础镐、基础镰刀、石料、植物纤维、七个既有 stone resource 的采集，以及三张地表地图固定 weed resource 的清除与有限日结补充。它完成后，父任务 `09-04-town-community-ledger-v1` 可把石料作为山路修缮的真实投入物；植物纤维本阶段仅作为低价值地表资源，不提前改父任务需求。

不进入矿洞，不创建第二套工具输入，不让 client 计算命中/掉落，也不为旧开发存档保留迁移链。干草、筒仓、动物、战斗和镰刀收获作物不进入本版本。

## 2. 现有调用链

```text
Hotbar selection
  -> WorldScene click / facing action
  -> ActionTimeline impact
  -> use-item-on-target(itemId, targetId)
  -> GameSession target-kind routing + captured Facing
  -> MiningSystem / WeedCuttingSystem domain mutation
  -> current save + snapshot
  -> RockEntity projection / AudioDirector cue
```

采矿继续沿用已实现链路。镰刀复用同一个 `use-item-on-target` 协议：点击先更新 Facing，C/触摸动作键使用当前 Facing，impact 只派发一次；`WeedCuttingSystem` 从 catalog 与 state 决定前方扇区命中，client 不传命中列表。

## 3. Domain signatures

```typescript
const ITEM_ID = {
  // existing IDs
  pickaxe: "pickaxe",
  scythe: "scythe",
  stone: "stone",
  fiber: "fiber",
} as const;

type MiningResult =
  | "mined"
  | "missing-target"
  | "depleted"
  | "too-far"
  | "wrong-tool"
  | "inventory-full"
  | "insufficient-stamina";

class MiningSystem {
  use(state: GameState, targetId: string, itemId: ItemId | ""): MiningResult;
  settleDay(state: GameState): number;
}

type WeedCuttingResult =
  | { code: "cut"; cutCount: number; fiberCount: number }
  | { code: "missing-target" | "depleted" | "too-far" | "wrong-tool" | "inventory-full"; cutCount: 0; fiberCount: 0 };

class WeedCuttingSystem {
  use(state: GameState, targetId: string, itemId: ItemId | "", facing: Facing): WeedCuttingResult;
  settleDay(state: GameState): number;
}
```

- 所有新增方法按仓库约定添加方法级注释，说明用途、参数、返回结果和原子性约束。
- `GameSession.useItemOnTarget()` 继续先解析 catalog resource kind：tree 交给 `GatheringSystem`，stone 交给 `MiningSystem`，weed 交给 `WeedCuttingSystem`，forage 保持原路径。
- `MiningSystem` 与 `WeedCuttingSystem` 复用 `InventorySystem`、`WorldCatalog`、Facing helper 和既有 `stableHash()`；不复制背包、距离或 hash 实现。

## 4. Current state contract

镰刀扩展把 current `GameState` / `StoredGame` 从尚未提交的 v11 提升为 v12，并执行项目级开发存档策略：只创建和解码完整 v12，v1–v11 全部 unsupported，不保留旧存档进度。

```typescript
interface ResourceState {
  readonly id: string;
  readonly kind: "tree" | "stone" | "weed";
  phase: "standing" | "stump" | "cleared";
  regrowOnDay: number | null;
}

interface GameState {
  lastSurfaceStoneRefreshDay: number;
  lastSurfaceWeedRefreshDay: number;
}
```

- tree 继续允许 standing/stump/cleared 与现有 `regrowOnDay`。
- stone 与 weed 只允许 standing/cleared 且 `regrowOnDay=null`；日结确定性选择恢复点，不为单个点保存计时器。
- 两个 refresh marker 分别保存最近执行 stone/weed 补充的 positive day，使同一日重复调用严格幂等；不保存每个点的随机数或未来恢复日。
- `cloneGameState()` 和 decoder 必须完整复制/验证 stone/weed phase；catalog reconcile 仍拒绝未知 resource key 和 kind 漂移。
- 新游戏 slots 0..4 固定为 hoe、watering-can、axe、pickaxe、scythe。

## 5. Atomic mining transition

`MiningSystem.use()` 按以下顺序处理：

1. 从 `WorldCatalog.resource(targetId)` 和 `state.resources[targetId]` 校验 stable identity、kind、region 与 standing。
2. 校验玩家距离、选中物品及背包确实拥有 pickaxe。
3. `InventorySystem.canAdd(stone, 1)`，再校验/扣除 2 体力。
4. 将 stone phase 设为 cleared，并向 inventory 增加 1 stone。
5. GameSession 只在 `mined` 时 publish 并排队一次 critical save。

任何步骤失败都不得提前改变体力、资源或背包。`canAdd()` 后的 `add()` 若违反已验证前提，沿用现有 GatheringSystem 的 fail-fast 约束，而不是静默部分成功。

## 6. Foothills daily refill

日结把 `state.day` 增加到新日后调用 `MiningSystem.settleDay(state)`：

1. 若 `lastSurfaceStoneRefreshDay===state.day`，直接返回 0；未来 marker 视为状态错误。
2. 从 catalog 选择 `regionId="foothills" && kind="stone"` 的 cleared 候选。
3. 使用 `stableHash(worldSeed, state.day, "surface-stone:" + entityId)` 排序，hash 相同按 ASCII entityId。
4. 取前两个设为 standing；不足两个则全部恢复，并写 `lastSurfaceStoneRefreshDay=state.day`。
5. Farm/Lakeshore 以及已 standing 的点不参与。

日结候选仍遵守现有“保存成功后才发布新日”的事务边界；保存失败重试同一 candidate，不重新选择石块。

## 7. Weed cutting transition

三张地图分别新增 Farm 6、Foothills 5、Lakeshore 4 个 `resourceKind=weed` 稳定点。每次 `use()`：

1. 校验 target 是当前区域、standing、42px 内的 weed，选中且持有 scythe，并要求合法 Facing。
2. 从当前区域选出 42px 内、Facing 前方 90° 扇区的 standing weed；按距离再按 ASCII entity ID 排序，最多取三个，target 必须属于候选。
3. 对每个命中 ID 用 `stableHash(worldSeed, day, "weed-fiber:" + entityId) % 2` 固定判定 50% fiber。
4. 在 mutation 前检查背包能完整接收总 fiber；失败时全部状态不变。零掉落仍可清除 weed。
5. 一次性把命中 phase 设为 cleared，增加 fiber，并只由 GameSession 保存一次。

镰刀不调用 `StaminaSystem`。这保留《星露谷物语》镰刀无体力消耗的工具身份，同时避免把未来的武器、作物收割和干草系统塞入当前规则。

## 8. Weed daily refill

- 日结在 day 增加后、同一保存 candidate 内调用 `WeedCuttingSystem.settleDay()`。
- Farm、Foothills、Lakeshore 对 cleared 候选分别按 `surface-weed:<entityId>` hash 排序并最多恢复 1、2、1 个；standing 不占名额。
- Farm 候选所在 tile 已存在 `farmTiles` 时跳过，避免杂草覆盖已耕种土壤。
- `lastSurfaceWeedRefreshDay` 保证同日幂等，未来 marker 视为状态错误。

## 9. Client presentation

- `RockEntity.project(resource)` 控制 standing/cleared 可见性；成功 impact 播放一次碎屑/震动后投影 cleared，错误工具只运行轻敲。
- `WorldScene` 增加与 axe 对称的 pickaxe facing/click 路径，目标只从 active rock views 中选择，并在 ActionTimeline impact 派发一次既有 command。
- `FarmingActionPresenter` 只增加 `pickaxe` pose、grip 与已登记 GARDENS `(6,1)` 图标 frame，不重命名或重构整个动作系统。
- `audioCueForCommandResult()` 仅将 `use-item-on-target + mined` 映射到已经发布的 stone cue；失败无成功声音。
- 石料图标优先复用既有正式图集，若没有清晰 frame，则添加到 `item-pixel-art.ts` 的源码像素配方；不新增静态 PNG。
- `WeedEntity` 使用源码生成的 16×16 原创杂草图形，投影 standing/cleared；成功时播放短弧线和叶片碎屑，teardown 清理全部临时对象。
- `FarmingActionPresenter` 增加 scythe pose/grip；scythe 与 fiber 图标使用已登记清晰帧或源码像素配方，不新增媒体对象。
- 成功 `cut` 复用现有植被/收获 cue；错误工具只提示，不播放成功 cue。

## 10. Validation and error matrix

| 条件 | 结果 |
|---|---|
| pickaxe + nearby standing stone + capacity + stamina | 1 stone、-2 stamina、target cleared、一次保存 |
| 背包满或体力不足 | state byte-equivalent，明确错误反馈 |
| axe/hoe/empty hand + stone | 无规则 mutation；只有轻敲或 quiet feedback |
| stone 已 cleared、未知 ID、跨区域或 >42px | 无 mutation |
| Day settlement save 失败 | 旧日与旧 stone 状态保持；重试同一新日候选 |
| current v12 非法 stone/weed phase、kind 或 key | decode/reconcile 失败 |
| scythe + facing + 1–3 nearby standing weeds | 0 stamina、全部 cleared、固定 0–3 fiber、一次保存 |
| weed fiber 总量无法放入背包 | 所有命中 weed 与背包保持不变 |
| wrong tool / behind player / >42px / depleted weed | 无 mutation、无成功 cue |
| weed daily settlement | 三区域最多 1/2/1，跳过耕种格，同日重复为 0 |
| v11 或更旧 save | 明确 unsupported；不迁移、不备份、不覆盖 |

## 11. Affected files

主要生产范围：

- `domain/items/definitions.ts`
- `domain/mining/MiningSystem.ts`（新增）
- `domain/gathering/WeedCuttingSystem.ts`（新增）
- `domain/world/regions.ts`
- `domain/state/game-state.ts`
- `domain/persistence/SaveRepository.ts`
- `domain/session/GameSession.ts`、`domain/session/commands.ts`
- `client/src/game/entities/WorldEntities.ts`
- `client/src/game/scenes/WorldScene.ts`
- `client/src/game/presentation/FarmingActionPresenter.ts`
- `client/src/game/assets/item-icons.ts`、`item-pixel-art.ts`
- `client/src/audio/audio-events.ts`
- `client/src/ui/shop/ShopPanel.vue`、`domain/farming/crops.ts`（stone 低价出售）
- `public/map/farm.tmj`、`foothills.tmj`、`lakeshore.tmj`（固定 weed 候选）

现有 TMJ 的七个 stone ID 与坐标不变；只在三个既有 `ResourceSpawns` 增加 weed 点。不修改 server、Prisma、SQL migration、Docker 或身份设施。

## 12. Verification and rollback

- 纯 domain 检查覆盖采矿/除草成功与失败原子性、formal resource 数量、50% 固定掉落、Facing/三目标上限、两个日结系统与保存失败重试。
- 最小自动门禁：相关 contract test、`typecheck`、`build:client`。
- 真人从清理站点数据后的新游戏验证开局镐/镰刀、三张地图采石/除草、背包满、体力与零消耗、睡眠刷新、键鼠/触摸/200% zoom。
- 回滚镰刀扩展只移除 scythe/fiber/weed/WeedCuttingSystem 与对应表现，不触碰已经通过检查的 pickaxe/stone/MiningSystem；开发存档不承诺向前或向后兼容。
