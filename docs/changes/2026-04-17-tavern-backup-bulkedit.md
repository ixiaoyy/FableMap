# Tavern 备份恢复与 Bulk Edit 落盘

## 背景

旧版备份接口标注为聊天备份，但实际只写出空间对象，不包含聊天 JSONL；恢复接口也直接读取传入路径，缺少备份目录限制。`/api/bulkedit` 则只在内存列表里改消息，没有写回 JSONL 文件，并且同样缺少 `visitor_id` 维度。

## 改动

- `WebService.create_tavern_backup()` 备份空间元数据和全部聊天会话。
- `WebService.restore_tavern_backup()` 只允许恢复 backups 目录内的文件，并可恢复聊天会话。
- `/api/backups`、`/api/backups/create`、`/api/backups/restore` 改为调用服务层备份方法。
- `TavernStore.replace_chat_history()` 支持覆盖或清空指定访客/角色会话的 JSONL 文件。
- `/api/bulkedit` 支持 `visitor_id`，并在 replace/delete 后写回 JSONL。
- 增加备份恢复与聊天历史覆盖测试。

## 验证

- `py -3 -m pytest tests/test_tavern_backup_restore.py tests/test_tavern_chat_history_store.py tests/test_tavern_router_compat.py tests/test_tavern_character_editor.py tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`（13 passed, 1 skipped；跳过项为当前环境缺少 `httpx` 的 API 路由级测试）
- `py -3 -m py_compile fablemap/tavern.py fablemap/web/service.py fablemap/web/router.py`
- `npm run build`
