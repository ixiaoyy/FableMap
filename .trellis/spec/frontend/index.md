# 镜像岛开发规范

## Scope

当前唯一应用是 `apps/mirror-island/` Phaser/Vue + Colyseus 权威共享世界。旧本地单机 Phaser、RPGJS、FastAPI 和 StoryWorld 不是兼容面。

## Guideline

- [Mirror Island Phaser/Colyseus](mirror-island-phaser-colyseus.md) — 客户端/服务端/shared、Keycloak、论坛 OIDC、持久化、路由、素材和部署合同。

## Pre-Development Checklist

1. 读取根 `AGENTS.md`、当前任务 PRD/design/implement 和 `mirror-island-phaser-colyseus.md`。
2. 新 helper/常量/配置前搜索现有所有者，不复制 payload 解码、路由或密钥合同。
3. 区分 browser、Keycloak、OIDC bridge、Colyseus Room、Prisma 和 deployment env 的信任边界。
4. 不让 Prisma/pg/SSO secret 进入 browser bundle；客户端只发送意图，server/shared 只有一个权威规则 owner。
5. 只引用 `game-media-manifest.json` 已登记的 HTTPS/同源代理资源，Git 不新增图片二进制。
6. 数据库改动先核对单 migration、部署顺序、备份和 forward-fix 边界。

## Verification Baseline

只选择与改动直接相关的最小子集；默认不运行或扩建全量自动测试矩阵：

```powershell
npm --prefix .\apps\mirror-island run prisma:validate
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```

既有自动测试也允许在触及相关区域时删除、合并或降级；玩法、多人、重连、视觉、身份和持久化正确性以人工测试反馈为主。只有用户明确授权时才连接隔离 PostgreSQL，禁止用生产数据库做测试。
