# Mirror Island Phaser Single-player

## Ownership

- 唯一应用位于 `apps/mirror-island/`；公开 `/` 只服务一份 Phaser/Vue 单人 client。
- 当前技术栈固定为 Phaser 4 + Vue 3 + TypeScript + Vite + Tiled，不为美术验证迁移 Unity 或 Godot。
- 未来桌面版与 Steam 目标采用 Tauri 2，但当前不引入 Tauri/Rust/Steam 依赖或接口；Web Runtime 与未来 Desktop Runtime 只通过 adapter 边界解耦。
- `domain/` 拥有 GameSession、GameState、命令、物品、配方、Inventory/Gathering/Crafting/Farming 和 SaveRepository 合同。
- `client/` 负责 Phaser 输入/表现、Vue UI 和 IndexedDB adapter；`server/` 只保留论坛 SSO、health 与未来非实时 API。
- RPGJS 和 Colyseus 多人切片已分别通过 checkpoint tag 封存，单人分支不保留双运行时。

## Runtime contract

```text
Phaser/Vue -> typed GameCommand -> GameSession -> pure domain mutation
           -> immutable snapshot -> Phaser/Vue
           -> SaveRepository -> IndexedDB
```

- 实时玩法不调用 WebSocket、matchmaking、服务端 tick、Prisma 或 PostgreSQL。
- GameSession 是唯一 mutable aggregate；Phaser/Vue 只能发送命令和订阅只读 snapshot。
- Inventory/Gathering/Crafting/Farming 不导入 Phaser、Vue、IndexedDB、Keycloak、Prisma 或 Node API。
- Item/Recipe/phase 的 decoder 和 reducer 只有一个 owner，不在 UI 重复判断状态转换。

## Local persistence

- SaveRepository 暴露 `has/load/save/delete`，domain 不知道 IndexedDB。
- IndexedDB adapter 使用固定 DB `mirror-island-local`、store `game-saves`；当前 save schema v3 包含 region、day、gold 与按天作物状态，旧 v1/v2 只通过显式幂等 decoder 迁移，不使用 localStorage 保存玩法。
- save value 包含 schema version、updatedAt、玩家、背包、资源和农田；读取从 unknown 完整验证，未来/损坏版本明确失败。
- token、ticket、密码、Keycloak 对象、数据库 URL 和 secret 禁止写入 IndexedDB；ownerKey 由身份 adapter 提供。
- 关键玩法事件立即排队保存，移动使用有界 debounce，页面隐藏/退出调用 flush；不得逐帧写盘。
- 持久化拓扑固定为 `GameSession -> SaveRepository -> IndexedDB（当前 Web）/ FileSystem（未来 Tauri）`；当前只实现 IndexedDB，不把 filesystem、Rust command 或桌面路径渗入 domain。

## Scenario: atomic IndexedDB v2 backup before v3 switch

### 1. Scope / Trigger

- Trigger：生产首次把已发布 v2 browser save 写回 v3；必须保留可 forward-fix 的原始 v2，而不改变 SaveRepository port 或 IndexedDB schema。

### 2. Signatures

```typescript
interface IndexedDbGameRecord {
  readonly key: string;
  readonly game: unknown;
}

interface IndexedDbSaveWritePlan {
  readonly main: IndexedDbGameRecord;
  readonly backup: IndexedDbGameRecord | null;
}

function planIndexedDbSave(
  mainKey: string,
  existingMain: IndexedDbGameRecord | undefined,
  existingBackup: IndexedDbGameRecord | undefined,
  validatedGame: StoredGame,
): IndexedDbSaveWritePlan;
```

### 3. Contracts

- main key 仍为 `ownerKey:slotId`；backup key 固定为 `ownerKey:slotId:backup:v2`。
- `load()` 只从 main key 读取并用 `decodeStoredGame` 返回 v3；backup 不成为 slot。
- `save()` 先验证传入 v3，再在一个 readwrite transaction 中同时读取 main/backup；仅当 main raw envelope 为 version 2 且 backup 缺失时，原样 put backup，然后 put v3 main。
- 两个读取 request 必须在 transaction 创建后立即发出；两个 onsuccess 都到达后同步排队 put，不在中间 await 导致 transaction inactive。
- backup 已存在、main 已是 v3或主记录不存在 → 只写 main。
- `delete()` 在一个 transaction 删除 main 和 scoped backup；其他 owner/slot 不受影响。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| 待写 game 不是合法 v3 | transaction 创建前失败，现有 main/backup 不变 |
| main 是 v2、backup 缺失 | 同 transaction 写 exact raw v2 backup + v3 main |
| main 是 v2、backup 已存在 | 保留首次 backup，只写 v3 main |
| 任一 IDB request/put/transaction 失败 | transaction abort/reject，不允许半迁移 |
| 显式 delete | 删除 main + backup，不保留隐藏用户数据 |

