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
- IndexedDB adapter 使用固定 DB `mirror-island-local`、store `game-saves`；当前 save schema v4 包含 region、day、minuteOfDay、gold 与按天作物状态，旧 v1/v2/v3 只通过显式幂等 decoder 迁移，不使用 localStorage 保存玩法。
- save value 包含 schema version、updatedAt、玩家、背包、资源和农田；读取从 unknown 完整验证，未来/损坏版本明确失败。
- token、ticket、密码、Keycloak 对象、数据库 URL 和 secret 禁止写入 IndexedDB；当前 Web 试玩 ownerKey 由 client session adapter 以固定 opaque 值 `local-playtest-v1` 提供，不生成用户或设备身份。
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
- Base：全新本地试玩槽与后续 current saves 沿用原 main key，不产生 backup。
- Bad：`load()` 先覆盖 main 再进入 GameSession，或先写 v3 后用另一个 transaction 补 backup。

### 6. Tests Required

- 纯 write-plan 合同断言首次 v2 生成 exact backup、已有 backup 不覆盖、v3/new 不备份、delete keys 仅两条 scoped key。
- Life Loop v2→v3 幂等 domain 合同继续通过。
- typecheck、client build；原子 v2→v3 保留由确定性 fixture 验证，当前生产人工验收聚焦新本地试玩槽的新游戏、继续和刷新恢复。

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

- Keycloak 26.7.1、oidc-provider 9.11.1、Prisma 7.9.1、PostgreSQL 17、论坛跨 Compose 网络、CDN 和部署设施继续保留；公开 Web 客户端不再依赖 `keycloak-js`。
- 后端近期只保留论坛 SSO、health 和未来非实时 API 边界；当前试玩客户端不调用它们，云存档、成就和排行榜另行规划。
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
- 长期产品方向仍是家园生活 + 灵兽培养 + 轻撤离探索 + 肉鸽事件 + 阶段性守家 + 东方志怪；当前继续 Stardew/Town，并仅额外批准 presentation-only 的空手 NPC 击打反馈，不构成敌人、伤害或战斗系统授权。未经新的明确批准不得创建 Expedition task、map、Cargo、敌人或捕获代码。
- `One Beautiful Slice`、Farm Gate A/B/C、Town Gate A/B/C 与三名 NPC 均已通过并进入生产；用户已于 2026-08-28 批准 `Town 世界元素扩展 v1`：增加铁匠工坊、五栋可进入公共区的民宅、静态阻挡的私人内屋、北侧山麓与南侧湖岸，但不实现工具升级、好感解锁、采矿、钓鱼或新经济。
- Ninja Adventure 从正式场景美术降级为开发/占位资源，不再为它进行 Gate C 级精修；Gate A 构图确认仍可使用现有占位画面。
- VectoRaith Farming Sim v1.08 已从 visual prototype 转为生产 Farm/Town 底座；运行时直接读取 6 张官方 Original/16×16 PNG，候选/旧 packed 流程不再是活跃实现面。
- Gate C 视觉样板已通过并冻结为 `docs/checkpoints/farm-showcase-v1/`，并正式成为生产 Farm v1；停止继续增加装饰。该 checkpoint 不等于 World Foundation 或完整世界美术完成。
- Town Gate A 已通过 reference study、40×30 空间蓝图和 ignored 候选视觉确认；正式 Town 固定为西入口→弯曲主街→桥头粉色地标→唯一河桥→Seed Shop，并保留南侧小巷与河畔次区回路。未经真实碰撞问题不得重开大构图。
- Town Gate B 建筑密度已于 2026-08-26 通过用户视觉确认：正式 40×30 Town 固定为 1 个蓝顶杂货铺、1 个红色大体量铁匠铺和 5 栋民宅，共 7 个建筑体量；石质粮仓已明确否决。允许橙顶/棕顶民宅非相邻复用，但相邻建筑不得完全同形；新增住宅只用短支路接入，河流、唯一桥、粉树广场、西入口、Seed Shop 出口和 5 个 stable object 保持不变。
- Town Gate C 已于 2026-08-26 通过用户视觉确认：生活感只通过成组静态 Props 建立，杂货铺使用货箱/招牌/门槛，铁匠铺使用灯具/木料/矿石，五栋民宅使用至少三类非均匀院落，粉树广场保留单一公告设施，桥头只放少量引导物。正式 Town 停止继续增加建筑或均匀铺装饰；后续只因真实通行、Collision、AbovePlayer 或功能入口问题窄修。
- Town Population MVP 已于 2026-08-27 通过生产人工验收：华强复用现有 Shop，昊天与阿禾使用线性 Dialogue，统一 modal lock、防出口触发和脚底碰撞均成立；后续输入精简为点击邻近 NPC 交互，当前世界交互不再注册 E；该验收不授权 NPC 日程、好感、任务或铁匠功能。
- 用户于 2026-08-28 批准 `Town 家庭与居民 v1`：五栋民宅各增加一名固定 dialogue NPC——墨子、浩南、阿澜、昊美丽、祥子；阿澜与阿禾、昊美丽与昊天只通过住址和对话表达家庭关系，不增加 Relationship、日程、好感、送礼或持久 NPC 状态。
- 用户于 2026-08-28 后续批准 `Town 时间与 NPC 日程 v1`：增加 06:00–24:00、8 秒/10 分钟的 GameSession 时钟和八名 NPC 四段固定日程；允许 v3→v4 存档迁移，但仍不增加 Season、天气、体力、好感、送礼或 NPC 寻路动画。
- Town 任务若主动推迟玩家可感知能力，归档前必须把能力、依赖和实施触发条件登记到 `docs/TOWN_ROADMAP.md`；路线图是防遗忘清单，不替代独立 PRD，也不自动扩大当前实现范围。

