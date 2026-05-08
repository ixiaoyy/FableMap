# Research: garden-tavern-exchange-system

## Relevant Specs
- `.trellis/spec/frontend/directory-structure.md`: 菜园功能在 `frontend/app/product/`，应复用现有产品模块与服务/工具位置。
- `.trellis/spec/frontend/component-guidelines.md`: 交易所卡片需保持函数组件、明确 props、移动端可用，不引入新 UI 框架。
- `.trellis/spec/frontend/state-management.md`: 本任务使用前端本地持久化边界，不新增后端 schema/API。
- `.trellis/spec/frontend/quality-guidelines.md`: 前端 UI 改动至少运行 build；规则/工具函数改动补充脚本测试。
- `.trellis/spec/frontend/type-safety.md`: localStorage 与动态 progress 读取要做 normalize/fallback。
- `.trellis/spec/guides/code-reuse-thinking-guide.md`: 扩展已有 `tavernFarmModes.js`，避免新建重复 farm/market helper。

## Code Patterns Found
- `frontend/app/product/tavernFarmModes.js`: 已有菜园作物、localStorage、种植/浇水/收获 helper，是交易所状态与出售逻辑的扩展点。
- `frontend/app/product/GardenFarmPanel.jsx`: 已有菜园/仓库 UI，应在同一面板增加交易所行情与出售操作。
- `frontend/app/product/TavernChatRoom.jsx`: 已有 `handleFarmAction` 将前端动作写入 localStorage 并转成 NPC 管家 prompt。
- `frontend/app/product/styles.css`: `guild-quest-panel` 一组样式已被菜园面板复用，可追加 farm/market 子类和移动端规则。
- `frontend/scripts/*-test.mjs`: 现有前端 helper 使用 Node assert 脚本做合约测试。

## Files to Modify
- `frontend/app/product/tavernFarmModes.js`: 增加确定性行情、收益格式化、出售逻辑和 prompt 文案。
- `frontend/app/product/GardenFarmPanel.jsx`: 展示交易所行情、钱包收益、库存出售按钮和空库存提示。
- `frontend/app/product/TavernChatRoom.jsx`: 为 harvest/sell 动作补足 prompt payload，避免出售后无法播报收益。
- `frontend/app/product/styles.css`: 增加交易所/仓库/地块样式与窄屏布局。
- `frontend/scripts/tavern-farm-modes-test.mjs`: 覆盖西瓜锚定价、出售扣库存/加收益、空库存不可出售。
- `frontend/package.json`: 将新脚本接入 `npm test`。
