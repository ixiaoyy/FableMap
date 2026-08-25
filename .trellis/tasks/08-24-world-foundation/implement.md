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

## 2026-08-24 progress

- Contract commit：`e8f0c8ff`。
- Commit A：`38c9fbb6`，完成集中 TMJ decoder、四区域 catalog 基础、Collision、region transition、save v1→v2。
- Commit B：`377fc569`，完成 EntityFactory、ActionTimeline、树木 impact 单次结算、cottage/seed-shop 和单店主 Dialogue 管线。
- Commit C 已实现并暂存：统一 Ninja Adventure CC0、官方 4×7 角色 frame、正式 Tilemap GID、树/石/农田视觉、水面呼吸、全屏 GameView 与 `?debug=1`。
- Chrome 已验证正式素材加载、默认/Debug 视图、第二棵树砍伐后木材 `3 -> 6`，当前控制台零 error/warn。
- 仍按 PRD `Remaining manual acceptance` 保留长路径、窄屏/200% 和不同 subject 证据；不因用户要求继续而伪报完成。

## Human-playable hardening

29. 用 Tiled 1.12.2 打开四张正式 TMJ，先核对嵌入 tileset、固定 layer 合同与对象属性。
30. 移除会覆盖 `public/map` 的生成入口；保留的生成器只写 ignored fixture，并冻结 `public/map/README.md` 中的 ID 清单。
31. 手工整理 Farm：自然边界、玩家小屋、农田、水塘、林边与向右通往 Town 的清晰道路；保持现有对象 ID。
32. 手工整理 Town：西入口、主街/小广场、种子店和东侧扩展暗示；保持现有对象 ID。
33. 用 Tiled 保存并以集中 decoder、typecheck、client build 做最低成本结构验证。
34. 启动真实浏览器，按 PRD 的完整 human-playable checkpoint gate 逐项人工验收并保留未通过项。
35. 全部门槛通过后才创建 World Foundation checkpoint；不提前开发 Day、经济、NPC 日程或剧情。

## 2026-08-24 Tiled hardening evidence

