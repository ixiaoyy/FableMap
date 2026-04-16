# T2.1 — 角色卡编辑器完整化 + SillyTavern 导入

## 概述

完整实现角色管理模态框，替换 `TavernOwnerPanel` 中原有的简化 `CharacterManagerModal`，新增 SillyTavern Character Card PNG/JSON 导入功能，以及删除确认 UI。

## 新增文件

- [CharacterManagementModal.jsx](frontend/src/CharacterManagementModal.jsx) — 完整的角色管理模态框组件
  - 左侧：角色列表（带头像、性格预览）
  - 右侧：`CharacterEditor` 编辑面板（懒加载）
  - 底部：删除确认浮层（非 browser `confirm()`）
  - SillyTavern PNG 角色卡导入（浏览器端解析 `chara`/`ccv3` tEXt chunk）
  - SillyTavern JSON 角色卡导入
  - 导入进度状态、错误提示

## 修改文件

### TavernOwnerPanel.jsx
- **删除了** 原有的 `CharacterManagerModal` 函数（约 165 行）
- **替换** 为从 `./CharacterManagementModal` 的导入
- **更新** 角色管理模态框渲染：使用新接口 `{ tavern, ownerId, onClose, onCharactersChanged }`
- **移除** 了不再需要的 `CharacterEditor` 和 `createEmptyCharacterDraft` 导入

### styles.css
- **新增** `.char-mgmt-*` 系列样式（约 160 行）：
  - 模态框整体布局：`.char-mgmt-overlay`、`.char-mgmt-modal`、`.char-mgmt-body`
  - 角色列表区：`.char-mgmt-list`、`.char-mgmt-items`、`.char-mgmt-item`
  - 列表项：`.char-mgmt-item-info`、`.char-mgmt-item-avatar`、`.char-mgmt-item-text`、`.char-mgmt-item-actions`
  - 编辑区：`.char-mgmt-editor-area`、`.char-mgmt-editor-placeholder`、`.char-editor-wrapper`
  - 删除确认：`.char-mgmt-delete-confirm`、`.char-mgmt-delete-actions`
  - 错误提示：`.char-mgmt-error`
  - 移动端响应式：最大宽度 720px 断点下改为单列布局

## 技术细节

### SillyTavern PNG 导入原理
`tavernService.js` 中的 `_extractFromPngBuffer` 函数遍历 PNG tEXt chunk，寻找 `chara` 或 `ccv3` 关键词，然后 base64 解码得到 JSON。`parseCharacterCard` 函数规范化字段映射（SillyTavern V2 → FableMap 角色对象）。

### prop 接口
`CharacterManagementModal` 的 props：
```jsx
tavern             // 酒馆数据（从中读取 tavern.id 和 tavern.characters）
ownerId           // 店主 ID（目前用于语义，可选）
onClose           // () => void — 关闭回调
onCharactersChanged  // (characters: Char[]) => void — 角色列表变化后通知父组件
```

父组件（`handleCharactersUpdated`）将其适配为完整的酒馆对象更新：
```jsx
onCharactersChanged={(chars) => handleCharactersUpdated({ ...characterManagerTavern, characters: chars })}
```

## 测试要点

- [ ] 点击 TavernCard 的「角色」按钮打开角色管理模态框
- [ ] 从 SillyTavern 导出的 PNG 角色卡能正确导入（解析 name/description/personality/sprites）
- [ ] 从 SillyTavern 导出的 JSON 角色卡能正确导入
- [ ] 新建角色 → 填写名称 → 保存 → 出现在角色列表
- [ ] 编辑已有角色 → 修改字段 → 保存 → 列表反映更新
- [ ] 删除角色 → 弹出确认 → 确认后角色消失
- [ ] 移动端（宽度 ≤ 720px）模态框布局正常
