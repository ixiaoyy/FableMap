# 2026-04-20 - FM-VT-GC-04 群聊上下文进入角色生成链路

把 GC-02 里已经形成的临时群聊 context 接入真实的 Tavern Chat 生成入口，避免群聊只“选人”而每个角色实际生成时仍只看自己的单聊历史。

## 范围

| 文件 | 说明 |
|------|------|
| `fablemap/web/service.py` | `tavern_chat_payload` 支持 `extra_context`，过滤后拼入 Prompt 历史 |
| `fablemap/web/router.py` | `/api/taverns/{tavern_id}/chat` 接收可选 `extra_context` |
| `frontend/src/services/tavernService.js` | `sendChat` 支持传递 `extra_context` |
| `frontend/src/TavernChatRoom.jsx` | 群聊逐角色生成时传递对应 selection context |
| `tests/test_group_chat.py` | 覆盖 extra context 注入、安全过滤、非持久化行为 |
| `docs/claims/2026-04-20-fm-vt-gc-04-group-context-prompt-injection.md` | 本任务认领说明 |

## 行为

- 群聊发送后，前端按 `character_id` 找到后端返回的 `context`，作为 `extra_context` 传入角色回复生成。
- 服务层只接受 `user` / `assistant` 两类 extra context，忽略 `system`。
- 与当前用户输入内容相同的 extra context user 消息会被去重，避免 Prompt 里重复出现本轮输入。
- extra context 只参与 Prompt，不写入单角色聊天历史；正式历史仍只保存本轮访客消息和该角色回复。

## 验证

- 已通过：`py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- 已通过：`npm --prefix .\frontend run build`
- 已通过：`py -3 -m compileall -q fablemap`
- 已通过：`git diff --check`

## 备注

`npm --prefix .\frontend run build` 仍报告既有 Vite 提示：`tavernService.js` 同时被静态和动态 import，构建成功，不影响本切片。

`git diff --check` 只报告工作区 CRLF 换行提示，没有空白错误。
