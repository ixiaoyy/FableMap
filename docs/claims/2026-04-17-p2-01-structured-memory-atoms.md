# FM-VT-P2-01 任务认领：结构化记忆模型

## 任务 ID
FM-VT-P2-01

## 任务名称
结构化记忆模型

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端数据模型 + API

## 任务目标
实现 MemoryAtom 数据模型，支持 scope/dimension/horizon/visibility 维度

## 可修改范围
- `fablemap/memory.py`
- `fablemap/tavern.py`
- `fablemap/web/router.py`
- `fablemap/web/service.py`

## 明确不改范围
- 不实现自动提炼（P2-02）

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest tests/test_tavern_memory_atoms.py` 通过

## 当前状态
done