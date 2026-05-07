# Notification System - 通知系统

## 目的

通过 WebSocket 实时向用户推送重要事件通知，提升用户参与度和留存。

## 通知类型

| 类型 | 触发条件 | 接收人 |
|------|----------|--------|
| new_visitor | 有人进入空间 | 空间主人 |
| new_message | AI 生成新消息 | 访客 |
| quest_completed | 任务达成 | 访客 |
| home_visit_request | 有人想拜访 Home | Home 主人 |
| new_guest_message | 新留言 | 空间主人 |
| guest_reply | 主人回复留言 | 访客 |

## 技术方案

### WebSocket 架构

```
Client (Web)  <--WebSocket-->  FastAPI Server
                                    |
                                    v
                               In-memory queue (MVP)`r`n                              # Redis Pub/Sub is future work
                                    |
                                    v
                               Notification Service
```

### API 设计

```python
# WebSocket 端点
@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket, user_id: str):
    # 1. 验证用户身份
    # 2. 订阅用户通知频道
    # 3. 推送实时通知
    pass

# 通知列表 API
@router.get("/api/notifications")
async def get_notifications(user_id: str, limit: int = 20):
    # 获取历史通知
    pass

# 已读标记 API
@router.post("/api/notifications/{id}/read")
async def mark_notification_read(notification_id: str):
    # 标记通知为已读
    pass
```

## 实现步骤

1. [x] 添加 WebSocket 支持到 FastAPI
2. [x] 实现通知频道管理（MVP: NotificationStore queue）
3. [x] 实现新访客通知
4. [x] 实现通知列表 API
5. [x] 实现已读标记功能
6. [x] 前端 WebSocket 连接（hook/component 已存在）
7. [x] 通知中心组件（NotificationBell 已存在）

## 验收标准

- [x] WebSocket 连接后可收到实时通知（focused test 覆盖）
- [x] 新访客/访客反馈时主人可收到通知（backend hook 已接入）
- [x] 通知列表 API 正确返回 total/unread_count
- [x] 已读标记功能正常


## MVP Notes

- 当前实现是进程内内存通知存储，不引入 Redis 依赖。
- WebSocket 通过 NotificationStore 注册 queue；新增通知会推送到已连接客户端。
- 生产级 Redis/pub-sub、多进程广播和持久化通知存储是后续任务。
