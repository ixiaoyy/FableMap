# 模块认领说明

- 模块名 / 区域名：disturbance interface alignment
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：in_progress

## 目标

把动态扰动模型、世界 schema 与万物转义协议之间的接口缝收成一份专门文档，明确原始信号、派生指标、`region / state / poi_states` 分层与 UI / NPC / event 输出链路。

## 计划修改范围

- `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`
- `docs/DISTURBANCE_MODEL.md`
- `docs/WORLD_SCHEMA.md`
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `README.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-11-disturbance-interface-alignment.md`
- `docs/changes/2026-03-11-disturbance-interface-alignment.md`

## 明确不改范围

- 不修改运行时代码与测试
- 不接入真实实时数据源
- 不把动态扰动写成已完整实现的线上系统

## 依据文档

- `docs/DISTURBANCE_MODEL.md`
- `docs/WORLD_SCHEMA.md`
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/DUAL_TRACK_MAPPING.md`

## 预期产出

- 一份动态扰动解释层与状态接口对齐文档
- 对 `DISTURBANCE_MODEL` 与 `WORLD_SCHEMA` 的命名/字段说明同步
- README 导航更新
- AI 共享任务表对应状态同步
- 一份对应 change 文档

## 验证方式

- 文档术语一致性检查
- `git diff --check`

## 风险与备注

- 本次只沉淀接口与字段约束，不承诺运行时刷新实现
- `comfort_level` 与 `comfort_drift` 会保留双字段，但职责分层必须明确