### 5. Good/Base/Bad Cases

- Good：v2 continue 解码、catalog reconcile 成功后，首次 critical save 原子留下原始 v2 并切换 v3。
- Base：全新账号与后续 v3 saves 沿用原 main key，不产生 backup。
- Bad：`load()` 先覆盖 main 再进入 GameSession，或先写 v3 后用另一个 transaction 补 backup。

### 6. Tests Required

- 纯 write-plan 合同断言首次 v2 生成 exact backup、已有 backup 不覆盖、v3/new 不备份、delete keys 仅两条 scoped key。
- Life Loop v2→v3 幂等 domain 合同继续通过。
- typecheck、client build；生产必须由全新账号与已有 v2 账号分别人工验收。

### 7. Wrong vs Correct

```typescript
// Wrong: main can be overwritten before recovery evidence exists.
await put(mainKey, migratedV3);
await put(backupKey, rawV2);

// Correct: IndexedDB commits both writes or neither write.
const transaction = database.transaction("game-saves", "readwrite");
store.put({ key: backupKey, game: rawV2 });
store.put({ key: mainKey, game: validatedV3 });
```

## Preserved backend boundary

- Keycloak 26.7.1、keycloak-js 26.2.4、oidc-provider 9.11.1、Prisma 7.9.1、PostgreSQL 17、论坛跨 Compose 网络、CDN 和部署设施继续保留。
- 后端近期只负责登录/论坛 SSO；云存档、成就和排行榜另行规划，不在当前任务创建 API 或数据库结构。
- 现有九表基线不修改。新表/字段/migration 必须先单独评审并获批准。

## Scenario: future Tauri SaveRepository adapter gate

### 1. Scope / Trigger

- 仅当用户单独批准桌面阶段时，才允许为 Tauri 2 增加 FileSystem adapter；当前 Web/Farm 美术任务不得触发。

### 2. Signatures

```typescript
interface SaveRepository {
  has(ownerKey: string, slotId: string): Promise<boolean>;
  load(ownerKey: string, slotId: string): Promise<StoredGame | null>;
  save(ownerKey: string, slotId: string, game: StoredGame): Promise<void>;
  delete(ownerKey: string, slotId: string): Promise<void>;
}
```

### 3. Contracts

- Web 继续注入 `IndexedDbSaveRepository`；未来桌面 shell 只注入另一个 `SaveRepository` implementation。
- 两个 adapter 共用 `StoredGame`、`SAVE_FORMAT_VERSION` 与 `decodeStoredGame`；不得增加 platform 字段、Rust payload 或素材 frame 字段。
- 当前没有 Tauri env key、command signature、filesystem path 或 Steam identifier。

### 4. Validation & Error Matrix

- 空 `ownerKey`/`slotId` → adapter 明确失败，不读写共享默认槽。
- 损坏、未来版本或非法 `updatedAt` → `decodeStoredGame` 失败，原记录不覆盖。
- adapter 打开/事务/文件写入失败 → Promise reject，由应用错误状态处理，不回退到另一存储后端。

### 5. Good/Base/Bad Cases

- Good：未来 Tauri shell 注入 FileSystem adapter，GameSession 与存档格式零改动。
- Base：当前 Web 继续只使用 IndexedDB。
- Bad：在 GameSession 中检测 `window.__TAURI__`，或把桌面文件路径写进 GameState。

### 6. Tests Required

- 真正实现 FileSystem adapter 时，至少验证相同 `StoredGame` round-trip、owner/slot 隔离、损坏记录失败和原子替换；本阶段没有实现，因此不新增测试。

### 7. Wrong vs Correct

