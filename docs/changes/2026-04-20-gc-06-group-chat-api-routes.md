# FM-VT-GC-06：群聊 API 路由

## 改动日期
2026-04-20

## 改动类型
功能变更

## 为什么改
FM-VT-GC-06 任务要求实现群聊 API 路由，让前端和外部客户端可以通过 REST API 使用群聊功能。

## 改了什么

### 新增 API 路由（router.py）

1. `GET /api/taverns/{tavern_id}/group-chat`
   - 获取群聊状态和配置
   - 返回：group_chat_enabled、group_chat_config、角色列表

2. `PUT /api/taverns/{tavern_id}/group-chat/config`
   - 更新群聊配置（仅店主）
   - 支持更新：group_chat_enabled、group_chat_config、character_talkativeness

3. `POST /api/taverns/{tavern_id}/group-chat`
   - 发送群聊消息
   - 返回多个角色的回复
   - 自动保存到聊天历史

4. `GET /api/taverns/{tavern_id}/group-chat/history`
   - 获取群聊历史记录

5. `PUT /api/taverns/{tavern_id}/characters/{char_id}/talkativeness`
   - 更新角色发言频率（仅店主）

### 新增 Service 层方法（service.py）

1. `get_group_chat_config_payload()`
   - 获取群聊配置和角色列表

2. `update_group_chat_config_payload()`
   - 更新群聊配置（启用/禁用、策略、最大响应数等）

3. `send_group_chat_payload()`
   - 发送群聊消息并获取回复
   - 使用 GroupChatManager 选择发言者
   - 保存聊天历史

4. `get_group_chat_history_payload()`
   - 获取群聊历史

## 影响的文件

- `fablemap/web/router.py`：新增 5 个 API 路由
- `fablemap/web/service.py`：新增 4 个 service 方法

## 没有改动

- Tavern 模型字段（已在 GC-05 中完成）
- GroupChatManager 实现（已在 fablemap/group_chat.py）
- 前端 UI（FM-VT-GC-08 已在后续变更中实现）

## 协议/Schema 变更

无

## 验证

- `py -3 -m compileall -q fablemap/web/service.py fablemap/web/router.py`：通过，无语法错误
- `pytest tests/test_group_chat.py`：7 passed
- `pytest tests/test_tavern*.py tests/test_group_chat.py`：60 passed

## 权限说明

- 群聊发送：访客可发送（需提供 visitor_id）
- 配置更新：仅店主可更新
- 历史获取：访客只能看自己的历史，店主可看所有

## 风险点

- LLM 调用失败时返回 degraded 响应，不中断聊天链路
- 聊天历史使用现有的 TavernStore 存储，与单聊共用

## 关联任务

- FM-VT-GC-05：Tavern 模型群聊字段（已完成）
- FM-VT-GC-07：前端群聊 API 封装（已完成）
- FM-VT-GC-08：TavernGroupChatRoom 界面（已完成）
