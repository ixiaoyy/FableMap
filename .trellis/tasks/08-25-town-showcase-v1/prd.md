# Town Showcase v1 视觉主街

## Goal

先恢复 VectoRaith 官方 Original/16×16 完整图集作为直接运行时资源并清退全部裁剪/重排链，再用同一原始素材为现有 40×30 Town 制作一条具有生活感的视觉主街 Gate A 样板。

## Confirmed decisions

- 用户明确要求删除此前 Farm 的全部裁剪/重排内容；不再为 Farm 或 Town 收集 used tiles、重排 atlas、合并 entities 或重编码 farmer。
- 原始完整 PNG 直接由 Phaser/Tiled 使用；浏览器公开下载完整 sheet 是用户最新批准的运行时分发方式。
- Town 本轮只做视觉主街，不新增 NPC、商店、室内、日程、好感、任务、剧情、时钟或经济。
- Seed Shop 仍是唯一功能建筑；Farm↔Town、Town↔Seed Shop、stable IDs、Collision、GameSession 与 v3 save 合同不变。

## Gate 0 — Original runtime restoration

- 直接使用以下官方原文件，不改尺寸、像素、编码内容或文件名：
  - terrain spring expanded 256×256
  - buildings 256×256
  - details 256×256
  - orchard 256×256
  - crops 256×256
  - `$farmer.png` 48×128
- 正式 Farm TMJ 恢复为原始 tileset metadata/GID；地图图像必须与当前 Farm v1 像素一致。
- EntityFactory 的 tree/stump/rock/crop/soil frame 直接指向 orchard/details/crops/terrain 原坐标。
- manifest、prepare-media、publisher allowlist 与文档改为 6 个官方原始对象。
- 原始资源部署并验证后删除：
  - CDN 旧 `farm-terrain.png`、`farm-buildings.png`、`farm-details.png`、`farm-entities.png`、`farmer.png`
  - 本地 `production-media/`、`build_production_media.py`
  - `src/tiled` 与 local public cache 中对应旧派生文件
- 不删除官方 Original、candidate-original、Farm checkpoint TMJ 或视觉证据。

## Gate A — Visual main street

- Town 保持 40×30，不扩地图数量或新增区域。
- 主要构图固定为：
  - 西侧 Farm 入口与清晰的主街引导；
  - 2～3 Tile 宽主街通向一个小广场；
  - Seed Shop 作为可识别的第一功能建筑；
  - 另外两栋仅外观建筑形成街道围合，不开放室内；
  - 留出少量负空间，禁止均匀铺满装饰。
- Gate A 只审道路、广场、建筑体量、入口视线与建筑间距；不提前放灯笼、花坛、摊位、招牌细节或新 NPC。
- 候选 TMJ、完整原始 PNG 和截图全部位于 ignored artifacts；用户确认前不替换正式 Town。

## Acceptance Criteria

- [ ] 生产 Farm 使用 6 个官方原始文件，正式画面/碰撞/对象合同不回退。
- [ ] 旧 5 个裁剪 CDN 对象与本地 packed/crop pipeline 已精确删除，代码/manifest/文档无旧引用。
- [ ] Git 图片二进制新增为 0；原始文件只在 ignored 本地与 CDN。
- [ ] Town Gate A 候选保持所有现有 stable IDs 与出口目标。
- [ ] 提供 Town 整图和 Farm→Town 实际到达比例截图。
- [ ] 用户确认大构图后才允许进入 Town Gate B 视觉细化。

## Out of Scope

- NPC、日程、好感、任务、剧情和新对话。
- 新商店、商品、经济、室内或建筑功能。
- Town Gate B/C 细节、东方定制图集或新图片生成。
- 战斗、Expedition、灵兽、肉鸽、塔防、Tauri、Steam。
