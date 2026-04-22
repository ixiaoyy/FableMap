# FM-VT-P2-04 任务认领：Prompt Block 段落引擎

## 任务 ID
FM-VT-P2-04

## 任务名称
Prompt Block 段落引擎

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端逻辑

## 任务目标
实现 Prompt Block 段落引擎，支持可开关、可排序、可设置 token 预算的段落系统

## 可修改范围
- `fablemap/prompt_builder.py`
- `fablemap/prompt_blocks.py`
- `frontend/src/PromptBlockEditor.jsx`

## 明确不改范围
- 不修改现有 PromptBuilder 行为

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest tests/test_tavern_prompt_blocks.py` 通过

## 当前状态
done