# 纯本地无账号试玩版实施计划

## Scope and affected flow

项目：`apps/mirror-island/` 公开 Phaser/Vue Web 客户端、浏览器构建配置、Keycloak realm 注册开关与权威文档。

调用链改动：

```text
App.onMounted
- old: initializeKeycloakSession -> deriveLocalSaveOwnerKey(subject) -> initializeLocalGameSession
- new: loadWorldCatalog -> initializeLocalPlaytestGameSession -> hasSave
```

GameSession、玩法 command/snapshot、StoredGame 与 IndexedDB adapter 不改变。

## Implementation steps

1. 更新权威产品合同：根 `AGENTS.md`、`README.md`、`docs/PRODUCT_BRIEF.md`、`docs/WHAT_NOT_TO_BUILD.md`、`docs/DEPLOYMENT.md` 和 frontend spec 改为无账号试玩，同时记录身份基础设施保留边界。
2. 在 `client/src/session/local-game-session.ts` 建立唯一固定试玩 owner key owner，并保留 tool-art preview 槽隔离。
3. 修改 `client/src/App.vue`：删除 Keycloak import/session 生命周期，直接启动本地 session，替换身份/账号文案，增加本地存档限制说明。
4. 修改 `client/src/stores/game-store.ts` 和 `client/src/style.css`，将 `authenticating` 改为本地初始化阶段，保持 loading/menu/playing/error 转换。
5. 删除已无客户端消费者的 `client/src/auth/keycloak.ts`、`keycloak-js` 依赖与 `OPEN_SOURCE_ADOPTION.md` 登记，用 npm 机械更新 lockfile。
6. 删除 `client/src/vite-env.d.ts`、根/应用 `.env.example`、`Dockerfile.web` 和根 `docker-compose.yml` 中已无效的 `VITE_KEYCLOAK_*` browser 配置，并删除部署 overlay 中 `frontend` 对 Keycloak/`mirror-game` 的启动依赖。
7. 将 `keycloak/mirror-island-realm.json` 的独立注册关闭；不删除 realm、client、Identity Provider、论坛 bridge 或数据库资源。
8. 全局检索客户端身份 import、`VITE_KEYCLOAK_*`、账号文案和过期合同，只保留明确属于服务端保留边界的 Keycloak/OIDC 引用。

## Existing-change protection

- 实施前重新检查 `git status` 和所有目标文件完整 diff。
- 若 `App.vue`、`style.css` 或 session 文件出现其他任务改动，只做局部合并，不使用整文件 restore/checkout。
- 删除 auth adapter 前再次确认全部 import；删除目标是单个明确文件，不使用递归删除。

## Verification

自动最小检查：

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run test:identity
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```

静态核对：

- 客户端 bundle source 无 `keycloak-js`、`initializeKeycloakSession`、`deriveLocalSaveOwnerKey` 和 `VITE_KEYCLOAK_*`。
- 服务端 `oidc-provider`、Keycloak realm/client、论坛 bridge 和数据库部署定义仍存在。
- 变更未新增 migration，未连接数据库，未枚举或删除 IndexedDB 旧账号记录。

人工验收：

1. 无 Keycloak cookie，且身份服务停止/不可达时访问 `/`。
2. 确认页面不跳转、不展示账号入口，直接出现新游戏/继续游戏。
3. 新建农场，完成一次会触发存档的玩法操作，刷新后继续并核对状态。
4. 在 Network 面板确认无 `/identity/`、OIDC discovery、authorize 或 token 请求。
5. 确认本地存档丢失/不跨设备提示在菜单可见。

## Staging and handoff

- 通过最小验证后，仅对本需求的生产代码和配置执行 `git add`。
- 任务 PRD/design/implement 文档不自动暂存。
- 最终交付说明旧账号存档未删除但暂时不可达，并列出未执行的数据库/基础设施操作。