```typescript
// Wrong: domain selects one platform-specific backend.
const repository = window.__TAURI__ ? new FileRepository() : new IndexedDbSaveRepository();

// Correct: the runtime shell injects the existing port.
const session = new GameSession(runtimeSaveRepository, ownerKey, worldCatalog);
```

## Stardew Core scope

- 第一批：GameSession、IndexedDB、背包/采集/制作/种田本地化，代码绘制场景可接受。
- 第二批 World Foundation 严格拆为 A：Tilemap Foundation，B：World Entities + ActionTimeline，C：Visual Pass；不并行铺昼夜、经济或 NPC 日程。
- 第三批当前收窄为 `Stardew Life Loop 第一批`：Day、Gold、床睡觉、按天成长和 Seed Keeper 单商品买卖；不顺势加入 Season、完整时钟、昼夜、天气或更多 NPC。
- World Foundation 与 Farm Showcase 已由用户在 2026-08-25 的生产真实浏览器清单中确认通过，第三批实施门槛已解除。
- 长期产品方向是家园生活 + 灵兽培养 + 轻撤离探索 + 肉鸽事件 + 阶段性守家 + 东方志怪，但当前禁止为这些后续阶段提前实现框架。Life Loop 真人验收后才允许提交小型 Expedition Prototype 设计。
- 当前视觉里程碑为 `One Beautiful Slice`：只把 Farm 做成可作宣传截图的样板核心区；Farm 视觉确认前冻结 Town/Cottage/Seed Shop 精修与旧长链验收。
- Ninja Adventure 从正式场景美术降级为开发/占位资源，不再为它进行 Gate C 级精修；Gate A 构图确认仍可使用现有占位画面。
- VectoRaith Farming Sim v1.08 只在 Farm 出生镜头做本地 visual prototype；候选 TMJ 必须复用现有对象层、stable ID、Collision、EntityFactory 和 GameSession 合同，不一次迁移全项目。
- Gate B 视觉已通过，当前进入本地 Gate C；大构图、小屋、水塘、农田、道路、河流、林缘和 Collision 冻结，只允许稀疏 Props、水生植物/岸石/波纹、作物表现、道路边缘草花、桥头景观、既有素材阴影和一处非交互地标树。
- Gate C 视觉样板已通过并冻结为 `docs/checkpoints/farm-showcase-v1/`，并正式成为生产 Farm v1；停止继续增加装饰。该 checkpoint 不等于 World Foundation 或完整世界美术完成。

## World Foundation contract

- 地图使用 16×16 正交 TMJ 区域文件；农场东侧连接小镇西侧，后续 forest/mountain/river/mine/temple/story regions 复用同一切图合同，不扩成单张超级地图。
- 每张 TMJ 固定 Tile Layers：`Ground`、`GroundDetail`、`Water`、`Buildings`、`AbovePlayer`、`Collision`；固定 Object Layers：`SpawnPoints`、`Exits`、`Interactions`、`ResourceSpawns`、`NpcSpawns`。
- 程序不按 Tiled object name 猜行为，只消费集中 decoder 验证过的 `type` 与 properties；stable entity ID 全世界唯一。
- Phaser 当前 parser 不支持 external tileset source，运行时 TMJ 必须内嵌 tileset metadata；先使用普通 TilemapLayer，不提前采用 TilemapGPULayer。
- Tilemap 只拥有地面、水、道路、墙、屋顶、桥和静态装饰；玩家、NPC、树、石头、箱子、作物、门和剧情对象由 EntityFactory 从 Object Layer 创建。
- 地图拥有 entity 静态位置，save 只保存动态状态；切图、刷新和继续游戏不得复活已耗尽资源。
- 可复用 ActionTimeline 固定 `windup -> impact -> recovery`；只有 impact 触发一次 GameSession mutation，动画期间拒绝重复交互。
- Commit C 后正式游戏世界是默认主视图；现有 LOCAL/grid 与指针方向盘只在显式 Debug Shell 模式出现。
- 正式 `public/map/*.tmj` 由 Tiled 手工维护，生成器只写 ignored fixture，运行时与构建命令禁止重写正式地图。
- 已登记 ID 是持久身份、坐标只是布局；Tiled 中可移动对象与重画 tile，但不得因构图变化重命名 `entityId`、`exitId`、`spawnId`、`npcId` 或 `dialogueId`。
- 地图阶段以实际画面、动线、碰撞与操作为主要验收证据；decoder、类型检查和构建仅证明最低结构完整性。
- 正式世界使用 2× 整数 camera zoom；不得退回 1× 全图总览造成角色和交互物过小，响应式缩放继续由 Phaser FIT 处理。
- Farm 固定扩为 64×48；核心构图集中在出生镜头附近，依次建立小屋、水塘/农田和东向道路三个视觉焦点。Gate A 只审大块构图，用户确认前禁止提前堆细节或新玩法实体。
- Gate A v2 与 VectoRaith 方向验证已通过；Gate B 冻结 23 个 stable object，只允许在 ignored 候选 TMJ 完成岸线、院落/石板、弯曲道路、农田边界、小桥、林缘、Collision 与 AbovePlayer。截图确认前不得进入 Gate C、装饰或新系统。

