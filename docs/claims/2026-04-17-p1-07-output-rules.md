# FM-VT-P1-07 任务认领：输出修正/风格护栏

## 任务 ID
FM-VT-P1-07

## 任务名称
输出修正/风格护栏编辑器

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端逻辑 + 前端 UI

## 任务目标
实现输出修正规则引擎，支持正则和文本替换，让 AI 输出更符合角色风格

## 可修改范围
- `fablemap/output_rules.py`
- `fablemap/web/service.py`
- `frontend/src/OutputRulesEditor.jsx`
- `frontend/src/TavernOwnerPanel.jsx`

## 明确不改范围
- 不修改聊天主流程

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest` 相关测试通过

## 当前状态
done