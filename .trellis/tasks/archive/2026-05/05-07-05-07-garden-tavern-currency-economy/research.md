# Research: garden-tavern-currency-economy

## Relevant Specs
- `.trellis/spec/frontend/directory-structure.md`: 菜园玩法属于 `frontend/app/product/` product parity 模块。
- `.trellis/spec/frontend/component-guidelines.md`: 经济面板、商店弹层和按钮禁用状态需要移动端可用、文案清晰。
- `.trellis/spec/frontend/state-management.md`: 使用 localStorage 访客私有进度，不新增全局状态或后端合同。
- `.trellis/spec/frontend/quality-guidelines.md`: 前端交互改动运行脚本测试、build 和可视自验收。
- `.trellis/spec/frontend/type-safety.md`: localStorage progress 需要 normalize，避免信任未知字段。
- `.trellis/spec/guides/code-reuse-thinking-guide.md`: 复用 `tavernFarmModes.js` / `GardenFarmPanel.jsx`，避免重复经济模块。

## Code Patterns Found
- `frontend/app/product/tavernFarmModes.js`: 已承载作物、库存、交易所、偷菜与 progress 保存，是黑钻/补给/商店/统计的扩展点。
- `frontend/app/product/GardenFarmPanel.jsx`: 已显示地块、库存、交易所、邻田，可追加余额、每日补给、商店和本地统计。
- `frontend/app/product/TavernChatRoom.jsx`: `handleFarmAction` 负责动作计算、保存 progress、生成 NPC prompt。
- `frontend/scripts/tavern-farm-modes-test.mjs`: 已覆盖菜园 helper，可继续覆盖种子成本、每日补给、收益统计和排行 prompt。

## Files to Modify
- `frontend/app/product/tavernFarmModes.js`: 黑钻种子成本、每日补给、商店购买、高级种子解锁、本地统计和 prompt。
- `frontend/app/product/GardenFarmPanel.jsx`: 余额/补给/商店/本地经济看板 UI，种植按钮价格与禁用状态。
- `frontend/app/product/TavernChatRoom.jsx`: 使用 extended farm update/prompt，传递 plant/buy/bonus payload。
- `frontend/app/product/styles.css`: 经济看板、商店弹层和移动端样式。
- `frontend/scripts/tavern-farm-modes-test.mjs`: 经济 helper 回归测试。
