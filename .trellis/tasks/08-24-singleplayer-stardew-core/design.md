# 技术设计

## 目标调用链

```text
Phaser input / Vue action
        -> GameCommand
        -> GameSession
        -> Inventory / Gathering / Crafting / Farming
        -> immutable GameSnapshot
        -> Phaser renderer + Vue projection
        -> SaveRepository (debounced / key event)
        -> IndexedDB adapter
```

- GameSession 是唯一 mutable aggregate；UI 不直接取得内部对象，只订阅结构化 clone/frozen snapshot。
- Domain command 使用封闭联合：move、gather、craft、farm、new/load/save。输入在 GameSession 边界验证一次。
- Domain systems 通过普通对象/数组工作，不继承 Colyseus Schema，不依赖 renderer 或 storage。
- GameSession 的每次命令同步完成状态转换，再异步排队保存；保存失败只更新可见 persistence status，不撤销已经发生的本地帧状态。

## 目录边界

```text
apps/mirror-island/
├── domain/
│   ├── session/
│   ├── inventory/
│   ├── gathering/
│   ├── crafting/
│   ├── farming/
│   ├── items/
│   └── persistence/
├── client/src/
│   ├── game/
│   ├── ui/
│   ├── stores/
│   └── persistence/IndexedDbSaveRepository.ts
├── server/        # 只保留身份、论坛 SSO 和未来非实时 API
└── src/{sso,persistence,generated}/
```

现有 `shared/items`、`shared/recipes` 和 server systems 采用移动/重构，不复制两套规则；新 domain 成为唯一 source of truth。

## Domain state

```typescript
interface GameState {
  version: 1;
  player: { x: number; y: number };
  inventory: InventorySlot[];
  resources: Record<ResourceId, ResourceState>;
  farmTiles: Record<FarmTileId, FarmTileState>;
}
```

- Item/Recipe ID 和最大堆叠继续由固定定义拥有。
- Inventory 命令保持完整添加、原子消耗和失败回滚。
- Gathering 在一个同步 reducer 中检查 available、距离和容量，随后 depletion + add wood。
- Farming 保持封闭 phase switch；成熟时间以可保存的 `readyAt` 表示，GameSession tick/恢复时结算。

## GameSession lifecycle

- `newGame(ownerKey)` 创建确定性第一版世界、起始位置和初始工具，然后立即保存。
- `continueGame(ownerKey)` 加载、验证并替换 aggregate；无存档返回明确结果，不自动新建。
- `dispatch(command)` 同步执行 domain transition，发布 snapshot，并按命令类型立即或 debounce 保存。
- `flush()` 等待最后一次排队保存，用于页面隐藏、退出和测试边界。
- ownerKey 由身份层传入；GameSession 不读取 Keycloak、token 或浏览器账号状态。

## SaveRepository 与 IndexedDB

```typescript
interface SaveRepository {
  has(ownerKey: string, slot: string): Promise<boolean>;
  load(ownerKey: string, slot: string): Promise<StoredGame | null>;
  save(ownerKey: string, slot: string, value: StoredGame): Promise<void>;
  delete(ownerKey: string, slot: string): Promise<void>;
}
```

- 使用原生 IndexedDB。已检索 `idb@8.0.3`，其 ISC 许可证不在项目默认 allowlist；接口窄且原生薄层成本更低，因此暂不引入新依赖并记录拒绝原因。
- DB：`mirror-island-local`，版本 1；store：`game-saves`；key：`${ownerKey}:${slot}`。
- value 只保存 version、updatedAt 和 domain snapshot；不保存 Keycloak subject 原文之外的认证对象，更不保存 token/ticket。ownerKey 的生成由身份 adapter 负责。
- 每次写入使用单 object-store readwrite transaction，并等待 transaction complete；升级只在 `onupgradeneeded` 创建 store。
- decoder 从 `unknown` 验证 version、数组长度、item IDs、数量、坐标和 farm phase；未来版本直接拒绝。

## 后端保留边界

- 保留 Keycloak client 初始化、Forum SSO bridge、Prisma schema/client、Docker、Nginx 和 CI 文件。
- 删除 active gameplay 对 Colyseus SDK/Core/Schema/WS transport 的依赖；Express server 只承载 `/forum-sso/` 与 `/health`，不创建 WorldRoom。
- 本任务不实现云存档 API，不让 IndexedDB adapter调用后端。

## 兼容与回滚

- 多人技术切片由远端 tag `phaser-colyseus-checkpoint-2026-08-24` 永久保留；本分支不需要保留可切换的双运行时。
- 不迁移 Colyseus in-memory checkpoint 到 IndexedDB；单人新游戏使用新的 schema version 1。
- 旧 `farm-game.save.v1`–`v4` localStorage key 仍只精确删除，不枚举或清空其他 origin storage。

## 验证

- 自动最小门槛：TypeScript、client build、必要 server build、diff/config 检查。
- 一次性窄诊断可验证纯 domain 的采集、制作、农田转换和 save encode/decode；不建立大测试矩阵。
- 人工浏览器负责 IndexedDB 新游戏/继续、刷新恢复和实际 Phaser/Vue 操作。
- 不连接 PostgreSQL/Keycloak database，不新增 migration，不部署生产。