## Scenario: Town Population MVP

### 1. Scope / Trigger

- Trigger：`life-loop-v1` 与 Town Gate C 已封存，需要用三个固定 NPC 验证小镇从静态地图变为生活空间。
- 本场景只拥有华强、昊天、阿禾、线性 1∼3 句对话、现有 Seed Shop 人格化入口、统一模态锁和固定脚底碰撞；不包含日程、好感、任务、分支、铁匠功能或持久 NPC 状态。

### 2. Signatures

```typescript
interface NpcSpawnDefinition extends WorldPoint {
  readonly entityId: string;
  readonly regionId: string;
  readonly npcId: string;
  readonly dialogueId: string;
  readonly interactionType: "shop" | "dialogue";
}

interface DialogueDefinition {
  readonly id: string;
  readonly speaker: string;
  readonly lines: readonly [string, ...string[]];
}

interface DialogueProjection {
  readonly speaker: string;
  readonly lines: readonly string[];
  readonly lineIndex: number;
}
```

### 3. Contracts

- 已发布华强保持 `entityId=seed-shop-keeper`、`npcId=seed-keeper`、`dialogueId=seed-keeper-welcome`，只补 `interactionType=shop`；不得为商店再造第二套入口。
- Town 新增且只新增 `town-blacksmith`（昊天）和 `town-resident-01`（阿禾），均为 `interactionType=dialogue`；坐标属于 Tiled，stable ID 不随移动改变。
- `interactionType` 是 decoder 必填枚举；WorldScene 以它分派现有 ShopPanel 或 DialoguePanel，ShopSystem 仍以 `seed-shop-keeper`、region 与 42px 距离验证买卖命令。
- Dialogue 只在 Vue transient state 中保存当前行；不进入 GameSession、StoredGame、IndexedDB 或 domain command。
- `isWorldInputLocked()` 在 Shop、Dialogue 或休息确认框打开时为 true，统一阻止 movement、interaction 与 exit transition；Dialogue 只通过界面按钮推进，最后一句关闭并恢复输入。
- 固定 `dialogue` NPC 使用约 5×3px 脚底半径；`shop` NPC 不新增脚底阻挡，避免已发布 Seed Shop 旧位置存档被困。
- 正式 NPC 图来自 VectoRaith NPC v1.6 DEMO 的完整 `DEMO/16x16/generic_people.png`：192×256、17354 bytes、SHA-256 `eb1fe419def5a351cfc147a8273b133f1e7daaa9f59a418fe4a7d3f8d7d67ba0`；Git 不跟踪 PNG，运行时只读 immutable CDN 原始 bytes。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| NPC 缺少/使用未知 `interactionType` | 地图解码失败，世界不启动 |
| `dialogueId` 不在 catalog | 显示固定错误 feedback，不打开空 modal |
| Dialogue/Shop 已打开时重复点击 NPC | 不创建第二 modal；当前 modal 保持唯一 |
| Shop 打开但玩家不在华强 42px 内 | ShopSystem 返回 `not-at-shop`，gold/inventory 不变 |
| NPC frame 缺失 | EntityFactory 明确失败，不回退 Ninja shopkeeper |
| NPC 脚底堵住 reviewed route | 路线门禁失败，不提交/部署 |
| NPC CDN bytes/hash 不匹配 | prepare/deploy 失败，不加载未知素材 |

