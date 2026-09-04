# 镜像岛开发规范

## Scope

当前唯一应用是 `apps/mirror-island/` Phaser/Vue + GameSession + IndexedDB 单人世界。RPGJS 和 Colyseus 多人切片均已封存，不是活跃兼容面。

开发阶段的浏览器本地 gameplay save 只保证 current schema；新增状态不为此前开发版本增加 migration、回填或备份。该约定不适用于数据库、论坛、身份、媒体或部署数据，完整合同见主规范顶部的 `Active development save reset policy`。

## Guideline

- [Mirror Island Phaser Single-player](mirror-island-phaser-singleplayer.md) — current v12 地表采矿/除草、GameSession/domain、IndexedDB、Keycloak、论坛 OIDC、后端保留、素材和部署合同。

## Pre-Development Checklist

1. 读取根 `AGENTS.md`、当前任务 PRD/design/implement 和 `mirror-island-phaser-singleplayer.md`。
2. 新 helper/常量/配置前搜索现有所有者，不复制 payload 解码、路由或密钥合同。
3. 区分 browser GameSession、IndexedDB、Keycloak、OIDC bridge、未来云 API、Prisma 和 deployment env 的信任边界。
4. 不让 Prisma/pg/SSO secret 进入 browser bundle；domain 只有一个规则 owner，Phaser/Vue 不复制状态机。
5. 只引用 `game-media-manifest.json` 已登记的 HTTPS/同源代理资源，Git 不新增游戏图片或音频二进制。
6. 数据库改动先核对单 migration、部署顺序、备份和 forward-fix 边界。
7. 改 GameState/StoredGame 时只设计完整 current shape 和同版本恢复；除非用户重新声明兼容基线，不维护旧开发存档迁移或测试。

## Verification Baseline

只选择与改动直接相关的最小子集；默认不运行或扩建全量自动测试矩阵：

```powershell
npm --prefix .\apps\mirror-island run prisma:validate
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```

既有自动测试也允许在触及相关区域时删除、合并或降级；玩法、IndexedDB 恢复、视觉、身份和业务正确性以人工测试反馈为主。只有用户明确授权时才连接隔离 PostgreSQL，禁止用生产数据库做测试。
