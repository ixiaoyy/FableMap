# 实施计划

1. 同步根 README、PRODUCT_BRIEF、WHAT_NOT_TO_BUILD、开发规范和部署说明：RPGJS 冻结，Phaser/Colyseus 成为唯一新主线；保留身份、九表基线、媒体和部署合同。
2. 写入开源迁移记录，固定官方模板/Cabacos/Rick commits、许可证、采用分类和素材禁用边界。
3. 调整 `apps/mirror-island/package.json` 与锁文件：移除活跃 RPGJS runtime，锁定 Phaser/Vue/Colyseus/SDK/Schema；保留 Vite 8、TypeScript 6、Keycloak、OIDC bridge 和 Prisma 工具链。
4. 建立 `shared`：消息 taxonomy/decoder、Schema、ItemDefinition、木材/斧头配方、资源与农田状态；规则不得依赖 Phaser/Vue/Prisma。
5. 建立 `server`：Colyseus 入口、WorldRoom、20 Hz movement tick、命令 dispatcher、Keycloak onAuth adapter 和 InMemoryGamePersistence。
6. 实现权威移动与在线玩家 lifecycle：加入、Schema patch、离开、allowReconnection、按 account ID 重新加入恢复。
7. 建立 `client`：官方 Vue/Phaser 生命周期、连接 store、Tiled/简单世界 renderer、本地输入意图、远端玩家插值；不使用无类型 EventBus。
8. 规则级移植 Cabacos 物品/背包：服务端 add/remove/move/craft 命令和只读客户端 projection；Vue 实现 8 格 Hotbar。
9. 实现一棵树与 GatheringSystem：距离/工具/available/revision 校验，同树并发只结算一次，木材更新 Hotbar。
10. 实现斧头配方与 CraftingSystem：服务端原子验证、扣除和添加。
11. 规则级移植一种作物：一格农田完成 hoe/plant/water/grow/harvest 的服务端封闭状态转换与 Phaser 表现。
12. 实现进程内 checkpoint：关键事件、离房和低频 dirty save；刷新/重新加入恢复位置、背包和农田，不连接 PostgreSQL。
13. 运行最小 TypeScript、client build、server build 和配置解析；不新增大规模测试或数据库检查。
14. 人工双账号验收完整链：登录、同房、移动、同树并发、Hotbar、制作、农田、刷新、B 断线/A 离线、B 重进恢复。
15. 人工通过后再准备生产切换计划；本任务内不部署、不新增 migration、不接 Rick 战斗模块。

## 提交与回滚点

- Commit 1：权威文档、任务和开源迁移合同。
- Commit 2：依赖、目录、shared/server/client 骨架与类型化连接。
- Commit 3：权威移动、在线生命周期和断线重连。
- Commit 4：树、背包、Hotbar 与同树单次结算。
- Commit 5：制作、农田和 in-memory checkpoint。
- 任一阶段失败只回滚该阶段；RPGJS 远端检查点保持不变，生产入口不切换。

## 最小验证命令

最终脚本名称在骨架提交中确定，但必须提供并运行等价命令：

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
```
