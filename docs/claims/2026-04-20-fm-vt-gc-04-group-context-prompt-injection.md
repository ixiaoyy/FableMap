# FM-VT-GC-04 任务认领：群聊上下文进入角色生成链路

## 任务 ID
FM-VT-GC-04

## 任务名称
群聊临时上下文注入 Tavern Chat Prompt

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
前后端功能补齐

## 任务目标
在 GC-02 已经能记录临时群聊会话的基础上，让 `/api/group/{session_id}/send` 返回的 `context` 真正参与每个角色的 LLM 回复生成：

1. `sendChat` 支持可选 `extra_context`，用于传递临时群聊上下文。
2. 后端聊天服务将安全过滤后的 `extra_context` 拼入 Prompt 历史。
3. 群聊前端按被选中的角色传递对应 context，避免所有角色只看到单角色私聊历史。
4. 临时群聊上下文不落入单角色持久聊天历史。

## 可修改范围
- `fablemap/web/service.py`
- `fablemap/web/router.py`
- `frontend/src/services/tavernService.js`
- `frontend/src/TavernChatRoom.jsx`
- `tests/test_group_chat.py`
- `docs/claims/2026-04-20-fm-vt-gc-04-group-context-prompt-injection.md`
- 后续完成记录：`docs/changes/2026-04-20-fm-vt-gc-04-group-context-prompt-injection.md`

## 明确不改范围
- 不重写 PromptBuilder 的块系统。
- 不把临时群聊会话持久化为正式群聊历史。
- 不改变单聊 API 的必填字段和既有调用方式。
- 不新增 LLM provider 或模型配置逻辑。

## 依赖的协议文档
- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-04-20-fm-vt-gc-01-group-chat-character-presets.md`
- `docs/claims/2026-04-20-fm-vt-gc-02-group-chat-session-continuity.md`
- `docs/claims/2026-04-20-fm-vt-gc-03-group-chat-ui-stability.md`

## 预期产出
- 群聊中后发言的角色能在 Prompt 里看到前面角色和访客的临时群聊内容。
- 传入的 `system` 类型 extra context 会被忽略，避免开放任意系统提示注入。
- 当前用户消息不会因为群聊 context 与 chat payload 同时携带而重复注入。

## 验证方式
- `py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- `npm --prefix .\frontend run build`
- `py -3 -m compileall -q fablemap`

## 当前状态
done
