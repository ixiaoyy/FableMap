# 纯本地无账号试玩版技术设计

## Architecture

公开 Web 客户端的启动链路改为：

```text
/ -> App.onMounted
   -> removeRetiredLocalStorageSaves
   -> loadWorldCatalog
   -> initializeLocalPlaytestGameSession(catalog)
   -> hasSave
   -> menu -> newGame / continueGame
   -> GameSession -> IndexedDbSaveRepository
```

客户端不再实例化 `keycloak-js`，不再根据 subject 派生 `ownerKey`，也不向 Keycloak/OIDC 发出请求。GameSession、SaveRepository 和 IndexedDB 格式均保持不变。

## Ownership and contracts

- 无账号存档 owner key 是客户端 session adapter 内部拥有的固定 opaque 常量 `local-playtest-v1`，`App.vue` 只调用 `initializeLocalPlaytestGameSession(catalog)`；它不是用户 ID、设备 ID 或可识别信息。
- 正式试玩与现有 tool-art 隔离预览使用不同 owner key，候选美术预览不得覆盖试玩存档。
- `IndexedDbSaveRepository.has/load/save/delete` 仍使用 `ownerKey:slotId`；不枚举 object store，因此旧 SHA-256 owner key 下的记录不会被读取或修改。
- `StoredGame`、save schema version、DB `mirror-island-local` 和 store `game-saves` 不变；不创建 migration。

## Client changes

- `client/src/App.vue`：删除身份初始化、session dispose 和账号文案；直接初始化本地 session，并展示本地存档丢失/不跨设备提示。
- `client/src/session/local-game-session.ts`：集中拥有试玩 owner key，保留方法级注释与 GameSession 注入边界。
- `client/src/stores/game-store.ts` 与 `client/src/style.css`：把 `authenticating` 阶段改为语义正确的本地初始化阶段，不保留身份命名。
- 删除只有公开 Web 客户端使用的 `client/src/auth/keycloak.ts` 与 `keycloak-js` npm dependency；服务端 `oidc-provider`、Keycloak realm 和论坛桥不属于该删除范围。

## Build and deployment boundary

- 删除公开 Web bundle 已不使用的 `VITE_KEYCLOAK_*` 类型、env 样例、Docker build args 和 Compose build args。
- 删除部署 overlay 中 `frontend` 对 Keycloak 和 `mirror-game` 的 `depends_on`，使静态试玩前端能独立启动和提供服务。
- Keycloak realm、`mirror-island-web` client、论坛 Identity Provider、SSO bridge、identity/game PostgreSQL、volumes 与 secrets 保留。
- realm 的独立注册开关设为关闭，避免身份入口被直接打开时继续创建试玩阶段不使用的独立账号；现有 realm 数据不删除。

## Authoritative documentation

最新用户决策需同步到根 `AGENTS.md`、`README.md`、`docs/PRODUCT_BRIEF.md`、`docs/WHAT_NOT_TO_BUILD.md`、`docs/DEPLOYMENT.md` 和 `.trellis/spec/frontend/mirror-island-phaser-singleplayer.md`，明确“公开 Web 现为纯本地无账号试玩，身份基础设施仅保留”。`OPEN_SOURCE_ADOPTION.md` 删除已不采用的 browser `keycloak-js` 记录。

## Compatibility and data handling

- 新试玩存档与旧账号存档并存于同一 IndexedDB store，但 key 空间隔离。
- 不提供旧账号存档的 UI 入口、自动选择、迁移或删除。
- 未来重新引入账号时，必须单独评审本地试玩槽与账号槽的选择/合并规则，不在本任务预留自动行为。

## Failure behavior

- 世界 catalog 或 IndexedDB 初始化失败：进入现有可恢复错误界面，不跳转身份页。
- Keycloak、论坛桥或数据库离线：不影响 `frontend` 容器启动、客户端启动、新游戏或继续游戏。
- 清除浏览器站点数据：视为无存档，界面已明示该限制。

## Rollback

如需恢复身份入口，以精确 diff 恢复客户端 auth adapter、browser env 和 Keycloak 注册开关；无账号 `local-playtest-v1` 记录不自动并入任何账号。
