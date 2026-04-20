# 2026-04-20 - FM-VT-GC-08 TavernGroupChatRoom 界面

## 为什么改

GC-07 已在 `tavernService.js` 封装酒馆级群聊接口，但访客聊天房间仍使用临时 `/api/group/*` 选择器，再对每个角色走单聊生成。这样会让群聊 UI、持久群聊历史和酒馆级 API 脱节。

## 改了什么

| 文件 | 说明 |
|------|------|
| `frontend/src/TavernChatRoom.jsx` | 群聊模式改为加载 `getGroupChatHistory()`，发送时调用 `sendGroupChat()`，并将多角色回复追加到同一消息流 |
| `docs/AI_SHARED_TASKLIST.md` | 将 FM-VT-GC-08 标记为完成 |
| `docs/CURRENT_TASKS.md` | 同步 Phase 11 群聊任务状态 |
| `docs/claims/2026-04-20-fm-vt-gc-08-tavern-group-chat-room.md` | 新增本次任务认领说明 |

## 行为变化

- 进入群聊模式时会读取酒馆级 `/group-chat/history`，展示已持久化的访客群聊历史。
- 访客发送一句话后，前端只调用一次 `sendGroupChat()`，由后端选择多个角色并返回多条回复。
- 每条角色回复会按 `character_id` 映射到当前角色卡，消息流展示对应头像和角色名。
- 群聊模式下点击左侧角色仍只切换展示角色 / 详情，不清空当前群聊消息。
- 单聊模式仍保留原有 `getChatHistory()` / `sendChat()` 链路。

## 没改什么

- 未新增独立 `TavernGroupChatRoom.jsx` 文件；按任务允许范围集成到现有 `TavernChatRoom.jsx`。
- 未移除 `tavernService.js` 中已有临时 `/api/group/*` 兼容方法。
- 未改店主群聊配置界面（GC-09）。
- 未改 Tavern / Character schema、LLM provider 或 Token 计费策略。

## 验证

- 已通过：`npm --prefix .\frontend run build`
- 已通过：`py -3 -m pytest -q --tb=short tests/test_group_chat.py tests/test_default_public_welfare_taverns.py`（12 passed）
- 已通过：`git -c safe.directory=D:/work/ai- diff --check`

## 风险

- 群聊消息表情目前使用默认表情；后续如果需要多角色逐条表情推断，可在 UI 层增量补充。
- 群聊接口不返回 `visitor_state` / `created_memories`，因此群聊发送后的记忆面板不会像单聊一样立即追加新提炼结果。
