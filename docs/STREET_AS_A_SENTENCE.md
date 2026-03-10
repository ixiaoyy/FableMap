# FableMap Street as a Sentence 设计稿 v0.1

## 目标

`Street as a Sentence` 的核心命题是：

**一条街不应只被看作 POI 的无序集合，而应被看作一串有顺序、有重音、有转折的语义句子。**

它的作用是把：

- 上游真实地图结构
- 中层文化诠释
- 下游叙事语气 / 视觉气质 / NPC 气口

连接成一条可解释的生成链路。

## 为什么需要它

如果只有单点 POI 映射，FableMap 会得到很多“有意思的地点”，但很难得到一整片街区的统一气质。

缺失主要体现在：

- 无法解释为什么这条街整体让人感到压迫、温柔、疲惫或荒诞
- 无法稳定生成 `region.narrative_summary`
- 无法让相邻地点之间产生“前后文”关系
- 无法为 NPC 语气、音景和镜头切换提供更高层依据

`Street as a Sentence` 就是为了解决这个中层问题。

## 核心原则

### 1. 顺序有意义

同样的三个地点：

- 学校 -> 便利店 -> 公园
- 公园 -> 学校 -> 便利店

在生活经验里并不是同一句话。

顺序会改变：

- 节奏
- 权力感
- 情绪落点
- 路径叙事

### 2. 街道是句子，不是标签云

街道的意义来自：

- 哪些东西连续出现
- 哪些东西彼此对照
- 哪些东西突然打断节奏
- 哪些空白和转角制造悬置

### 3. 句法必须能追溯到真实结构

这个系统不是纯文学修辞，而应尽量由真实地图可观察结构支撑：

- POI 类型与密度
- 道路等级与连接关系
- 路口、拐点、节点压力
- 地标与公共设施分布
- 白天 / 夜间功能变化

### 4. 句子输出必须能落回现有 Schema

在 v0.1 阶段，它不要求新增 Schema 字段，而应优先反哺：

- `region.theme`
- `region.atmosphere`
- `region.narrative_summary`
- `region.satire_profile`
- `region.vibe_profile`
- `region.class_tone`
- `roads[*].fantasy_role`
- `historical_echoes`
- `memory_anchors`

## 基本定义

### 街道

这里的“街道”不是只指一条命名道路，而是一个玩家可连续感知的线性城市片段。

它可以由以下对象构成：

- 一条主路及其两侧 POI
- 一段步行街
- 一组连续路口之间的路径
- 从地铁口到住宅街、再到公园的常见通勤链路

### 句子

句子是把这一线性片段按体验顺序切开后得到的语义序列。

一句话里至少要有：

- **词**：单个地点 / 节点 / 转角 / 空白
- **语法关系**：重复、并列、转折、压迫、缓冲、结尾
- **语气**：疲惫、暧昧、庄严、空心、治愈、嘲讽

## Token 化建议

建议把街道拆成一系列 `street tokens`。

### 可作为 token 的对象

1. **POI token**
   - 如医院、便利店、学校、咖啡馆、公园

2. **road token**
   - 如主干路、住宅街、步道、桥下通道

3. **intersection token**
   - 如大型路口、红绿灯控制节点、换乘口

4. **landmark token**
   - 如纪念物、塔楼、广场、异常地标

5. **void token**
   - 如长围墙、空停车场、夜间封闭门面、缺失照明的空段

### token 应至少携带的信息

- 现实功能
- 社会信号
- 情绪温度
- 开放 / 封闭程度
- 消费 / 管制 / 治愈 / 通行倾向
- 日夜差异

## 句法关系

街道语义不只看 token 本身，还看 token 之间的关系。

### 1. 重复

连续出现同类 token，会形成强调。

例如：

- 连续便利店、快餐店、药妆店

可能指向：

- 高流动商业补给带
- 都市疲惫的续命语法

### 2. 转折

高压节点后突然出现缓冲空间，会形成强烈转折。

例如：

- 大路口 -> 办公楼 -> 小公园

可能指向：

- 被制度挤出的短暂呼吸口

### 3. 插入

一串统一语义里插入异质 token，会成为“破句”。

例如：

- 一排商业门店中突然出现一座旧神龛、回收点或封闭建筑

它常适合生成：

- `historical_echoes`
- `memory_anchors`

### 4. 并列

功能相近但阶层含义不同的地点并列，会强化社会讽刺。

例如：

- 高级咖啡馆 与 平价快餐店并列

可能指向：

