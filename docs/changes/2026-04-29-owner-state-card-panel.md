# Owner StateCard Management Panel

## Summary

店主侧状态卡（Canon Ledger）管理面板已完成。店主可查看空间所有状态卡（按状态/类型/范围筛选），确认/拒绝/替换访客提出的候选卡，以及手动创建空间级正史卡。

## Changes

### frontend/app/product/OwnerStateCardPanel.jsx（新增）

全功能店主侧状态卡管理面板：

- **卡片列表**：按 pending/confirmed/rejected/superseded 分组展示，每张卡片显示类型图标、状态标签、范围标记、矛盾警告
- **筛选器**：状态、类型、范围三级筛选，支持刷新
- **卡片决策**：pending 卡可一键确认加入正史、忽略或替换
- **创建正史卡**：店主可手动创建 canon_scope=tavern 的状态卡（类型/标题/摘要），创建后进入 pending 待确认状态
- **数据来源**：调用 `listStateCards`/`decideStateCard`/`createStateCard`（已从 `taverns.ts` 导出）

### frontend/app/product/TavernOwnerPanel.jsx

- 导入 `OwnerStateCardPanel`
- 添加 `stateCardTavern` 状态
- 渲染 `OwnerStateCardPanel` 弹窗（tavern + ownerId + onClose）

### frontend/app/product/OwnerConsoleSections.jsx

- `OwnerAdvancedToolPanel` 新增 `onManageStateCards` prop
- 空间卡工具按钮区新增"状态卡"按钮（紧接"群聊"后）

### frontend/app/product/styles.css

新增 `.owner-state-card-panel` 及相关样式：

- 弹窗布局（760px max-width, 90vh max-height, flex-col）
- 筛选栏（select 下拉样式）
- 创建表单（输入框/textarea/select 样式）
- 卡片列表（分组标签、卡片项、图标/标签/状态徽章）
- 决策按钮（确认/拒绝/替换三色）
- 矛盾警告徽章、空状态、加载态
- 移动端响应式折叠

## Verification

- `npm --prefix ./frontend run build` 通过
- `py -3 -m pytest tests/ --ignore=tests/test_api.py --ignore=tests/test_voice_greeting.py -q` 258 passed