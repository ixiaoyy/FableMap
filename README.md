# FableMap

> Turn real places into living fantasy worlds.

## 项目简介

FableMap（寓言地图）是一个基于真实世界地理数据生成幻想 RPG 世界的开源项目。

它把现实中的道路、建筑、公园、医院、商店等 OSM 地图元素，映射成一个可以探索、叙事、持续演化的异世界地图。目标不是做一个普通地图工具，而是做一个“现实空间幻想化生成引擎”。

## 核心理念

- **真实地图是骨架**：使用 OSM / Overpass 数据作为不可违背的空间约束
- **LLM/规则系统是灵魂**：把现实地点翻译成异世界语义、任务和叙事
- **游戏引擎是身体**：让生成结果在 Godot 中变成可行走、可交互的场景

## 项目气质

FableMap 的未来目标不是做“把警察局换成魔法塔”的轻量玩具，而是做一个更偏**黑暗、复杂、社会化**的现实空间 RPG。

- **阵营与权力**：区域不只是地点集合，而是资源、立场与控制权的博弈场
- **黑色幽默与现实讽刺**：写字楼、健身房、便利店和医院，都可以被解构成带有社会隐喻的异世界机构
- **隐秘历史与谜团探索**：地点之下埋藏真实历史残响、碎片化叙事和可追踪线索
- **现实信号驱动的动荡**：交通、人流、消费与城市节奏可以逐步成为世界事件的动态输入

同时，FableMap 的另一条长期主线是更偏**审美、情感、自我表达与治愈收集**的体验：

- **风格化现实重构**：把日常街道变成吉卜力、王家卫、印象派或脏冷赛博风格的平行城市
- **情感锚点与私密叙事**：让长椅、路口、咖啡店和雨夜车站成为记忆容器与秘密花园
- **都市精灵与收藏系统**：把现实地点转化为可发现、可收集、可装扮的温柔生态
- **镜像家园**：把你在现实中捡到的风格碎片、纪念物和精灵带回一个可持续装扮的私人空间

## MVP 目标

第一版只证明一个闭环：

1. 输入一个现实坐标
2. 抓取周边 OSM 数据
3. 生成幻想世界 JSON
4. 保持同一区域生成结果稳定
5. 在 Godot 中实例化为可探索场景

## 第一版模块

- **Generate CLI**：输入坐标，输出稳定的 `world.json`
- **Overpass Adapter**：支持真实地图抓取、超时、有限重试与清晰错误信息
- **Local Cache Layer**：缓存原始 Overpass JSON，提高在线开发稳定性
- **World Builder**：将真实地理实体映射为当前世界 Schema
- **Future Inspect CLI**：读取已生成世界文件并输出摘要信息
- **Future Godot Consumer**：将 JSON 转为 Godot 中的节点与可探索场景

## 当前已实现原型

仓库当前已经不只停留在设计阶段，而是具备了一个最小可运行原型：

- 可通过 `python -m fablemap generate` 生成世界 JSON
- 支持离线 fixture 模式与在线 Overpass 模式
- 在线请求具备超时、有限重试与可读错误信息
- 已具备最小本地缓存层，减少重复请求外部地图服务
- 已有基础单元测试覆盖 CLI、world builder、Overpass 与 cache 链路

这意味着 FableMap 已经从“概念文档”进入了“可迭代工程原型”阶段。

## 未来设计钩子

以下方向不是当前 MVP 的阻塞项，但会决定 FableMap 后续是否真正形成独特护城河：

- **Causal Ripple Algorithm**：让单点事件向周边街区传播，形成阵营、经济、情绪与异常度的连锁反应
- **Street as a Sentence**：把街道上的 POI 序列当作语义句子，推断整片区域的叙事气质、视觉风格与 NPC 语气
- **The Ethereal Radio**：基于 GPS 与区域状态实时生成耳机叙事体验，降低新用户体验门槛并增强传播性
- **Aesthetic Kernel**：让同一份世界数据能快速切换不同视觉滤镜与情绪氛围，提升创作反馈感

## 文档导航

- [产品概述](docs/PRODUCT_BRIEF.md)
- [PRD v0.1](docs/PRD_V0.1.md)
- [系统架构](docs/ARCHITECTURE.md)
- [世界 Schema](docs/WORLD_SCHEMA.md)
- [开发路线图](docs/ROADMAP.md)
- [长期体验方向](docs/LONG_TERM_EXPERIENCE.md)
- [审美与情感系统](docs/AESTHETIC_EMOTION_SYSTEMS.md)
- [文化诠释框架](docs/CULTURAL_INTERPRETATION.md)
- [视觉气质宣言](docs/STYLE_VIBES_MANIFESTO.md)
- [动态扰动模型](docs/DISTURBANCE_MODEL.md)
- [阵营系统](docs/FACTION_SYSTEM.md)
- [AI 参与开发协议](docs/AI参与开发协议.md)
- [模块认领说明模板](docs/claims/README.md)

## 推荐命名策略

当前项目名保留为 **FableMap**，中文名为 **寓言地图**。

如果未来需要更强的品牌表达，可以把 `FableMap` 作为仓库/技术名，后续再评估 `Worldfold`、`LoreWalk` 等展示名。

## 近期交付物

- 已落地：`generate` CLI，输入坐标输出世界描述 JSON
- 已落地：Overpass 在线请求健壮性增强（超时 / 重试 / 错误提示）
- 已落地：本地缓存层，缓存原始 Overpass JSON
- 下一步：`inspect` 子命令与更明确的世界摘要读取能力
- 下一步：文化诠释词典与视觉气质宣言等核心设计资产
- 后续：Godot Demo，支持加载 JSON 并进行基础探索

## 项目状态

当前阶段：**文档体系已建立，Python 最小原型已跑通**

当前已完成：

- 项目文档体系与协作协议
- `python -m fablemap generate`
- 世界 JSON 最小生成闭环
- Overpass 在线抓取健壮性增强
- 本地缓存层
- 对应的测试、认领文档与变更说明流程

下一阶段：补 `inspect` 子命令、继续增强区域一致性生成逻辑，并逐步接近 Godot 可消费的最小展示链路。

中长期阶段：在稳定世界生成闭环之上，同时推进两条体验主线：

- **权力与世界状态主线**：阵营政治、社会讽刺、历史谜团与现实动态事件
- **审美与情感表达主线**：风格化相机、私密记忆空间、都市精灵与镜像家园