### 5. Good/Base/Bad Cases

- Good：玩家从 Farm 进入 Town，先点击阿禾并完成两句对话，找到昊天，再进入 Seed Shop 点击华强打开原子买卖面板。
- Base：Dialogue 用按钮逐句推进，Shop/Dialogue 期间世界停止响应，关闭后恢复；刷新不保存任何对话位置。
- Bad：Vue 直接修改 gold、按 `entityId` 硬编码多个商店分支、把 sprite frame 写进 save，或引入 DialogueGraph/Quest/Schedule 框架。

### 6. Tests Required

- 正式四地图 decoder 断言 Town 两名 dialogue NPC、Seed Shop 一名 shop NPC、全局 stable ID 唯一及非法 `interactionType` 失败。
- WorldCatalog 断言 Town NPC 脚底阻挡、华强不阻挡旧位置、三人均有 42px 内可达交互点，Farm↔Town/桥/商店路线不回退。
- transient modal 合同断言对话逐句关闭、Shop 欢迎语、统一输入锁和关闭恢复；Life Loop 原子买卖合同继续通过。
- `prepare:media`、NPC/ Life Loop 窄合同、typecheck、client build、manifest totals、Git 图片二进制为 0；生产最终由 30∼60 秒真实浏览器验收。

### 7. Wrong vs Correct

```typescript
// Wrong: UI guesses identity and owns shop/economy state.
if (npc.entityId === "some-shopkeeper") snapshot.gold -= 20;

// Correct: Tiled declares interaction; UI reuses the existing command owner.
if (npc.interactionType === "shop") openShop(dialogue.lines[0]);
session.dispatch({ type: "buy-item", itemId: "turnip-seed", quantity: 1 });
```

## Scenario: Town clock and fixed NPC schedules

### 1. Scope / Trigger

- Trigger：五栋住宅与八名固定 NPC 已成立，需要用可见时间让住宅、工作地点、山麓和湖岸形成日常生活网络。
- 本场景只拥有单日时钟、四段 anchor 切换、活跃 NPC 碰撞和 Seed Shop 白天营业；不包含天气、Season、好感、送礼、寻路或昏倒。

### 2. Signatures

```typescript
interface GameStateV4 {
  readonly version: 4;
  day: number;
  minuteOfDay: number; // 360..1440, step 10
}

type NpcSchedulePhase = "morning" | "day" | "evening" | "night";

function activeNpcSpawns(
  catalog: WorldCatalog,
  minuteOfDay: number,
): readonly NpcSpawnDefinition[];

function GameSession.tick(now?: number, paused?: boolean): void;
```

### 3. Contracts