- 已定位并使用 Tiled 1.12.2（`D:\Tiled\`）；官方 `tmxrasterizer` 已实际渲染 Farm/Town，不再只靠 JSON 检查。
- 正式 Farm/Town 已由 Tiled 保存为手工维护 TMJ；fixture 命令改写 ignored `artifacts/` 后，两张正式地图 SHA-256 均保持不变。
- 基线与当前对象属性比较结果：Farm 23 个、Town 5 个登记 ID，差异均为 0；坐标与 tile 布局已重排。
- Farm 已形成小屋、农田、水塘、东向道路和边界；Town 已形成西入口、主街/广场、种子店和未来东向延伸。
- 游戏相机从 1× 全图总览改为 2× 整数视野；Tiled 预览按相同 2× 出生视野复核过密度和视觉锚点。
- 四区域集中 decoder 与 WorldCatalog 通过；所有 spawn 均落在非碰撞格，所有 exit 至少有一个可通行格。
- `npm run typecheck` 与 `npm run build:client` 通过；client build 只有既有的大 chunk warning。
- Chrome 本地 5173 已到达 Keycloak 登录页，但当前无可用密码会话，因此连续人工游玩链、200% zoom 与第二 subject 隔离仍明确未通过。

## One Beautiful Slice — current execution order

36. Gate 0 素材审计：固定 GitHub 提交只含当前四张地图图集；官方完整包为 CC0 且声明含 farming/woodwork/fishing，但未采用文件不得直接进入运行时。
37. 同步最新产品优先级：Farm 64×48，Town/Cottage/Seed Shop 视觉冻结，旧长链验收后置。
38. Gate A 只重排 Farm 大块：小屋、水塘、农田、东向道路、林缘与对象坐标；保持登记 ID 与跨区 target 不变。
39. 用 Tiled 1.12.2 保存正式 TMJ，集中 formatter 只压缩 tile data；不让 fixture generator 覆盖正式地图。
40. 产出无对象标记的 64×48 整图截图，以及按正式 2× 相机裁切的出生镜头截图。
41. 只运行 TMJ decoder、ID 差异、spawn/exit 可通行性和必要 client build；截图交用户确认后停止，不进入 Gate B/C。

## 2026-08-24 Gate A evidence

- 已完成同源素材审计：官方 GitHub 固定提交仍只有当前地图图集；Gate A 没有引入第二套素材、没有新增图片二进制或 CDN 对象。
- 正式 Farm 已由 Tiled 1.12.2 保存为 64×48（1024×768）；Town/Cottage/Seed Shop 未修改本轮视觉布局。
- Farm 23 个登记 ID 与暂存基线差异为 0；`home-yard`、`east-gate`、`cottage-door` 均落在可通行格，两个 exit 均有开放格。
- 大构图形成左上小屋、左侧水塘、中部田土与向右道路；右下只保留林缘色块，不伪造尚未采用的竹林素材。
- 田土 frame 已从旧灰色暗主题切到同一亮色 floor atlas 的暖土 tile；没有新增 farm phase 或 gameplay state。
- 整图审图：`artifacts/farm-showcase-gate-a/farm-full.png`；正式 2× 出生镜头审图：`artifacts/farm-showcase-gate-a/farm-spawn-2x.png`。
- Chrome 使用现有存档进入 64×48 Farm 后最终正常渲染，完整控制台无 error；保留既有 `Image tile area not tile size multiple in: floor` warning。第一次截图发生在 Phaser 初始化前，等待后地图出现，因此不记录为黑屏缺陷。
- 四区域 WorldCatalog、typecheck 与 client build 通过；build 只有既有的大 chunk warning。
- 当前严格停在 Gate A 用户视觉确认点；自然岸线、石板、小桥、樱花/竹林、花草、荷叶、水波、灯笼和树影均未开始。

## 2026-08-24 Gate A v2 composition review

- 根据用户审图只重排位置：小屋左移 2 tile、下移 3 tile；水塘右移并缩为约 9×7；农田右下移并缩为 7×5。
- 门前保留干净院落；道路从 2 tile 门前小路逐步过渡为 3 tile 主路，经农田下方折向右上，并从地图约 40% 高度离开。
- 8 棵登记资源树由均匀散布改成左上 4 棵与右下 4 棵两组；中央生活区保持清爽，未新增资源实体。
- 新出生点位于门前右下，首屏同时看到小屋、水塘、院落、部分农田与道路起点。
- v2 整图：`artifacts/farm-showcase-gate-a-v2/farm-full.png`；v2 2× 出生镜头：`artifacts/farm-showcase-gate-a-v2/farm-spawn-2x.png`。
- v2 仍为 64×48，23 个登记 ID 差异为 0；所有 spawn 非阻塞、两个 exit 可通行、四区域 WorldCatalog 通过。本轮仅 TMJ 重排，未重复运行上一轮已经新鲜通过的 typecheck/build。
- 当前再次停在 Gate A 视觉确认点，不进入岸线或装饰轮次。

## Gate B — structural pass

42. 记录 Gate A v2 已获用户通过，冻结主体与对象坐标。
43. 从当前已登记 floor/village atlas 选择岸线、道路/田土边缘和林缘静态结构 tile，不新增素材文件或 manifest 项。
44. 仅重画 Farm 的 GroundDetail、Water、Buildings、AbovePlayer 与 Collision；保持 64×48、对象层、稳定 ID 和跨区 target。
45. 生成无对象标记的 Gate B 整图和正式 2× 出生镜头审图；不添加细节轮次元素。
46. 运行 ID 差异、TMJ decoder、spawn/exit 可通行和必要浏览器渲染检查；截图交用户确认后停止。

## 2026-08-24 Gate B evidence

- Gate A v2 的全部对象属性与坐标冻结；正式 Farm 与 Gate A 暂存基线的 object contract 差异为 0。
- 使用同一已登记 floor atlas 的亮色 dirt terrain 边角完成池岸、院落/道路和田土边界；水面缩入岸线内部，但 Collision 继续覆盖原约 9×7 池塘 footprint。
- 道路保持 Gate A 中心线，用 2 tile 小路、院落和 3 tile 主路的边缘 tile 消除橙色色块感；农田保持 7×5 与现有 8 个互动 plot。
- 左上林缘补 forest-floor 块面，左右林缘各增加 4 个同源静态灌木 tile；8 个可采树 ID 和 4+4 分组不变，静态灌木不可采。
- Gate B 整图：`artifacts/farm-showcase-gate-b/farm-full.png`；Gate B 2× 出生镜头：`artifacts/farm-showcase-gate-b/farm-spawn-2x.png`。
- 全部 tile GID 均落在内嵌 tileset 范围；所有 spawn 非阻塞、两个 exit 可通行、四区域 WorldCatalog 通过。本轮只改 TMJ，不重复运行上一轮已通过的 typecheck/build。
- 当前停在 Gate B 视觉确认点；花草、荷叶、灯笼、樱花、竹林、水动画、阴影、新素材和 gameplay state 均未开始。

## VectoRaith Farm visual prototype

47. 固定官方 itch.io Farming Sim v1.08 ZIP，记录 SHA-256、包内文件清单与页面许可；不上传原包或 PNG。
48. 从当前正式 Farm 派生 ignored 候选 TMJ，保持 64×48、固定 6+5 layers、Collision、对象坐标、全部 stable ID 与跨区 target 不变。
49. 只把出生镜头所需草地、水面/岸线、道路、小屋、农田和树木/林缘重映射为 VectoRaith Original 16×16；不迁移 Town 或增加装饰系统。
50. EntityFactory、Tree/FarmPlot、采集、种田、进屋、Town Exit 和 GameSession/SaveRepository 不改；素材坐标和 frame 只存在候选表现层。
51. 用候选 TMJ 运行集中 decoder，生成 Farm 整图、正式 2× 玩家出生镜头和同位置 Ninja/VectoRaith 对比截图。
52. 只运行本轮新鲜的 decoder、typecheck 和 client build；视觉是否通过由用户截图确认决定。
53. 用户确认且 Web/CDN 许可澄清后，再单独规划正式 atlas、manifest、CDN 和默认运行时接入；本轮不提前实施。

## 2026-08-24 VectoRaith prototype evidence

- 官方 v1.08 ZIP 为 6,535,037 bytes，SHA-256 `1957927a1b740fb598f3f302032f4c96a7efcfd61259048b4b9508dac8fcd6fd`；包内没有独立 LICENSE/README，许可边界继续以官方页面为证且保持待澄清。
- 候选 `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-vectoraith.tmj` 从当前正式 Farm 派生；5 个对象层逐值一致、23 个对象未变、300 个 Collision 格逐值一致。
- 集中 decoder 成功创建 4 区域 WorldCatalog，候选 Farm 为 1024×768；Tiled 1.12.2 `tmxrasterizer` 成功输出候选底图。
- 整图：`candidate-original/farm-full.png`；正式 2× 出生镜头：`candidate-original/farm-spawn-2x.png`；同位置新旧对比：`candidate-original/farm-spawn-comparison.png`。
- 本轮 `typecheck` 与 `build:client` 通过；build 仅保留既有大 chunk warning。视觉是否通过仍等待用户审图，检查结果不替代视觉结论。
- 未修改 GameSession、SaveRepository、IndexedDB、EntityFactory、正式 TMJ 或默认运行时；未引入 Tauri/Rust/Steam，未连接数据库、上传 CDN 或追踪图片二进制。

## VectoRaith Gate B — structural pass

54. 记录用户通过 VectoRaith 方向验证；Ninja Adventure 不再精修正式 Farm，Gate C 继续冻结。
55. 在 ignored candidate 完成自然岸线、暖土院落/石板门槛、弯曲 Town 道路、农田后 fence 边界、木桥、疏密林缘、Collision 与 AbovePlayer。
56. 原型阶段新增 DEV-only VectoRaith 表现 profile；该临时门控随后由 `Farm v1 production adoption` 替代，不修改 domain/persistence。
57. 只同步 Original/16x16 所需 PNG 与 candidate TMJ 到 ignored local public media；不登记 manifest、不上传 CDN、不采用 32/48px 放大源。
58. 用同一 GameSession typed `move` 沿 Gate B road contract 回放出生→桥→树冠→Farm Exit，并执行 `transition-region`；输出路线 JSON 和三段 2× 相机证据。
59. 运行 candidate decoder、23 stable object equality、Collision route、typecheck、client build；浏览器画布验证失败或受阻时明确保留为未通过。

## 2026-08-24 VectoRaith Gate B evidence

- candidate 保留全部 23 个 object 与既有 ID；GameSession、EntityFactory 行为、SaveRepository、IndexedDB 与正式 TMJ 不变，EntityFactory 只新增 presentation profile 参数。
- 原型阶段使用 Original 16×16 terrain/buildings/details/orchard/farmer，文件位于 ignored local media；随后只把最小派生图集正式发布。
- 59-tile GameSession road replay 通过：spawn `(304,256)` → bridge `(616,408)` → crown `(808,408)` → `farm-east-exit` `(1016,328)` → Town spawn `(32,224)`；持久化仍通过 SaveRepository port。
- 整图 `candidate-original/farm-full.png`；出生镜头 `farm-spawn-2x.png`；路线证据 `farm-route-verification.png`。
- candidate decoder、typecheck、client build 通过；build 只有既有大 chunk warning。
- 浏览器被 Keycloak `localhost:8081` redirect 的 Browser URL policy 阻止，未取得真实画布截图，因此 Gate B 仍停在用户视觉/人工游玩确认点，不进入 Gate C。

## 2026-08-24 final Gate B macro revision

- 根据用户最后一轮大结构反馈把溪流整体右移约 5 tile 并缩为连续 2-tile 水道；木桥同步右移，Farm Exit 与 typed route 合同不变。
- 左侧池塘缩小并改为非对称 5-row 凹凸岸线；门前院落保留暖土与窄石板门槛。
- 7×5 农田使用 VectoRaith details atlas 的独立深色 soil tile，与黄色院落/2–3 tile Town road 明确分离；8 个 FarmPlot object 坐标不变。
- 右侧静态树重组为道路北/南树群，既有 4 棵右侧 resource tree stable ID 不变，道路从林缘之间进入 Town。
- candidate decoder 与 59-tile GameSession route 通过：bridge `(664,408)`、crown `(872,376)`、exit `(1016,328)`、Town spawn `(32,224)`。
- 最终只交付 `candidate-original/farm-full.png` 与 `candidate-original/farm-spawn-2x.png`；当前仍停在 Gate B 视觉确认点。

## VectoRaith Gate C — visual polish

60. 记录 Gate B 视觉通过；冻结大构图、建筑、水体、农田、道路、桥、林缘、Collision 与 23 个 object。
61. 用当前 Original/16x16 atlas 在出生区、池塘、农田、道路与桥头增加少量成组细节，不新增来源、系统或地图内容。
62. 把既有路边 static tree frame 替换为粉色非交互地标；保留其位置、遮挡和 collision tile。
63. 为 VectoRaith EntityMediaProfile 增加可选 growing/mature crop frames；FarmPlotEntity 只投影现有 phase，不修改 FarmingSystem/GameState/save。
64. 输出整图、2× 出生镜头、水塘、农田、桥头五张图；运行 candidate decoder、23 object equality、route replay、typecheck 和 client build。

## 2026-08-24 VectoRaith Gate C evidence

- Gate B geometry 与 Collision 未调整；23 个 object 逐值一致，59-tile spawn→bridge→crown→Farm Exit→Town route 继续通过。
- 出生区新增邮箱/小型院落物件与田边干草；池塘新增少量荷叶、水草、岸石与静态波纹；道路/桥头只放置局部草花和水岸石。
- 7×5 农田保持原位置与 8 个 FarmPlot object，截图用 growing/mature crop frame 展示密度；runtime 由现有 FarmTile phase 决定 crop visibility。
- 普通林缘疏密不变，既有路边 static tree 改为粉色视觉地标；没有新 ID、交互或 gameplay state。
- candidate decoder、23 object equality、Original 16×16 检查、route replay、typecheck 和 client build 通过；build 只有既有大 chunk warning。
- 五张审图位于 `candidate-original/farm-full.png`、`farm-spawn-2x.png`、`farm-pond-detail-2x.png`、`farm-field-detail-2x.png`、`farm-bridgehead-detail-2x.png`；等待用户视觉确认。

## Farm Showcase Checkpoint

- 用户确认 Gate C 样板够用，停止继续增加花草或进行 Gate D 式打磨。
- 文本 checkpoint：`docs/checkpoints/farm-showcase-v1/README.md` 与 `farm-showcase-v1.tmj`；五张 ignored 截图的 SHA-256、表现 profile、来源和 pending 许可已登记。
- `manual-acceptance.md` 固定出生、小屋碰撞、池塘、树冠、农田、桥面、进屋/出屋、Farm→Town、砍树和 console 清单。
- 当前 World Foundation 仍为 in_progress：真实浏览器人工验收与 VectoRaith 分发许可尚未通过；checkpoint 不等于大地图或 World Foundation 完成。
- 下一个 `Stardew Life Loop 第一批` 只允许进入 planning，实施必须等待上述人工验收结果。

## Farm v1 production adoption

- 用户明确批准把 VectoRaith 最小派生 atlas 的 Web runtime delivery 解释为游戏内嵌使用，并接受作者书面回复前的残余许可风险。
- 从 checkpoint 扫描实际 GID，生成 3 个 compact tileset、1 个 entity atlas、1 个 farmer sheet；正式 TMJ 的 Tilemap 渲染与批准候选像素一致。
- 5 个不可变对象通过 `publish-game-media` 精确 allowlist 发布并由 CDN 回读验证；manifest 共 11 个对象。
- Farm 默认 profile 改为 VectoRaith；Town/室内继续 Ninja 技术占位。GameSession、SaveRepository、IndexedDB 与 23 个 object 合同不变。
