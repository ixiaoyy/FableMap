# FableMap

> Turn real places into living fantasy worlds.

## 项目简介

FableMap（寓言地图）是一个把真实世界地理数据转译成可探索、可记忆、可共创幻想世界的开源项目。

它不是单纯把 POI 换成奇幻名字，而是试图在真实城市之上长出一个持续运转的第二世界：现实中的道路、建筑、公园、医院、商店等 OSM 元素，会被解释为异世界中的地形、机构、叙事节点与社会关系。

目标不是做一个普通地图工具，也不是只做一张“死的漂亮地图”，而是做一个“让现实世界长出神话”的生成引擎。

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

## 最终想实现的世界

FableMap 最终想实现的，不是一张“好看的奇幻地图”，而是一个覆盖在真实城市之上的活神话层。你看到的仍然是熟悉的道路、街区和建筑骨架，但它已经不再只是导航底图，而是一张会解释现实、回应玩家、并被玩家共同改写的世界地图。

- **同一座城市，两条长期世界线**：一条偏黑暗、成人、社会寓言，强调阵营、权力、讽刺、事件与现实压力；另一条偏审美、情感、治愈收集，强调记忆、表达、风格切换、精灵与家园。
- **玩家不是游客，而是共创者**：玩家可以留下情绪胶囊、私密记忆、地点传说、镜像家园、公共修复痕迹，甚至逐步参与地点命名、规则讨论与城市气质塑造。
- **城市会记住发生过什么**：地点会累积回声、广播、状态变化与集体行为结果；同一条街不会每次都像随机地图，而会逐步长出历史感与“被谁改变过”的痕迹。
- **先在浏览器里成型，再继续长出更强身体**：近期先把浏览器 Web-2D 主舞台做出来，让地图本身成为入口、观察窗和交互层；后续再扩展到更强的引擎身体与更完整的持续世界。

当前仓库还在验证 `nearby -> world -> preview` 的 Web-2D 入口闭环，还没有把这些长期机制全部实现；但项目的最终目标已经明确：让现实地图不只是被观看，而是被探索、被表达、被共同改写。

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
- **Nearby Preview Runner**：输入附近坐标后，直接产出 `world.json` 与 `bundle/index.html`
- **Future Godot Consumer**：将 JSON 转为 Godot 中的节点与可探索场景

## 当前已实现原型

仓库当前已经不只停留在设计阶段，而是具备了一个最小可运行原型：

- 可通过 `python -m fablemap generate` 生成世界 JSON
- 可通过 `python -m fablemap inspect --input <world.json>` 输出世界摘要
- 可通过 `python -m fablemap.demo --output-dir demo-output` 一键生成稳定 demo 输出
- 可通过 `python -m fablemap.showcase --input demo-output/world.json` 生成展示样品文件
- 可通过 `python -m fablemap.bundle --input demo-output/world.json` 导出固定结构的静态包
- 可通过 `python -m fablemap nearby --lat ... --lon ... --radius ...` 直接导出附近地图异世界预览
- 可通过 `python -m fablemap page` 启动本地页面服务，以页面方式触发 nearby 生成与预览
- 仓库根目录入口页 `index.html` 与生成后的 `bundle/index.html` 都支持中英双语切换
- 对明显非法的世界文件，`inspect` 会返回最小 schema 校验错误
- 支持离线 fixture 模式与在线 Overpass 模式
- 在线请求具备超时、有限重试与可读错误信息
- 已具备最小本地缓存层，减少重复请求外部地图服务
- 已有基础单元测试覆盖 CLI、world builder、Overpass 与 cache 链路

这意味着 FableMap 已经从“概念文档”进入了“可迭代工程原型”阶段。

## 30 秒进入世界

如果你现在想最快体验“把附近地图变成异世界”的页面入口，可以直接运行：

- `python -m fablemap page`

默认会启动本地页面服务，并自动打开：

- `http://127.0.0.1:8765/`

进入页面后你可以：

- 用 **离线样例（fixture）** 模式稳定试跑
- 切到 **真实 nearby（在线 Overpass）** 模式体验真实地图生成
- 直接点 **“用我的当前位置”**，把你所在街区作为世界切片入口
- 用 **预设地点** 一键体验几个更适合展示的真实地点
- 在页面里直接看到新生成的 bundle 预览页
- 在入口页和生成后的预览页之间都使用中英切换，并可显式切到中文
- 在结果卡片里看到更完整的真实性信息：坐标、半径、OSM 链接、区域主题、主导派系、seed、生成时间等

这里的两个页面分别是：

- 仓库根目录 `index.html`：世界入口 / 操作台
- 生成后的 `bundle/index.html`：世界切片观察窗 / 静态预览页

如果你只是想先看页面壳，不先启动服务，也可以直接打开：

- 仓库根目录 `index.html`

但要真正触发 nearby 生成，仍然需要先启动本地页面服务。

如果你想先体验一个稳定、无网络依赖的样例世界切片，可以直接运行：

- `python -m fablemap.demo --output-dir demo-output`

运行后会生成：

- `demo-output/world.json`
- `demo-output/summary.json`

如果想继续走现有 CLI 链路，可以再执行：

