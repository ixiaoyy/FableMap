# FableMap 动态扰动解释层与状态接口对齐 v0.1

## 目标

这份文档用于把 `docs/DISTURBANCE_MODEL.md`、`docs/WORLD_SCHEMA.md` 与 `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md` 里的动态扰动概念，对齐成同一套可执行接口说明。

它主要回答四个问题：

- 原始现实信号如何进入扰动链路
- 哪些指标属于 `region` 稳态，哪些属于 `state` 时态
- `poi_states` 应该承载哪些局部扰动切片
- UI / NPC / event / broadcast 应如何消费这些指标

## 核心对齐原则

### 1. 地点身份与临时状态必须分开

地点的 archetype、双轨命名与稳定社会功能，属于地点长期身份；扰动只决定它“此刻如何表现”，不负责重新定义它“本质是什么”。

### 2. `region` 放慢变量，`state` 放快变量

- `region`：区域基线、慢变化体验、稳定风格倾向
- `state`：时段、天气、人流等带来的短时扰动快照
- `state.poi_states`：局部热点、特殊窗口、单点异常

### 3. 先做可追溯指标，再做玩法映射

前端、NPC 与事件层不直接消费原始现实信号，而是消费一组可解释的派生指标。

## 标准折叠链路

1. `signal_inputs`：天气、昼夜、工作日/周末、人流代理、交通代理、营业状态
2. `normalized_inputs`：统一映射到 `0.0 ~ 1.0`
3. `region` baseline：形成区域长期底色
4. `state.disturbance_metrics`：形成当前时段的扰动指标快照
5. `state.poi_states[*].disturbance`：把区域级扰动折到局部地点
6. 输出到 UI / NPC / event / broadcast

## 命名对齐

### `comfort_level` 与 `comfort_drift`

两者都保留，但职责不同：

- `region.comfort_level`：区域当前经过平滑后的舒适/压迫体验强度，是对外稳定读取的区域级体验值
- `state.disturbance_metrics.comfort_drift`：相对区域基线的短时偏移方向，用于表达“此刻比平时更治愈还是更紧绷”

因此：

- `comfort_level` 是区域层结果字段
- `comfort_drift` 是状态层扰动字段
- 不应再把 `comfort_drift` 直接写回 `region`

## 建议字段落点

### `region`

这些字段应表示区域的慢变化底色：

- `social_tension`
- `commerce_flux`
- `anomaly_pressure`
- `comfort_level`
- `vibe_profile`
- `palette_hint`

其中前四项应理解为“平滑后的区域体验基线”，而不是逐分钟跳动的实时值。

### `state`

这些字段应表示本轮世界切片的时态信息：

- `disturbance_level`
- `signal_snapshot`
- `disturbance_metrics`
- `active_lens`
- `spawn_window`

建议 `state.disturbance_metrics` 至少包含：

- `social_tension`
- `commerce_flux`
- `anomaly_pressure`
- `comfort_drift`
- `vibe_amplitude`
- `spawn_potential`

### `state.poi_states`

`poi_states` 不只是访问记录，也应承载 POI 级局部扰动：

- `disturbance_tags`：如 `messenger_swarm`, `memory_flood`, `flux_overlap`
- `local_anomaly`：局部异常强度
- `local_spawn_bonus`：局部刷新加成
- `interaction_mood`：局部交互语气，如 `tense`, `soft`, `uncanny`
- `window_expires_at`：临时窗口结束条件

## 指标到表现层的映射

### UI / 地图气氛

- `social_tension`：影响提示文案压迫感、边框张力、区域播报语气
- `comfort_level` + `comfort_drift`：影响文本柔和度、治愈入口开放感
- `vibe_amplitude`：影响镜头强化程度、色板偏移与氛围层强度

### NPC / 精灵 / 收集物

- `commerce_flux`：提高物流型 NPC、补给点、流通事件可见度
- `spawn_potential`：控制都市精灵、稀有收集物与 Secret Garden 窗口概率
- `anomaly_pressure`：提高异常型 NPC、历史残响与谜团入口权重

### event / task / broadcast

- `social_tension`：提高巡逻、封锁、摩擦事件权重
- `anomaly_pressure`：提高历史回声、异象播报、时间裂口任务权重
- `commerce_flux`：提高黑市、配送、交换类事件权重
- `comfort_drift`：决定当前更偏压抑叙事还是抚慰叙事

## v0.1 推荐实现边界

第一版应优先支持：

- 基于时段、天气、工作日/周末的规则扰动
- `region.comfort_level` 与 `state.disturbance_metrics.comfort_drift` 的分层
- `state.disturbance_metrics` 的统一读取口
- `poi_states` 的局部扰动标签

第一版不要求：

- 接入真实分钟级人流/交通 API
- 做跨城市在线同步扰动
- 做完整经济模拟

## 对后续 AI 协作者的直接约束

- 如果你在改 `WORLD_SCHEMA`，不要把所有扰动指标都塞进 `region`
- 如果你在做 UI / Web-2D，优先读取 `state.disturbance_metrics`，不要直接猜原始信号
- 如果你在做 POI 玩法，局部异象请优先落在 `state.poi_states`
- 如果你在做地点命名，请不要让扰动覆盖 archetype 与 Dual-Track Mapping 的稳定身份