- 时间由 GameSession 唯一拥有：新游戏/睡觉为 360，10 分钟一步，1440 冻结；现实 8000ms 推进一步，单 tick elapsed 最多消费 1000ms。
- modal、ActionTimeline、transition 通过 `paused=true` 切断 wall-clock 累积；恢复时不补算后台或暂停时间。
- GameState/StoredGame 当前版本为 4；v3 完整验证后补 06:00，v1/v2 继续迁移到 v4；minute 必须可被 10 整除。
- Tiled SpawnPoints 拥有 schedule anchor 坐标；domain registry 只引用 regionId/spawnId。NpcSpawns 仍唯一拥有 entityId/npcId/dialogueId。
- movement、reconcile、WorldScene 与 ShopSystem 必须消费同一个 active NPC resolver；禁止 Phaser 单独移动 sprite 或留下旧脚底碰撞。
- 华强仅 day phase 投影为 `shop`，其他 phase 投影为 `dialogue`；买卖命令必须在当前 active counter 的 42px 内。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| minute 非安全整数、越界或非 10 分钟粒度 | save decode 失败，原记录不覆盖 |
| v3 save | 迁移到 v4 06:00，其他 state 字段保持 |
| pause / 后台长间隔 | 更新时间基线，不推进、不追赶 |
| 24:00 后 tick | 保持 24:00，等待主动睡觉 |
| schedule 缺 anchor、anchor 被 tile 阻挡或同 phase 重叠 | 启动 validation 失败 |
| NPC anchor 改变但 entityId 相同 | 销毁并重建临时 NpcEntity，identity/dialogue 保持 |
| 华强不在 day counter | 只对话，ShopSystem 返回 `not-at-shop` |

### 5. Good/Base/Bad Cases

- Good：09:00 浩南位于山麓、祥子位于码头、华强在柜台可交易；17:00 同一 identity 切到 evening anchor，旧位置无 sprite/碰撞。
- Base：对话打开一分钟现实时间后关闭，游戏 minute 不变；睡觉后 Day+1 且 06:00。
- Bad：Vue 自增时间、在 Phaser hardcode 像素日程、复制同一 NPC 实体，或只换 sprite 不换 movement collision。

### 6. Tests Required

- v3→v4 06:00、v4 幂等、非法 minute、8 秒步长、pause、24:00 freeze、sleep reset。
- 四个 phase 各断言八名 NPC identity 唯一、region anchor、无 tile 阻挡/重叠；active interaction range 可达。
- 华强 morning/evening 为 dialogue、day 为 shop；买卖只在 day counter 成功。
- Life Loop、Town、v2 backup、typecheck、client build；不扩建天气/好感测试。

### 7. Wrong vs Correct

```typescript
// Wrong: renderer invents a second schedule and collision remains at the TMJ base point.
npcSprite.setPosition(304, 240);

// Correct: every consumer projects the same Tiled anchor from the persisted game minute.
const active = activeNpcSpawnsInRegion(catalog, regionId, state.minuteOfDay);
catalog.isBlocked(regionId, x, y, 5, 4, active);
```

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
- Town 扩展继续使用分区切图而不是放大单张主镇：`blacksmith`、五栋 `town-house*` 使用现有室内占位图集，`foothills`、`lakeshore` 使用现有 VectoRaith 户外 profile；每栋住宅外门可进入公共区，私人内屋只由 Collision + Tiled-owned `inspect dialogueId` 阻挡，禁止把访问状态写入 GameState/save。
- Farm 固定扩为 64×48；核心构图集中在出生镜头附近，依次建立小屋、水塘/农田和东向道路三个视觉焦点。Gate A 只审大块构图，用户确认前禁止提前堆细节或新玩法实体。
- Gate A v2 与 VectoRaith 方向验证已通过；Gate B 冻结 23 个 stable object，只允许在 ignored 候选 TMJ 完成岸线、院落/石板、弯曲道路、农田边界、小桥、林缘、Collision 与 AbovePlayer。截图确认前不得进入 Gate C、装饰或新系统。

## Direct Original/16×16 art profile

**What**：正式 Farm 与 Town 直接使用 VectoRaith 官方完整 terrain/buildings/details/orchard/crops/farmer PNG、原始 GID 和原始 frame 坐标；Cottage、Seed Shop 等室内区域继续使用占位 profile。profile 选择仍只存在 client 表现层。

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
- Required checks：formal decoder + Farm 23 stable object/Town 7 stable object equality + Farm/Town route Collision replay + typecheck + client build；浏览器画布验收不需要 Keycloak session 或身份服务。
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
| Farm 或 Town layer/GID 与已确认 original candidate 不同 | 不部署，不替换正式地图 |
| 任一 original CDN key 缺失 | 删除工作流拒绝执行 |
| runtime bundle 仍含旧 packed key | 不删除旧对象 |
| 图片出现在 Git diff | 质量门禁失败 |

