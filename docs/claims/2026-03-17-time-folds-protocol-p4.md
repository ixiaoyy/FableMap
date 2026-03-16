# 模块认领说明

- 模块名 / 区域名：P4 · 历史深度 / 尘封之眼 / Time Folds 协议 v0.1
- 负责人：AI 协作者
- 改动类型：协议 / 文档
- 当前状态：claimed

## 目标

在 P3 治理边界协议完成后，定义 FableMap 的时间深度系统协议，让地点具备历史纵深与跨时间叙事能力：

- 定义历史证据来源、可信度与历史层级结构
- 设计旧地标回声、历史残留与深层入口机制
- 规划跨时间任务生成边界与历史探索玩法
- 明确与 P3/P5 的历史沉淀接口与数据流转规则

## 计划修改范围

- 会新增 `docs/TIME_FOLDS_PROTOCOL.md` 协议文档
- 可能补充 [`docs/WORLD_WRITEBACK_PROTOCOL.md`](docs/WORLD_WRITEBACK_PROTOCOL.md) 中与时间沉淀相关的章节引用
- 会更新 [`docs/AI_SHARED_TASKLIST.md`](docs/AI_SHARED_TASKLIST.md) 中 P4 任务状态
- 会新增对应的 `docs/changes/` 变更说明文档

## 明确不改范围

- 不改 P3 的治理边界定义（private/local_public/global）
- 不改 P5 的事件模型、target schema、effect schema
- 不改 [`docs/WORLD_SCHEMA.md`](docs/WORLD_SCHEMA.md) 的世界数据结构（仅定义协议）
- 不改 [`docs/PLAYER_STATE.md`](docs/PLAYER_STATE.md) 的玩家状态字段定义
- 不实现具体的后端代码、API 接口或前端交互（仅定义协议）
- 不引入数据库设计或完整时间旅行系统实现

## 依据的协议文档

- [`README.md`](README.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`docs/AI_SHARED_TASKLIST.md`](docs/AI_SHARED_TASKLIST.md)
- [`docs/AI参与开发协议.md`](docs/AI参与开发协议.md)
- [`docs/WORLD_WRITEBACK_PROTOCOL.md`](docs/WORLD_WRITEBACK_PROTOCOL.md)
- [`docs/WORLD_WRITEBACK_PLAN.md`](docs/WORLD_WRITEBACK_PLAN.md)
- [`docs/WORLD_WRITEBACK_GOVERNANCE.md`](docs/WORLD_WRITEBACK_GOVERNANCE.md)
- [`docs/PLAYER_STATE.md`](docs/PLAYER_STATE.md)

## 预期产出

新增协议文档 `docs/TIME_FOLDS_PROTOCOL.md`，至少包含以下章节：

### 1. 时间层级结构
- `present_state` - 当前状态
- `recent_echoes` - 最近回声（P5 已定义）
- `archived_layers` - 归档历史层（P3 已预留）
- `deep_history` - 深层历史（新增）

### 2. 历史证据系统
- 证据来源类型（玩家写回、OSM 历史数据、外部数据源）
- 可信度评级机制
- 证据冲突解决规则
- 历史真实性与虚构性平衡

### 3. 旧地标回声与历史残留
- 地标消失后的回声机制
- 历史建筑的虚影显示
- 玩家如何触发历史回声
- 回声强度与衰减规则

### 4. 深层入口与时间探索
- "尘封之眼"能力定义
- 玩家如何进入深层历史
- 跨时间任务生成边界
- 历史探索的奖励与风险

### 5. 与现有系统的衔接
- 与 P5 的 `recent_echoes` 对接
- 与 P3 的 `archived_layers` 沉淀规则
- 与玩家状态系统的历史感知能力
- 与世界生成系统的历史数据注入

## 验证方式

- 协议文档能明确回答"地点如何具备历史纵深"
- 协议文档能明确定义历史证据的来源与可信度
- 协议文档能为后续实现时间探索系统提供清晰的规则基础
- 协议文档与 P3/P5 的时间沉淀接口保持一致
- 协议文档不与现有世界生成逻辑产生冲突

## 风险与备注

- 本任务为纯协议设计任务，不涉及代码实现，风险较低
- 时间深度系统需要在"历史真实性"与"奇幻叙事"之间找到平衡
- 第一版协议应保持最小可行性，避免过度设计复杂的时间旅行机制
- 历史证据的可信度评级需要特别谨慎，避免破坏玩家对世界的沉浸感
- 本协议完成后，应立即同步到 [`docs/AI_SHARED_TASKLIST.md`](docs/AI_SHARED_TASKLIST.md) 并更新 P4 任务状态
