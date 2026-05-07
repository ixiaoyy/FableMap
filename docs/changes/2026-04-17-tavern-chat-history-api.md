# Tavern 聊天历史 API 稳固

## 背景

旧版 `/api/chats` 路由把 `character_id` 误传成 `visitor_id`，导致历史读取、导出和搜索查不到真实聊天记录。删除接口也只是写入一个不存在的内存字段，实际 JSONL 文件不会被删除。

## 改动

- `TavernStore` 增加 `list_chat_sessions()`，可按空间、访客、角色列出聊天会话。
- `TavernStore` 增加 `delete_chat_history()`，按访客/角色删除匹配的 JSONL 文件。
- `/api/chats` 列表接口改为读取真实会话文件，并返回访客、角色、消息数、最后一条消息和更新时间。
- `/api/chats/{tavern_id}/{character_id}` 支持按 `visitor_id` 查询；未提供访客时可聚合角色下所有会话。
- `/api/chats/import` 与 `/api/chats` 保存接口补齐缺省 `id`、`tavern_id`、`character_id`、`visitor_id`、`role`、`content`、`timestamp`。
- `/api/chats/export` 与 `/api/chats/search` 修正为按 `visitor_id + character_id` 查询。
- 删除接口现在会删除实际 JSONL 文件并返回删除数量。

## 验证

- `py -3 -m pytest tests/test_tavern_chat_history_store.py tests/test_tavern_router_compat.py tests/test_tavern_character_editor.py tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`（10 passed, 1 skipped；跳过项为当前环境缺少 `httpx` 的 API 路由级测试）
- `py -3 -m py_compile fablemap/tavern.py fablemap/web/service.py fablemap/web/router.py`
- `npm run build`
