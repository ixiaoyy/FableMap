# FableMap Dual-Track Mapping 规则表 v0.1

## 目标

这份文档把 `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md` 中的“镜头坍缩层”继续拆细，定义：同一个现实 archetype，如何在 FableMap 的两条长期世界线里稳定坍缩为不同地点身份。

它主要服务于：

- 地点转义规则编写
- Web-2D 呈现与 UI 文案
- `WORLD_SCHEMA` 字段预留与 hook 对齐
- 后续 AI 协作者编写更多地点词条时的统一模板

## 与现有世界线的对应关系

- `Cynic Lens`：更接近 `Dark Satire Spirit Vision`
- `Muse Lens`：更接近 `Healing Spirit Vision`

这里用 `Cynic / Muse`，是为了强调它们不是简单的美术风格，而是两种解释现实的世界镜头。

## 规则编写原则

### 1. 先抽 archetype，再写双轨结果

不要从“这个地点叫什么”开始，而要先写：

- 现实功能
- 社会结构角色
- 情绪位置
- 稳定交互角色

### 2. 双轨映射必须共享同一组不变量

无论切到哪条镜头，下列内容应尽量稳定：

- 真实坐标与邻接
- 基础空间规模
- 公共 / 半公共 / 私密属性
- 主要交互角色（补给、停留、规训、修复、穿行等）

### 3. 双轨映射允许改变的内容

- `fantasy_name`
- `fantasy_type`
- 文案口吻
- icon / 色板 / 建筑装饰
- 事件概率与可见收集物
- `satire_hook` / `emotion_hook` 的重心

### 4. 先写“为什么会这么转”，再写“转成什么”

如果一个词条不能解释“为什么学校在这一轨里会被叫作意识模具厂”，那它还不算完成。

## 建议字段骨架

每个 archetype 规则建议至少回答：

- `real_inputs`：来自哪些现实标签或组合标签
- `core_archetype`：稳定原型语义
- `shared_invariants`：双轨下都不该丢的稳定属性
- `cynic_variant`：黑暗社会寓言轨的坍缩结果
- `muse_variant`：治愈情感表达轨的坍缩结果
- `interaction_tags`：这个地点适合挂哪些玩法与 hook

## 首批高频 archetype 规则

### 1. School / 教育设施

- `real_inputs`：`amenity=school`、`amenity=college`、`amenity=university`
- `core_archetype`：教育、筛选、规训、未来分配、青春残响
- `shared_invariants`：人群周期性聚集、日程强、制度边界明显、成长叙事浓度高
- `cynic_variant`：`意识模具厂 / Ego Foundry`，强调标准化、筛选与未来加工
- `muse_variant`：`萤火学堂 / Lumen Academy`，强调启蒙、陪伴、记忆与夜色微光
- `interaction_tags`：课程任务、青春回声、考试压力、匿名愿望、成长型精灵

### 2. Bank / 金融设施

- `real_inputs`：`amenity=bank`、部分 `office=financial`
- `core_archetype`：储存、债务、信用、交换、时间承诺
- `shared_invariants`：高门槛、资源控制、信任结构、价值记账
- `cynic_variant`：`灵魂债务行 / Debt Cathedral`，强调信用控制、负担与制度威压
- `muse_variant`：`时光储蓄罐 / Tick-Tock Jar`，强调愿望封存、时间积累与未来交换
- `interaction_tags`：资源兑现、代价选择、时限任务、承诺系留言

### 3. Convenience Store / 便利店

- `real_inputs`：`shop=convenience`
- `core_archetype`：即时补给、深夜续命、最低限度日常维持
- `shared_invariants`：高频访问、轻停留、夜间可靠、生活缝隙中的支持点
- `cynic_variant`：`多巴胺补剂点`，强调疲惫城市对即时慰藉的依赖
- `muse_variant`：`解忧杂货铺`，强调小确幸、安慰、碎片收集与善意交换
- `interaction_tags`：补给、留言、交换、碎片掉落、夜行者事件

### 4. Hospital / 医疗设施

- `real_inputs`：`amenity=hospital`、`amenity=clinic`
- `core_archetype`：诊断、修复、等待、希望、成本与门槛
- `shared_invariants`：脆弱感高、秩序强、停留时间长、修复与编号并存
- `cynic_variant`：`生体审判庭 / Vital Tribunal` 或 `圣白收容所`，强调筛查、代价与生物伦理边界
- `muse_variant`：`记忆礼堂 / Hall of Mending`，强调疗愈、被照看、重生与脆弱共存
- `interaction_tags`：治愈任务、脆弱状态、纪念回声、守护系 NPC

### 5. Office Tower / 办公楼与商务区