### 5. Good/Base/Bad Cases

- Good：Tiled 从完整 sheet 选 tile，Phaser 直接加载同一官方 PNG，Farm 像素/Collision/objects 不变。
- Base：Town Gate A 的 ignored candidate 获确认后只机械投影 tileset image path，正式 tile/object data 与候选一致。
- Bad：为每张地图重新收集 used tiles、重排 GID、裁切 entity 或重编码 PNG。

### 6. Tests Required

- 6 个 CDN objects：dimensions、bytes、SHA-256、MIME、immutable cache。
- formal Farm/Town 与各自 full-original candidate：tile/object layers 相同；Farm→Town、主街→桥→Seed Shop、小巷→次区→桥头回路通过。
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
- 玩家在 42px 内点击 Cottage 床后先打开“是否休息？”确认框；“否”只关闭 modal，“是”关闭 modal 后调用一次既有 sleep transition。远距离点击静默无效，E 不承担睡觉交互。
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

## Scenario: production Hotbar item icons

### 1. Scope / Trigger

- Trigger：Tool Art Gate A 已确认 GARDENS 工具/种子图标，正式 Hotbar 不再使用大号汉字占位；本场景只晋升 UI item frame，不晋升候选工具动作。

### 2. Signatures

```typescript
interface ItemIconDefinition {
  readonly url: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly x: number;
  readonly y: number;
  readonly width: 16;
  readonly height: 16;
}

function itemIconForItem(itemId: string): ItemIconDefinition | null;
```

### 3. Contracts

- `client/src/game/assets/item-icons.ts` 是正式 item ID → immutable source/frame 的唯一 owner；ItemDefinition、GameState、StoredGame 和 IndexedDB 不保存 URL、texture key 或 frame。
- GARDENS 采用原始 160×176 PNG：hoe `(0,1)`、watering can `(0,4)`、axe `(0,9)`、turnip seed `(6,5)`；turnip/wood 继续使用已登记 VectoRaith crops/details frame。
- GARDENS 对象固定在 `game/media/v1/assets/vendor/ivoryred/gardens-2026-08-27/original/`，bytes/SHA-256 必须等于 manifest；禁止裁图、重排、重编码或把 PNG 加入 Git。
- Hotbar 对 mapped item 显示 2× nearest-neighbor 图标并保留小字 name/quantity/selection；只有确实 unmapped 的 item 才回退 `hotbarMark`。
- CC BY 4.0 署名必须随产品交付到 `/THIRD_PARTY_NOTICES.txt` 并从 start UI 可发现；仓库内部采用记录不能替代产品署名。
- `tool-art-candidate.ts` 只保留 development-only action preview；生产 Hotbar 不读取 `import.meta.env.DEV` 或 query flag。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| CDN key 已存在但 SHA 不同 | 发布失败，禁止覆盖 immutable object |
| manifest totals/key/hash/URL 不一致 | 构建/部署媒体门禁失败 |
| mapped item 图标请求失败 | 生产验收失败，不把缺图当成功发布 |
| item 无正式 frame | Hotbar 使用 `hotbarMark`，name/quantity 仍正常 |
| notice 缺失或不可访问 | CC-BY 采用未完成，不部署 |

### 5. Good/Base/Bad Cases

- Good：新游戏前三格显示锄头、浇水壶、斧头像素图标，选择和数量不变，网络只请求登记的同源媒体。
- Base：未来新增尚未评审的 item 仍显示文字 mark，不猜 frame、不复用不相干图标。
- Bad：生产依赖 `/tool-art-candidate/`、在 ItemDefinition 写图片 URL、提交 PNG，或只在仓库 README 署名。

### 6. Tests Required

- manifest 断言 14 images / 214731 bytes，并从 CDN 校验全部 SHA-256、dimensions、MIME 与 immutable cache。
- typecheck、client build；产物包含正式 GARDENS URL 和 `THIRD_PARTY_NOTICES.txt`，不包含旧 local GARDENS candidate URL。
- Git 图片 binary diff 为 0；真实浏览器断言前三格使用图标且 notice 可访问。

### 7. Wrong vs Correct

