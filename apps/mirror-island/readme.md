# 镜像岛 Phaser 单人主线

安装并启动本地依赖：

```powershell
npm install
Copy-Item .env.example .env
npm run dev:client
npm run dev:server
```

- Keycloak：`http://127.0.0.1:8081`
- 身份/论坛 SSO 服务：`http://127.0.0.1:3001`（不参与实时玩法）
- Vite：`http://127.0.0.1:8080/`

正式游戏要求 Keycloak 会话；本地 GameSession 通过 IndexedDB SaveRepository 保存单人状态，不启动 gameplay server。论坛登录仍经 `/forum-sso/` OIDC 桥进入 Keycloak，Prisma/PostgreSQL 保留给未来云能力。

检查：

```powershell
npm run prisma:validate
npm run typecheck
npm run build:client
npm run build:server
```

生产路由、备份、迁移和旧系统清退见 [PRODUCTION.md](PRODUCTION.md)；开源版本/许可证/风险见 [OPEN_SOURCE_ADOPTION.md](OPEN_SOURCE_ADOPTION.md)。
