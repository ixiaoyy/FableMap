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
- Town、Cottage、Seed Shop、NPC、玩法规则、GameSession、SaveRepository 与存档 schema 均不变。
- 原包、完整 PNG 和截图保存在 Git ignored `artifacts/vectoraith-farming-sim-v1.08-1957927a/`，不进入 Git 或 CDN。

## Production derivatives

只发布实际运行需要的最小派生 PNG：

| Object key | 尺寸 | Bytes | SHA-256 | 处理 |
|---|---:|---:|---|---|
| `assets/vendor/vectoraith/farming-sim-v1.08/farm-terrain.png` | 128×64 | 3,469 | `7eb50c6588605efeb54e3d5f6aefa6dfa105b827f95aaad8322d9d8bfadab5d6` | 只重排 Gate C 实际使用的 spring terrain tiles |
| `assets/vendor/vectoraith/farming-sim-v1.08/farm-buildings.png` | 128×80 | 3,063 | `3f3c121917067bbe5056574f6ccf800308a2d98b486d7e299b4d543aa46ff357` | 只重排实际使用的建筑/Props tiles |
| `assets/vendor/vectoraith/farming-sim-v1.08/farm-details.png` | 128×80 | 5,322 | `40f48f1e5469156988af5e46363f62af44b9b3ec394b54141b1153be4f4fd5bd` | 只重排实际使用的 fence/bridge/tree/water-detail tiles |
| `assets/vendor/vectoraith/farming-sim-v1.08/farm-entities.png` | 64×96 | 2,867 | `0a0d2a6ca099ebcbc898bae482b6407cd22fbead3265d624f162a213de018833` | 只合并 tree/stump/rock/growing/mature frames |
| `assets/vendor/vectoraith/farming-sim-v1.08/farmer.png` | 48×128 | 2,950 | `864bd89bb8386f5a79324dca6b9eecd4289f2e30d966e5a501d4b2ae44f3113a` | 完整使用的 farmer sheet，重编码但不缩放 |

生产 TMJ 把 GID 重映射到上述 compact tilesets；Tiled 1.12.2 渲染与批准 checkpoint 像素一致。所有源 tile 保持 Original/16×16，由 Phaser NEAREST 与整数 camera zoom 放大。

## License decision

官方页面允许在免费与商业项目中使用并修改素材，同时禁止原样再分发、转售或再许可素材文件及衍生文件，并禁止 NFT 与 AI learning。ZIP 内没有独立 LICENSE/README。

项目把仅供游戏运行的最小派生 atlas 视为许可所允许的项目内使用，而不是素材包式再分发。用户于 2026-08-25 明确批准该解释并接受作者书面回复前的残余风险。

边界固定为：不上传原 ZIP/完整 sheets，不提供素材目录或下载入口，不转售/再许可，不主张所有权；作者回复若要求署名、额外包装或扩展许可，则使用 forward-fix 更新。
