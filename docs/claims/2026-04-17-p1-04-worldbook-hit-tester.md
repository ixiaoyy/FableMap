# FM-VT-P1-04 任务认领：世界书命中测试器

## 任务 ID
FM-VT-P1-04

## 任务名称
世界书命中测试器

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端 API + 前端 UI

## 任务目标
实现世界书条目命中测试功能，让创作者知道某句话会触发哪些世界书

## 可修改范围
- `fablemap/world_info_injector.py`
- `fablemap/web/router.py`
- `frontend/src/WorldBookEditor.jsx`
- `frontend/src/services/tavernService.js`

## 明确不改范围
- 不修改现有聊天 API

## 验证方式
- `py -3 -m compileall -q fablemap`
- `npm --prefix frontend run build`

## 当前状态
done