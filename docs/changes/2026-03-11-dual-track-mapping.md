# 变更说明：Dual-Track Mapping 规则表 v0.1

## 本次改动

- 新增 `docs/DUAL_TRACK_MAPPING.md`
- 在 `README.md` 文档导航中加入对应入口
- 在 `docs/AI_SHARED_TASKLIST.md` 中同步该文档落地后的任务状态
- 在 `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md` 中补充对子文档的指向

## 改动目的

把“同一个现实地点如何在两条世界线里稳定坍缩”为可直接引用的规则文档，避免后续 AI 在扩展地点词条时只做零散命名，而没有共享的 archetype、稳定不变量和玩法挂接思路。

## 核心沉淀内容

- `Cynic Lens` 与 `Muse Lens` 的对应关系
- Dual-Track Mapping 的编写原则
- archetype 规则骨架
- 首批高频地点的双轨规则表
- 给后续 AI 协作者的直接使用提示

## 影响范围

- 仅影响设计文档、任务同步与导航入口
- 不改变现有代码行为
- 不直接修改 Schema 协议

## 验证

- 与 `UNIVERSAL_TRANSMUTATION_PROTOCOL`、`CULTURAL_INTERPRETATION`、`WEB_2D_SPIRIT_VIEW` 的术语一致性检查
- `git diff --check`

## 备注

这份文档是 Dual-Track Mapping 的第一版规则表，适合后续继续扩展为更细的地点库、配置表或机器可读规则层。