## Direct Original/16×16 art profile

**What**：正式 Farm 直接使用 VectoRaith 官方完整 terrain/buildings/details/orchard/crops/farmer PNG、原始 GID 和原始 frame 坐标；Town visual candidate 复用同一完整素材，其他区域继续使用占位 profile。profile 选择仍只存在 client 表现层。

**Why**：用户明确否决 used-tile 裁剪、重排 atlas、合并 entities 和重编码 farmer，要求现成官方文件直接作为运行时资源；该发布决定仍不得渗入 domain 或存档。

```typescript
// Correct: presentation shell resolves a local profile; domain receives only the decoded catalog.
const mapUrl = "/map/farm.tmj";
const factory = new EntityFactory(scene, entityMediaForRegion(regionId));

// Wrong: persist an art profile or atlas frame in domain state.
gameState.player.tileset = "vectoraith";
```

- Production source root：同源 `/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/`；只含 6 个 manifest 登记并保持官方 bytes 的完整 PNG。
- Runtime source tiles remain original 16×16; Phaser uses `pixelArt`、`roundPixels` 与 2× integer camera zoom，不采用 32/48px upscaled tileset。
- 禁止为发布再次 pack used tiles、重排 GID、裁切/合并 entity frames 或重编码 PNG；Tiled 直接使用原始 16-column metadata，EntityFactory 直接注册原 sheet frame。
- Missing local file or decoder failure → visible media/startup error；不得静默回退未知素材。
- Required checks：candidate decoder + 23 stable object equality + route Collision replay + typecheck + client build；浏览器画布验收仍需可用的 Keycloak session。
- Checkpoint 后只有真实游玩发现的明确碰撞、树脚、路径或院落操作问题允许修改 Farm v1；不以偏好性微调重开 Gate A/B/C。

### 1. Scope / Trigger

- Trigger：用户要求删除全部 VectoRaith used-tile packing/cropping，并让 Farm/Town 直接使用官方 Original/16×16 完整 PNG。

### 2. Signatures

```typescript
const VECTORAITH_MEDIA_KEYS = {
  terrain: "vectoraith-terrain",
  buildings: "vectoraith-buildings",
  details: "vectoraith-details",
  orchard: "vectoraith-orchard",
  crops: "vectoraith-crops",
  farmer: "vectoraith-farmer",
} as const;

interface TilesetBinding {
  readonly tiledName: "vectoraith-terrain" | "vectoraith-buildings" | "vectoraith-details";
  readonly textureKey: string;
}
```

### 3. Contracts

- CDN key 保留官方文件名，位于 `farming-sim-v1.08/original/16x16/`；manifest 的 bytes/SHA-256 必须等于归档原文件。
- Farm/Town TMJ 使用原始 16-column metadata；Farm firstgid 固定 terrain=1、buildings=257、details=513。
- EntityFactory frame 直接指向 orchard/details/crops/terrain 原 sheet 坐标，不创建合并 atlas。
- Git 不跟踪图片；`prepare-media` 只从 CDN 验证下载 exact originals 到 ignored runtime/Tiled 路径。
- 原图全部部署并验证后，精确删除 5 个旧 packed CDN keys；禁止递归删除 VectoRaith prefix。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| 原图 bytes/hash 与 manifest 不同 | prepare/build/deploy 失败，不回退到 packed key |
| Farm layer/GID 与 original candidate 不同 | 不部署，不删除旧派生 |
| 任一 original CDN key 缺失 | 删除工作流拒绝执行 |
| runtime bundle 仍含旧 packed key | 不删除旧对象 |
| 图片出现在 Git diff | 质量门禁失败 |