```typescript
// Wrong: production Hotbar remains behind a development-only visual gate.
const icon = import.meta.env.DEV ? candidateIconForItem(itemId) : null;

// Correct: production resolves one reviewed presentation frame without changing item state.
const icon = itemIconForItem(itemId);
```

## Scenario: selected Hotbar item owns world interaction

### 1. Scope / Trigger

- Trigger：玩家必须先选择工具/种子或空手，再点击 Tree/FarmPlot；系统不再根据目标 phase 自动猜测工具。
- 本场景只拥有 transient Hotbar selection、持续手持表现、精确 item/target command 和空手采摘；不包含工具品质、耐久、体力、升级或铁匠功能。

### 2. Signatures

```typescript
type HeldItemId = ItemId | "";

type ToolUseCommand = {
  readonly type: "use-item-on-target";
  readonly itemId: HeldItemId;
  readonly targetId: string;
};

interface ToolSelectionProjection {
  readonly selectedHotbarIndex: number | null;
  readonly selectedItemId: HeldItemId;
}
```

### 3. Contracts

- 新游戏 slots 0/1/2 固定 hoe/watering-can/axe；默认 `selectedHotbarIndex=null`、空手。开发期不 backfill 旧存档。
- 点击或按 `1–8` 选择槽位；再次选择当前槽或选择空槽回到空手。选择只在 client store，禁止进入 GameState、StoredGame、IndexedDB 或 domain。
- Phaser 在 ActionTimeline impact 发送 `use-item-on-target`；GameSession 重新验证背包仍拥有非空 item，并按 WorldCatalog target kind 路由。
- 精确合法组合只有：axe+tree、hoe+untilled、turnip-seed+tilled、watering-can+growing、empty+mature。
- 错误物品/phase 仍播放当前玩家动作，但 GameSession 返回 quiet no-effect；目标不播放 impact，不 publish/save，不显示文字错误。
- 空手收获使用当前 farmer 的代码俯身动作；mutation 仍只发生在 impact 一次。
- Shop/Dialogue/ActionTimeline busy 时 Hotbar 与数字键选择被锁；modal 关闭后保留先前选择。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| item 不在背包或 target 未知 | quiet no-effect，state byte-equivalent |
| wrong item/target phase | 玩家动作完成；target 无 impact；无反馈/保存 |
| axe + available nearby tree | tree depleted、+3 wood、一次 critical save |
| watering-can + already watered crop | waiting feedback；不重复成长 |
| empty + mature crop + 背包有容量 | 俯身 impact 时收获一次 |
| empty + mature crop + 背包满 | 俯身完成，作物保留，inventory-full feedback |
| selected slot 被消耗为空 | 下一 snapshot projection 自动清空 selection |
| modal/action busy | selection/use input ignored |

### 5. Good/Base/Bad Cases

- Good：按 1 选锄头→点击未耕地；选择种子→播种；选择浇水壶→浇水；成熟后取消选择→空手俯身收获。
- Base：选择斧头点击成熟作物，斧头动作播放但作物完全不动；再次按斧头槽回到空手。
- Bad：FarmPlot 根据 phase 自动选择动作、Vue 直接改 inventory、把 selected index 写进 current save，或错误工具仍触发 target shake。

### 6. Tests Required

- GameSession：新游戏三件工具；所有合法组合成功；tree 与每个 farm phase 的 wrong-item snapshot 全等；不存在旧 gather/farm-primary active 调用。
- Client store：初始空手、click/key toggle、空槽、最后一个 seed 消耗、modal/action lock。
- ActionTimeline：正确/错误工具都只派发一次；只有 success 调用 Tree/FarmPlot impact；空手 harvest 失败不移除 crop。
- 回归：Life Loop、Town Population、IndexedDB v2 backup、typecheck、client build；Git 图片/TMJ/migration diff 为零。

### 7. Wrong vs Correct

```typescript
// Wrong: target state chooses the player's item.
session.dispatch({ type: "farm-primary", tileId });

// Correct: client sends the selected item; domain validates the exact pair.
session.dispatch({ type: "use-item-on-target", itemId: selectedItemId, targetId: tileId });
```

## Scenario: presentation-only NPC hit reaction

