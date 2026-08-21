# Mirror Island Phaser/Colyseus

## Ownership

- 唯一应用位于 `apps/mirror-island/`；公开 `/` 只服务一份 Phaser/Vue client。
- `client/` 负责输入、地图/实体表现、插值和 Vue UI；`server/` 负责 Colyseus Room、认证 adapter、权威玩法和 checkpoint；`shared/` 负责类型化消息、Schema、物品、配方和纯规则。
- RPGJS 已冻结在 `rpgjs-checkpoint-2026-08-21`，不合并、不部署、不继续双线开发。
- `/mirror-island` 只 308 到 `/`；`/identity/`、`/forum-sso/`、`/parties/` 和 `/game-media/v1/` 继续同源路由。

## Open-source contract

- 客户端固定 `phaser@4.2.1`、`vue@3.5.41`；服务端固定 `colyseus@0.17.10`、`@colyseus/sdk@0.17.43`、`@colyseus/schema@4.0.31`。
- 构建继续使用当前 Vite 8、TypeScript 6 和 Vue plugin 6；纵向切片完成前不追版本或使用漂移 tag。
- 官方 Phaser Vue TS 模板固定 `2fe6c3e42a877422c0f13e85634fb6ca16fca49b`，只采用生命周期和工程结构。
- Cabacos 固定 `79e423defc12bd99327cfcc28bf7ec0085996244`，只做规则级清洁移植；其 LICENSE holder 未澄清前不大段逐行复制。
- Rick Survival 固定 `ea9738ce922423d91b1ec51c21be8632bd3ea660`，首阶段不采用代码或素材，后续仅参考战斗结构。

## Authoritative runtime contract

```text
Input -> typed intent -> decoder -> WorldRoom command -> authoritative mutation
      -> Colyseus Schema patch -> client projection -> Phaser/Vue
```

- 客户端只发送移动轴、目标 ID、槽位、配方 ID 和农田动作；不得发送最终位置、物品数量、掉落结果或作物阶段。
- WorldRoom 使用 20 Hz server tick 计算移动，客户端对权威位置插值；首阶段不做预测、rollback、ECS 或分布式 room。
- 资源、背包、制作和农田只能由 server system 修改，Vue/Phaser 不维护第二份玩法 reducer。
- 同一树节点先同步转为 depleted/revision+1，再给唯一成功玩家结算；随后到达的命令固定失败且不掉落。
- 玩家断线后从在线 Schema 删除；位置、背包和农田 checkpoint 按 Keycloak subject 保存在 persistence interface 中。

## Authentication contract

- Keycloak 管理独立账号和论坛 federated identity；浏览器 token 只存在 `keycloak-js` 内存。
- Colyseus 加入请求通过同源 TLS body/options 传递短期 access token，禁止 URL、localStorage、sessionStorage、Cookie 和日志。
- `onAuth` 只接受 RS256、正确 issuer/audience/exp 和非空 `sub`；失败不降级游客，Room state 不包含 token。
- 论坛 ticket 仍只由服务端兑换并实时 introspect；OIDC bridge 的 P-256/ES256 key、PKCE、interaction cookie 和静态 client 合同保持不变。
- `/opt/fablespace` 与 `/opt/parallellines` 是独立 Compose 项目；只有 `mirror-game` 加入动态解析且含 `api` alias 的论坛外部网络，并从真实 caller 容器请求论坛 `/healthz`。

## Persistence contract

- Colyseus memory 是实时真相；移动、tick 和普通 state patch 不写 PostgreSQL。
- `GamePersistence` 只暴露 load/save player/world checkpoint；关键事件、离房和低频 dirty flush 才调用。
- 首个纵向切片使用 in-memory adapter，不连接数据库；刷新和重新加入只保证同一服务进程内恢复。
- 现有九表基线和单 migration 保持不变。Schema 不足时先提交结构/影响/部署评审，禁止偷偷塞 JSONB、启动时建表或新增未批准 migration。
- Keycloak 和游戏库继续分库、分凭据、分 volume；Prisma/pg/数据库 URL 不得进入 browser graph。

## Open-source media adoption

- 默认允许 CC0、CC-BY、MIT、BSD-2/3-Clause、Apache-2.0 且明确覆盖目标素材、商用和再分发；NC、ND、个人使用和来源不明禁止。
- 只从作者官网、官方仓库或官方发行包取材，固定 tag/commit/snapshot；不从候选游戏仓库或镜像复制图片。
- 每项记录作者、官方来源、固定版本、许可证、原路径、处理、尺寸、bytes、MIME、SHA-256 和对象 key；CC-BY 同步用户可访问 NOTICE/Credits。
- 采用项先进入不可变 `game/media/v1` 并登记 `deploy/cdn/game-media-manifest.json`；Git 不跟踪游戏图片二进制。

## Verification convention

- 默认自动检查仅覆盖 TypeScript、模块导入、配置解析和必要 client/server build；不扩建大规模 unit、contract、integration、E2E 或数据库测试矩阵。
- 双账号同房、权威移动、同树单次结算、Hotbar、制作、农田、刷新、断线和重连由人工浏览器验收。
- 数据库连接始终需要用户新的明确授权；不得连接生产数据库做测试。

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```

## Deployment boundary

- 迁移分支在人工纵向切片验收前不部署；当前生产继续运行冻结前的 RPGJS revision。
- 切换时保留 `/`、Keycloak、论坛 OIDC、`/parties/`、媒体和数据库服务名，只替换 client build 与 game server runtime。
- browser image 不含 Prisma/pg/secret；runtime image 不含 Prisma CLI；migration 继续由一次性镜像执行。
- 健康 endpoint 只证明进程；身份需真实 authorization 探针，多人需双客户端房间验收，持久化需获授权后跨 adapter/进程验证。
