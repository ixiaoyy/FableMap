# FableMap 文档清理计划（v2）

## 文档目的

这份文档不再用于清理“旧版四层模型遗留物”，而是用于在当前主线下统一整个文档体系的口径、分类与维护规则。

当前主线已经明确为：

> 真实底图 + 地点选择 + 角色遭遇 / 地点事件 + 聊天叙事 + writeback / memory

因此，文档清理的核心目标不是“尽量删掉旧文档”，而是：

1. 保留当前主线必需的产品与架构文档
2. 保留协议类文档作为稳定接口说明
3. 将旧“自绘地图 / Web-2D 主舞台 / 地图资产包 / Godot-first”文档降级为历史参考
4. 明确哪些文档仍有价值、哪些文档需要继续重写、哪些文档只应作为留痕

---

## 一、当前分类原则

### P0 - 当前主线文档（必读）

这些文档描述当前项目的产品定义、系统主链路与执行口径，任何新协作者都应先读。

- `README.md`
- `docs/PRODUCT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/CURRENT_TASKS.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/WHAT_NOT_TO_BUILD.md`
- `docs/INDEX.md`

### P1 - 核心协议文档

这些文档描述当前实现或近期实现会直接消费的协议、状态结构与治理边界。

- `docs/WORLD_WRITEBACK_PROTOCOL.md`
- `docs/WORLD_WRITEBACK_GOVERNANCE.md`
- `docs/PLAYER_STATE.md`
- `docs/WORLD_ORCHESTRATOR_PROTOCOL.md`
- `docs/WORLD_SCHEMA.md`
- `docs/TIME_FOLDS_PROTOCOL.md`

### P2 - 当前仍有价值的实施 / 设计文档

这些文档不一定是主线入口，但仍对实现、建模或未来扩展有现实参考价值。

- `docs/AIO1_WORLD_ORCHESTRATOR_PLAN.md`
- `docs/AI_NATIVE_WORLD_ORCHESTRATION.md`
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/DUAL_TRACK_MAPPING.md`
- `docs/DISTURBANCE_MODEL.md`
- `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`
- `docs/ARCHITECTURE_PRINCIPLES.md`
- `docs/LONG_TERM_EXPERIENCE.md`（需按新主线重写后保留）

### P3 - 历史参考文档

这些文档可以保留，但必须明确标注：它们不再代表当前最高优先产品方向。

- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/MAP_ASSETS_PLAN.md`
- `docs/MAP_ASSETS_FRONTEND_BASELINE.md`
- `docs/MAP_ASSETS_GENERATION_GUIDE.md`
- `docs/MAP_ABSTRACTION_RULES_V0_1.md`
- `docs/GODOT_INTEGRATION.md`
- 其他明显服务旧地图主舞台或旧渲染路线的文档

### P4 - 协作记录与历史留痕

这些文档不应被当作当前产品定义，但应保留为协作与变更历史。

- `docs/changes/`
- `docs/claims/`（若存在）
- 各类阶段性记录、变更说明、试验结论

---

## 二、本轮清理中已经明确的问题

### 1. 旧主线口径残留

以下表达不应再被写成当前主线：

- “自绘地图 / Web-2D 主舞台”
- “先做地图，再承载体验”
- “地图资产包是当前第一优先级”
- “Godot-first 可探索 Demo 是当前落地方向”

如果这些内容仍然存在于文档中，应改写为：

- 历史阶段判断
- 灵感来源
- 降级边界说明
- 非当前主线的实验记录

### 2. 旧计划文档误导新协作者

本文件旧版本存在以下问题：

- 引用了不存在或已废弃的 `AI_SHARED_TASKLIST_V2.md`
- 将 `docs/CURRENT_TASKS.md` 误判为应简化成跳转页
- 将 `docs/PRODUCT_BRIEF.md` 误判为“可能过时”
- 将 `docs/ARCHITECTURE.md` 误判为待合并或废弃对象
- 将若干仍有价值的设计文档直接列入废弃清单

这些判断已经不再成立，现已废止。

### 3. 索引与分类未完全同步

虽然 `docs/README.md`、`docs/INDEX.md` 已经完成过一轮更新，但仍需要继续同步：

- 哪些协议文档已经按新主线重写
- 哪些长期设计文档仍带旧地图主舞台语义
- 哪些文件只是历史参考而非当前执行文档

---

## 三、当前处理策略

