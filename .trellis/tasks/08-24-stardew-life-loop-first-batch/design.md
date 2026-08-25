# 技术设计

## Runtime flow

```text
Tiled bed / Seed Keeper proximity
  -> Phaser E input
  -> typed GameCommand
  -> GameSession
       -> Calendar/Sleep settlement
       -> FarmingSystem day settlement
       -> ShopSystem atomic buy/sell
       -> InventorySystem
  -> immutable GameState snapshot
  -> Phaser/Vue HUD + ShopPanel
  -> SaveRepository -> IndexedDB
```

- GameSession 继续拥有唯一 mutable state，并负责关键 mutation 后排队保存。
- Phaser 只解析最近的 typed interaction/NPC 并发命令；Vue ShopPanel 不读取价格常量或直接改库存。
- `SaveRepository` 和 `IndexedDbSaveRepository` 无接口变化。

## GameState v3

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
```

- 删除 `readyAt`；day settlement 是唯一 growth owner。
- `deriveGameDate(day)` 为纯函数：28 天/季、春夏秋冬、4 季/年；第一批 HUD 只显示季节与当季日，不做时钟。
- 金币和日期随 clone/decode/migration/save 完整 round-trip。

## Commands and results

```typescript
type GameCommand =
  | ExistingCommands
  | { type: "sleep"; bedId: string }
  | { type: "buy-item"; itemId: "turnip-seed"; quantity: 1 }
  | { type: "sell-item"; itemId: "turnip"; quantity: 1 };
```

- `sleep` 校验 interaction kind、region 和 42px 距离；成功后同步 settle crops/day/player，再单次 critical save。
- `ShopSystem` 使用固定 catalog `{turnip-seed: buy 20, turnip: sell 35}`；buy 先验证 gold 与完整容量，sell 先验证完整库存，再 mutation。
- 交易结果使用 closed union，GameSession 唯一映射为中文 feedback。

## Cottage and shop presentation

- `domain/world/regions.ts` 与 Tiled decoder 增加 `bed` interaction kind；Cottage TMJ 新增 stable `cottage-bed`，位置由 Tiled 人工确认且不修改其他 ID。
- WorldScene E 输入优先级：最近 bed → sleep；Seed Shop 最近 NPC → 打开 ShopPanel；无目标时固定错误反馈。
- ShopPanel state 只包含 open/closed、snapshot gold 与 inventory projection；按钮 dispatch typed buy/sell command。
- HUD 在现有 GameView/DebugShell 复用同一个 derived date/gold projection，不在 Phaser/Vue 各自计算 calendar。

## v2 to v3 migration

- `decodeStoredGame` 继续接受已发布 v1/v2；新增显式 `migrateGameStateV2`。
- inventory slot ID：`alien-seed → turnip-seed`、`alien-crop → turnip`。
- FarmTile crop ID 同样映射；合法 phase 保留，`growthStage` 规范到 0–3，删除 `readyAt`。
- day=1、gold=100；watered 原值保留，使用户下一次主动睡觉决定是否增长。
- migration 只在内存返回 v3；下一次保存写回 v3。失败不覆盖原 IndexedDB record。

## Compatibility and rollback

- 当前 Farm Showcase、23 stable object、WorldCatalog 区域和 VectoRaith profile 不重排。
- 新 bed object 是唯一地图对象新增；Seed Keeper ID 与 Dialogue ID 保留。
- 若实现发现 Farm 人工验收未通过，停止任务并回到 checkpoint 窄修复，不并行开发 Life Loop。
- 回滚移除 v3 命令/UI前必须保留能读取已写 v3 存档的 forward-fix 路径；不能降级后静默丢档。

## Open-source review boundary

- 实现前检索维护中的 TypeScript calendar/economy/state-machine 方案并记录许可证与退出成本。
- 当前规则仅为整数日期派生、固定 1 商品价格和已有 closed state machine；若库的接入面积大于这些纯函数/薄 domain service，记录拒绝原因并最小自研。

## Verification

- 自动：typecheck、client build、v2→v3 decode、三次 watered sleep、未浇水不增长、buy/sell 原子失败与成功。
- 人工：登录后完整 10 分钟循环、床交互、HUD、ShopPanel、刷新继续与 Farm/Town/Cottage/Seed Shop 往返。
- 不连接 PostgreSQL、不新增 Prisma migration、不部署生产。