### 5. Good/Base/Bad Cases

- Good：Tiled 从完整 sheet 选 tile，Phaser 直接加载同一官方 PNG，Farm 像素/Collision/objects 不变。
- Base：Town candidate 在 ignored artifacts 使用完整 sheets，未确认前不进入正式 map。
- Bad：为每张地图重新收集 used tiles、重排 GID、裁切 entity 或重编码 PNG。

### 6. Tests Required

- 6 个 CDN objects：dimensions、bytes、SHA-256、MIME、immutable cache。
- formal Farm 与 full-original candidate：全部 tile/object layers 相同，59-tile route replay 通过。
- Life Loop contracts、typecheck、client build、真实 Phaser Farm screenshot。
- Git tracked image binaries=0，代码/manifest/文档无旧 packed key 引用。

### 7. Wrong vs Correct

```typescript
// Wrong: runtime depends on a project-repacked entity atlas.
tree.textureKey = "vectoraith-entities";
tree.frame = { x: 0, y: 0, width: 48, height: 48 };

// Correct: runtime references the official orchard sheet directly.
tree.textureKey = "vectoraith-orchard";
tree.frame = { x: 5 * 16, y: 0, width: 3 * 16, height: 3 * 16 };
```

## Scenario: Stardew Life Loop v3

### 1. Scope / Trigger

- Trigger：Farm Showcase 已人工通过，当前需要让玩家完成第一个可重复生活日循环。
- 本场景只拥有 `day`、`gold`、床睡觉日结、三次有效浇水成长和 Seed Keeper 萝卜买卖；不包含 Season、Clock、天气、NPC 日程、远征或灵兽。

### 2. Signatures

```typescript
interface GameStateV3 {
  version: 3;
  day: number;
  gold: number;
  player: PlayerState;
  inventory: InventorySlot[];
  resources: Record<string, ResourceState>;
  farmTiles: Record<string, FarmTileStateV3>;
}

interface FarmTileStateV3 {
  id: string;
  phase: "untilled" | "tilled" | "growing" | "mature";
  cropId: "" | "turnip";
  growthStage: 0 | 1 | 2 | 3;
  watered: boolean;
}

type LifeLoopCommand =
  | { type: "sleep"; bedId: "cottage-bed" }
  | { type: "buy-item"; itemId: "turnip-seed"; quantity: 1 }
  | { type: "sell-item"; itemId: "turnip"; quantity: 1 };
```

### 3. Contracts

- 新游戏固定 `day=1`、`gold=100`；HUD 只投影 `Day N` 与 `Ng`。
- `sleep` 必须在一次同步 mutation 中依序完成：结算所有 watered crops → 清除每日 watered → `day + 1` → Cottage 安全位置；随后由 GameSession 排队一次 critical save。
- 萝卜播种后只有“该日已浇水 + 成功睡觉”才增长 1 阶；3 次有效日结后 mature。wall-clock、刷新等待和同日重复浇水都不能额外成长。
- `turnip-seed` 每次只买 1 个、价格 20g；`turnip` 每次只卖 1 个、价格 35g。扣款/加物与背包 mutation 必须全成或全不成。
- ShopPanel open/closed 是 client UI state，不写入 GameState；打开期间 client shell 锁定 Phaser 世界移动、动作与地图交互输入。
- v2→v3 在内存中迁移 `alien-seed → turnip-seed`、`alien-crop → turnip` 和 FarmTile crop ID；`readyAt` 被丢弃，合法 phase/watered 保留。v3 重复 decode 不再运行 defaults 或 remap。
- SaveRepository、IndexedDB DB/store/ownerKey/slot 均不变；不新增数据库或 Tauri 代码。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| `day` 不是安全的 1-based 整数，或 `gold` 不是非负安全整数 | decode 明确失败，原 IndexedDB record 不覆盖 |
| 非 Cottage、错误 bed ID、距离超限或睡觉 command 正在处理 | 拒绝睡觉，day/crops/player 不变 |
| 作物未浇水 | 睡觉只清理 daily state 并推进 day，作物阶段不变 |
| 购买时 gold < 20 或背包无法完整加入 1 粒 | gold 与 inventory 全部不变 |
| 出售时没有 1 个 turnip | gold 与 inventory 全部不变 |
| future/损坏 save | 显式错误，不静默新建或降级覆盖 |

