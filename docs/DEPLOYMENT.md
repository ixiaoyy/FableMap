# 镜像岛生产部署

## 公开路由

- 游戏：`https://fable.pingxingxian.space/`
- Keycloak：`https://fable.pingxingxian.space/identity/`
- 论坛 OIDC 桥：`https://fable.pingxingxian.space/forum-sso/`
- 冻结多人 WebSocket：`wss://fable.pingxingxian.space/parties/`（单人主线不使用，生产切换时移除）
- 媒体代理：`https://fable.pingxingxian.space/game-media/v1/`

`/mirror-island` 和 `/mirror-island/` 只返回 308 `/`，不存在第二份前端产物。

## 服务

| 服务 | 职责 | 持久化 |
|---|---|---|
| `frontend` | Nginx 和单份 Phaser/Vue client | 无 |
| `keycloak` | 保留的身份与论坛 Identity Broker；当前试玩客户端不接入 | `mirror_identity_db` |
| `mirror-identity-db` | Keycloak PostgreSQL 17 | `mirror_identity_db` volume |
| `mirror-game` | 论坛 OIDC 桥、health 与未来云存档/成就/排行榜 API；不参与实时玩法 | `mirror-game-db` |
| `mirror-game-db` | 游戏 PostgreSQL 17 | `mirror_game_db` volume |
| `mirror-game-migrate` | 一次性 `prisma migrate deploy` | 无 |

Keycloak 与游戏数据库使用不同服务、database、用户、密码和 volume。公开 `/` 使用固定本地试玩槽，不读取身份服务；`frontend` 不声明对 Keycloak 或 `mirror-game` 的启动依赖。Keycloak 关闭独立注册，但 realm、client、论坛 Identity Provider 和数据均保留。

`mirror-game` 保留镜像岛默认网络，并额外连接 ParallelLines `api` 当前使用的外部 Docker 网络；只有 `mirror-game` 进入该网络。生产部署从正在运行的 `api` 容器解析带精确 `api` 别名的唯一网络，不依赖固定 Compose 项目名，也不让 frontend、Keycloak 或数据库进入论坛网络。

## 私密配置

`deploy/server/configure_mirror_island.py` 在主机上生成 mode `0600` 的 `apps/mirror-island/.env.production`，并与 `/opt/parallellines/apps/api/.env` 同步现有票据密钥。输出只包含是否生成密钥和论坛 env 是否变化，不输出值。

受管理变量包括：

- Keycloak/PostgreSQL 凭据与 issuer/JWKS。
- 游戏 PostgreSQL 凭据与 `MIRROR_ISLAND_DATABASE_URL`。
- ParallelLines public/API base、共享 ticket secret。
- OIDC client secret 和两个 cookie signing key。

密钥不进入 GitHub artifact、Docker image、Vite 变量或日志。

## 迁移与发布顺序

1. 构建 frontend、game server 和一次性 migration 三个镜像。
2. 校验 `game/media/v1` manifest/CDN，并确认 browser 镜像不含 Prisma/pg/secret，game runtime 镜像不含 Prisma CLI。
3. 生成/复用两套数据库和 SSO 密钥，启动两个 PostgreSQL。
4. 对已有的 Keycloak/game database 分别生成非空 `pg_dump` gzip 备份。
5. 运行唯一 `20260819000000_mirror_island_baseline` migration；失败时不启动新 `mirror-game`。
6. 解析 ParallelLines `api` 的实际 Docker 网络，启动 Keycloak/mirror-game，并从 `mirror-game` 访问论坛 `/healthz` 后再应用 realm、主题、OIDC provider、client 和 user profile。
7. 替换 frontend，验证 `/`、`/identity/`、`/forum-sso/` 和 308 重定向；单人主线不以 `/parties/` 为健康条件。
8. 只在新系统健康后执行旧 FableSpace 永久清退。

应用启动不执行 DDL。不提供破坏性 down migration；正式接流量后的 schema 变更只能用新的 forward-fix migration。

## 旧系统永久清退

`deploy/server/retire_legacy_fablespace.py` 默认只输出精确清单，`--apply` 才执行：

- 删除 `backend`、`memory-worker`、`llm-proxy` 容器与 `fablespace-backend:local` 镜像。
- 只 `DROP DATABASE fablespace`，不删 ParallelLines 其他 database 或 DB user。
- 删除精确 `fablespace_fablespace_data` volume、旧 Schema/LLM/env 文件和非镜像岛备份。
- 保留 `backups/mirror-island-keycloak`、`backups/mirror-island-game`、两个镜像岛 volume 和论坛服务。

GitHub runner 随后只删除 R2 `fablespace/` prefix，删除前后核对 `game/` 对象数不变。这些删除无恢复路径。

## 验证

```powershell
npm --prefix .\apps\mirror-island run prisma:validate
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```

当前生产入口调整为 Phaser/Vue 纯本地无账号试玩。发布必须验证身份服务不可达时仍能新建/继续农场，浏览器无 Keycloak/OIDC 请求，且旧账号 owner key 下的 IndexedDB 记录不被枚举或改写。现有 v2→v3 原子 backup 合同保留，但试玩版不为旧账号存档提供入口或迁移。

浏览器 v2 backup 使用现有 `mirror-island-local/game-saves` store 和 owner/slot scoped backup key，不改变 IndexedDB database version 或 SaveRepository port。该备份只用于 forward-fix 恢复，不进入玩法 snapshot；用户显式删除 slot 时主记录与 backup 同时删除。