- `python -m fablemap inspect --input demo-output/world.json`

如果想把生成出的世界切片整理成更适合观察的样品，再执行：

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

如果你只是想**马上进入**当前样例世界切片，生成 bundle 后可以直接打开：

- `demo-output/bundle/index.html`

如果你想开始体验“把附近真实地图变成异世界”的第一版最小闭环，可以直接运行：

- `python -m fablemap nearby --lat 35.6580 --lon 139.7016 --radius 300 --output-dir nearby-output`

如果你只想离线稳定试跑，不依赖在线 Overpass，可改用 fixture：

- `python -m fablemap nearby --lat 35.6580 --lon 139.7016 --radius 300 --output-dir nearby-output --source-file tests/fixtures/overpass_sample.json`

运行后默认会生成：

- `nearby-output/world.json`
- `nearby-output/bundle/index.html`
- `nearby-output/bundle/manifest.json`

其中最直接的体验入口是：

- `nearby-output/bundle/index.html`

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
- [万物转义协议](docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md)
- [Dual-Track Mapping 规则表](docs/DUAL_TRACK_MAPPING.md)
- [开发路线图](docs/ROADMAP.md)
- [长期体验方向](docs/LONG_TERM_EXPERIENCE.md)
- [审美与情感系统](docs/AESTHETIC_EMOTION_SYSTEMS.md)
- [Web-2D 灵觉视图设计说明](docs/WEB_2D_SPIRIT_VIEW.md)
- [文化诠释框架](docs/CULTURAL_INTERPRETATION.md)
- [视觉气质宣言](docs/STYLE_VIBES_MANIFESTO.md)
- [Street as a Sentence 设计稿](docs/STREET_AS_A_SENTENCE.md)
- [Causal Ripple Algorithm 设计稿](docs/CAUSAL_RIPPLE_ALGORITHM.md)
- [Causal Ripple 规则草案 JSON](docs/CAUSAL_RIPPLE_RULES_V0.1.json)
- [动态扰动模型](docs/DISTURBANCE_MODEL.md)
- [阵营系统](docs/FACTION_SYSTEM.md)
- [AI 参与开发协议](docs/AI参与开发协议.md)
- [AI 协作共享任务列表](docs/AI_SHARED_TASKLIST.md)
- [模块认领说明模板](docs/claims/README.md)

协作者建议先阅读 `docs/AI_SHARED_TASKLIST.md` 选择任务；若任务涉及地点转义、动态扰动、玩家写回或历史深度，建议先补读 `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`；若任务直接涉及地点双轨命名与镜头切换，再补读 `docs/DUAL_TRACK_MAPPING.md`，再到 `docs/claims/` 提交认领说明后开始开发。

## 推荐命名策略

当前项目名保留为 **FableMap**，中文名为 **寓言地图**。

如果未来需要更强的品牌表达，可以把 `FableMap` 作为仓库/技术名，后续再评估 `Worldfold`、`LoreWalk` 等展示名。

## 近期交付物

- 已落地：`generate` CLI，输入坐标输出世界描述 JSON
- 已落地：`inspect` CLI，读取世界文件、输出稳定摘要，并识别明显非法结构
- 已落地：repo 内固定 fixture runner，可一键产出可复现的样例世界切片
- 已落地：showcase runner，可把 `world.json` 整理成更适合观察的世界切片样品
- 已落地：static bundle export，可导出固定目录结构与 `manifest.json`
- 已落地：bundle manifest 资源槽位与资源清单增强，便于下游稳定读取
- 已落地：bundle HTML 观察窗，可直接本地打开生成后的 `bundle/index.html`
- 已落地：仓库根目录页面壳，可作为 nearby 页面体验入口
- 已落地：入口页与预览页中英双语切换，支持显式切到中文
- 已落地：nearby CLI 体验入口，可直接把附近坐标导出为 `world.json` 与 bundle 预览页
- 已落地：`page` 本地页面服务，可在浏览器中触发 nearby 生成并嵌入预览
- 已落地：Overpass 在线请求健壮性增强（超时 / 重试 / 错误提示）
- 已落地：本地缓存层，缓存原始 Overpass JSON
- 已沉淀：Web-2D 灵觉视图设计说明，明确共享地理骨架、多审美切换与浏览器 2D 的阶段路线
- 下一步：继续把 nearby 页面入口与 bundle 观察窗往更明确的世界切片入口方向推进
- 下一步：把 bundle 观察窗推进为有主舞台的 Web-2D 灵觉地图，并先做双模式切换 MVP
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
- `python -m fablemap nearby`
- `python -m fablemap page`
- 世界 JSON 最小生成闭环
- Overpass 在线抓取健壮性增强
- 本地缓存层
- 对应的测试、认领文档与变更说明流程

下一阶段：继续细化 nearby 世界入口、地图主舞台、双模式切换交互，以及 `bundle/manifest.json` 的 Godot 对接字段。

中长期阶段：在稳定世界生成闭环之上，同时推进两条体验主线：

- **权力与世界状态主线**：阵营政治、社会讽刺、历史谜团与现实动态事件
- **审美与情感表达主线**：风格化相机、私密记忆空间、都市精灵与镜像家园