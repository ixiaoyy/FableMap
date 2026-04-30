# SC-03：状态卡 Prompt 注入（历史 claim，已迁移）

> 状态：已迁移到 Trellis；本文件不再代表活跃认领状态。
> Trellis 任务：`.trellis/tasks/04-30-state-card-prompt-injection-sc-03/`

## 迁移说明

旧认领内容已作为来源写入 Trellis 任务：

- `task.json`：`.trellis/tasks/04-30-state-card-prompt-injection-sc-03/task.json`
- `prd.md`：`.trellis/tasks/04-30-state-card-prompt-injection-sc-03/prd.md`

后续实现、状态流转、验证输出都必须写入 Trellis 任务目录，不再更新本 claim 文件作为任务状态。

## 原始目标摘要

已确认的 `fixed_canon=true` 状态卡注入到 AI Prompt，作为场景上下文；普通 confirmed 卡仅在 WorldInfo 层级可见。

## 原始边界摘要

- 不修改 StateCard 数据模型字段。
- 不修改访客侧 StateCardReviewPanel。
- 不修改 canon_ledger.py 卡片生成逻辑，除非 Trellis 任务重新确认范围。

## 原始验证方式

- `py -3 -m pytest tests/test_tavern_state_cards.py -q`
- `py -3 -m compileall -q backend/src`
- `npm --prefix ./frontend run build`
