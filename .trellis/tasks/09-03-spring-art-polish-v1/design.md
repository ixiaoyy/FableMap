# 技术设计

## Boundaries and flow

- 小屋：`cottage.tmj` 固定 Tile Layers → client visual profile → Phaser。用运行时原创像素木作表达；保留原有稳定对象 ID，重新编排小屋家具及 Collision。额外 `cottage-room-view` 点位由地图拥有，只供客户端固定镜头读取。
- 物品：`ItemId` → client-only `item-icons.ts` → `ItemIcon.vue` / Phaser。既有图集直接选原 frame；袋子叠加作物标识；六鱼与竹竿等小图形共用源码像素定义，由 Vue SVG 与 Phaser Canvas 渲染。
- 动作：原输入 → `ActionTimeline` → client action presenter；impact 回调仍由 WorldScene 发出 GameSession command，反馈 tone 决定成功效果。
- 九种角色使用自己的 VectoRaith profile，通过原有帧、身体姿态、真实工具与少量接触粒子表现，避免另一角色的完整动画替换外观。

## Files

- `client/src/game/assets/item-icons.ts`、原创像素定义与图标注册。
- `client/src/ui/items/ItemIcon.vue`，Hotbar/Backpack/Gift/Fishing 消费面。
- `client/src/game/presentation/` 小屋纹理和工具动作表现。
- `client/src/game/scenes/WorldScene.ts`、`entities/WorldEntities.ts`、`assets/visual-profile.ts`。
- `public/map/cottage.tmj` 与相应合同；不运行 fixture 生成器覆盖正式地图。

## Compatibility

GameSession、v10 save、ItemDefinition 和输入协议不变。Cottage 的 40×30 尺寸、既有对象 ID 和三宠物点位保留；床、入口和出口重新布局。既有 `reconcileGameStateWithCatalog` 会把受新 Collision 影响的旧坐标放回该区域安全入口，无新迁移。运行时纹理用 NEAREST 和整数像素；只清理当前动作/场景拥有的表现。无新增 URL、付费包或依赖。

## Visual findings

- 原有 GARDENS 坐标实际取到了铁锹、镰刀局部和钳子。放大原图网格后校正为锄头 `(0,2)`、水壶 `(0,5)`、木斧 `(0,10)`，种子袋继续 `(6,5)`。
- 木材、春日野花、春笋、竹竿和六种鱼使用客户端源码像素配方；野花/春笋的世界实体与背包共享同一图形。
- 小屋需要在 HUD 留白中完整显示门槛与家具，固定 2× 相机读取地图的 `cottage-room-view` 点。

## Alternatives researched

- VectoRaith 室内/图标付费包：预算 0 下不采用。
- HelloRumin：局部 pose，未有正式 Web/CDN 分发结论，本批不采用。
- Kenney Roguelike/RPG 1.0（官方 CC0，16px）及作者 CC0 Retro Fish 已查：现有图集与少量原创像素 UI 足以覆盖本批，为少量元素增加新风格/发布链的成本较高。
- 动画/粒子复用 Phaser 与 ActionTimeline，不引入框架。

## Rollback

仅撤销本任务客户端与小屋视觉差异，保留他人文档改动；无需数据回滚。
