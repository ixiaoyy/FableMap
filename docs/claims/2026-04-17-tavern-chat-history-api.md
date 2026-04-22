# Tavern 聊天历史 API 任务认领

## 任务 ID
T-TAVERN-CHAT-HISTORY

## 任务名称
Tavern 聊天历史 API 稳固

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端 API + 存储层

## 任务目标
修正聊天历史 API 的参数错误，实现真实的 JSONL 文件读写

## 可修改范围
- `fablemap/web/service.py`
- `fablemap/web/router.py`
- `fablemap/tavern.py`

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest` 相关测试通过

## 当前状态
done