### 1. 不大规模物理移动文件

当前阶段不优先创建大规模 `archive/` 迁移动作。

原因：

- 旧文档仍有历史价值
- 当前更需要的是“分类清晰”，而不是“目录大搬家”
- 频繁移动文件会增加引用失效与认知成本

因此，优先策略是：

- 保留原文件路径
- 在文档内部重写定位说明
- 在 `docs/INDEX.md` 与 `docs/README.md` 中标明类别

### 2. 优先重写高误导性文档

优先处理会直接误导新协作者的文档，而不是先处理所有细节文档。

当前高优先级对象包括：

- `docs/LONG_TERM_EXPERIENCE.md`
- `docs/AI_NATIVE_WORLD_ORCHESTRATION.md`
- `docs/EVOLUTION_DIRECTION.md`
- `docs/WHAT_NOT_TO_BUILD.md`（词汇级对齐）
- `docs/ARCHITECTURE_PRINCIPLES.md`（词汇级对齐）
- `docs/GODOT_INTEGRATION.md`

### 3. 协议优先于表现层描述

只要协议类文档与当前主线冲突，就必须优先改写。表现层灵感、视觉语言和长期愿景可以延后整理。

当前已经优先重写的对象包括：

- `docs/PLAYER_STATE.md`
- `docs/WORLD_WRITEBACK_PROTOCOL.md`
- `docs/WORLD_ORCHESTRATOR_PROTOCOL.md`

---

## 四、执行清单

### 已完成

- [x] 统一根 `README.md` 的项目口径
- [x] 重写 `docs/README.md` 的文档分类说明
- [x] 重写 `docs/PLAYER_STATE.md`
- [x] 重写 `docs/WORLD_WRITEBACK_PROTOCOL.md`
- [x] 重写 `docs/WORLD_ORCHESTRATOR_PROTOCOL.md`
- [x] 将 `docs/WEB_2D_SPIRIT_VIEW.md` 降级为历史参考
- [x] 将 `docs/MAP_ASSETS_PLAN.md` 降级为历史参考
- [x] 将 `docs/MAP_ASSETS_FRONTEND_BASELINE.md` 降级为历史参考
- [x] 将 `docs/MAP_ASSETS_GENERATION_GUIDE.md` 降级为历史参考
- [x] 将 `docs/MAP_ABSTRACTION_RULES_V0_1.md` 降级为历史参考

### 进行中

- [ ] 重写 `docs/LONG_TERM_EXPERIENCE.md`，移除 Web-2D 主舞台 / Godot-first 旧落地口径
- [ ] 复查 `docs/AI_NATIVE_WORLD_ORCHESTRATION.md` 的 map-centric 残留表达
- [ ] 复查 `docs/EVOLUTION_DIRECTION.md` 的阶段结论是否仍停留在旧主线
- [ ] 复查 `docs/WHAT_NOT_TO_BUILD.md` 的旧渲染主语
- [ ] 复查 `docs/ARCHITECTURE_PRINCIPLES.md` 的旧渲染主语
- [ ] 为 `docs/GODOT_INTEGRATION.md` 增加明确的历史参考定位

### 收口动作

- [ ] 统一更新 `docs/INDEX.md`
- [ ] 确认 `docs/README.md` 与 `docs/INDEX.md` 的分类完全一致
- [ ] 搜索全仓库残留“Web-2D 主舞台 / map assets / Godot demo”旧口径
- [ ] 为仍保留的历史文档补充“历史参考”说明

---

## 五、成功标准

完成本轮清理后，应满足以下条件：

- 新协作者阅读 `README.md`、`docs/PRODUCT_BRIEF.md`、`docs/ARCHITECTURE.md`、`docs/INDEX.md` 后，不会误以为当前主线仍是自绘地图工程
- 协议类文档都以 place / character / event / chat / memory 为主消费口径
- 旧地图资产、旧 Web-2D 主舞台、Godot-first 文档都被明确降级
- 文档索引能区分“当前主线 / 核心协议 / 有价值参考 / 历史参考 / 留痕记录”
- 不需要依赖隐含记忆，新协作者仅靠文档就能理解当前方向

---

## 六、一句话结论

当前文档清理的目标，不是删除历史，而是把历史、主线、协议与参考边界重新标清，确保整个项目记忆稳定收敛到“真实底图 + 地点体验 + 角色事件 + 聊天叙事 + writeback / memory”。
