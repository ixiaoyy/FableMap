# FableMap 当前任务清单（真实底图 + 角色事件叙事版）

## 当前阶段结论

FableMap 现阶段已经不再以“自绘地图能否成立”为主问题。

当前工程已经具备：

- 稳定的 `nearby -> world -> web` 基础闭环
- [`fablemap/writeback.py`](../fablemap/writeback.py) 支持的最小世界写回实现
- FastAPI + React 的当前工程化前后端结构
- 围绕写回治理、时间褶皱与 AI-native 编排方向的协议文档基础
- 可作为后续真实底图入口与地点叙事底座的结构化 `world` 数据

因此，当前主线应收束为：

> **在不破坏稳定世界底座的前提下，从“自绘地图主舞台”切换到“真实底图 + 地点选择 + 角色事件 + 聊天叙事 + writeback / memory”主链路。**

---

## 当前最高优先级

### 0. T0 · 产品主线重构与工程收敛
**状态：proposed**

目标：把项目从“地图表现层驱动的原型态”收敛为“地点叙事驱动的工程态”，为后续角色、事件、聊天与记忆系统建立稳定边界。

问题判断：

1. [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx) 与 [`frontend/src/worldMap/renderers.js`](../frontend/src/worldMap/renderers.js) 代表的自绘地图链路过重，已不再适合作为产品核心
2. [`frontend/src/App.jsx`](../frontend/src/App.jsx) 仍以旧地图主舞台思路组织前端流程
3. 当前文档与任务清单仍残留大量“Web-2D 主舞台 / 地图资源”时代口径
4. 角色、地点事件、聊天体验与记忆模块尚未成为一等公民

整改原则：

1. 先统一产品主线，再进入实现层拆分
2. 先保留真实世界底座，再替换前端主舞台
3. 先建立地点 / 角色 / 事件 / 聊天边界，再决定哪些旧地图模块保留
4. 新功能接入不得继续向旧地图组件追加核心逻辑

近期重点：

1. 把当前唯一主链路固定为 `坐标输入 / 定位 -> 真实底图 -> 地点选择 -> 角色遭遇 / 地点事件 -> 聊天叙事 -> writeback / memory -> 回访反馈`
2. 将自绘地图、地图资源包、自定义渲染层统一降级为历史参考或次要能力
3. 为真实底图接入定义统一 `map adapter` 抽象
4. 为地点、角色、事件、聊天、记忆定义新的前端模块边界
5. 为聊天与事件推进补齐 writeback 消费链路
6. 清理旧文档口径，避免继续以 Web-2D 地图主舞台叙述当前产品

关键参考：

- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
- [`docs/WHAT_NOT_TO_BUILD.md`](WHAT_NOT_TO_BUILD.md)

### 1. P0 · 真实底图入口抽象
**状态：planned**

目标：停止继续自研地图渲染主舞台，引入真实地图 SDK 作为空间容器。

当前重点：

1. 定义 `MapAdapter` 接口：`createMap / setCenter / setZoom / addMarker / addOverlay / fitBounds`
2. 保持 provider 无关，避免把产品绑定到单一地图供应商
3. 为地点层、事件层与聊天层提供稳定的空间入口
4. 设计底图失败时的列表 / 简化入口降级方案

### 2. P1 · 地点体验主线
**状态：planned**

目标：把地点从“地图上的点”提升为“可进入的故事场景”。

当前重点：

1. 定义地点卡、地点详情、地点上下文协议
2. 组织地点摘要、状态、历史、当前事件与角色列表
3. 统一地点入口与 writeback / memory 的读写关系
4. 明确地图点击与地点进入的状态流转

### 3. P2 · 角色与事件系统
**状态：planned**

目标：让角色遭遇、地点事件与聊天推进成为主体验。

当前重点：

1. 定义角色 persona、关系、记忆、mood 与 agenda 结构
2. 定义地点事件、分支选择、结果回写与冷却机制
3. 明确事件如何消费 `world_state / player_state / writeback_events`
4. 为后续 AI 编排器接入预留稳定输入输出边界

### 4. P3 · 聊天叙事与 writeback 闭环补平
**状态：planned**

目标：让聊天不是一次性文本，而是能够真实改写地点、角色与世界状态。

当前重点：

