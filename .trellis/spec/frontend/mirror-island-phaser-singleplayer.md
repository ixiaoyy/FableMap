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
- IndexedDB adapter 使用固定 DB `mirror-island-local`、store `game-saves`；当前 save schema v2 已包含 region，旧 v1 只通过显式 decoder 迁移，不使用 localStorage 保存玩法。
- save value 包含 schema version、updatedAt、玩家、背包、资源和农田；读取从 unknown 完整验证，未来/损坏版本明确失败。
- token、ticket、密码、Keycloak 对象、数据库 URL 和 secret 禁止写入 IndexedDB；ownerKey 由身份 adapter 提供。
- 关键玩法事件立即排队保存，移动使用有界 debounce，页面隐藏/退出调用 flush；不得逐帧写盘。
- 持久化拓扑固定为 `GameSession -> SaveRepository -> IndexedDB（当前 Web）/ FileSystem（未来 Tauri）`；当前只实现 IndexedDB，不把 filesystem、Rust command 或桌面路径渗入 domain。

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
- 第三批：时间/昼夜/睡觉跨日、按天成长、金币、商店和 3 个 NPC。
- A/B/C 技术提交不等于 World Foundation 通过；真人完整走通农场、城镇、室内、对话、返回、刷新恢复、200% zoom 与账号隔离前，第三批不得开始。
- 当前禁止多人、战斗、科技树、NPC 招募、复杂剧情、书屋和《聊斋》内容。
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

## Local art prototype profile

**What**：正式 Farm 默认使用 VectoRaith compact map、tileset binding、玩家与实体 atlas；非 Farm 区域继续使用占位 profile。profile 选择仍只存在 client 表现层。

**Why**：许可仍 pending，需要真实 Phaser/GameSession 验证但不能让正式 runtime、manifest 或 CDN 依赖不可分发素材。

```typescript
// Correct: presentation shell resolves a local profile; domain receives only the decoded catalog.
const mapUrl = "/map/farm.tmj";
const factory = new EntityFactory(scene, entityMediaForRegion(regionId));

// Wrong: persist an art profile or atlas frame in domain state.
gameState.player.tileset = "vectoraith";
```

- Production source root：同源 `/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/`；只含 5 个 manifest 登记的最小派生 PNG。
- Runtime source tiles remain original 16×16; Phaser uses `pixelArt`、`roundPixels` 与 2× integer camera zoom，不采用 32/48px upscaled tileset。
- Missing local file or decoder failure → visible media/startup error；不得静默回退未知素材。
- Required checks：candidate decoder + 23 stable object equality + route Collision replay + typecheck + client build；浏览器画布验收仍需可用的 Keycloak session。
- Checkpoint 后只有真实游玩发现的明确碰撞、树脚、路径或院落操作问题允许修改 Farm v1；不以偏好性微调重开 Gate A/B/C。

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
- VectoRaith v1.08 采用自定义项目使用许可。用户已批准把最小派生 atlas 的 Web runtime delivery 视为游戏内嵌使用并接受作者回复前的残余风险；禁止原 ZIP、完整 sheet、素材下载入口或素材包式再分发。作者回复若附加条件则 forward-fix。

## Verification

- 默认只运行 TypeScript、client build、必要 server build 和配置解析；不扩建大规模自动测试矩阵。
- 修改 Keycloak、论坛 OIDC bridge、反向代理或 server image 时，运行现有 `test:identity`；生产 server image 构建固定先执行该合同测试，确保带路径 issuer 的 discovery 与真实授权 route 一致。
- 人工浏览器验收新游戏、继续游戏、本地玩法闭环、刷新恢复和损坏存档错误状态。
- 默认不连接数据库、不新增 migration；生产部署只在用户明确授权后执行。

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run test:identity
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```
