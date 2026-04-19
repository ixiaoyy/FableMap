# 2026-04-20 - FM-VT-GC-03 群聊界面稳定性

在群聊连续性落地后，补齐前端房间交互的一个稳定性问题：群聊中点击左侧角色不应被视为切换单聊会话。

## 范围

| 文件 | 说明 |
|------|------|
| `frontend/src/TavernChatRoom.jsx` | 拆分群聊清空消息时机；群聊点击角色时只切换展示角色；群聊状态显示中文策略名与每轮上限 |
| `docs/claims/2026-04-20-fm-vt-gc-03-group-chat-ui-stability.md` | 本任务认领说明 |

## 行为

- 单聊模式保持原逻辑：点击角色后清空当前消息并重新加载该角色历史。
- 群聊模式下点击角色不会清空当前群聊消息，只会更新当前头像、立绘和详情入口关联角色。
- 群聊消息会在进入群聊模式或更换房间时重置，避免不同地点的临时群聊上下文混在一起。
- 顶部状态条使用中文策略标签，并显示每轮最多回复人数。

## 验证

- 已通过：`npm --prefix .\frontend run build`
- 已通过：`py -3 -m pytest tests/test_group_chat.py tests/test_tavern_character_editor.py -q`
- 已通过：`py -3 -m compileall -q fablemap`
- 已通过：`git diff --check`

## 备注

`npm --prefix .\frontend run build` 仍报告既有 Vite 提示：`tavernService.js` 同时被静态和动态 import，构建成功，不影响本切片。

`git diff --check` 只报告工作区 CRLF 换行提示，没有空白错误。
