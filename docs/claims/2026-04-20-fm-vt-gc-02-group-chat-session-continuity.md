# FM-VT-GC-02 任务认领：群聊会话连续性

## 任务 ID
FM-VT-GC-02

## 任务名称
群聊临时会话回复回写

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
前后端功能补齐

## 任务目标
在 GC-01 群聊 MVP 的基础上，让临时群聊会话记录真实角色回复，避免群聊选择器只看到用户发言：

1. 群聊管理器支持记录 assistant 回复。
2. 群聊 API 增加轻量回写端点，用于记录已生成的角色回复。
3. 前端群聊发送完成后，将每个角色的真实回复同步回临时群聊会话。
4. 群聊选择器后续轮次可参考已说话角色，尤其服务 relevance / balanced 策略。

## 可修改范围
- `fablemap/group_chat.py`
- `fablemap/web/router.py`
- `frontend/src/TavernChatRoom.jsx`
- `frontend/src/services/tavernService.js`
- `tests/test_group_chat.py`
- `docs/claims/2026-04-20-fm-vt-gc-02-group-chat-session-continuity.md`
- 后续完成记录：`docs/changes/2026-04-20-fm-vt-gc-02-group-chat-session-continuity.md`

## 明确不改范围
- 不把临时群聊会话落为永久聊天历史。
- 不重写现有 `sendChat` 角色生成链路。
- 不新增新的 LLM 调用路径或前端依赖。
- 不引入访客间实时社交。

## 依据的协议文档
- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md`

## 预期产出
- 群聊临时会话 `message_count` 会包含用户消息和已记录的角色回复。
- `/api/group/{session_id}/send` 返回的 context 能看到上一轮角色回复。
- 前端记录失败不阻断访客聊天主流程。

## 验证方式
- `py -3 -m pytest tests/test_group_chat.py -q`
- `npm --prefix .\frontend run build`
- `py -3 -m compileall -q fablemap`

## 当前状态
done
