# FM-VT-GC-11 任务认领：群聊记忆与回访联动

## 任务 ID

FM-VT-GC-11

## 任务名称

群聊记忆与回访联动

## 认领时间

2026-04-20

## 负责人

Codex

## 改动类型

后端聊天链路 + 前端状态刷新切片

## 任务目标

GC-08 已说明群聊接口暂未返回 `visitor_state` / `created_memories`，导致群聊发送后访客记忆面板不会即时刷新。本切片补齐：

1. 群聊成功发送后更新访客回访关系。
2. 群聊一轮多角色回复合并提炼结构化记忆。
3. API 返回 `visitor_state` / `created_memories`。
4. 前端群聊发送后刷新记忆面板状态。

## 可修改范围

- `fablemap/web/service.py`
- `frontend/src/TavernChatRoom.jsx`
- `tests/test_group_chat.py`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-11-group-chat-memory-link.md`
- `docs/changes/2026-04-20-fm-vt-gc-11-group-chat-memory-link.md`

## 明确不改范围

- 不改变群聊发言选择策略。
- 不改单聊记忆提炼逻辑。
- 不新增前端依赖。
- 不改变 MemoryAtom schema。

## 依据的协议文档

- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/changes/2026-04-20-fm-vt-gc-08-tavern-group-chat-room.md`
- `docs/changes/2026-04-20-fm-vt-gc-09-owner-group-chat-settings.md`

## 预期产出

- 群聊 API 返回 `visitor_state` 和 `created_memories`。
- 群聊记忆保存为 `visitor_tavern` 范围，避免误归属单个 NPC。
- 前端群聊发送后即时更新访客记忆状态。
- 测试覆盖 API 返回和 `/memories` 读取。

## 验证方式

- `& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\tmp_pytest_escalated_gc11 tests/test_group_chat.py`
- `npm --prefix .\frontend run build`
- `& 'C:\Users\phpxi\miniconda3\python.exe' -m compileall -q fablemap`
- `git -c safe.directory=D:/work/ai- diff --check`

## 当前状态

done
