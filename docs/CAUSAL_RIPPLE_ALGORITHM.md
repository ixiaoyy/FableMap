# FableMap Causal Ripple Algorithm 设计稿 v0.1

## 目标

`Causal Ripple Algorithm` 要回答的问题是：

**一个地点发生的事件，为什么会影响它周边的另一批地点、阵营关系、资源流和整体氛围？**

它的作用是把：

- 单点 POI 事件
- 区域动态扰动
- 道路与街句结构
- 阵营与资源关系

连接成一条**可追溯、可控制、可落回 Schema 的连锁反应链路**。

## 为什么需要它

如果 FableMap 只有静态映射，那么世界只能回答：

- 这个地方是什么
- 这条街看起来像什么

但还不能回答：

- 这个地方出事后，周边为什么会一起紧张起来
- 为什么同一条街上的补给点、巡逻点和记忆点会同时变调
- 为什么一个事件会让文案、经济、阵营与镜头一起偏移

`Causal Ripple Algorithm` 就是用来补上这条“事件 -> 传播 -> 区域反馈”的中层机制。

## 核心原则

### 1. 连锁反应必须可追溯

传播不是神秘随机数，而应能追溯到：

- 空间距离
- 道路连通
- 街句结构
- 阵营关系
- 资源依赖
- 时段 / 天气 / 扰动强度

### 2. 传播不是只看距离

离得近不一定影响最大。

一个便利店可能离警察局更远，却因为：

- 位于同一通勤链路
- 共享同一控制结构
- 处于同一高流动补给句

而受到更强影响。

### 3. 传播必须分层

同一事件不只改变“战斗难度”或“危险等级”，还可以改变：

- 阵营控制力度
- 资源流和补给压力
- 地区压迫感与安抚感
- 历史回声与异常残留
- 文案语气、镜头和 vibe 候选

### 4. 传播必须可控、可衰减

系统要能防止一次偶发输入让整片城市失真。

因此每次 ripple 都需要：

- 最大传播半径
- 传播窗口
- 衰减系数
- 层级上限
- 恢复或平滑机制

### 5. v0.1 优先复用现有 Schema

在当前阶段，它不要求先扩展世界 Schema，而应优先回落到已有字段与状态容器：

- `region.social_tension`
- `region.commerce_flux`
- `region.anomaly_pressure`
- `region.comfort_level`
- `region.theme`
- `region.atmosphere`
- `region.satire_profile`
- `region.vibe_profile`
- `state.disturbance_level`
- `state.signal_snapshot`
- `state.story_events`
- `state.poi_states`
- `state.faction_states`
- `state.economy_state`
- `state.route_impact`
- `state.resource_transfers`
- `state.active_lens`

## 基本定义

### 源事件（source event）

源事件是 ripple 的起点，可以来自：

- 玩家行为
- 规则系统触发
- 时段 / 天气 / 节假日变化
- 某个 POI 的状态切换
- 阵营行动或区域事件

例如：

- `judgement_tower` 遭到破坏
- `supply_outpost` 进入短缺
- 雨夜车站片区人流异常下降
- `healing_sanctum` 过载

### 传播载体（carrier）

事件不会对所有对象平均扩散，而会沿特定载体传播：

- 空间邻近
- 路网连接
- 街句语法关系
- 阵营控制链
- 资源流路径
- 情绪 / 记忆 / 异常关联

### 影响层（impact layer）

一次 ripple 至少应落在一个或多个影响层：

- `control`：秩序、巡逻、封锁、威慑
- `supply`：物价、补给、物流、黑市活跃
- `care`：治疗、安抚、休息资源的紧张程度
- `emotion`：压迫、疲惫、温柔、陌生化
- `anomaly`：历史残响、谜团入口、异常放大
- `aesthetic`：镜头强度、色板倾向、文案语气

### ripple window

每次 ripple 都应有明确窗口：

- **空间窗口**：影响多大半径或几条街句
- **时间窗口**：持续多久
- **层级窗口**：能改动哪些状态层，不能越级污染全部世界

## 建议事件类型

### 1. 控制破裂事件

例如：

- 审判塔受损
- 巡逻节点失效
- 政务区发生封锁

常见结果：

- `social_tension` 上升
- 控制类阵营影响力波动
- 周边补给点进入惊慌或囤积状态
- 文案语气更紧绷，镜头更冷硬

### 2. 补给冲击事件

例如：