### 1. Scope / Trigger

- Trigger：玩家空手按 Space 时需要一个短促挥拳反馈，并允许当前三个固定 NPC 产生非致命视觉反应；本场景不建立战斗领域状态。

### 2. Signatures

```typescript
type Facing = "down" | "up" | "left" | "right";

interface NpcHitCandidate extends WorldPoint {
  readonly entityId: string;
}

function selectNpcHitTarget<T extends NpcHitCandidate>(
  player: WorldPoint,
  facing: Facing,
  candidates: readonly T[],
): T | null;
```

### 3. Contracts

- Space 只在 `selectedItemId === ""`、world input unlocked、transition idle 和 ActionTimeline idle 时开始；工具、种子或其他手持物存在时完全无动作。
- 命中走廊固定为前向 `0..28px`、横向绝对距离 `<=10px`；多目标按欧氏距离平方、再按 stable entity ID 决定唯一目标。
- 玩家挥空仍播放 `120ms windup → 90ms impact → 180ms recovery`；命中只调用 NpcEntity 的临时闪白、约 6px 击退和复位。
- NPC Tiled spawn、脚底碰撞、GameState、StoredGame 和 IndexedDB 永远不因击打改变；切图/Scene shutdown 必须终止 tween、清 tint 并恢复 spawn。
- Phaser 4 的填充闪白使用 `setTint(color).setTintMode(Phaser.TintModes.FILL)`；禁止调用已移除参数语义的 `setTintFill(color)`。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| Space 时手持任意物品 | 无动画、无 NPC 反应 |
| 前方无合法 NPC | 只播放挥拳 |
| NPC 在背后、横向超 10px 或前向超 28px | NPC 不反应 |
| NPC 已在 reaction 中 | 不叠加 tween；当前挥拳正常结束 |
| Shop/Dialogue/休息确认/工具动作/切图中 | 忽略 Space |
| Scene teardown | 玩家与 NPC 临时坐标/tint 全部复位 |

### 5. Good/Base/Bad Cases

- Good：空手面对 NPC 按 Space，玩家短突进，最近的前方 NPC 闪白后退并回到原位，存档字节不变。
- Base：面对空地挥拳有动作；拿着锄头按 Space 完全无动作。
- Bad：把击打次数、NPC 坐标或血量写入 GameSession，按鼠标攻击，或让击退改变地图碰撞位置。

### 6. Tests Required

- 纯目标选择断言四方向、背后、横向、超距、最近目标与 stable ID tie-break。
- client typecheck 与 build 必须通过；Life Loop、Town Population 和工具交互窄合同不得回退。
- 真实浏览器检查空手/手持、挥空、命中、连续 Space、打开 modal 与切图后的 tint/坐标残留。

### 7. Wrong vs Correct

```typescript
// Wrong: a presentation hit becomes persistent combat state.
session.dispatch({ type: "damage-npc", npcId, amount: 1 });

// Correct: the client chooses one active-region visual target and restores it after feedback.
selectNpcHitTarget(player, facing, candidates)?.entity.playHitReaction(facingVector(facing));
```

## Scenario: anonymous local playtest entry

### 1. Scope / Trigger

- Trigger：前期只验证玩法，公开 `/` 取消注册、登录、论坛账号和身份检查门禁，但保留 Keycloak/OIDC/数据库基础设施供未来单独评审。

### 2. Signatures

```typescript
const LOCAL_PLAYTEST_OWNER_KEY = "local-playtest-v1";

function initializeLocalPlaytestGameSession(catalog: WorldCatalog): GameSession;
function initializeLocalGameSession(ownerKey: string, catalog: WorldCatalog): GameSession;
```

```json
{
  "registrationAllowed": false
}
```

### 3. Contracts

