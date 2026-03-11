# 变更说明：动态扰动解释层与状态接口对齐

## 本次改动

- 新增 `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`
- 在 `docs/DISTURBANCE_MODEL.md` 中同步 Schema 字段落点说明
- 在 `docs/WORLD_SCHEMA.md` 中补充 `disturbance_metrics` 与 `poi_states` 的扰动职责
- 在 `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md` 中补充对子文档的指向
- 在 `README.md` 文档导航中加入对应入口
- 在 `docs/AI_SHARED_TASKLIST.md` 中同步 `P2` 文档落地后的任务状态

## 改动目的

把“现实信号 -> 派生指标 -> `region / state / poi_states` -> UI / NPC / event”的折叠链路收成统一接口说明，避免后续 AI 或开发者在动态扰动上各自定义字段、重复命名或把稳态与时态混在一起。

## 核心沉淀内容

- `comfort_level` 与 `comfort_drift` 的职责分层
- `region`、`state`、`poi_states` 的字段落点建议
- `state.disturbance_metrics` 的统一读取口
- 扰动指标到 UI / NPC / event / broadcast 的映射约束
- v0.1 的实现边界

## 影响范围

- 仅影响协议/设计文档、任务同步与导航入口
- 不改变现有代码行为
- 不代表动态扰动运行时已经实现完毕

## 验证

- 与 `DISTURBANCE_MODEL`、`WORLD_SCHEMA`、`UNIVERSAL_TRANSMUTATION_PROTOCOL` 的术语一致性检查
- `git diff --check`

## 备注

这份文档适合作为后续 Web-2D 表现层、事件层与 POI 玩法层读取动态扰动的统一参考入口。