- 同一条街上的阶层折叠

### 5. 收束

街道末端的 token 往往决定句尾语气。

例如：

- 通勤链路最终收束到住宅区
- 消费街最终收束到桥下空地

它会影响：

- `region.narrative_summary` 的最后一句
- 玩家对该区域“回家 / 被抛下 / 继续漂浮”的感觉

## 语义角色建议

为了便于后续规则实现，可以先给 token 归纳少量稳定角色：

- `control`：管理、审查、维持秩序
- `supply`：补给、续航、消费支撑
- `care`：治疗、休息、缓冲、安抚
- `exchange`：交易、交谈、社交流动
- `transit`：通行、换乘、穿越
- `memory`：停留、留痕、回望
- `void`：空白、缺失、停摆
- `anomaly`：异质、异常、谜团入口

这些角色不是最终展示字段，但适合作为中间语义层。

## 街句生成流程建议

### 第一步：抽取线性片段

从真实地图中取一段玩家最可能连续经过的路径。

依据可包括：

- 道路连通性
- POI 分布密度
- 主要出入口与换乘口
- 行人友好路径

### 第二步：生成 token 序列

按体验顺序排列：

- 进入点
- 中段连续区
- 转折点
- 结尾点

### 第三步：识别句法模式

判断该街句更像：

- 补给句
- 通勤句
- 审判句
- 休憩句
- 消费幻觉句
- 记忆回声句

### 第四步：输出区域级推断

把句子层结论沉淀到：

- `region.theme`
- `region.atmosphere`
- `region.satire_profile`
- `region.vibe_profile`
- `region.class_tone`
- `region.narrative_summary`

### 第五步：生成局部叙事钩子

再把局部冲突、转折和异常分发给：

- `pois[*].satire_hook`
- `pois[*].emotion_hook`
- `historical_echoes`
- `memory_anchors`

## 句型原型示例

### 1. 通勤耗损句

`station -> convenience -> crossing -> office tower -> fast food -> apartment`

可能输出：

- `region.theme = mechanical_commute`
- `region.atmosphere = hurried`
- `region.satire_profile = efficiency_devours_life`
- `region.vibe_profile = neon_nostalgia` 或 `gritty_cyberpunk`

### 2. 温柔缓冲句

`school -> bakery/cafe -> small park -> residential lane`

可能输出：

- `region.theme = neighborhood_breath`
- `region.atmosphere = gentle`
- `region.vibe_profile = amber_evening` 或 `ghibli_town`

### 3. 控制压迫句

`court/police -> major crossing -> government block -> surveillance void`

可能输出：

- `region.theme = civic_judgement_corridor`
- `region.atmosphere = tense`
- `region.satire_profile = order_as_theater`
- `region.vibe_profile = dark_gothic`

## 与现有文档的关系

### 与《文化诠释框架》的关系

《文化诠释框架》解释“一个点为何被翻译成这种异世界语义”。

`Street as a Sentence` 解释“多个点连起来后，为何会形成这种整街气质”。

### 与《视觉气质宣言》的关系

《视觉气质宣言》定义 vibe 的参数边界。

`Street as a Sentence` 负责为某条街、某片区推断最合理的 vibe 候选。

### 与《Causal Ripple Algorithm》的关系

`Street as a Sentence` 提供的是**静态或准静态句法结构**。

`Causal Ripple Algorithm` 则负责让事件沿这些结构传播，改变整句语气和节点压力。

## 对实现层的启发

在未来代码实现上，它可以先做成一个轻量规则系统：

- 输入：一段路径上的 POI / roads / landmarks
- 中间层：token、角色、句法模式
- 输出：区域主题、语气、vibe 候选、局部钩子

不必一开始就依赖 LLM。

更合适的路径是：

1. 规则先给出稳定骨架
2. LLM 再对 `narrative_summary`、NPC 语气和广播文本做润色

## 需要避免的坏味道

- 把街道仍然当作 POI 列表，只是换个名字
- 句法定义过多过碎，导致无法实现
- 为了文学感牺牲可追溯性
- 只生成区域结论，不回流到具体 POI 钩子
- 只看白天功能，不考虑夜晚反差

## 未来可扩展方向

- 街句的机器可读配置文件
- 不同城市文化下的句法偏移规则
- 基于玩家移动轨迹的“主观句子”版本
- 与 Ethereal Radio 结合，把句型直接转成旁白和音景脚本
- 与 Godot 结合，把句法重音转成镜头和灯光重心