### 5. Good/Base/Bad Cases

- Good：玩家以 100g 买种，连续三次浇水后睡觉，收获 1 个萝卜并以 35g 出售；刷新后 day/gold/inventory/farmTiles 一致。
- Base：未浇水直接睡觉，Day 仍只增加 1，萝卜不成长；商店失败命令给出 feedback 且无 mutation。
- Bad：Vue 直接 `gold -= 20`、FarmingSystem 继续读取 `Date.now()`，或 sleep 分多次 command/save 导致半日结。

### 6. Tests Required

- v2 fixture decode 为 v3 后断言 day/gold、alien item/crop remap、phase/watered 保留、`readyAt` 消失；再次 decode v3 值完全相同。
- 连续三次 watered sleep 每次只增长一阶并最终 mature；未浇水、重复浇水和 wall-clock 等待不增长。
- buy/sell 的成功、金币不足、背包满和库存不足分别断言 gold/inventory 原子性。
- sleep 的错误位置、快速重复输入与成功路径分别断言 day/crop/save 次数。
- 最小门禁：窄确定性检查、typecheck、client build；最终由真实浏览器完成完整循环和刷新恢复。

### 7. Wrong vs Correct

```typescript
// Wrong: UI owns economy and sleep emits partial mutations.
snapshot.gold -= 20;
session.dispatch({ type: "grow-crops" });
session.dispatch({ type: "next-day" });

// Correct: UI sends one command; GameSession owns one atomic mutation.
session.dispatch({ type: "buy-item", itemId: "turnip-seed", quantity: 1 });
session.dispatch({ type: "sleep", bedId: "cottage-bed" });
```

### Convention: FarmPlot visual frames remain optional presentation data

**What**：`EntityMediaProfile.farmCrop` 可以提供 growing/mature atlas frame；`FarmPlotEntity.project` 只把现有 domain phase 映射为可见 frame，未耕/已耕阶段隐藏 crop image。

**Why**：作物种类、阶段和收获仍由 FarmingSystem/GameState 拥有，素材 key、坐标和 frame name 不得进入 command、save 或 domain。

```typescript
// Correct: presentation maps the existing phase.
crop.setVisible(tile.phase === "growing" || tile.phase === "mature");

// Wrong: domain or save stores an atlas frame.
farmTile.frameName = "vectoraith-crop-mature";
```

## Identity replaceability

- 当前托管 Web 版本继续通过 Keycloak 验证账号隔离，但 domain、WorldCatalog、GameSession 与 SaveRepository 只接 opaque owner key，不导入 Keycloak。
- Keycloak 是否为未来离线/单机产品强制前提尚未决定；不得在 World Foundation 中把登录页面或 token 固化为地图、玩法或存档格式的一部分。

## Open-source contract

- Phaser/Vue 和既有固定开源来源继续锁版本；规则迁移以当前 checkpoint 源码为依据，不建立复制分叉。
- 已评审 `idb@8.0.3`，许可证 ISC 不在默认 allowlist，且当前接口窄，因此采用受控原生 IndexedDB 薄层并记录拒绝原因。
- 图片仍遵循官方固定来源、许可 allowlist、不可变 `game/media/v1` manifest 和 Git 图片二进制为零。
- VectoRaith v1.08 采用自定义项目使用许可。用户已批准 Web runtime 直接下载 6 张官方完整 sheet 并接受作者回复前的残余风险；禁止原 ZIP、未采用目录、素材浏览/下载入口或素材包式产品。作者回复若附加条件则 forward-fix。

## Verification

- 默认只运行 TypeScript、client build、必要 server build 和配置解析；不扩建大规模自动测试矩阵。
- 修改 Keycloak、论坛 OIDC bridge、反向代理或 server image 时，运行现有 `test:identity`；生产 server image 构建固定先执行容器内可独立运行的 `test:oidc`，确保带路径 issuer 的 discovery 与真实授权 route 一致。
- 人工浏览器验收新游戏、继续游戏、本地玩法闭环、刷新恢复和损坏存档错误状态。
- 默认不连接数据库、不新增 migration；生产部署只在用户明确授权后执行。

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run test:identity
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```
