# Python 编译阻断修复任务认领

## 任务 ID
T-PYTHON-COMPILE-FIXES

## 任务名称
Python 编译阻断修复

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
维护 / 稳定性

## 任务目标
修复 Python 编译检查发现的语法错误

## 可修改范围
- `fablemap/slash_commands.py`
- `fablemap/stt_caption_service.py`
- `fablemap/tts_clients.py`

## 验证方式
- `py -3 -m compileall -q fablemap`

## 当前状态
done