# 2026-04-20 - FM-VT-GC-02 群聊会话连续性

在 GC-01 群聊 MVP 基础上，为临时群聊会话补齐真实角色回复回写，让后续轮次的群聊选择和上下文能看到上一轮谁说过什么。

## 范围

| 文件 | 说明 |
|------|------|
| `fablemap/group_chat.py` | 新增 `add_assistant_message`，并让群聊 LLM 上下文包含所有角色回复 |
| `fablemap/web/router.py` | 新增 `/api/group/{session_id}/record` 回写端点；`send` 支持 `include_names` 并返回 `message_count` |
| `frontend/src/services/tavernService.js` | 新增 `recordGroupMessage`，`sendGroupMessage` 支持附加选项 |
| `frontend/src/TavernChatRoom.jsx` | 群聊角色回复生成后，尽量回写到临时群聊会话，失败不阻断聊天 |
| `tests/test_group_chat.py` | 覆盖回写后下一轮 context 能看到上一轮角色回复 |
| `docs/claims/2026-04-20-fm-vt-gc-02-group-chat-session-continuity.md` | 本任务认领说明 |

## 行为

- 前端仍沿用现有 `sendChat` 生成每个角色回复，不新增 LLM 调用路径。
- 每个群聊角色回复生成后，会调用 `/api/group/{session_id}/record` 写回临时群聊会话。
- 回写失败只记录前端警告，不影响访客看到回复。
- 群聊上下文现在包含所有角色的历史 assistant 消息，并在 `include_names=true` 时带角色名前缀。
- `/api/group/{session_id}/send` 返回 `message_count`，便于测试和后续调试。

## 验证

- `py -3 -m pytest tests/test_group_chat.py -q`
- `npm --prefix .\frontend run build`
- `py -3 -m compileall -q fablemap`

## 备注

`npm --prefix .\frontend run build` 仍报告既有 Vite 提示：`tavernService.js` 同时被静态和动态 import，构建成功，不影响本切片。
