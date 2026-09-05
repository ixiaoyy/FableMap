# 技术设计

## Rendering

- 复用 `cottage-art.ts` 的像素配方、色板和绘制原语，小屋原有像素不变。
- 新 `shop-interiors-art.ts` 在 256×256 运行时 Canvas texture 中保留前 128 行基础木作，再加入商店/工坊陈设与石地。
- `visual-profile.ts` 提供 tileset binding 和三处精修室内的固定 camera anchor ID；`WorldScene` 注册纹理并按地图取镜头。
- 两个正式 TMJ 拥有静态摆放、Collision 和位置；PNG 仅为 ignored Tiled 缓存，无新增 URL 或 CDN 对象。

## Gameplay boundary

`TMJ anchor/Collision → WorldCatalog → 原有 NPC resolver/pathfinding 与 GameSession`，渲染只消费位置。

- 华强位于柜台后方，三锚点有通路，柜台前接近点在既有交互距离内。
- forge/tool-rack bounds 对应真实图形，昊天靠近铁砧，昊美丽靠近整理台。
- 保留所有 ID；各增加一个地图拥有的镜头 spawn。旧坐标被新 Collision 遮挡时，复用既有安全入口 reconcile。
- 日程、商品、金币、好感、天气覆盖、升级与存档全部由原有 domain 决定，不复制规则。

## Reuse and licensing

沿用第一批已研究和认可的零预算路线：既有 Phaser/Vue 与源码定义的原创像素图形，不新增通用库/第三方素材，不改变官方原图 bytes。

## Risks and validation

浏览器往返复现了返回 Town 后黑屏但 DOM 方向仍可移动。代码核对确认：`WorldCatalog.exitAt()` 上边界包含等号，原门外点仍算在入口中；`beginRegionTransition()` 只锁私有 phase，没有同步方向控件的共享锁，拒绝分支也没有 fade-in。窄修为 `(496,208)` 落点、完整过渡期共享输入锁、拒绝分支恢复画面。补一条落点净空回归检查，其他测试矩阵不扩展。

- 柜台前距离、华强三锚点通路、营业交易。
- 炉前/架前可达且在 48px inspect 范围内。
- 包括 Collision 的所有非零 GID 属于当前内嵌 tileset。
- 桌面/手机入口与人物不被 HUD 遮挡。
- 最小 typecheck、client build 与相关纯数据/运行时检查，不扩建测试矩阵。
