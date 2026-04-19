# FM-VT-GC-03 任务认领：群聊界面稳定性

## 任务 ID
FM-VT-GC-03

## 任务名称
群聊角色点击不清空当前对话

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
前端交互修复

## 任务目标
在 GC-01 / GC-02 的群聊 MVP 基础上，修复群聊房间内点击左侧角色时误触发单聊切换逻辑的问题：

1. 群聊模式下点击角色只切换当前展示角色与头像表情，不清空群聊消息。
2. 群聊消息只在进入或更换群聊房间时重置。
3. 群聊顶部状态显示中文策略名和每轮最多回复人数，避免直接暴露内部 strategy id。

## 可修改范围
- `frontend/src/TavernChatRoom.jsx`
- `docs/claims/2026-04-20-fm-vt-gc-03-group-chat-ui-stability.md`
- 后续完成记录：`docs/changes/2026-04-20-fm-vt-gc-03-group-chat-ui-stability.md`

## 明确不改范围
- 不改群聊后端选择算法。
- 不改单聊历史加载逻辑。
- 不新增新的持久化会话结构。
- 不改角色管理和酒馆配置表单。

## 依赖的协议文档
- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md`
- `docs/claims/2026-04-20-fm-vt-gc-02-group-chat-session-continuity.md`

## 预期产出
- 群聊房间内点击不同角色时，现有群聊消息仍保留。
- 更换房间或重新进入群聊模式时，群聊消息会按房间边界重置。
- 群聊状态条展示“均衡轮换 / 按积极度 / 固定轮流 / 减少重复”等中文标签。

## 验证方式
- `npm --prefix .\frontend run build`
- `py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- `py -3 -m compileall -q fablemap`

## 当前状态
done
