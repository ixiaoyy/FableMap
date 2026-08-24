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
