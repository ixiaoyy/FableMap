# Mirror Island Phaser Single-player

## Ownership

- 唯一应用位于 `apps/mirror-island/`；公开 `/` 只服务一份 Phaser/Vue 单人 client。
- `domain/` 拥有 GameSession、GameState、命令、物品、配方、Inventory/Gathering/Crafting/Farming 和 SaveRepository 合同。
- `client/` 负责 Phaser 输入/表现、Vue UI 和 IndexedDB adapter；`server/` 只保留论坛 SSO、health 与未来非实时 API。
- RPGJS 和 Colyseus 多人切片已分别通过 checkpoint tag 封存，单人分支不保留双运行时。

## Runtime contract

```text
Phaser/Vue -> typed GameCommand -> GameSession -> pure domain mutation
           -> immutable snapshot -> Phaser/Vue
           -> SaveRepository -> IndexedDB
```

- 实时玩法不调用 WebSocket、matchmaking、服务端 tick、Prisma 或 PostgreSQL。
- GameSession 是唯一 mutable aggregate；Phaser/Vue 只能发送命令和订阅只读 snapshot。
- Inventory/Gathering/Crafting/Farming 不导入 Phaser、Vue、IndexedDB、Keycloak、Prisma 或 Node API。
- Item/Recipe/phase 的 decoder 和 reducer 只有一个 owner，不在 UI 重复判断状态转换。

## Local persistence

- SaveRepository 暴露 `has/load/save/delete`，domain 不知道 IndexedDB。
- IndexedDB adapter 使用固定 DB `mirror-island-local`、版本 1、store `game-saves`；不使用 localStorage 保存玩法。
- save value 包含 schema version、updatedAt、玩家、背包、资源和农田；读取从 unknown 完整验证，未来/损坏版本明确失败。
- token、ticket、密码、Keycloak 对象、数据库 URL 和 secret 禁止写入 IndexedDB；ownerKey 由身份 adapter 提供。
- 关键玩法事件立即排队保存，移动使用有界 debounce，页面隐藏/退出调用 flush；不得逐帧写盘。

## Preserved backend boundary

- Keycloak 26.7.1、keycloak-js 26.2.4、oidc-provider 9.11.1、Prisma 7.9.1、PostgreSQL 17、论坛跨 Compose 网络、CDN 和部署设施继续保留。
- 后端近期只负责登录/论坛 SSO；云存档、成就和排行榜另行规划，不在当前任务创建 API 或数据库结构。
- 现有九表基线不修改。新表/字段/migration 必须先单独评审并获批准。

## Stardew Core scope

- 第一批：GameSession、IndexedDB、背包/采集/制作/种田本地化，代码绘制场景可接受。
- 第二批：固定 Tiled 布局“农场向右连接小镇、北山、南侧河湖”，玩家动画、碰撞、建筑和地图切换。
- 第三批：时间/昼夜/睡觉跨日、按天成长、金币、商店和 3 个 NPC。
- 当前禁止多人、战斗、科技树、NPC 招募、复杂剧情、书屋和《聊斋》内容。

## Open-source contract

- Phaser/Vue 和既有固定开源来源继续锁版本；规则迁移以当前 checkpoint 源码为依据，不建立复制分叉。
- 已评审 `idb@8.0.3`，许可证 ISC 不在默认 allowlist，且当前接口窄，因此采用受控原生 IndexedDB 薄层并记录拒绝原因。
- 图片仍遵循官方固定来源、许可 allowlist、不可变 `game/media/v1` manifest 和 Git 图片二进制为零。

## Verification

- 默认只运行 TypeScript、client build、必要 server build 和配置解析；不扩建大规模自动测试矩阵。
- 人工浏览器验收新游戏、继续游戏、本地玩法闭环、刷新恢复和损坏存档错误状态。
- 不连接数据库、不新增 migration、不部署生产。

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
npm --prefix .\apps\mirror-island run build:server
docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config
```
