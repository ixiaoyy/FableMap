# 新人试玩入口回退加固任务认领

## 任务 ID
T-NEWCOMER-TRIAL-FALLBACK

## 任务名称
新人试玩入口回退加固

## 认领时间
2026-04-20

## 负责人
Codex

## 改动类型
前端稳定性

## 任务目标
加固新人试玩入口的回退逻辑，确保默认空间不可用时能回退到公开公益空间

## 具体实现
- 抽取空间解析逻辑到 `frontend/src/services/newcomerTavern.js`
- 默认新手空间只有在公开且营业中时才直接进入
- 回退逻辑搜索公开营业的公益空间

## 可修改范围
- `frontend/src/services/newcomerTavern.js`
- `frontend/src/App.jsx`
- `frontend/scripts/service-contract-test.mjs`

## 验证方式
- `npm --prefix frontend test`
- `pytest tests/test_default_public_welfare_taverns.py` 通过

## 当前状态
done