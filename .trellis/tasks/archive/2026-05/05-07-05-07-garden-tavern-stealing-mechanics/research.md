# Research: garden-tavern-stealing-mechanics

## Relevant Specs
- `.trellis/spec/frontend/directory-structure.md`: 菜园玩法属于 `frontend/app/product/` product parity 模块。
- `.trellis/spec/frontend/component-guidelines.md`: 偷菜 UI 需要保持函数组件、清晰按钮状态和移动端可用。
- `.trellis/spec/frontend/state-management.md`: 本任务使用 localStorage 访客私有进度，不新增全局状态或后端合同。
- `.trellis/spec/frontend/quality-guidelines.md`: 前端交互改动需要脚本测试、build，以及可视自验收。
- `.trellis/spec/frontend/type-safety.md`: progress/stealing 本地数据要 normalize，不能信任 localStorage。
- `.trellis/spec/guides/code-reuse-thinking-guide.md`: 直接扩展 farm helper/UI，避免新增重复农场状态模块。

## Code Patterns Found
- `frontend/app/product/tavernFarmModes.js`: 当前已有作物、库存、钱包、交易所和 `updateFarmProgress`，适合扩展 stealing 状态。
- `frontend/app/product/GardenFarmPanel.jsx`: 同一菜园面板里已有地块、仓库、交易所，适合追加邻田偷菜卡片。
- `frontend/app/product/TavernChatRoom.jsx`: `handleFarmAction` 负责动作 -> 本地保存 -> NPC prompt，适合追加偷菜 prompt payload。
- `frontend/scripts/tavern-farm-modes-test.mjs`: 已覆盖交易所 helper，可继续覆盖偷菜次数/库存规则。

## Files to Modify
- `frontend/app/product/tavernFarmModes.js`: 增加每日偷菜限制、邻田配置、偷菜计算/更新/prompt。
- `frontend/app/product/GardenFarmPanel.jsx`: 增加邻田偷菜 UI、剩余次数和禁用状态。
- `frontend/app/product/TavernChatRoom.jsx`: 为 steal 动作计算 prompt payload 并持久化本地进度。
- `frontend/app/product/styles.css`: 增加偷菜卡片样式和移动端布局。
- `frontend/scripts/tavern-farm-modes-test.mjs`: 增加偷菜 helper 回归测试。
