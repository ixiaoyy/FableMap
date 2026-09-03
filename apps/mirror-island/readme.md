# 镜像岛 Phaser 单人主线

安装并启动本地依赖：

```powershell
npm install
Copy-Item .env.example .env
npm run dev:client
```

- Keycloak：`http://127.0.0.1:8081`
- 身份/论坛 SSO 服务：`http://127.0.0.1:3001`（不参与实时玩法）
- Vite：`http://127.0.0.1:8080/`

公开游戏入口是无账号本地试玩；客户端不读取 Keycloak 会话，也不启动 gameplay server。本地 GameSession 通过 IndexedDB SaveRepository 保存单人状态。论坛登录仍经 `/forum-sso/` OIDC 桥进入保留的 Keycloak 基础设施，Prisma/PostgreSQL 只为未来云能力保留。

当前春季 v10 已实现午夜提醒/02:00 昏倒、体力/天气、自由种田与补水、六作物、资源再生、钓鱼和送礼，等待真人验收；发布状态以 main 流水线为准。正常试玩无需 `dev:server`，也不得为验证玩法连接数据库。

按修改范围选择最小检查；本次只涉及客户端/domain：

```powershell
npm run typecheck
npm run build:client
```

生产路由、备份、迁移和旧系统清退见 [PRODUCTION.md](PRODUCTION.md)；开源版本/许可证/风险见 [OPEN_SOURCE_ADOPTION.md](OPEN_SOURCE_ADOPTION.md)。
