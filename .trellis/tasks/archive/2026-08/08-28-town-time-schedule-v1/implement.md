# Town 时间与 NPC 日程 v1：实施计划

## 1. Time and save v4

1. 新增纯时间常量、phase resolver 与 HH:MM formatter。
2. GameState/StoredGame 升至 v4，新增 minuteOfDay 与显式 v3→v4 migration。
3. GameSession tick 增加 paused、有界累积、10 分钟 publish/save；sleep 重置 06:00。
4. Vue store/HUD 投影时间，WorldScene 传 modal/action/transition pause。

## 2. Schedule resolver

1. 新增八名 NPC 的四段 schedule registry，只引用 region/spawn IDs。
2. 实现 schedule validation、phase active projections、region filter 与 npcId lookup。
3. 扩展 WorldCatalog collision 输入；movement、state reconcile、WorldScene、ShopSystem 统一消费 active resolver。
4. NpcEntity/WorldScene 在同 NPC anchor 改变时精确重建临时 view。

## 3. Tiled anchors

1. 向 Town、Seed Shop、Blacksmith、Foothills、Lakeshore 与五栋住宅 SpawnPoints 添加日程 anchor。
2. 保持 tile、exit、interaction、resource 与 base NpcSpawns IDs 不变。
3. 核对同时活跃 anchor 不重叠、不封路。

## 4. Focused checks

1. Life Loop：v3→v4、非法 minute、tick/pause/24:00/sleep 06:00。
2. Town：四时段八 NPC 唯一位置、anchor 完整、交互范围和碰撞。
3. Shop：只有 day counter 可交易。
4. 更新现有 v2 backup 断言为写入 v4，但保留 exact v2 backup 合同。

## 5. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:life-loop
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

不运行全量、E2E、数据库或身份测试。

## Rollback

- v4 尚未产生数据库 migration；回滚只精确恢复 time/state/save/schedule/map anchor 文本。
- 不整文件恢复与 Tool Interaction、NPC Hit Reaction、World Expansion 重叠的 GameSession、WorldScene、state 或测试文件。
