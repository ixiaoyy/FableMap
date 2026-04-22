# Tavern 备份恢复与 Bulk Edit 任务认领

## 任务 ID
T-TAVERN-BACKUP

## 任务名称
Tavern 备份恢复与 Bulk Edit 落盘

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端逻辑 + API

## 任务目标
实现完整的酒馆备份恢复功能和聊天历史 Bulk Edit 落盘

## 可修改范围
- `fablemap/web/service.py`
- `fablemap/web/router.py`
- `fablemap/tavern.py`

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest` 相关测试通过

## 当前状态
done