# Tavern 路由兼容与 WorldInfo 持久化

## 背景

Tavern 扩展路由中仍有一批旧调用使用 `WebService.get_tavern` / `update_tavern` / `list_taverns`，但服务层主接口已经迁移到 `*_payload` 命名。这会让 groups、bookmarks、templates、worldinfo、backup 等旧路由在运行时触发缺失方法错误。

同时，角色卡解析链路能读到 `character_book.entries`，但新增角色时没有把这些 WorldInfo 绑定回空间。

## 改动

- `WebService` 增加 `get_tavern`、`update_tavern`、`list_taverns` 兼容包装，旧路由可继续工作。
- `Tavern` 数据模型持久化 `groups`、`bookmarks`、`chat_templates`。
- `TavernService.update_tavern` 支持更新 `world_info` 和上述扩展字段。
- `WorldInfoEntry` 兼容 `insertion_order` 与 `order` 字段。
- `add_character` 会把角色卡带来的 `world_info` / `_world_info` 写入空间 `world_info`。
- 增加回归测试覆盖旧路由兼容包装、扩展字段保存、角色卡 WorldInfo 导入。

## 验证

- `py -3 -m pytest tests/test_tavern_router_compat.py tests/test_tavern_character_editor.py tests/test_tavern_llm_degradation.py tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`（8 passed, 1 skipped；跳过项为当前环境缺少 `httpx` 的 API 路由级测试）
- `py -3 -m py_compile fablemap/tavern.py fablemap/web/service.py fablemap/web/router.py`
- `npm run build`
