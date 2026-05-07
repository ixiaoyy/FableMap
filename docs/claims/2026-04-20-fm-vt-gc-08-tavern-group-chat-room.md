# FM-VT-GC-08 任务认领：TavernGroupChatRoom 界面

## 任务 ID

FM-VT-GC-08

## 任务名称

TavernGroupChatRoom 界面 / 现有聊天房间群聊模式接入

## 认领时间

2026-04-20

## 负责人

Codex

## 改动类型

前端体验切片

## 任务目标

在 GC-07 已封装空间级群聊 API 后，把现有 `TavernChatRoom.jsx` 的群聊模式从临时 `/api/group/*` 选择器 + 多次单聊生成，收口到空间级持久群聊接口：

1. 群聊模式进入时加载 `/group-chat/history`。
2. 访客发送消息时调用 `sendGroupChat()`，一次返回多个角色回复。
3. 消息流显示不同角色头像、角色名和时间。
4. 群聊模式下点击角色只切换右侧展示角色，不清空群聊消息。
5. 保留单聊模式原有历史加载、记忆、语音和降级提示行为。

## 可修改范围

- `frontend/src/TavernChatRoom.jsx`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-08-tavern-group-chat-room.md`
- `docs/changes/2026-04-20-fm-vt-gc-08-tavern-group-chat-room.md`

## 明确不改范围

- 不新增前端依赖。
- 不重写 `TavernChatRoom` 三栏布局。
- 不移除 `/api/group/*` 临时群聊兼容方法。
- 不改店主群聊配置界面（GC-09）。
- 不改 Tavern / Character schema、LLM provider 或 Token 计费策略。

## 依据的协议文档

- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-07-frontend-group-chat-api.md`

## 预期产出

- `TavernChatRoom.jsx` 群聊模式直接使用 `getGroupChatHistory()` 与 `sendGroupChat()`。
- 多角色回复在同一消息流中展示各自角色名和头像。
- 更新共享任务清单和本次变更记录。

## 验证方式

- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short tests/test_group_chat.py tests/test_default_public_welfare_taverns.py`
- `git -c safe.directory=D:/work/ai- diff --check`

## 当前状态

done
