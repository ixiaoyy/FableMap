# Tavern 路由兼容与 WorldInfo 持久化任务认领

## 任务 ID
T-TAVERN-ROUTER-COMPAT

## 任务名称
Tavern 路由兼容与 WorldInfo 持久化

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
后端兼容性修复

## 任务目标
修复旧版路由兼容性问题，实现 WorldInfo 持久化和角色卡 WorldInfo 导入

## 可修改范围
- `fablemap/web/service.py`
- `fablemap/web/router.py`
- `fablemap/tavern.py`

## 验证方式
- `py -3 -m compileall -q fablemap`
- `pytest` 相关测试通过

## 当前状态
done