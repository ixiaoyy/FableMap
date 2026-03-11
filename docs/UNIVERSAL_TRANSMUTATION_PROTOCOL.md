# FableMap 万物转义协议 / Universal Transmutation Protocol v0.1

## 目标

这份文档定义 FableMap 的世界语法基线：现实城市为什么能在同一套地理骨架上，被解释成多条异世界体验线，并且持续接受现实信号、玩家参与和历史深度的写回。

它不是单纯的地点改名表，而是后续 AI / 开发者在做 Schema、地点转义、Web-2D、动态扰动、记忆系统与历史层设计时的共用参考。

## 这份协议回答什么

- 为什么同一个 `school` 能在不同世界镜头下变成完全不同的地点
- 为什么城市拥堵、天气、物流、人流会在异世界里表现成超自然状态
- 为什么玩家留下的记忆、投票、修复痕迹不该直接污染底层现实骨架
- 为什么旧地标、消失建筑、历史地图与上传证据应该成为更深层世界入口

## 与现有文档的关系

- `docs/WORLD_SCHEMA.md`：定义数据容器与字段承载边界
- `docs/DUAL_TRACK_MAPPING.md`：定义 archetype 如何坍缩为双轨世界镜头下的具体地点身份
- `docs/CULTURAL_INTERPRETATION.md`：定义现实功能如何被解释为异世界语义
- `docs/DISTURBANCE_MODEL.md`：定义现实信号如何变成动态状态
- `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`：定义扰动指标在 `region / state / poi_states` 之间的落点与表现层消费方式
- `docs/WEB_2D_SPIRIT_VIEW.md`：定义浏览器中的第一版表现层

这份协议位于它们之上，负责说明这些文档为什么属于同一套世界物理。

## 核心原则

### 1. 真实地理骨架必须稳定

道路关系、POI 坐标、邻接、区域边界与基本土地用途，不应因为风格切换或玩家留言而漂移。现实骨架是世界的“不可违背层”。

### 2. 先有原型语义，再有最终命名

不要把 `amenity=school` 直接映射成某个最终奇幻名。应先抽取其稳定原型：教育、筛选、规训、未来分配、青春残响。不同镜头再把这个原型坍缩成不同读法。

### 3. 模式切换是世界镜头，不是滤镜

切换的不是颜色而已，而是：

- 名称口吻
- 建筑身份
- 事件概率
- 可见收集物
- NPC 密度表达
- 侧边叙事与底部播报语气

### 4. 动态扰动不能替代稳定身份

地点的“它是什么”与“它现在处于什么状态”必须分开。银行可以长期是资源/债务原型，但在某个时段暂时进入灵力回流、信使蜂群或记忆洪泛状态。

### 5. 玩家写回必须分层并带权限

玩家可以留下痕迹，但不能直接把现实底层改坏。至少应区分：

- `private`：只对自己或授权对象可见
- `local_public`：对局部社区可见
- `global`：会改变街区公共语义或世界广播

### 6. 历史深度必须有证据强弱

旧地标、拆除建筑、老照片、历史地图与民间记忆都可以进入世界，但它们的可信度不应相同。历史层最好带有证据等级，避免“任何传说都等于事实”。

## 五层协议

### 第一层：现实骨架层 Reality Skeleton

这一层回答“现实里这里到底是什么、在哪里、和什么相邻”。

- OSM / Overpass 的道路、建筑、POI、土地用途
- 基本时间与地理上下文
- 可指向旧地标或历史资料的现实锚点

它主要对应 `world.json` 中的 `region`、`roads`、`pois`、`landmarks` 与 `source`。

### 第二层：基础原型层 Archetype Semantics

这一层回答“这个现实地点在社会结构里承担什么角色”。

例如：

- `school` -> 教育 / 筛选 / 规训 / 未来分配
- `bank` -> 储存 / 债务 / 信用 / 时间交换
- `shop=convenience` -> 即时补给 / 深夜续命 / 日常维持
- `traffic_signal` -> 微型秩序仪式 / 节奏控制器
- `parking` -> 暂停 / 待机 / 被驯化巨兽停泊区

