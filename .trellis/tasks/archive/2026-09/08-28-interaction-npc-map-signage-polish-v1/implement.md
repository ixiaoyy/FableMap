# 交互、NPC、地图入口与看板精细化 v1：实施

1. 启动当前游戏，采集桌面/手机 Farm→Town→住宅→Blacksmith→Foothills→Lakeshore 路线证据。
2. 排序 NPC 提示/姿态、入口、私人内屋、看板、inspect 的 P0/P1/P2 问题。
3. 先修共用交互提示与 NPC presentation owner，再修个别地图 object/文案。
4. 复走同一路线，核对夜色、modal、Social、200% zoom 和触摸可发现性。
5. 只运行与实际改动相关的一次类型检查、构建和必要窄合同。

风险：不得把 hover 作为手机唯一提示；不得用 Phaser 临时坐标修正 Tiled 问题；不得借 polish 扩玩法。

## Verification handoff — 2026-09-01

- 用户明确决定真实浏览器、手机、200% zoom、夜间可读性与完整路线由真人验收；对应 PRD 条目保持未勾选，不伪造通过，也不再阻塞任务归档。
- 静态基线：`test:town-population` 6/6、`typecheck`、`build:client` 通过。
- 当前没有由本任务拥有的未提交生产代码；工作区 `App.vue`、`style.css`、`media-catalog.ts` 属于并行首页重设计，不纳入本任务。
- 真人发现问题时，按 NPC/入口/看板的精确地图、时间、视口和操作路径创建窄修复任务。
