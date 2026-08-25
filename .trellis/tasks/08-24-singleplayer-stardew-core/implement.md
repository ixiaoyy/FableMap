# 实施计划

1. 同步 README、PRODUCT_BRIEF、WHAT_NOT_TO_BUILD、开发规范和应用文档：主线改为单人 Stardew Core；多人 checkpoint 只作为历史参考。
2. 写入 IndexedDB 采用评审：记录 `idb@8.0.3`/ISC 与原生薄层选择，不新增未批准许可证依赖。
3. 把 Item/Recipe 定义从 shared 移到 renderer/storage 无关的 `domain`；建立纯 `GameState`、command/result 和 snapshot contract。
4. 将 InventorySystem 改为普通数组/对象规则，保持 24 格、8 格 Hotbar、堆叠、原子 consume/craft 和 snapshot/restore。
5. 将 Gathering/Crafting/Farming 改为纯 domain system，删除 Colyseus Schema/Room 依赖。
6. 实现 GameSession：new/continue/dispatch/subscribe/tick/flush、关键事件保存和移动 debounce。
7. 实现原生 IndexedDbSaveRepository：版本化 DB/store、has/load/save/delete、事务完成和 unknown decoder。
8. 将 Vue world store、Hotbar 和 Phaser WorldScene 从 Colyseus projection 改为 GameSession snapshot/command；提供最小新游戏/继续游戏入口。
9. 移除 client/server gameplay 对 Colyseus 的依赖和 WorldRoom/网络 intent/Schema 文件；后端只保留 SSO/health，更新 package lock、Docker/Nginx/CI 边界。
10. 确保不启动 Colyseus时仍能完成砍树、木材、木斧、锄地、播种、浇水、成熟和收获，并保存/继续。
11. 运行最小 TypeScript、client build、必要 server build 和 Compose 配置解析；不运行数据库测试或大规模自动化矩阵。
12. 人工浏览器验收新游戏、继续按钮、完整本地闭环、退出/刷新和损坏存档错误状态。

## 2026-08-24 进度

- 步骤 1–11 已完成，生产代码提交为 `9b7cf24f`。
- 一次性纯 domain 诊断已跑通完整采集/制作/种田闭环，并以新 GameSession 恢复同一存档快照。
- `typecheck`、client build、server build 和 Compose 配置解析通过；未连接数据库、未新增 migration、未部署生产。
- 步骤 12 保留为人工浏览器验收。Docker Desktop 未运行，因此本机 production image 复核未完成，不记为通过。

## 2026-08-24 浏览器验收补记

- Chrome 已实际跑通树木采集、木斧制作、开垦、播种、浇水、成熟、收获，以及刷新后继续游戏。
- 刷新后木斧、荧光果、树木耗尽和农田阶段均恢复；为 Debug Shell 增加了只发送既有 `move` 命令的可点击方向控制。
- 第二次登录仍读取第一份存档，说明没有切换到不同 Keycloak subject；账号隔离人工证据保留为未完成，按用户最新指示不阻塞 World Foundation。

## 提交与回滚点

- Commit 1：单人主线合同和 IndexedDB 采用记录。
- Commit 2：纯 domain + GameSession。
- Commit 3：IndexedDB adapter + 新游戏/继续游戏。
- Commit 4：Phaser/Vue 本地接线与 Colyseus active graph 清理。
- 任一阶段失败只回滚当前层；多人 checkpoint tag 不变。

## 最小验证命令

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```
