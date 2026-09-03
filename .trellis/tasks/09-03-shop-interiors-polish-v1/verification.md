# 验证记录 · 2026-09-03

## 自动检查

- 最终 `typecheck` 与 `build:client` 通过。139 modules，产物 JS 约 1,714KB；保留既有 Phaser 大包提示，本轮未扩展打包优化。
- 纯数据检查覆盖 12 张地图，NPC 全日程、activity 和宠物路线通过；两图原有各六个 object IDs 保留；所有非零 GID 在内嵌图集范围内。
- 华强三锚点两两通路可走，含角色脚部采样；柜台前与 NPC 距离 40px，满足现有 42px 合同。
- 工坊炉前/架前站位可达且在 48px 查看范围内；新墙体中的旧坐标可由原有 reconcile 回安全入口，存档仍为 v10。
- 门外落点 `(496,208)` 可走，且 `catalog.exitAt()` 返回 null。
- 定向运行 `node --import tsx --test --test-name-pattern="seed shop return landing" test/town-population-contract.test.mjs`：1/1 通过；未运行全量测试矩阵。
- 结构输出和绘图指令保留在 `artifacts/shop-interiors-polish-v1/`；PNG 是 ignored Tiled 缓存，不增加生产媒体。

## 实际浏览器路线

- 使用独立 `127.0.0.1:8085` 的构建预览，新建本地农场，通过游戏移动进入种子店与铁匠铺。
- 柜台前点击华强打开商店，购买一袋萝卜种子：100g→80g，持有数量 0→1。刷新后状态保持。
- 种子店 1280×720 与 390×844 画面已查看；柜台、货架、入口和触摸控制可见。
- 铁匠铺炉前点击显示「冷却的锻炉」原有说明，架前点击显示「工具架」原有说明。白天看到昊美丽工作点，傍晚看到昊天在铁砧附近。
- 铁匠铺桌面/手机画面已查看，工作台和入口未被 HUD 遮挡。

## 实际缺陷与复验

往返时发现 Town 店门落点仍在入口 inclusive 边界上；方向控件能在切图私有 phase 中继续发 move，拒绝的 transition 又没有淡入恢复，导致黑屏。

本批将落点 y=192→208，完整过渡期共享输入锁，并在拒绝时恢复画面。重新构建后复验：Town→Seed Shop→Town 成功，返回位置为 `(496,208)`；画面、方向控制和时间正常恢复，console error/warn 为 `[]`。

## 截图与状态

`artifacts/shop-interiors-polish-v1/` 保存：

- `seed-shop-preview.png`、`seed-shop-mobile.png`
- `blacksmith-preview.png`、`blacksmith-mobile.png`
- `return-to-town.png`

本批生产代码已暂存；测试、文档和截图不自动暂存。没有连接服务端数据库、新增依赖、采购素材、提交或部署。最终真人审美验收待用户反馈。
