# 默认公益空间与系统预设角色任务认领

## 任务 ID
T-DEFAULT-PUBLIC-TAVERNS

## 任务名称
默认公益空间与系统预设角色

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
平台功能

## 任务目标
实现平台默认公益空间和系统预设角色

## 具体实现
- 新增 6 个系统预设角色（小舟、安澜、阿槐、闻笺、岚姨、北辰）
- 新增 4 个平台默认公益空间（新手旅人服务站、深夜树洞电台、社区修补铺、城市失物档案亭）
- 默认公益空间使用 rules 本地规则后端，不需要 API Key

## 可修改范围
- `fablemap/default_taverns.py`
- `fablemap/tavern.py`
- `fablemap/web/service.py`
- `frontend/src/systemCharacterPresets.js`

## 验证方式
- `pytest tests/test_default_public_welfare_taverns.py` 通过
- `npm --prefix frontend run build`

## 当前状态
done