# VectoRaith Farming Sim v1.08 Farm v1 采用记录

## Source and version

- 作者：VectoRaith
- 官方发布页：`https://vectoraith.itch.io/farming-sim-asset-pack`
- 官方更新页：`https://vectoraith.itch.io/farming-sim-asset-pack/devlog/1563685/farming-sim-asset-pack-update-v108`
- 官方文件名：`vectoraith_tileset_farming_sim_essentials.zip`
- 发布时间：2026-06-25（下载页文件时间为 2026-06-24 15:59 UTC）
- 归档字节：6,535,037
- 归档 SHA-256：`1957927a1b740fb598f3f302032f4c96a7efcfd61259048b4b9508dac8fcd6fd`
- 核验日期：2026-08-24

## Adopted scope

- 只评估 `Original/16x16` 下的春季 terrain、buildings、details、orchard、crops 与 farmer。
- 只替换 Farm 出生镜头可见的草地、水面/岸线、道路、小屋、农田和树木/林缘。
- Gate B 在同一候选内增加院落石板、弯曲 Town 道路、农田后 fence、小桥、Collision 与 AbovePlayer；不增加新素材来源或 gameplay state。
- Gate C 继续只用同一 Original/16x16 包，增加稀疏生活 Props、水生植物/岸石/波纹、作物 frame、桥头景观与一棵静态粉色地标树。
- Town 进入同素材体系的视觉主街 Gate A；Cottage、Seed Shop、NPC、玩法规则、GameSession、SaveRepository 与存档 schema 均不变。
- 原 ZIP、截图和未采用目录保存在 Git ignored `artifacts/vectoraith-farming-sim-v1.08-1957927a/`，不进入 Git；6 张被运行时直接引用的官方 PNG 按原始 bytes 上传 CDN。

## Direct production originals

运行时直接加载官方归档内的完整 Original/16×16 PNG，不裁剪、不重排、不合图、不重编码：

| Object key | 尺寸 | Bytes | SHA-256 | 处理 |
|---|---:|---:|---|---|
| `.../original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_terrain_spring_expanded.png` | 256×256 | 21,694 | `e86e6c9b5f003b0e74a7cbac261cd89df2bd56a0df6af90c6cd08e046a9dbffa` | none |
| `.../original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_buildings.png` | 256×256 | 16,502 | `cf4670e091ab1a4e6b84b7f88c96de7304f33730c54fc9f6956f1051bf07b69a` | none |
| `.../original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_details.png` | 256×256 | 27,372 | `d0e32b626904506b027ce9cb7eb4fb1ac5a70fe74572bdea75983cd06c728c9e` | none |
| `.../original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_orchard.png` | 256×256 | 11,487 | `5488f4107c9bb136e057be2f1b95a6b3688d80026f295b940bd057e3396788fb` | none |
| `.../original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_crops.png` | 256×256 | 13,655 | `ac174d7c0a45afb6525f1210f06fad86d6fce1112f5ced5d5f472590fe6d3d61` | none |
| `.../original/16x16/sprites/$farmer.png` | 48×128 | 3,059 | `85fe4b7350f2ccf9a6225c2bec6fe1bc9f5dfa00909605cc4ec3962d1c006f08` | none |

生产 TMJ 保留官方 16-column metadata 与原始 GID；Tiled 1.12.2 渲染与批准 checkpoint 像素一致。Phaser 直接注册原 sheet frame，并使用 NEAREST 与整数 camera zoom 放大。

## License decision

官方页面允许在免费与商业项目中使用并修改素材，同时禁止原样再分发、转售或再许可素材文件及衍生文件，并禁止 NFT 与 AI learning。ZIP 内没有独立 LICENSE/README。

用户于 2026-08-25 最新明确要求删除全部裁剪/重排/合图/重编码产物，并批准 6 张官方完整 PNG 作为浏览器运行时资源直接公开下载，同时接受作者书面回复前的残余风险。

边界固定为：不上传原 ZIP、截图或未采用目录，不提供素材目录/浏览入口，不转售/再许可，不主张所有权；作者回复若要求署名、额外包装或扩展许可，则使用 forward-fix 更新。
