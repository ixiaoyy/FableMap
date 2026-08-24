# 实施计划

## Gate and contract

1. 将 World Foundation、Debug Shell、身份可替换性、Tiled layers/objects、16px 与 A/B/C 边界同步进权威 spec。
2. 记录官方 Phaser/Tiled 约束：普通 TilemapLayer、TMJ 内嵌 tileset metadata、Tiled 工具不是运行时依赖。
3. 保留不同 Keycloak subject 隔离人工证据为未完成，不阻塞本任务，也不伪报通过。

## Commit A — Tilemap Foundation

4. 新增纯 domain `RegionDefinition`/`WorldCatalog`/collision contracts，搜索并复用现有 movement/GameState owner。
5. 新增 client `TiledRegionDecoder`，集中验证 raw TMJ layers、objects、properties、IDs 和 exit targets。
6. 新增文本 `farm.tmj`、`town.tmj`，使用内嵌测试 tileset metadata 与完整固定 layers。
7. 建立 Region loader/renderer：普通 TilemapLayer、Collision、camera bounds、spawn projection、销毁清理。
8. 扩展 typed commands 与 GameSession：current region、collision-aware movement、atomic region transition。
9. 实现 save v1 -> v2 明确 migration，不改变 IndexedDB DB/store/owner key。
10. 实现 Farm east exit ↔ Town west spawn，加入 transition lock 与短淡入淡出。
11. 浏览器验收 Farm -> Town -> Farm、碰撞、刷新恢复；运行最小 typecheck/client build。
12. 提交 Commit A。

## Commit B — World Entities and ActionTimeline

13. 扩展 Tiled decoder 输出 Resource/Interaction/NPC spawn definitions，不复制 property parsing。
14. 建立 EntityFactory 与 Tree/Rock/FarmPlot/NPC view classes；地图 owns position，save owns dynamic state。
15. 改造 Gathering/Farming 从 WorldCatalog 查询 target region/position；保持 GameSession 唯一 mutation owner。
16. 建立 ActionTimeline `windup/impact/recovery` 和 input lock；impact 只结算一次。
17. 用测试图形完成挥击、树震动/闪烁、木材反馈、耗尽转换；锄地/浇水复用 timeline。
18. 新增 cottage/seed-shop interior TMJ 与门/出口切换。
19. 新增一个店主和 Vue Dialogue，一句固定文本；不实现商店/日程/剧情。
20. 浏览器验收砍树 -> 切图 -> 返回 -> 刷新、室内往返、E 对话；运行最小 typecheck/client build。
21. 提交 Commit B。

## Commit C — Visual Pass

22. 用 manifest 已登记 Ninja Adventure 单一来源替换测试 tileset/entity，集中登记 texture/frame keys。
23. 实现正式玩家 idle/walk/action 表现、脚底 hitbox、Y-depth 与整数相机。
24. 完成农场小屋/田地/池塘/林边/东向道路和小镇西门/主街/种子店的视觉引导。
25. 加入已验证 frame 的水面动画、命中粒子/木屑、树木耗尽表现和克制过渡。
26. 重构 App：正式世界全屏主视图 + 最小 HUD；LOCAL/grid/debug controls 只在显式 debug mode。
27. 浏览器按 9 条玩家链路验收桌面、窄屏、200% zoom 与无错误控制台；运行最小 typecheck/client build。
28. 核对 media URL/key/尺寸/MIME/SHA、Git 图片二进制为零；提交 Commit C。

## Minimal verification

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
git diff --check
```

- 不新增大规模 unit/integration/E2E 矩阵。
- 不连接 PostgreSQL，不运行 migration，不部署生产。
- Docker Desktop 不运行时如实记录 image build 未执行，不把 client build 等同于 image build。

## Commit boundaries

- Commit A：Tilemap Foundation。
- Commit B：World Entities + ActionTimeline + interiors/dialogue。
- Commit C：统一素材与正式主视图。
- 规格/任务合同在 A 前单独提交，避免实现提交混入决策漂移。