- 补给站短缺
- 商业节点异常关闭
- 通勤干线拥堵

常见结果：

- `commerce_flux` 偏移
- 黑市或替代节点活跃
- NPC 语气转向焦躁、讨价还价或疲惫

### 3. 治愈过载事件

例如：

- `healing_sanctum` 等待过长
- 公园 / 缓冲空间被高压链路吞没

常见结果：

- `comfort_level` 下降
- `care` 类地点被迫承担额外压力
- 温柔型街句被改写成疲惫或应急语气

### 4. 异常点火事件

例如：

- 旧地标在夜雨中被激活
- 一段空白街句突然出现异常回声

常见结果：

- `anomaly_pressure` 上升
- `historical_echoes` 更容易被触发
- `memory_anchors` 的解锁条件被短时放大

### 5. 审美放大事件

例如：

- 雨夜 + 车站 + 便利店 + 人流回落
- 黄昏 + 公园 + 住宅街 + 低压时段

常见结果：

- `region.vibe_profile` 候选收敛
- `state.active_lens` 更容易偏向某种镜头
- 文案和音景建议同步偏移

## 传播路径建议

### 1. 空间邻近传播

最基础的传播路径。

影响通常受以下因素控制：

- 直线距离
- 可达距离
- 中间是否被主干路、河道或大空白切断

### 2. 路网传播

道路不是背景，而是事件的导线。

例如：

- 主干路适合传播补给压力与通勤恐慌
- 仪式路径适合传播异常与记忆效应
- 市场街更容易放大阶层并列带来的社会讽刺

### 3. 街句传播

`Street as a Sentence` 提供的是语法结构。

这意味着 ripple 可以沿着：

- 重复
- 转折
- 插入
- 并列
- 收束

这些关系扩散，而不是只按地理圆形外扩。

### 4. 阵营传播

如果两个地点被同一阵营控制，或被互相竞争的阵营同时关注，事件会跨越纯空间距离传播。

例如：

- 一个控制节点受损，附近未受损节点也会进入戒备状态
- 一个补给点被抢占，竞争阵营会提前调整周边资源流

### 5. 资源流传播

补给、治疗、通勤、休闲与黑市并不是孤立地点，而是网络。

一处节点异常时，应优先影响：

- 上游输入点
- 下游消费点
- 替代节点
- 灰色替代路线

## 建议计算骨架

### 第一步：识别源事件

确定：

- 事件类型
- 源 POI / 路段 / 区域
- 事件强度
- 持续时长

### 第二步：确定传播载体

对每种可能载体给出权重，例如：

- 空间邻近权重
- 路网连通权重
- 街句关系权重
- 阵营关联权重
- 资源依赖权重

### 第三步：计算候选受影响节点

优先找：

- 半径内 POI
- 同一街句中的关键 token
- 同阵营 / 对立阵营节点
- 同资源链上的替代节点

### 第四步：对影响层分别衰减

可用类似思路：

`ripple_score = source_intensity × carrier_weight × distance_decay × context_modifier`

其中 `context_modifier` 可由以下因素共同决定：

- 当前 `disturbance_level`
- 时段 / 天气
- 区域基线压力
- 当前街句类型
- 目标节点的承压能力

### 第五步：写回区域与状态层

把 ripple 结果写回：

- 区域指标
- POI 状态
- 阵营状态
- 资源与路线影响
- 叙事与镜头候选

## 与现有 Schema 的映射

### 对 `region` 的影响

优先影响：

- `social_tension`
- `commerce_flux`
- `anomaly_pressure`
- `comfort_level`
- `theme`
- `atmosphere`
- `satire_profile`
- `vibe_profile`

这些字段负责回答：

- 整片区域现在更紧绷还是更缓和
- 这次事件更像经济问题、秩序问题还是异常问题
- 当前更适合被哪种叙事语气和镜头观看

### 对 `state` 的影响

优先影响：

- `disturbance_level`：记录当前总体扰动强度
- `signal_snapshot`：记录触发 ripple 的上下文信号
- `story_events`：记录已发生的关键事件
- `poi_states`：记录具体地点的局部状态变化
- `faction_states`：记录阵营警戒、扩张、收缩或争夺状态
- `economy_state`：记录价格、短缺与资源偏移
- `route_impact`：记录哪些路径变得危险、拥堵或关键
- `resource_transfers`：记录补给或控制资源被重新分配
- `active_lens`：记录当前最被放大的观看方式

