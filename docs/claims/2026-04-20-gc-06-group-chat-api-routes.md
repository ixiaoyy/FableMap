# FM-VT-GC-06 任务认领：群聊 API 路由

## 任务 ID
FM-VT-GC-06

## 任务名称
群聊 API 路由实现

## 认领时间
2026-04-20

## 负责人
lijin

## 改动类型
后端 API

## 任务目标
实现群聊相关的 REST API 端点

## 具体实现
- `GET /api/taverns/{tavern_id}/group-chat` - 获取群聊状态和配置
- `PUT /api/taverns/{tavern_id}/group-chat/config` - 更新群聊配置（仅店主）
- `POST /api/taverns/{tavern_id}/group-chat` - 发送群聊消息
- `GET /api/taverns/{tavern_id}/group-chat/history` - 获取群聊历史
- `PUT /api/taverns/{tavern_id}/characters/{char_id}/talkativeness` - 更新角色发言频率

## 可修改范围
- `fablemap/web/router.py`
- `fablemap/web/service.py`

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest tests/test_group_chat.py` 通过

## 当前状态
done