这一层应优先落在 archetype、hook、role、theme 上，而不是先锁死 fantasy name。

### 第三层：镜头坍缩层 Lens Collapse / Dual-Track Mapping

这一层回答“同一个原型，在不同世界线里如何被解释”。

- `school`
  - Cynic：`意识模具厂 / Ego Foundry`
  - Muse：`萤火学堂 / Lumen Academy`
- `bank`
  - Cynic：`灵魂债务行 / Debt Cathedral`
  - Muse：`时光储蓄罐 / Tick-Tock Jar`
- `shop / convenience`
  - Cynic：`多巴胺补剂点`
  - Muse：`解忧杂货铺`
- `traffic signals`
  - Cynic：`秩序监视眼`
  - Muse：`命运转经筒`
- `parking`
  - Cynic：`巨兽墓地`
  - Muse：`流浪云停靠站`

后续 AI 在补 POI 规则时，应该优先产出“原型 -> 多镜头坍缩”结构，而不是只交单一模式名表。

### 第四层：动态扰动层 Disturbance Interpretation

这一层回答“现实节奏如何把世界推入临时状态”。

- 交通拥堵 -> `灵力湍流 / The Flux`、`时空黏连`
- 配送/物流密度升高 -> `信使蜂群 / Messenger Swarm`
- 雨天/低能见度 -> `位面重叠 / The Overlap`、`记忆洪泛`

这一层不直接推翻地点身份，而是通过 `social_tension`、`commerce_flux`、`anomaly_pressure`、`comfort_drift`、`spawn_potential` 等派生指标，影响：

- UI 与地图气氛
- NPC / 精灵刷新
- 事件概率
- 播报与任务口吻

具体到 `region / state / poi_states` 的字段分层与接口约束，统一以 `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md` 为准。

### 第五层：玩家写回与历史深度层 Write-back + Historical Depth

这一层回答“世界如何被人长期改写并长出厚度”。

#### 玩家写回

- `Semantic Vote`：街区主导风格或地点解释投票
- `Mythic Graffiti`：地点寓言留言，必要时经 AI 改写后公开
- `Building Resonance`：玩家对建筑的共鸣、命名、修复与传说沉积

这里应明确 private / local public / global 三层可见性与治理边界。

#### 历史深度

- `尘封之眼 / Dust-Sealed Eye`
- `Geo-Archaeology`
- `Time Folds`

它们允许旧地标、消失建筑、历史照片、口述记忆与旧地图进入更深层世界。建议至少区分：

- `rumor`：传闻或未经证实的记忆
- `evidenced`：有照片、资料或多人交叉印证
- `archived`：可稳定作为长期世界入口的高可信锚点

历史层的输出可以是 ghost log、跨时间任务、旧地标永恒幻影、现职能与旧职能的语义冲突。

## 对其他 AI 参与者的直接约束

### 如果你在做地点转义

- 不要只写最终名字
- 先写现实功能、社会结构、基础原型，再写双轨镜头结果

### 如果你在改 Schema

- 保持稳定骨架、动态状态、玩家写回、历史证据四者分离
- 不要把短时扰动直接写死成地点恒定身份

### 如果你在做 Web-2D 或 UI

- 切换镜头时，坐标与空间关系保持稳定
- 主要变化应发生在 icon、文案、实体身份、氛围与刷新逻辑

### 如果你在做家园、记忆或留言

- 默认采用隐私优先设计
- 真实住所、私密地点与长期记忆必须支持抽象化和权限控制

### 如果你在做历史层

- 先定义证据来源与可信度，再设计视觉奇观
- 不要把所有过去都处理成同一种“灵异特效”

## 明确不是当前已实现能力

这份协议描述的是 FableMap 的世界语法基线，不代表当前仓库已经完成：

- 完整多人同步
- 历史证据上传系统
- 审美宪法投票
- 全量双轨地点规则库
- 尘封之眼/Time Folds 的运行时机制

当前更准确的状态是：仓库已经有 Web-2D、文化诠释、Schema 与动态扰动的基础文档，这份协议把它们统一到同一条长期世界设计主线上。