# FM-VT-GC-07 任务认领：前端群聊 API 封装

## 任务 ID

FM-VT-GC-07

## 任务名称

前端 `tavernService.js` 群聊 API 封装

## 认领时间

2026-04-20

## 负责人

Codex

## 改动类型

前端服务层功能切片

## 任务目标

在已有 GC-06 空间群聊路由基础上，为前端提供稳定的持久群聊 API 调用方法：

1. 读取空间群聊配置和角色发言积极度。
2. 保存空间群聊开关、策略和角色发言积极度。
3. 发送空间群聊消息并接收多角色回复。
4. 查询空间群聊历史。
5. 单独更新角色 `talkativeness`。

## 可修改范围

- `frontend/src/services/tavernService.js`
- `fablemap/web/service.py`（仅限封装接口冒烟时暴露的 GC-06 运行时修正）
- `tests/test_group_chat.py`（仅限空间级群聊路由冒烟覆盖）
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-07-frontend-group-chat-api.md`
- `docs/changes/2026-04-20-fm-vt-gc-07-frontend-group-chat-api.md`

## 明确不改范围

- 不实现新的群聊 UI（GC-08）。
- 不重写已有临时群聊 `/api/group/*` 兼容接口。
- 不修改空间或角色数据 schema。
- 不引入新的前端依赖。
- 不调整 LLM provider、Token 计费或访客身份系统。

## 依据的协议文档

- `docs/AI参与开发协议.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-20-fm-vt-gc-05-tavern-model-group-chat-fields.md`

## 预期产出

- `tavernService.js` 新增持久群聊方法：`getGroupChatConfig`、`updateGroupChatConfig`、`sendGroupChat`、`getGroupChatHistory`、`updateTalkativeness`。
- 保留已有临时群聊方法，避免破坏当前 TavernChatRoom 兼容链路。
- 修正空间级群聊 service 运行时归一化和 `rules` 后端发送链路，保证新增封装对应接口可冒烟。
- 更新共享任务清单和本次变更记录。

## 验证方式

- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short tests/test_group_chat.py tests/test_default_public_welfare_taverns.py`
- `py -3 -m compileall -q fablemap`

## 当前状态

done
