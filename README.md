# 镜像岛

镜像岛是一款东方风格、未来拥有独立剧情的星露谷式单人 Web 像素生活 RPG。当前只做正常种田、采集、钓鱼与日常社交，不做剧情、节庆或远征；主线由 Phaser/Vue、GameSession、纯 TypeScript 规则和 IndexedDB 本地存档组成。

RPGJS 和 Phaser/Colyseus 多人技术切片均已封存，不再是活跃运行时。公开根入口 `/` 只服务镜像岛单人主线。

当前工作区为 **v13 仓储与出货切片**，位于 `codex/storage-shipping-v1`：在 12 个区域、六种春作、时间/体力/天气、钓鱼、NPC 与宠物、地表工具基础上，接入 12→24→36 背包、12 格活动快捷栏、制作入口、箱子存取与摆放、隔夜出货和墨子木匠服务。当前实现待浏览器与真人完整路线验收；技能、矿洞和真实四季仍待开发。

地表工具、小屋与两处商店精修均已提交并进入本地 `main`。春季 v10 有历史真人通过记录；后续批次的真人反馈和当前部署需分别核验，详见 [当前状态](docs/CURRENT_STATE.md)。

**当前：完成农场仓储与出货 v1 的验证和验收**。本 child 已单独启动；下一阶段固定为技能与配方，再按矿洞/冶炼/工具 → 完整矿洞战斗 → 四季 → 自动化 → 鸡舍 → 加工 → 烹饪 → 小镇共建推进。后续 child 仍为规划，详细顺序与验收见 [开发计划](docs/DEVELOPMENT_PLAN.md)。

## 新主线底座

- Phaser `4.2.1` + Vue 3 + TypeScript + Vite：地图、角色表现、输入和 Web UI。
- GameSession + 纯 TypeScript domain：背包、采集、制作、种田和本地状态 owner。
- 原生 IndexedDB：版本化单人存档；不使用 localStorage 保存玩法状态。
- Keycloak `26.7.1`：保留的身份与论坛 OIDC 代理基础设施；当前试玩客户端不接入。
- `oidc-provider` `9.11.1`：将 ParallelLines 现有一次性票据适配为标准 OIDC。
- Prisma `7.9.1` + PostgreSQL 17：保留已评审的后端数据基础设施，未来云能力另行评审；当前本地玩法不接入。
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
- [下一步开发计划](docs/DEVELOPMENT_PLAN.md)
- [产品简报](docs/PRODUCT_BRIEF.md)
- [明确不做](docs/WHAT_NOT_TO_BUILD.md)
- [Town 后续开发路线图](docs/TOWN_ROADMAP.md)
- [现阶段精细化验收门禁](docs/CURRENT_SLICE_POLISH_GATE.md)
- [生产部署](docs/DEPLOYMENT.md)
- [Phaser 单人运行时规范](.trellis/spec/frontend/mirror-island-phaser-singleplayer.md)
