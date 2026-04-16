# T5.4 变更记录：移动端适配 — TavernChatRoom + 酒馆创建面板

## 变更日期
2026-04-17

## 任务 ID
T5.4

## 变更类型
样式优化（响应式）

## 概述
在 `styles.css` 中新增 `@media (max-width: 720px)` 媒体查询，覆盖 `TavernChatRoom` 聊天界面和 `TavernCreatePanel` 酒馆创建面板的移动端布局。

## 为什么改
`TavernChatRoom` 和 `TavernCreatePanel` 在移动端（< 720px）没有专项样式，存在以下问题：
- `.chat-room-header` 横向排列，空间局促
- `.char-sidebar`（280px 固定宽度）占用过多屏幕空间，角色列表未针对小屏优化
- `.chat-message` 宽度 85%，在手机上显得过窄
- `.chat-input-area` 和 `.chat-char-bar` padding 不适应小屏
- `.tavern-create-panel` 宽度固定，无法适配手机全屏使用

## 改了什么
**文件：`frontend/src/styles.css`**

在 `@media (max-width: 720px)` 中新增以下移动端规则：

### TavernChatRoom
| 选择器 | 改动 |
|--------|------|
| `.tavern-chat-room` | `flex-direction: column; height: 100dvh` 全屏纵向布局 |
| `.chat-room-header` | `flex-direction: column` 纵向堆叠，减少 padding |
| `.chat-room-body` | `flex-direction: column` 侧边栏变为横向滚动条 |
| `.char-sidebar` | 改为横向滚动模式，字符列表水平排列 |
| `.char-list` | `flex-direction: row; overflow-x: auto` 角色横向滚动 |
| `.char-item` | 改为纵向居中布局，减小尺寸 |
| `.chat-char-bar` | 减少 padding，表达式状态缩小 |
| `.chat-message` | `max-width: 92%` 消息更宽 |
| `.message-bubble` | 减小 padding 和字体 |
| `.chat-input-area` | 减少 padding |
| `.input-wrapper` | 减小内部 padding |
| `.chat-textarea` | `min-height: 40px; max-height: 80px` 更紧凑 |

### TavernCreatePanel
| 选择器 | 改动 |
|--------|------|
| `.tavern-create-panel` | `width: 100%; max-width: 100%; height: 100dvh; border-radius: 0` 全屏无圆角 |
| `.tavern-create-steps` | `flex-wrap: wrap` 步骤按钮换行 |
| `.tavern-create-actions` | `flex-direction: column; gap: 8px` 按钮垂直堆叠，每个按钮全宽 |

## 没改什么
- JSX 组件结构未修改
- 后端未修改
- TavernOwnerPanel 的移动端样式未修改（已有）

## 影响文件
| 文件 | 改动类型 |
|------|----------|
| `frontend/src/styles.css` | 样式添加 |
| `docs/CURRENT_TASKS.md` | 状态同步 |

## 验证
- `npm run build` 在 `frontend/` 执行成功（73 modules, CSS 79.34 kB, JS 315.30 kB）

## 风险点
- `100dvh`（dynamic viewport height）在部分移动浏览器上行为差异，需在真机上测试
- TavernChatRoom 的 `.char-sidebar` 改为横向滚动后，需要确保展开/收起状态仍然正常工作
