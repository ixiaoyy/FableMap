# 模块认领说明

- 模块名 / 区域名：AI shared tasklist（AI 协作共享任务列表）
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：in_progress

## 目标

把当前会话里已经沉淀的 Web-2D、视觉转义、参与感与共创方向任务，整理成仓库内可共享、可认领、可持续维护的一份统一任务列表，方便多位开发者或 AI 协作者并行认领。

## 计划修改范围

- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-11-ai-shared-tasklist.md`
- `docs/changes/2026-03-11-ai-shared-tasklist.md`
- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 Python CLI、page、bundle 或 world builder 代码
- 不把共享任务列表直接当作协议字段或运行时数据源

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/claims/README.md`

## 预期产出

- 一份仓库内共享任务列表文档
- README 与协作协议中新增统一入口
- 明确共享任务列表与认领说明之间的关系

## 验证方式

- 文档术语一致性检查
- `git diff --check`

## 风险与备注

- 本次只沉淀共享任务入口，不等于替代内部 issue tracker 或未来外部项目管理工具
- 共享任务列表应优先承载“当前可认领的任务”，历史已完成能力以摘要形式保留，不必无限膨胀

