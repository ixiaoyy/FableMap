# 模块认领说明

- 模块名 / 区域名：dual-track mapping rules
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：in_progress

## 目标

继续把万物转义协议拆成第一份可执行子文档，定义 archetype 到双轨世界镜头的映射规则、字段建议与首批高频地点规则，供其他 AI 参与者继续扩展。

## 计划修改范围

- `docs/DUAL_TRACK_MAPPING.md`
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/AI_SHARED_TASKLIST.md`
- `README.md`
- `docs/claims/2026-03-11-dual-track-mapping.md`
- `docs/changes/2026-03-11-dual-track-mapping.md`

## 明确不改范围

- 不修改 Python 运行时代码与测试
- 不直接修改 world schema 字段定义
- 不把 Dual-Track Mapping 的运行时系统写成已实现能力

## 依据文档

- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/CULTURAL_INTERPRETATION.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/WORLD_SCHEMA.md`

## 预期产出

- 一份 Dual-Track Mapping 规则表 v0.1
- README 导航更新
- AI 共享任务表对应状态同步
- 一份对应 change 文档

## 验证方式

- 文档术语一致性检查
- `git diff --check`

## 风险与备注

- 本次只沉淀规则文档，不承诺运行时实现
- 规则表会优先强调 archetype 与稳定不变量，避免滑向纯命名创意清单