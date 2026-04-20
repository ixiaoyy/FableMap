# 2026-04-20 - FM-VT-GC-11 群聊记忆与回访联动

## 为什么改

访客单聊成功后会返回 `visitor_state` 和 `created_memories`，前端可即时刷新记忆面板；群聊成功后此前只返回角色回复，导致访客虽然参与了群聊，但回访关系和结构化记忆 UI 不会同步更新。

## 改了什么

| 文件 | 说明 |
|------|------|
| `fablemap/web/service.py` | 群聊成功发送后更新 VisitorState；将多角色回复合并提炼为 `visitor_tavern` 记忆；API 返回 `visitor_state` 和 `created_memories` |
| `frontend/src/TavernChatRoom.jsx` | 群聊发送后消费 `visitor_state` / `created_memories`，刷新访客记忆面板状态 |
| `tests/test_group_chat.py` | 酒馆级群聊路由测试增加 visitor_state、created_memories 和 `/memories` 可读断言 |
| `docs/AI_SHARED_TASKLIST.md` | 新增并完成 FM-VT-GC-11 |
| `docs/CURRENT_TASKS.md` | 同步 Phase 11 群聊任务状态 |
| `docs/claims/2026-04-20-fm-vt-gc-11-group-chat-memory-link.md` | 新增本次任务认领说明 |

## 行为变化

- `/api/taverns/{id}/group-chat` 成功返回：
  - `visitor_state`
  - `created_memories`
- 群聊记忆使用 `character_id=""`，因此保存为 `visitor_tavern` 范围，不会误绑定到某个单独 NPC。
- 前端群聊发送后，记忆面板可立即看到最新回访关系和本轮提炼记忆。

## 没改什么

- 未改变群聊发言策略。
- 未改变单聊记忆逻辑。
- 未改变 MemoryAtom schema。
- 未新增前端依赖。

## 验证

- 已通过：`& 'C:\Users\phpxi\miniconda3\python.exe' -m pytest -q --tb=short -p no:cacheprovider --basetemp .\tmp_pytest_escalated_gc11 tests/test_group_chat.py`
- 已通过：`npm --prefix .\frontend run build`
- 已通过：`& 'C:\Users\phpxi\miniconda3\python.exe' -m compileall -q fablemap`
- 已通过：`git -c safe.directory=D:/work/ai- diff --check`

## 风险

- 群聊自动记忆会把多角色回复合并为一轮助手文本；如果后续要做“每个 NPC 独立记忆”，需要再扩展记忆来源展示，而不是复用本切片的聚合策略。
