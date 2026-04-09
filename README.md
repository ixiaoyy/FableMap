# FableMap

> Turn real places into living location-based stories.

## 项目简介

FableMap 是一个把真实地点转化为**角色遭遇、地点事件、持续对话与世界记忆**的开源叙事系统。

它不再以“自动生成一张异世界地图”或“自绘 Web-2D 主舞台”为核心目标，而是选择一条更清晰的产品路线：

- 用真实底图提供稳定空间入口
- 用地点面板承载故事上下文
- 用角色与事件构成主要体验
- 用 writeback 与 memory 形成持续世界

换句话说，FableMap 现在更像一个**基于真实地点的城市酒馆 / LBS 叙事引擎**，而不是一个地图美术项目。

## 核心理念

- **真实地图是空间锚点**：使用 OSM / Overpass 与后续地图 SDK 作为不可违背的现实骨架
- **角色与事件是内容本体**：用户价值来自地点中的遭遇、对话、选择与回访
- **writeback / memory 是长期护城河**：地点和角色必须记住玩家来过、说过、做过什么
- **AI 是编排层，不是画图层**：AI 更适合角色扮演、事件组织、连续记忆与反馈生成，而不是直接负责最终地图画面

## 当前产品方向

当前唯一主链路收敛为：

> **坐标输入 / 定位 -> 真实底图 -> 地点选择 -> 角色遭遇 / 地点事件 -> 聊天叙事 -> writeback / memory -> 回访反馈**

这意味着：

- 地图是入口，不是产品本体
- 底图能力可以外包给成熟地图 SDK
- 前端重心应转向地点、角色、事件与聊天体验
- 旧的自绘地图链路不再是优先扩写方向

## 当前原型状态

仓库当前已经不只停留在设计阶段，而是具备了一套可运行的现实地点 -> 世界状态基础能力：

- 可通过 `python -m fablemap generate` 生成世界 JSON
- 可通过 `python -m fablemap inspect --input <world.json>` 输出世界摘要
- 可通过 `python -m fablemap.demo --output-dir demo-output` 一键生成稳定 demo 输出
- 可通过 `python -m fablemap.showcase --input demo-output/world.json` 生成展示样品文件
- 可通过 `python -m fablemap.bundle --input demo-output/world.json` 导出固定结构的静态包
- 可通过 `python -m fablemap nearby --lat ... --lon ... --radius ...` 直接导出附近区域数据
- 可通过 `python -m fablemap api` 启动基于 FastAPI 的后端，并托管当前 React 前端
- 当前后端已经具备最小 world / writeback 基础，可作为后续地点事件、角色状态与聊天体验的底座

当前已存在但**不再作为主线继续扩写**的部分包括：

- [`frontend/src/WorldMap.jsx`](frontend/src/WorldMap.jsx)
- [`frontend/src/worldMap/renderers.js`](frontend/src/worldMap/renderers.js)
- [`frontend/src/worldMap/geometry.js`](frontend/src/worldMap/geometry.js)
- [`frontend/src/mapAssets/manifest.js`](frontend/src/mapAssets/manifest.js)
- [`frontend/src/mapAssets/iconMapping.js`](frontend/src/mapAssets/iconMapping.js)

这些模块可保留为历史参考，但新的产品主线不再围绕它们展开。

## 当前最值得保留的底座

在新方向下，以下底座仍然有持续价值：

- 现实地理输入链路
- `world` 数据结构与世界生成能力
- 写回协议与持久化能力
- 玩家痕迹、地点状态与世界记忆
- FastAPI + React + Vite 工程化结构

也就是说，FableMap 不是推倒重来，而是**保留世界底座，替换前端主舞台与产品叙事中心**。

## 近期重构目标

下一阶段不再优先解决“地图画得像不像”，而是优先完成以下重构：

1. 引入真实底图 adapter 抽象
2. 定义地点、角色、事件、聊天、记忆的前端模块边界
3. 重写前端主舞台，让地点面板与聊天面板成为主体验
4. 让 writeback 不只作用于地图点选，也作用于对话与事件推进
5. 为角色连续性、地点历史与回访反馈建立统一协议

建议新增模块方向：

- `frontend/src/mapAdapter/`
- `frontend/src/placeGraph/`
- `frontend/src/characterEngine/`
- `frontend/src/eventEngine/`
- `frontend/src/chatScene/`
- `frontend/src/worldMemory/`

## 30 秒进入当前工程

如果你现在想体验当前 FastAPI + React 工程入口，可以直接运行：

- `python -m pip install -r requirements.txt`
- `cd frontend && npm install`
- `cd frontend && npm run build`
- `python -m fablemap api`

默认会启动后端服务，并在可用时打开：

- `http://127.0.0.1:8950/`

当前访问到的是工程化前端入口 [`frontend/index.html`](frontend/index.html)，开发期由 Vite 加载 [`frontend/src/main.jsx`](frontend/src/main.jsx)。

## 当前开发口径

如果你准备参与这个项目，请先遵守以下口径：

1. 不再把“自绘地图渲染增强”视为最高优先级
2. 不再把“资源包 / 场景贴图 / 地图画面”当作产品核心
3. 优先服务“地点 -> 角色 -> 事件 -> 聊天 -> writeback -> 回访”链路
4. 优先保留结构化 world、writeback、memory 与 orchestrator 接线能力
5. 所有新模块都应避免继续把核心逻辑堆进 [`frontend/src/WorldMap.jsx`](frontend/src/WorldMap.jsx)

## 未来设计钩子

以下方向不是当前 MVP 的阻塞项，但会决定 FableMap 后续是否真正形成独特护城河：

- **Character Engine**：地点中的长期角色、persona、关系变化与记忆
- **Event Engine**：地点事件、遭遇、分支结果与回访冷却
- **World Memory**：地点历史、角色记忆、玩家痕迹与回访显影
- **AI Orchestration**：基于世界状态生成“此时此地最值得触发的事件与回应”
- **Broadcast / Rumor Layer**：把局部事件扩展为街区广播、公共传闻与城市回声

## 文档导航

- [产品概述](docs/PRODUCT_BRIEF.md)
- [系统架构](docs/ARCHITECTURE.md)
- [当前任务清单](docs/CURRENT_TASKS.md)
- [AI 协作共享任务列表](docs/AI_SHARED_TASKLIST.md)
- [世界 Schema](docs/WORLD_SCHEMA.md)
- [世界写回协议](docs/WORLD_WRITEBACK_PROTOCOL.md)
- [世界写回治理](docs/WORLD_WRITEBACK_GOVERNANCE.md)
- [AI-native 世界编排](docs/AI_NATIVE_WORLD_ORCHESTRATION.md)
- [世界编排器计划](docs/AIO1_WORLD_ORCHESTRATOR_PLAN.md)
- [文档索引](docs/INDEX.md)

## 一句话总结

FableMap 现在最应该成为的，不是“会自动画地图的 AI 项目”，而是一个**以真实地点为入口、以角色和事件为核心、以聊天和记忆为主舞台的城市叙事系统**。
