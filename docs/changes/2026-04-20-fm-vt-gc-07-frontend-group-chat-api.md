# 2026-04-20 - FM-VT-GC-07 前端群聊 API 封装

## 为什么改

GC-06 已提供 `/api/taverns/{id}/group-chat/*` 酒馆级群聊路由，但前端服务层还没有对应封装。后续 GC-08 / GC-09 的群聊房间和店主配置界面需要通过统一的 `tavernService.js` 方法调用这些接口，而不是在组件内手写 URL。

## 改了什么

| 文件 | 说明 |
|------|------|
| `frontend/src/services/tavernService.js` | 新增酒馆级持久群聊 API 方法：`getGroupChatConfig`、`updateGroupChatConfig`、`sendGroupChat`、`getGroupChatHistory`、`updateTalkativeness` |
| `fablemap/web/service.py` | 修正酒馆级群聊配置归一化、`rules` 本地后端发送链路和群聊历史聚合，保证前端封装对应接口可冒烟 |
| `tests/test_group_chat.py` | 增加酒馆级群聊路由冒烟测试，覆盖配置更新、talkativeness、规则后端发送和历史返回 |
| `docs/AI_SHARED_TASKLIST.md` | 将 FM-VT-GC-07 标记为完成，并同步 GC-06 标题状态 |
| `docs/CURRENT_TASKS.md` | 同步 Phase 11 群聊任务状态 |
| `docs/claims/2026-04-20-fm-vt-gc-07-frontend-group-chat-api.md` | 新增本次任务认领说明 |

## 没改什么

- 未移除或重命名已有临时群聊 `/api/group/*` 前端方法，避免影响当前 `TavernChatRoom` 兼容链路。
- 未实现新的群聊 UI；多人聊天房间仍留给 GC-08。
- 未改酒馆 / 角色 schema，也未新增前端依赖。
- 未引入外部 LLM 调用；新增冒烟使用本地 `rules` 后端。

## 接口封装

- `getGroupChatConfig(tavernId, userId)`
- `updateGroupChatConfig(tavernId, data, userId)`
- `sendGroupChat(tavernId, message, visitorId, visitorName, userId)`
- `getGroupChatHistory(tavernId, visitorId, userId, limit)`
- `updateTalkativeness(tavernId, characterId, talkativeness, userId)`

## 运行时修正

- `group_chat_enabled` 现在按统一布尔规则解析，避免 `"false"` 被 Python `bool("false")` 误判为开启。
- `group_chat_config` 复用 Tavern 层归一化，限制策略、每轮回复上限和 name prefix。
- 酒馆级群聊发送支持 `rules` / `rule_based` / `public_welfare` 本地后端，不再尝试创建不存在的外部 client。
- 群聊历史从访客相关角色会话中聚合 `_group` 用户消息和角色回复，返回顺序按时间排序。

## 验证

- 已通过：`npm --prefix .\frontend run build`
- 已通过：`py -3 -m pytest -q --tb=short tests/test_group_chat.py tests/test_default_public_welfare_taverns.py`（12 passed）
- 已通过：`py -3 -m compileall -q fablemap`
- 已通过：`git -c safe.directory=D:/work/ai- diff --check`

## 风险

- 新方法已在 GC-08 接入访客群聊界面；店主配置界面仍依赖后续 GC-09 收口。
- 当前仍保留临时群聊方法和酒馆级群聊方法两套入口；后续 UI 收口时需要明确选择使用哪套链路。
