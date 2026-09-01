# 升级、背包与委托 UI：技术设计

## Surfaces

- `BackpackPanel.vue`：独立 trigger + modal，按 snapshot 渲染 `inventoryCapacity` 个格；slot 1–8 标记为快捷栏，不允许在本阶段拖拽/排序。
- `DialoguePanel.vue`：当当前 NPC 是昊天且 Day≥3，在线性对话下方增加唯一 Watering Can Lv2 服务区；成本从 domain constants 导入，点击只 dispatch `upgrade-watering-can`。
- `ShopPanel.vue`：Day≥5 在现有商品列表前增加 Backpack 32 服务区；成本从 domain constants 导入，点击只 dispatch `upgrade-backpack`。
- `RequestBoardPanel.vue`：复用现有 `town-notice-board` inspect anchor，显示 Day1 未开放或 v8 current request 的 NPC/item/qty/owned/Gold/Friendship/completed。

## Store projection

- `game-store.ts` 增加 `backpackOpen`、`requestBoardOpen` 和 current dialogue `npcId`；两面板加入 `isWorldInputLocked`。
- `setDialogue` 接收可选 `npcId`，环境 inspect 保持 null；`closeDialogue` 清理整个 projection。
- RequestPanel 只从 `gameUiState.dailyRequest` + domain catalogs + inventory projection 派生展示，不复制 selector/reward/submit 规则。

## Interaction

- WorldScene 检测 `entity.entityId === "town-notice-board"` 后打开 request modal；其他 inspect 保持对话。
- NPC talk 已由 v8 GameSession 自动提交。UI 只显示 returned thank/missing dialogue 与 feedback，不提供领取按钮。
- Upgrade click 可在 Dialogue/Shop modal 打开时发 command；GameSession 再验证日期、NPC、位置、Gold/wood/already state。

## Visual direction

- 沿用现有 parchment、double border、green/brown ink 和 hard-offset shadow；Backpack 用规整像素格，Request Board 用钉在木板上的窄纸条感。
- Backpack trigger 位于右侧 LifeHud 下方；不与左侧 Social/Audio 冲突。
- 640px 下 modal 占可用宽度、内部滚动；32 slots 使用 4/6/8 列自适应，不横向裁切。
