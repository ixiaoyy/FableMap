# 镜像岛

镜像岛是一款东方风格、未来拥有独立剧情的星露谷式单人 Web 像素生活 RPG。当前只做正常种田、采集、钓鱼与日常社交，不做剧情、节庆或远征；主线由 Phaser/Vue、GameSession、纯 TypeScript 规则和 IndexedDB 本地存档组成。

RPGJS 和 Phaser/Colyseus 多人技术切片均已封存，不再是活跃运行时。公开根入口 `/` 只服务镜像岛单人主线。

当前版本已实现春季基础玩法 v10：午夜提醒、02:00 昏倒、体力与天气、自由耕地、水壶补水、六作物、资源再生、钓鱼和送礼。相关自动检查通过，真人验收仍待完成；部署结果以 main 发布流水线为准，详见 [当前状态](docs/CURRENT_STATE.md)。

## 新主线底座

- Phaser `4.2.1` + Vue 3 + TypeScript + Vite：地图、角色表现、输入和 Web UI。
- GameSession + 纯 TypeScript domain：背包、采集、制作、种田和本地状态 owner。
- 原生 IndexedDB：版本化单人存档；不使用 localStorage 保存玩法状态。
- Keycloak `26.7.1`：保留的身份与论坛 OIDC 代理基础设施；当前试玩客户端不接入。
- `oidc-provider` `9.11.1`：将 ParallelLines 现有一次性票据适配为标准 OIDC。
- Prisma `7.9.1` + PostgreSQL 17：玩家资料、存档、背包、动态格、区块、住宅和全服结算。
- Nginx：`/`、`/identity/`、`/forum-sso/` 和 `/game-media/v1/` 同域路由；单人玩法不提供 WebSocket 路由。

## 本地开发

```powershell
npm --prefix .\apps\mirror-island install
Copy-Item .\apps\mirror-island\.env.example .\apps\mirror-island\.env
npm --prefix .\apps\mirror-island run dev:client
```

公开 `/` 直接进入无账号本地试玩，不需要启动 Keycloak、游戏服务端或 PostgreSQL。单人实时玩法不读取 `MIRROR_ISLAND_DATABASE_URL`；Prisma/PostgreSQL 只为未来云存档等后端能力保留，实际接入需要单独评审和授权。不要将生产连接串、Keycloak 管理密码、论坛 SSO secret 或 OIDC cookie key 写入仓库。

## 最小检查

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
```

数据库只有一个已评审 migration，位于 `apps/mirror-island/prisma/migrations/20260819000000_mirror_island_baseline/`。生产通过一次性 migration 镜像执行 `prisma migrate deploy`，不在游戏启动时建表。

## 资源

游戏图片优先使用经许可审核和登记的成熟素材。正式 Farm/Town 直接使用 VectoRaith Farming Sim v1.08 的 6 张官方 Original/16×16 PNG，不再裁剪、重排、合图或重编码；Ninja Adventure 只保留室内技术占位。采用项位于不可变 `game/media/v1` CDN 命名空间，Git 不跟踪游戏图片二进制。详见 [图片与美术规范](docs/IMAGE_ASSETS_SPEC.md)。

## 文档

- [文档索引](docs/INDEX.md)
- [当前状态](docs/CURRENT_STATE.md)
- [产品简报](docs/PRODUCT_BRIEF.md)
- [明确不做](docs/WHAT_NOT_TO_BUILD.md)
- [Town 后续开发路线图](docs/TOWN_ROADMAP.md)
- [现阶段精细化验收门禁](docs/CURRENT_SLICE_POLISH_GATE.md)
- [生产部署](docs/DEPLOYMENT.md)
- [Phaser 单人运行时规范](.trellis/spec/frontend/mirror-island-phaser-singleplayer.md)
