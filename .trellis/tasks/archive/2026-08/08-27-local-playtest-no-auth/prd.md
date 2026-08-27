# 纯本地无账号试玩版

## Goal

在前期玩法验证阶段取消注册、登录及身份检查门禁，让玩家访问公开根路由 `/` 后直接进入本地单人世界菜单，仅验证玩法、操作、画面与本地存档。

## Background

- 当前 `apps/mirror-island/client/src/App.vue` 在启动时必须完成 Keycloak `login-required` PKCE 流程，然后才用 `client/src/auth/keycloak.ts` 从 Keycloak subject 派生的 SHA-256 `ownerKey` 初始化 GameSession。
- 实时玩法和存档已由浏览器本地 GameSession + IndexedDB 处理，不依赖 Keycloak、Prisma、PostgreSQL 或服务端 tick。
- 用户已确认试玩期不保留任何注册、登录、论坛账号或账号设置入口。
- 历史决策已明确 Keycloak 不应被固化为未来单机产品的强制前提；Keycloak、论坛 OIDC bridge、Prisma、PostgreSQL 暂时保留。

## Requirements

- `R1` 公开根路由 `/` 不得跳转 Keycloak、不得发起静默身份检查，并直接进入现有“新游戏 / 继续游戏”本地菜单。
- `R2` 产品界面不展示注册、登录、登出、论坛账号、账号设置或云存档入口。
- `R3` 客户端不初始化 `keycloak-js`，不启动 token 刷新计时器，也不因身份服务不可用而阻止游戏启动。
- `R4` 无账号试玩使用一个稳定的浏览器本地存档所有者键；同一 origin + 浏览器 profile 只有一个试玩农场，刷新后可继续。
- `R5` 不为试玩生成匿名设备 ID、用户记录或新账号体系；不把试玩身份写入 localStorage、sessionStorage 或服务端。
- `R6` 界面需明确告知存档仅存在当前浏览器，清除站点数据会丢失，且不支持跨设备同步。
- `R7` Keycloak、论坛 OIDC bridge、Prisma/PostgreSQL 服务、数据库、volume、secret 和部署能力本次不删除、不连接、不迁移；客户端只是停止依赖它们。
- `R8` 本次不改变 GameSession、SaveRepository、StoredGame 或 IndexedDB DB/store 的业务合同，只替换客户端传入的 opaque `ownerKey` 策略。
- `R9` 现有基于 Keycloak subject 派生的账号本地存档保持原样但在试玩版中暂时不可达；不枚举、删除、覆盖、合并或迁移旧账号存档。
- `R10` Keycloak realm 保留，但关闭独立用户注册；不删除旧账号、realm client 或论坛 Identity Provider。

## Out of Scope

- 云存档、跨设备同步、账号恢复、试玩存档与未来账号自动绑定或合并。
- 删除 Keycloak realm、关闭身份容器、删除论坛 SSO 桥、删除数据库或迁移。
- 新增匿名埋点身份、设备指纹、游客账号或服务端试玩会话。
- 改动采集、背包、制作、种田、小镇、NPC 或商店玩法。

## Acceptance Criteria

- [x] `AC1` 无 Keycloak session 且身份服务不可达时，访问 `/` 仍能看到本地菜单并开始新游戏。
- [x] `AC2` 从访问 `/` 到进入游戏的全程不出现账号入口，不发生 Keycloak/OIDC 导航或 token 请求。
- [x] `AC3` 新游戏可保存，同一浏览器刷新后“继续游戏”可用并恢复同一份存档。
- [x] `AC4` 身份服务、论坛 SSO 和数据库不会被本次改动删除或修改数据，也不是客户端启动前提。
- [x] `AC5` 界面清楚说明存档仅保存在当前浏览器，清除站点数据会丢失且不支持跨设备。
- [x] `AC6` 现有玩法 domain、StoredGame schema、IndexedDB DB/store 和存档恢复行为不因取消登录而发生其他改变。
- [x] `AC7` 启动试玩版不枚举或改写旧账号 `ownerKey` 下的 IndexedDB 记录，无账号存档使用独立固定键。
- [x] `AC8` Keycloak 配置不再允许独立注册，但现有 realm、client、论坛 Identity Provider 和数据均保留。

## Notes

- 用户已于 2026-08-27 审阅并批准 PRD/design/implement，任务已进入实施。
- 验证证据：typecheck、client build、`test:identity`、Compose config、静态身份残留检查和实际浏览器新游戏/刷新继续流程均通过。