### 对 POI / echoes / memory 的影响

虽然不要求新增字段，但 ripple 可以改变这些对象的解释与触发方式：

- `pois[*].satire_hook`
- `pois[*].emotion_hook`
- `historical_echoes[*].trigger_hint`
- `memory_anchors[*].unlock_conditions`

## 示例

### 例 1：审判塔受损 -> 补给链恐慌

`judgement_tower sabotage -> trade street -> supply_outpost cluster`

可能结果：

- 周边 `social_tension` 上升
- 附近 `supply_outpost` 进入紧张或涨价状态
- `faction_states` 中的秩序阵营进入警戒
- `route_impact` 标记某些街段更危险
- 文案语气从“规训稳定”转为“惊慌审视”

### 例 2：雨夜车站空洞 -> 霓虹异常放大

`station slowdown + rain + convenience strip + low visibility`

可能结果：

- `anomaly_pressure` 上升
- 车站到便利店的街句被读成“空心续命句”
- `active_lens` 倾向 `neon_nostalgia` 或更冷的夜景镜头
- `memory_anchors` 更容易开放深夜型留言

### 例 3：治疗圣所过载 -> 温柔街句塌缩

`healing_sanctum overload -> cafe -> park -> residential lane`

可能结果：

- `comfort_level` 下降
- 原本偏 `ghibli_town` / `amber_evening` 的片区变得疲惫
- 邻近 `care` 类节点被迫承担额外压力
- `narrative_summary` 更像“勉强维持日常”的段落

## 与现有文档的关系

### 与《动态扰动模型》的关系

《动态扰动模型》提供的是**区域级背景压力与信号基线**。

`Causal Ripple Algorithm` 提供的是**单点事件如何沿结构传播并改写局部与区域状态**。

两者关系可以理解为：

- 扰动模型决定此刻世界“容易往哪边偏”
- ripple 算法决定这次具体事件“沿什么链路扩散、打到哪里”

### 与《Street as a Sentence》的关系

《Street as a Sentence》提供**静态或准静态的街句结构**。

`Causal Ripple Algorithm` 让事件沿这些语法关系扩散，改变整句的语气、节奏与句尾落点。

### 与《文化诠释框架》的关系

《文化诠释框架》解释的是：

- 一个地点为什么属于控制、补给、关怀或记忆结构

这正是 ripple 判断“为什么它会影响另一个地点”的语义前提。

### 与《视觉气质宣言》的关系

《视觉气质宣言》定义 vibe 的参数边界。

`Causal Ripple Algorithm` 则负责说明：

- 什么事件会让某种镜头被放大
- 为什么同一片区会在特定时刻从温柔切到压迫

## 对实现层的启发

在未来代码实现上，它更适合先做成**规则驱动的局部传播系统**：

- 输入：事件、源节点、区域基线、街句结构、阵营关系
- 中间层：传播载体、影响层、衰减与放大器
- 输出：区域字段偏移、状态写回、局部叙事钩子

v0.1 不需要：

- 接入真实分钟级人流
- 做在线多人同步
- 构建超大范围实时仿真

更合适的路径是：

1. 先用规则生成稳定 ripple 结果
2. 再让 LLM 润色 `narrative_summary`、NPC 语气和广播文本

## v0.1 机器可读规则草案

为帮助后续实现层落地，当前可以先维护一份：

- `docs/CAUSAL_RIPPLE_RULES_V0.1.json`

这份文件优先把以下结构化信息固定下来：

- `formula`
- `carrier_types`
- `impact_layers`
- `context_modifiers`
- `event_templates`
- `writeback_targets`

它的定位是**规则草案与实现前配置骨架**，不是已经冻结的运行时契约。

## 需要避免的坏味道

- 把传播简单写成“以源点为圆心的统一减半半径”
- 只改数值，不改叙事语气与镜头层
- 为了酷炫而引入不可追溯的神秘随机事件
- 一次事件影响全部层，导致世界失真
- 把 ripple 和扰动模型写成两套互不相干的系统

## 未来可扩展方向

- 为不同事件类型补机器可读配置文件
- 引入 H3 / 路网图作为更稳定的传播图结构
- 为 inspect 工具提供 ripple 解释输出
- 允许玩家行为在长期上沉淀为 Collective Myth 层
- 将 ripple 输出接入 Ethereal Radio 与 Godot 镜头系统