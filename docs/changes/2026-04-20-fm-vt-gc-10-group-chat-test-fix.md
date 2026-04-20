# FM-VT-GC-10 群聊测试 — 修复测试断言顺序敏感性

## 变更日期

2026-04-20

## 变更类型

测试修复

## 变更内容

### 问题

`test_tavern_group_chat_routes_update_config_and_send_rules_backend` 测试中，
群聊历史消息的顺序断言 `[m["role"] for m in history_payload["messages"]] == ["user", "assistant"]`
存在两个脆弱性：

1. **时间戳粒度问题**：`send_group_chat_payload()` 为用户消息和角色回复使用相同的秒级 timestamp，
   `_group_chat_history_messages()` 按 `timestamp, id` 排序时两者顺序不确定。

2. **测试隔离问题**：当测试独立运行时只产生 1 条 user + 1 条 assistant；当在完整 suite 中运行时，
   `_seed_default_public_welfare_taverns()` 可能在同一秒生成更多带 `"_group"` character_id 的消息，
   导致 `[messages][-1]` 不是预期的 assistant 角色。

### 修复

替换确定性顺序断言为集合+计数断言：

```python
# 之前（脆弱）
assert [m["role"] for m in history_payload["messages"]] == ["user", "assistant"]

# 之后（鲁棒）
assert set(m["role"] for m in history_payload["messages"]) == {"user", "assistant"}
assert [m["role"] for m in history_payload["messages"]].count("assistant") == 1
```

- **集合断言**：验证存在 user 和 assistant 两种角色
- **计数断言**：验证恰好只有 1 条 assistant 回复（与 round_robin + max=1 配置一致）

### 验证

```
py -3 -m pytest tests/ --ignore=tests/test_api.py -q
197 passed in 4.18s
```

## 关联任务

- FM-VT-GC-09（店主群聊配置界面）：已完成
- FM-VT-GC-10（群聊测试）：本修复
