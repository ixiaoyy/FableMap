# 镜像岛 Phaser/Colyseus

安装并启动本地依赖：

```powershell
npm install
Copy-Item .env.example .env
npm run dev:client
npm run dev:server
```

- Keycloak：`http://127.0.0.1:8081`
- Colyseus：`http://127.0.0.1:3001`
- Vite：`http://127.0.0.1:8080/`

正式游戏要求 Keycloak 会话，并使用 Keycloak `sub` 作为服务端私有稳定玩家 ID。首个纵向切片通过 in-memory persistence interface 恢复刷新/重连状态，不连接数据库；论坛登录仍经 `/forum-sso/` OIDC 桥进入 Keycloak。

检查：

```powershell
npm run prisma:validate
npm run typecheck
npm run build:client
npm run build:server
```

生产路由、备份、迁移和旧系统清退见 [PRODUCTION.md](PRODUCTION.md)；开源版本/许可证/风险见 [OPEN_SOURCE_ADOPTION.md](OPEN_SOURCE_ADOPTION.md)。