1. 定义聊天动作与地点动作的统一写回入口
2. 让对话选择能够生成结构化事件
3. 在 UI 中显示结构化反馈，而不只是一次性提示
4. 验证重新进入同一地点后仍能看到角色记忆与状态变化

### 5. P4 · 世界记忆与回访反馈
**状态：planned**

目标：把玩家痕迹从“即时交互结果”推进为“地点与角色的持续记忆”。

当前重点：

1. 对齐地点历史、角色记忆、玩家关系与世界回声
2. 明确哪些痕迹属于 `private / local_public / global`
3. 为回访反馈、广播与后续编排器提供稳定输入
4. 避免记忆系统只停留在 UI 文案层

---

## 本周主线

### A. 文档与产品记忆收敛

1. 重写 [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
2. 重写 [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
3. 更新 [`README.md`](../README.md)
4. 更新 [`docs/AI_SHARED_TASKLIST.md`](AI_SHARED_TASKLIST.md) 与 [`docs/INDEX.md`](INDEX.md)

### B. 前端新边界规划

1. 规划 `frontend/src/mapAdapter/`
2. 规划 `frontend/src/placeGraph/`
3. 规划 `frontend/src/characterEngine/`
4. 规划 `frontend/src/eventEngine/`
5. 规划 `frontend/src/chatScene/`
6. 规划 `frontend/src/worldMemory/`

### C. 旧地图链路冻结

1. 冻结 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx)
2. 冻结 [`frontend/src/worldMap/renderers.js`](../frontend/src/worldMap/renderers.js)
3. 冻结 [`frontend/src/worldMap/geometry.js`](../frontend/src/worldMap/geometry.js)
4. 冻结 [`frontend/src/mapAssets/manifest.js`](../frontend/src/mapAssets/manifest.js)
5. 冻结 [`frontend/src/mapAssets/iconMapping.js`](../frontend/src/mapAssets/iconMapping.js)

### D. 写回与记忆接口补平准备

1. 梳理现有 [`fablemap/writeback.py`](../fablemap/writeback.py) 对地点 / 角色 / 事件主线的可复用能力
2. 设计聊天动作与地点动作的统一事件模型
3. 为回访、记忆与关系变化预留前后端接口

---

## 待排期

### 第一组：前端新主舞台模块

1. `M0.1` · Map Adapter 抽象与首个 provider 接入
2. `M0.2` · Place Graph 与地点详情上下文
3. `M0.3` · Chat Scene 主面板与对话状态机
4. `M0.4` · Event Engine MVP
5. `M0.5` · World Memory 前端消费层

### 第二组：AI-native 中层能力

1. AIO1 · 世界编排器接线到地点 / 角色 / 事件主线
2. AIO2 · 角色回应风格、事件优先级与地点排序建议
3. AIO3 · 世界记忆图谱
4. AIO4 · 行为到意义编译器
5. AIO5 · 城市人格代理
6. AIO6 · 生成式场景胶囊规范

### 第三组：长期体验能力

1. 公共广播与街区传闻
2. 多地点连续故事线程
3. 角色网络与地点间传播
4. 现实行为输入与动态事件
5. 长期公共事件与城市级世界状态

---

## 明确不再作为当前主线的方向

以下方向可以保留为历史参考，但不应继续占据当前任务中心：

1. 单纯继续堆自绘地图表现层
2. 把 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx) 继续做成超大核心组件
3. 继续扩写地图资源包、贴图、装饰与场景画面
4. 把 bundle 页面继续当作长期核心产品形态
5. 继续以 Godot-first 或 Web-2D 地图-first 作为近期执行口径
6. 让 AI 直接负责最终地图画面生成

---

## 当前判断标准

如果一个新需求满足以下条件，说明它方向正确：

1. 它强化了“地点 -> 角色 -> 事件 -> 聊天 -> writeback -> 回访”链路
2. 它依赖真实空间锚点，但不要求继续增强自绘地图渲染
3. 它提升角色连续性、地点体验、事件质量或记忆沉淀
4. 它在 AI 失败时仍可通过规则、缓存或静态状态降级运行

如果一个新需求满足以下特征，则应谨慎：

1. 主要价值是让地图更炫、更像游戏场景
2. 需要新增大量自绘几何、资源包和渲染细节
3. 无法直接加强角色、事件、聊天与 writeback 体验
4. 会把前端重新拖回旧地图主舞台路线
