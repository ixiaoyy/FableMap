# T5.6 — 访客昵称系统

## 概述

新增访客昵称系统：首次访问平台时弹出昵称设置弹窗，用户消息在聊天中显示昵称而非匿名 UUID。

## 新增文件

- [VisitorNicknameModal.jsx](frontend/src/VisitorNicknameModal.jsx) — 首次入场昵称输入弹窗组件
  - 强制显示（点击遮罩无法关闭），必须输入昵称才能继续
  - 本地验证：非空、最大 24 字符
  - 提交后调用 `onSubmit` 回调，App.jsx 负责保存到 localStorage

## 修改文件

### App.jsx
- **新增** `visitorNickname` state：从 `fablemap_visitor_nickname` localStorage 读取
- **新增** `VisitorNicknameModal` 导入
- **渲染** `VisitorNicknameModal`：当 `!visitorNickname` 时显示
- **传递** `visitorNickname` 给 `TavernChatRoom` 组件

### TavernChatRoom.jsx
- **新增** `visitorNickname` prop（默认值 `''`）
- **更新** `ChatMessage` 组件签名：增加 `visitorNickname` 参数
- **渲染** 用户消息时显示 `.visitor-sender` 标签（昵称）

### styles.css
- **新增** `.visitor-nickname-overlay`（z-index: 300，模糊背景遮罩）
- **新增** `.visitor-nickname-modal`（居中卡片，最大宽度 420px）
- **新增** `.visitor-nickname-icon`、`.visitor-nickname-title`、`.visitor-nickname-subtitle`
- **新增** `.visitor-nickname-form`、`.visitor-nickname-field`、`.visitor-nickname-input`、`.visitor-nickname-label`、`.visitor-nickname-error`、`.visitor-nickname-submit`、`.visitor-nickname-hint`
- **新增** `.visitor-sender`（用户消息气泡内的昵称显示，白色加粗）

## 技术细节

### localStorage 键
- `fablemap_visitor_id` — 访客唯一标识（已有）
- `fablemap_visitor_nickname` — 访客显示昵称（新增）

### 首次访问流程
1. App.jsx 初始化时读取 `fablemap_visitor_nickname`
2. 若为空字符串 → 渲染 `VisitorNicknameModal`
3. 用户输入昵称并提交 → `localStorage.setItem('fablemap_visitor_nickname', nickname)` + 更新 state
4. state 更新后 `!visitorNickname` 为 false → 弹窗消失
5. 后续访问时 nickname 已存在于 localStorage → 跳过弹窗

### ChatMessage 渲染逻辑
- `isUser && visitorNickname` → 显示 `.visitor-sender` 标签（白色昵称）
- `!isUser && character` → 显示 `.message-sender` 标签（角色名 + 表情标签）

## 测试要点

- [ ] 首次访问平台时弹出昵称设置弹窗
- [ ] 弹窗点击遮罩无法关闭（强制设置）
- [ ] 输入空内容提交 → 显示错误提示
- [ ] 输入昵称 → 点击「进入酒馆」→ 弹窗消失
- [ ] 进入酒馆 → 发送消息 → 消息气泡旁显示昵称
- [ ] 刷新页面 → 昵称已填充（不需重新输入）
- [ ] 移动端（宽度 ≤ 720px）弹窗布局正常
