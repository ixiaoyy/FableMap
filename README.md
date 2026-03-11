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
- **Inspect CLI**：读取已生成世界文件、输出稳定摘要，并做最小结构校验
- **Demo Runner**：用固定 demo fixture 生成可复现的 `world.json` 与 `summary.json`
- **Showcase Runner**：把 `world.json` 整理成更适合展示的 `showcase.json` 与 `showcase.md`
- **Static Bundle Export**：把世界与展示文件导出成固定目录结构的静态 bundle，并附带 `manifest.json`
- **Future Godot Consumer**：将 JSON 转为 Godot 中的节点与可探索场景

## 当前已实现原型

仓库当前已经不只停留在设计阶段，而是具备了一个最小可运行原型：

- 可通过 `python -m fablemap generate` 生成世界 JSON
- 可通过 `python -m fablemap inspect --input <world.json>` 输出世界摘要
- 可通过 `python -m fablemap.demo --output-dir demo-output` 一键生成稳定 demo 输出
- 可通过 `python -m fablemap.showcase --input demo-output/world.json` 生成展示样品文件
- 可通过 `python -m fablemap.bundle --input demo-output/world.json` 导出固定结构的静态包
- 对明显非法的世界文件，`inspect` 会返回最小 schema 校验错误
- 支持离线 fixture 模式与在线 Overpass 模式
- 在线请求具备超时、有限重试与可读错误信息
- 已具备最小本地缓存层，减少重复请求外部地图服务
- 已有基础单元测试覆盖 CLI、world builder、Overpass 与 cache 链路

这意味着 FableMap 已经从“概念文档”进入了“可迭代工程原型”阶段。

## 30 秒 demo

如果你想先体验一个稳定、无网络依赖的小 demo，可以直接运行：

- `python -m fablemap.demo --output-dir demo-output`

运行后会生成：

- `demo-output/world.json`
- `demo-output/summary.json`

如果想继续走现有 CLI 链路，可以再执行：

- `python -m fablemap inspect --input demo-output/world.json`

如果想把 demo 结果整理成更适合展示的样品，再执行：

- `python -m fablemap.showcase --input demo-output/world.json`

运行后还会额外生成：

- `demo-output/showcase.json`
- `demo-output/showcase.md`

如果想继续导出成更接近 Godot 消费方向的固定静态包，再执行：

- `python -m fablemap.bundle --input demo-output/world.json`

默认会生成：

- `demo-output/bundle/manifest.json`
- `demo-output/bundle/world.json`
- `demo-output/bundle/summary.json`
- `demo-output/bundle/showcase.json`
- `demo-output/bundle/showcase.md`
- `demo-output/bundle/index.html`

如果你只是想**马上体验一下**当前小 demo，生成 bundle 后可以直接打开：

- `demo-output/bundle/index.html`

其中 `manifest.json` 当前除了基础 `files` / `entrypoints` 外，还会提供：

- `slots`：稳定资源槽位，适合下游按固定名称读取
- `resources`：可遍历资源清单，适合 Godot 或其他消费层统一扫描

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
- [Street as a Sentence 设计稿](docs/STREET_AS_A_SENTENCE.md)
- [Causal Ripple Algorithm 设计稿](docs/CAUSAL_RIPPLE_ALGORITHM.md)
- [Causal Ripple 规则草案 JSON](docs/CAUSAL_RIPPLE_RULES_V0.1.json)
- [动态扰动模型](docs/DISTURBANCE_MODEL.md)
- [阵营系统](docs/FACTION_SYSTEM.md)
- [AI 参与开发协议](docs/AI参与开发协议.md)
- [模块认领说明模板](docs/claims/README.md)

## 推荐命名策略

当前项目名保留为 **FableMap**，中文名为 **寓言地图**。

如果未来需要更强的品牌表达，可以把 `FableMap` 作为仓库/技术名，后续再评估 `Worldfold`、`LoreWalk` 等展示名。

## 近期交付物

- 已落地：`generate` CLI，输入坐标输出世界描述 JSON
- 已落地：`inspect` CLI，读取世界文件、输出稳定摘要，并识别明显非法结构
- 已落地：repo 内固定 fixture demo runner，可一键产出可复现 demo 输出
- 已落地：showcase runner，可把 `world.json` 整理成更适合展示的样品文件
- 已落地：static bundle export，可导出固定目录结构与 `manifest.json`
- 已落地：bundle manifest 资源槽位与资源清单增强，便于下游稳定读取
- 已落地：bundle HTML 预览页，可直接本地打开 `index.html` 体验样品
- 已落地：Overpass 在线请求健壮性增强（超时 / 重试 / 错误提示）
- 已落地：本地缓存层，缓存原始 Overpass JSON
- 下一步：继续把 HTML 预览页往更像真正小 demo 的交互体验推进
- 下一步：文化诠释词典与视觉气质宣言等核心设计资产
- 后续：Godot Demo，支持加载 JSON 并进行基础探索

## 项目状态

当前阶段：**文档体系已建立，Python 最小原型已跑通**

当前已完成：

- 项目文档体系与协作协议
- `python -m fablemap generate`
- `python -m fablemap inspect`
- `python -m fablemap.demo`
- `python -m fablemap.showcase`
- `python -m fablemap.bundle`
- 世界 JSON 最小生成闭环
- Overpass 在线抓取健壮性增强
- 本地缓存层
- 对应的测试、认领文档与变更说明流程

下一阶段：继续细化 bundle 预览交互与 `bundle/manifest.json` 的 Godot 对接字段。

中长期阶段：在稳定世界生成闭环之上，同时推进两条体验主线：

- **权力与世界状态主线**：阵营政治、社会讽刺、历史谜团与现实动态事件
- **审美与情感表达主线**：风格化相机、私密记忆空间、都市精灵与镜像家园