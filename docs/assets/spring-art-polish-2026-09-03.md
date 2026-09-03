# 春季美术精修采用记录 · 2026-09-03

## 范围与来源

- 采购预算为 0，无新增 npm 包、静态图片、外部 URL 或 CDN 对象。
- VectoRaith 六作物继续选择已登记官方原图中的帧；所有官方原图 bytes 保持原样。
- GARDENS 使用已登记的 `all-the-icons-gardens.png`（160×176，13,130 bytes，SHA-256 `de4dbbb56936520882e1217aad9dae22e60a5f57dde15512f673ec031b581536`）。对照实际网格后，正式工具改为锄头 `(0,2)`、水壶 `(0,5)`、木斧 `(0,10)`；种子袋 `(6,5)` 叠加对应现有作物标识。
- IvoryRed 的 CC-BY 4.0 署名继续通过产品现有 `THIRD_PARTY_NOTICES.txt` 交付。
- 木材、野花、春笋、竹竿和六鱼为项目原创 16×16 像素图形，配方在 `item-pixel-art.ts`，Canvas 与 Vue inline SVG 复用 `pixelArtRects()`；没有把第三方图片转成源码，也没有 ImageGen 输出或 prompt sidecar。
- 小屋木作、窗、柜、灶、竹盆、地毯和床由 `cottage-art.ts` 的固定配方生成 256×128 Canvas texture；色板和像素均可在源码审查。

## 运行时边界

- `cottage.tmj` 拥有静态布局和真实碰撞，`cottage-room-view` 拥有镜头位置；`cottage-bed` 继续复用原有交互与日结链。
- Tiled 的 `cottage-woodwork.runtime.png` 只是 ignored 编辑缓存，可从校对页的原生 256×128 atlas Canvas 导出。生产不加载、不复制发布该缓存，纹理由同一源码生成。
- 工具动作继续使用保存角色的原始帧、分阶段姿态与已登记 GARDENS 工具，不切换另一人物。GameSession/ActionTimeline 继续拥有规则与单次 impact。
- 既有 Gate A 的 VectoRaith plowing/HelloRumin 本地候选不进入正式资源路径。`?toolArt=preview` 仅保留已有隔离试玩入口，所见动作与正式路径一致。

## 检索与未采用方案

- [VectoRaith Interior Essentials](https://vectoraith.itch.io/interior-essentials) 和 [Farming Sim Icon Pack](https://vectoraith.itch.io/16x16-farming-sim-icon-pack)：官方存在配套内容，但本轮预算为 0，不采购。
- [Kenney Roguelike/RPG 1.0](https://kenney.nl/assets/roguelike-rpg-pack)：官方 CC0、16×16；为有限小屋增加另一套美术及发布依赖的收益低于当前窄实现。
- [EXCITESZZ Retro Fish](https://opengameart.org/content/2d-retro-fish)：作者页面 CC0；采用独立六鱼轮廓的原创 UI 配方，避免引入不一致的侧视角色图形。
- 继续复用 Phaser 4.2.1 / Vue 3.5.41 和 ActionTimeline；没有新增需要评估安全公告、体积、升级或退出成本的第三方运行时。

## 验证

构建、类型、地图/图标结构与浏览器记录见本任务 `verification.md`。真人手感与最终审美由用户验收，本记录不代签。
