# Farm Showcase Checkpoint

## Status

- 名称：`Farm Showcase Checkpoint`
- 日期：2026-08-24
- 视觉状态：Gate C 样板通过，停止继续增加装饰。
- 游玩状态：真实浏览器人工验收 pending。
- 许可状态：用户已批准按“游戏内嵌使用”解释发布最小派生 atlas；作者书面确认仍 pending。

> 这是一张视觉样板场景，用于确认正式美术方向；不代表整个 World Foundation 已全部完工。

## Frozen Farm v1 foundation

以下内容作为 Farm v1 正式基础冻结：

- 64×48、16px Tilemap 大构图。
- 小屋、门前院落、水塘、7×5 农田、弯曲 Town 道路、河流、小桥和林缘位置。
- Gate C 出生区、水塘、农田、桥头细节密度。
- 23 个 stable object、Collision、AbovePlayer 与 Farm→Town exit 合同。
- 正式 VectoRaith Farm profile 和 Original/16×16 素材选择；Town/室内继续作为技术占位。

后续只允许由真实游玩反馈驱动的小修，例如明确碰撞、树脚、路径或院落操作问题；不再进行无目标的构图或装饰迭代。

## Tracked text snapshot

- TMJ：[farm-showcase-v1.tmj](farm-showcase-v1.tmj)
- 原 ignored candidate SHA-256：`da549f4ae88471474f21d62e7c6e367e82f5c495c8f6d669dd8b88c4c38bc597`
- checkpoint TMJ SHA-256：`5e63bff703b8145fe10b2c4361660dde9096cd5f195ad8e1474a2cd891872366`
- 两者仅因 checkpoint 内的本地素材相对路径不同；Tile/Object/Collision 内容相同。

Checkpoint TMJ 是文本布局合同，不包含 VectoRaith PNG。它只在合法取得官方 v1.08 ZIP 并放回文档声明的 ignored artifact 路径后可本地渲染。

正式 compact Farm TMJ 为 `apps/mirror-island/public/map/farm.tmj`，SHA-256 `991dda56b447416b151c2b0d43981cfecaaed4d0ed1f7a1793c174d69f55a207`；它与 checkpoint Tilemap 像素一致，只把 GID 重映射到实际使用 tile 的最小生产图集。

## Local visual evidence

截图不进入 Git；本机证据和 SHA-256：

| 证据 | Ignored 路径 | SHA-256 |
|---|---|---|
| Farm 整图 | `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-full.png` | `89e8db18c0b4bc8e7f190d4fe0e3d5a2178e321fb7d0df26cf9ce7d366b578f4` |
| 2× 出生镜头 | `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-spawn-2x.png` | `3221c09444e830e935a057276e366e2ec5c298f6f257edd2853e122e1cbeba88` |
| 水塘局部 | `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-pond-detail-2x.png` | `e898678105e5093c4e41cda4ff5396c2725b8e47db2709f28a676c3a493148a5` |
| 农田局部 | `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-field-detail-2x.png` | `1de3d3fba5f524cf074433b7c38f91e1bd82561aeb0738669c382af169ae0ca1` |
| 桥头局部 | `artifacts/vectoraith-farming-sim-v1.08-1957927a/candidate-original/farm-bridgehead-detail-2x.png` | `62a8e213b0034127c61aa7e745a78aff2e0f5d8e3cc73a624a39586885251547` |

## Presentation profile

- `apps/mirror-island/client/src/game/assets/visual-profile.ts`
- `apps/mirror-island/client/src/game/entities/WorldEntities.ts`
- `apps/mirror-island/client/src/game/scenes/WorldScene.ts`
- `apps/mirror-island/client/src/game/world/world-catalog.ts`

Farm 在开发与生产均使用 VectoRaith compact profile；GameSession、GameState、SaveRepository 和 IndexedDB 不保存 profile、texture key 或 frame。

## Source and license

- 来源记录：[VectoRaith Farming Sim v1.08](../../assets/vectoraith-farming-sim-v1.08.md)
- 官方 ZIP、完整原始图集与截图不进入 Git，也不上传 CDN。
- 生产只发布 5 个项目专用最小 PNG：3 个 used-tile tileset、1 个 EntityFactory atlas 和 1 个完整使用的 farmer sheet；无素材下载入口。
- 用户于 2026-08-25 明确批准按“Web 游戏内嵌使用”解释许可并接受作者回复前的残余风险；作者书面确认继续作为后续证据。

## Remaining gates

1. 按 [真实人工验收清单](manual-acceptance.md) 完成登录与完整 Farm 路线。
2. 使用 [VectoRaith license inquiry draft](vectoraith-license-inquiry.md) 获得 Web/CDN 与 Tauri/Steam 分发的书面许可说明。
3. CDN/manifest 已完成；作者回复若附加条件，使用 forward-fix 更新署名、包装或分发边界。
