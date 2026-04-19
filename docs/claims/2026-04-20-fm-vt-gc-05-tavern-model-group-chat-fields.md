# FM-VT-GC-05 任务认领：Tavern 模型群聊字段 + service 层

## 任务 ID
FM-VT-GC-05

## 任务名称
Tavern 模型添加群聊字段 + 实现 tavern_group_chat_payload()

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
后端数据模型 + 服务层

## 任务目标
为群聊功能打下数据基础和 LLM 调用入口：

1. `TavernCharacter` 添加 `talkativeness: float = 0.5`，控制该角色在群聊中的发言频率
2. `Tavern` 添加 `group_chat_enabled: bool = False` 和 `group_chat_config: dict`，控制群聊开关和策略
3. 实现 `tavern_group_chat_payload()`，调用 `GroupChatManager` 选人，按角色依次调用 LLM，写入群聊消息

## 可修改范围
- `fablemap/tavern.py`
- `fablemap/web/service.py`

## 明确不改范围
- 不实现 API 路由（GC-06）
- 不实现前端界面（GC-08/GC-09）
- 不新增测试用例（GC-10）

## 依赖的前置任务
- FM-VT-GC-01 ~ GC-04：群聊基础框架（已有，group_chat.py）

## 预期产出
- Tavern 和 TavernCharacter 序列化和反序列化群聊字段，向后兼容
- `tavern_group_chat_payload()` 能基于 talkativeness 选择发言者并逐个生成回复

## 验证方式
- `py -3 -m compileall -q fablemap`
- 既有测试全部通过

## 当前状态
in_progress