- `real_inputs`：`office=*`、高密度商务楼、`building=office`
- `core_archetype`：劳动组织、等级秩序、价值提炼、协作疲劳
- `shared_invariants`：高密度、强节奏、重复进出、资源与权力集中
- `cynic_variant`：`契约尖塔 / Contract Spire`、`灵魂磨盘`，强调效率神话与被抽取的人生
- `muse_variant`：`纸灯工坊群 / Paperlight Works`，强调努力、灯火、微小成就与夜归者情绪
- `interaction_tags`：通勤压力、阵营影响、加班回声、黄昏播报

### 6. Park / 公园与绿地

- `real_inputs`：`leisure=park`、`natural=*`、水体周边
- `core_archetype`：缓冲、呼吸、停留、城市中的软边界
- `shared_invariants`：可停驻、可散步、节奏减慢、适合记忆与偶遇
- `cynic_variant`：`被规划的安宁带 / Pacified Grove`，强调城市如何把自然收编成可消费的疗愈装置
- `muse_variant`：`低语花园 / Whispering Grove`，强调情绪修复、精灵刷新与秘密停靠
- `interaction_tags`：精灵刷新、情绪锚点、野餐式回忆、私密对话

### 7. Cafe / 茶饮店 / 停留型小店

- `real_inputs`：`amenity=cafe`、`shop=tea`、适合短暂停留的小型消费点
- `core_archetype`：停留、交谈、发呆、短暂自我修复
- `shared_invariants`：半公共、可停留、节奏柔和、适合叙事沉积
- `cynic_variant`：`情绪收费站 / Mood Toll Booth`，强调温柔空间常由消费资格维持
- `muse_variant`：`余温茶屋 / Ember Parlor`，强调陪伴、等待、秘密交换与匿名安慰
- `interaction_tags`：私密留言、好友相遇、心事胶囊、雨天镜头增强

### 8. Traffic Signal / 交叉口 / 节奏控制点

- `real_inputs`：`highway=traffic_signals`、重要路口、十字节点
- `core_archetype`：节奏调度、微型秩序仪式、停与行的决定点
- `shared_invariants`：高频通过、短时等待、决策感、方向分流
- `cynic_variant`：`秩序监视眼`，强调被管理、被校准、被允许通行
- `muse_variant`：`命运转经筒`，强调岔路、偶遇、愿望与方向感
- `interaction_tags`：路径选择、街道播报、瞬时事件、路口传闻

### 9. Parking / 停车场与待机空间

- `real_inputs`：`amenity=parking`、大型地面停车区
- `core_archetype`：暂停、待机、通勤工具沉睡区、城市边缘化空地
- `shared_invariants`：功能过渡性强、情绪温度偏低、适合承载“暂停状态”
- `cynic_variant`：`巨兽墓地`，强调钢铁躯壳被驯化后的整齐停放
- `muse_variant`：`流浪云停靠站`，强调归途、停靠、短暂休眠与远行愿望
- `interaction_tags`：旅行前夜、过渡任务、低活性回声、迁徙系精灵

### 10. Residential Block / 住宅区

- `real_inputs`：`building=residential`、住宅组团、老旧公寓与常住社区
- `core_archetype`：居住、维持日常、亲密与孤独并存、私人边界
- `shared_invariants`：高隐私、重复返场、情绪沉积强、适合长期记忆系统
- `cynic_variant`：`回声蜂巢 / Echo Hive`，强调密集居住、现实压力与匿名相邻
- `muse_variant`：`灯窗栖所 / Lantern Nest`，强调归家、私人仪式、镜像家园与柔光生活
- `interaction_tags`：镜像家园、私密记忆、邻里回声、保护性抽象显示

## 给其他 AI 参与者的直接提示

### 如果你要新增规则

- 先补 archetype，不要直接补词藻
- 同时写 `cynic_variant` 与 `muse_variant`
- 至少说明一个 `shared_invariants`
- 至少说明一个可挂接的玩法标签

### 如果你要把规则落到 Schema

- 稳定部分优先进入 `fantasy_type`、`faction_alignment`、`satire_hook`、`emotion_hook`、`visual_hint`
- 镜头特异部分更适合落在 lens-specific 配置层，而不是污染底层坐标或原始 OSM 身份

### 如果你要做 Web-2D 图标

- 同一个 archetype 的两轨 icon 应看起来像“同源异构”，而不是完全无关的两套图形
- 地图缩放时应优先保持空间认知连续性

## 明确不是当前已实现能力

这份规则表是规格初稿，不代表仓库已经完成：

- 全量 archetype 覆盖
- 自动化规则引擎
- 运行时镜头切换逻辑
- 历史层与玩家写回在双轨中的完整联动

它的作用是让后续 AI 协作者在继续扩表时，不会把 Dual-Track Mapping 做成一堆风格松散的随意命名。