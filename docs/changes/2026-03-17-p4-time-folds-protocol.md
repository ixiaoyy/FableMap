# 变更说明：P4 历史深度 / 尘封之眼 / Time Folds 协议

- 日期：2026-03-17
- 任务：P4 · 历史深度 / 尘封之眼 / Time Folds 协议 v0.1
- 类型：协议文档
- 状态：已完成

## 为什么改

在 P3 治理边界协议完成后，需要定义 FableMap 的时间深度系统，让地点具备历史纵深与跨时间叙事能力，实现：
- 地点不只有当前状态，还有历史回声与深层历史
- 玩家可以探索地点的历史层级
- 历史证据有明确的来源与可信度评级
- 跨时间任务有清晰的生成边界

## 改了什么

### 新增文档

- **[docs/TIME_FOLDS_PROTOCOL.md](docs/TIME_FOLDS_PROTOCOL.md)**：Time Folds 协议 v0.1

### 核心内容

1. **四层时间结构**
   - `present_state`：当前状态（OSM 数据 + 玩家写回 + 实时扰动）
   - `recent_echoes`：最近回声（0-7天，P5 生成）
   - `archived_layers`：归档历史层（30天-1年，P3 沉淀）
   - `deep_history`：深层历史（1年以上，外部数据 + AI 生成）

2. **历史证据系统**
   - 四种来源：玩家写回（80-100%）、OSM 历史（95%）、外部数据（90%）、AI 生成（30-50%）
   - 五级可信度：S（95-100%真实记录）、A（80-94%可信共识）、B（60-79%部分可信）、C（40-59%半虚构）、D（0-39%纯虚构）
   - 证据冲突解决：可信度优先 → 时间优先 → 玩家视角优先 → 多视角并存

3. **旧地标回声机制**
   - 虚影显示：半透明地标轮廓 + 光晕标注
   - 文字回声：历史描述文字
   - 情感回声：基于玩家情绪胶囊
   - 回声强度衰减：0-30天（100%）→ 30天-1年（80%）→ 1-5年（50%）→ 5-10年（30%）→ 10年以上（10%）

4. **尘封之眼能力**
   - 解锁条件：attunement >= 10 + 完成任务"时间的裂缝"
   - 使用方式：主动激活30秒，冷却5分钟
   - 效果：显示周围100米历史回声 + 触发跨时间任务

5. **跨时间任务边界**
   - 三种任务类型：历史调查（收集证据）、历史修复（修复回声）、历史传承（传递故事）
   - 生成边界：必须基于真实历史或玩家写回，不生成纯虚构任务
   - 奖励：历史知识、特殊称号、稀有物品、attunement +5

6. **与现有系统的衔接**
   - P5 `recent_echoes` → Time Folds `recent_echoes` → `archived_layers` → `deep_history`
   - P3 `archived_layers` 沉淀规则自动对接
   - 新增玩家状态字段：history_perception、dust_sealed_eye_unlocked、time_folds_explored、historical_knowledge
   - 世界生成时注入 OSM 历史数据

### 更新文档

- **[docs/AI_SHARED_TASKLIST.md](docs/AI_SHARED_TASKLIST.md)**：P4 任务状态从 `planned` 更新为 `done`

### 新增认领说明

- **[docs/claims/2026-03-17-time-folds-protocol-p4.md](docs/claims/2026-03-17-time-folds-protocol-p4.md)**：P4 任务认领说明

## 影响了哪些文件或模块

- 新增：`docs/TIME_FOLDS_PROTOCOL.md`
- 新增：`docs/claims/2026-03-17-time-folds-protocol-p4.md`
- 新增：`docs/changes/2026-03-17-p4-time-folds-protocol.md`
- 修改：`docs/AI_SHARED_TASKLIST.md`（P4 任务状态）

## 没改什么

- 不改 P3 的治理边界定义（private/local_public/global）
- 不改 P5 的事件模型、target schema、effect schema
- 不改 WORLD_SCHEMA.md 的世界数据结构（仅定义协议）
- 不改 PLAYER_STATE.md 的玩家状态字段定义（仅建议新增字段）
- 不实现具体的后端代码、API 接口或前端交互（仅定义协议）

## 是否涉及协议 / Schema / 命名变更

- **协议变更**：是（新增时间深度协议）
- **Schema 变更**：否（仅建议新增玩家状态字段）
- **命名变更**：否

## 做了哪些验证

- ✅ 协议文档能明确回答"地点如何具备历史纵深"
- ✅ 协议文档能明确定义历史证据的来源与可信度评级
- ✅ 协议文档能为后续实现时间探索系统提供清晰的规则基础
- ✅ 协议文档与 P3/P5 的时间沉淀接口保持一致
- ✅ 协议文档不与现有世界生成逻辑产生冲突

## 风险点是什么

- 本任务为纯协议设计任务，不涉及代码实现，风险较低
- 时间深度系统需要在"历史真实性"与"奇幻叙事"之间找到平衡
- 第一版协议保持最小可行性，避免过度设计复杂的时间旅行机制
- 历史证据的可信度评级需要特别谨慎，避免破坏玩家对世界的沉浸感

## 后续工作

P4 协议完成后，建议按以下顺序推进：

1. **P5 最小写回闭环实现**：实现 observe/dwell/mark 的 API 与持久化
2. **实现 recent_echoes 到 archived_layers 的自动沉淀**
3. **实现旧地标回声的基础显示**：虚影 + 文字回声
4. **实现"尘封之眼"能力的基础版本**
5. **实现完整的跨时间任务系统**

## 依据的协议文档

- [README.md](README.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/AI_SHARED_TASKLIST.md](docs/AI_SHARED_TASKLIST.md)
- [docs/AI参与开发协议.md](docs/AI参与开发协议.md)
- [docs/WORLD_WRITEBACK_PROTOCOL.md](docs/WORLD_WRITEBACK_PROTOCOL.md)
- [docs/WORLD_WRITEBACK_PLAN.md](docs/WORLD_WRITEBACK_PLAN.md)
- [docs/WORLD_WRITEBACK_GOVERNANCE.md](docs/WORLD_WRITEBACK_GOVERNANCE.md)
- [docs/PLAYER_STATE.md](docs/PLAYER_STATE.md)