- `LOCAL_PLAYTEST_OWNER_KEY` 只由 `client/src/session/local-game-session.ts` 拥有；`App.vue` 只调用 `initializeLocalPlaytestGameSession`，不复制键值。
- `ownerKey` 不是用户 ID、设备 ID 或可识别信息；同一 origin + browser profile 只有一个试玩槽。tool-art preview 继续使用独立键，不覆盖正式试玩。
- IndexedDB 仍以 `ownerKey:slotId` 直接读写，不枚举 object store。旧 Keycloak subject hash owner key 记录保留但暂时不可达，不迁移、合并或删除。
- browser source/dependency/build env 不包含 `keycloak-js`、`VITE_KEYCLOAK_*`、token 刷新或 Keycloak/OIDC 请求；界面不显示账号入口。
- Compose 的 `frontend` 不得 `depends_on` Keycloak 或 `mirror-game`。Keycloak realm/client、论坛 Identity Provider、OIDC bridge、PostgreSQL、volumes 和 secrets 保留；realm 关闭独立注册。
- 未来重新引入账号时，必须单独评审试玩槽与账号槽的选择/合并规则；不在本合同预留自动绑定。

### 4. Validation & Error Matrix

| 条件 | 结果 |
|---|---|
| Keycloak、论坛 bridge 或 PostgreSQL 不可达 | `frontend` 仍可启动，`/` 仍可新建/继续本地游戏 |
| 当前试玩槽缺失 | “继续游戏”禁用，“新游戏”可用 |
| 当前试玩槽损坏/未来版本 | 进入可恢复错误状态，不静默新建或覆盖 |
| 只存在旧 subject hash 槽 | 视为当前试玩槽缺失，旧记录不读取/改写 |
| 直接访问 Keycloak 注册 | realm 拒绝独立注册，已有 realm 数据不删除 |

### 5. Good/Base/Bad Cases

- Good：身份服务不可达时访问 `/`，新建 Day 1 / 100g 农场，刷新后“继续游戏”恢复同一 IndexedDB 槽。
- Base：首次访问直接显示本地菜单和存档丢失/不跨设备提示，不发起任何身份请求。
- Bad：只隐藏登录按钮但仍初始化 Keycloak，在 `App.vue` 复制 owner key，枚举旧存档猜测一个账号，或保留 `frontend -> keycloak/mirror-game` 启动依赖。

### 6. Tests Required

- 静态搜索 browser source、dependency、lockfile、Docker build args 和 env 样例，断言无 `keycloak-js`、`initializeKeycloakSession`、`deriveLocalSaveOwnerKey` 和 `VITE_KEYCLOAK_*`。
- 解析 realm JSON，断言 `registrationAllowed=false`，同时 `mirror-island-web` client 和 `parallellines` Identity Provider 仍存在；运行 `test:identity`。
- 解析 Compose config，断言 `frontend.depends_on` 不存在，Keycloak/bridge/database 服务仍存在。
- 运行 typecheck 和 client build；真实浏览器验证 `/` 不跳转、无账号入口、新游戏、刷新后继续和本地存档限制文案。

### 7. Wrong vs Correct

```typescript
// Wrong: the shell still owns authentication and derives a per-account key.
const auth = await initializeKeycloakSession();
initializeLocalGameSession(await deriveLocalSaveOwnerKey(auth.subject), catalog);

// Correct: the session adapter owns the single anonymous playtest key.
initializeLocalPlaytestGameSession(catalog);
```

```yaml
# Wrong: static gameplay cannot start until identity services start.
frontend:
  depends_on: [keycloak, mirror-game]

# Correct: frontend has no runtime service dependency.
frontend:
  build:
    dockerfile: apps/mirror-island/Dockerfile.web
```

## Open-source contract

- Phaser/Vue 和既有固定开源来源继续锁版本；规则迁移以当前 checkpoint 源码为依据，不建立复制分叉。
- 已评审 `idb@8.0.3`，许可证 ISC 不在默认 allowlist，且当前接口窄，因此采用受控原生 IndexedDB 薄层并记录拒绝原因。
- 图片仍遵循官方固定来源、许可 allowlist、不可变 `game/media/v1` manifest 和 Git 图片二进制为零。
- VectoRaith Farming v1.08 与 NPC v1.6 DEMO 采用自定义项目使用许可。用户已批准 Web runtime 直接读取登记的官方完整 PNG 并接受作者回复前的残余风险；禁止原 ZIP、32/48px 版本、未采用目录、素材浏览/下载入口或素材包式产品。作者回复若附加条件则 forward-fix。

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
