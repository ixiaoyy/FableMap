# 当前主线角色创建与选择：技术设计

## 数据所有权

- `domain/player/appearance.ts` 只拥有稳定语义 ID、默认值和解码；不保存 URL、texture key 或 frame。
- `GameState.player.appearanceId` 是角色选择的唯一持久事实，当前存档升级为 v6；v1–v5 均迁移为现有 farmer，保证继续游戏不改变旧角色外观。
- `GameSession.newGame(appearanceId)` 在创建初始状态前验证 ID，并在首次写盘成功后才发布世界。
- `client/game/assets/visual-profile.ts` 是 appearance ID → 官方图集动画帧的唯一表现映射。

## 页面流程

```text
菜单“新游戏” → 已有存档覆盖确认 → 角色创建页
角色创建页浏览/选择 → 最终“开始新生活” → GameSession.newGame(id) → Phaser
角色创建页取消 → 返回原菜单/错误页，存档不变
```

- 页面使用当前已登记的 VectoRaith farmer 和 NPC demo 原图，不增加图片二进制或媒体对象。
- 角色卡提供鼠标/触屏点击、Tab、方向键、Enter 和 Escape；选中状态不只依赖颜色。
- 预览使用 CSS 像素裁切和三帧行走循环，不生成衍生 PNG。

## Phaser 投影

- NPC demo 改为 16×32 spritesheet 加载，同时保留现有 named atlas frame 注册。
- WorldScene 从已启动 GameSession snapshot 解析一次 player media；同一局不允许外观漂移。
- farmer 使用原 3×4 合同；NPC demo 使用 RPG Maker 8-character sheet：12 列×8 行、每人 3×4 帧、四方向。

## 兼容与风险

- 旧存档默认 `farmer-original`，视觉零回退。
- 新玩家若选择 NPC demo 外观，可能与现有居民使用同源造型；第一版接受同素材复用，后续由专用可换装素材替换，但 stable appearance ID 不绑定 NPC identity。
- 工具候选动画仍只在开发预览开关下运行，不扩大本任务范围。
