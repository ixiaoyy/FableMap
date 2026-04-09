# FableMap 系统架构（真实底图 + 角色事件叙事版）

## 文档定位

本文档描述 FableMap 当前起效的**新主线架构**。

它不再以“自绘 2D 世界地图主舞台”为核心，也不再把“做一张更像异世界的地图”视为主要目标。

当前产品方向已经收敛为：

> **坐标输入 / 定位 -> 真实底图 -> 地点选择 -> 角色遭遇 / 地点事件 -> 聊天叙事 -> writeback / memory -> 回访反馈**

所有近期实现、重构、测试与协议接线，都应优先服务这条链路。

---

## 当前阶段结论

FableMap 当前不是“验证地图能否显示”的阶段，也不是“继续增强自绘地图表现”的阶段。

当前阶段应理解为：

> **以真实地图 SDK 作为空间容器，把产品重心转向角色、事件、对话、地点记忆与持续体验。**

当前仍然成立的稳定基础：

1. 基于 OSM / Overpass 的现实地理骨架
2. 结构化 `world` 数据与切片化世界生成能力
3. 最小可用的世界写回协议与后端实现
4. FastAPI + React + Vite 的当前工程化结构
5. 围绕治理、时间褶皱、编排与记忆的协议文档基础

因此，当前架构目标不是继续发散视觉层，而是：

1. 固定新的唯一主链路
2. 收敛前后端模块边界
3. 让真实底图成为稳定空间入口，而不是自研地图渲染系统
4. 把角色、地点事件、聊天体验与 writeback 变成产品主舞台
5. 为 orchestrator / memory / event engine 等 AI-native 能力预留明确接线点

---

## 当前架构总览

FableMap 当前应按“稳定现实底座 + 真实底图容器 + 叙事体验层 + AI 增强边界”来理解。

### 第一层：Reality Kernel（现实内核）

职责：

- 接收坐标、半径、定位等地理输入
- 拉取和清洗 OSM / Overpass 数据
- 提供道路、POI、zone、route 等稳定空间锚点
- 保证同一 slice 可验证、可缓存、可重建

当前落点：

- [`fablemap/overpass.py`](../fablemap/overpass.py)
- [`fablemap/api.py`](../fablemap/api.py)
- [`fablemap/api_service.py`](../fablemap/api_service.py)
- world build 相关模块

原则：

- 不让 AI 替代真实空间骨架
- 不让表现层决定世界结构
- 同一地理输入应尽可能产生稳定基础结果

### 第二层：Structured World State（结构化世界状态）

职责：

- 维护 `world` 数据及其可演化字段
- 保存 slice、POI、地点状态、玩家痕迹、写回事件等结构化信息
- 作为地点体验、聊天状态、事件编排与回访反馈的共同事实来源

当前落点：

- [`fablemap/writeback.py`](../fablemap/writeback.py)
- [`fablemap/world_builder.py`](../fablemap/world_builder.py)
- [`fablemap/memory_graph.py`](../fablemap/memory_graph.py)
- world / player / event 相关数据结构与测试

原则：

- 世界真相必须可持久化、可回放、可验证
- 玩家痕迹必须附着在结构化对象上，而不是只存在于临时 UI 文案
- AI 输出若进入主世界，必须先结构化

### 第三层：Base Map Adapter（真实底图适配层）

职责：

- 接入 Google Maps / Mapbox / 高德 / Leaflet 等真实底图能力
- 提供统一的地图容器抽象，而不是自研完整地图渲染器
- 负责地图中心、缩放、marker、popup、overlay、bounds 等基础能力
- 为地点层、事件层与聊天面板提供空间入口

建议落点：

- `frontend/src/mapAdapter/`
- 供应商无关的 adapter interface
- 底图 provider 配置与 runtime 初始化模块

原则：

- 地图只负责真实空间承载，不负责产品价值本体
- 产品不能绑死在单一地图供应商上
- 底图失败时应允许降级到简化列表或 fallback 入口

### 第四层：Place / Character / Event Experience（地点 / 角色 / 事件体验层）

职责：

- 把真实地点组织成可进入的故事入口
- 暴露地点详情、角色列表、当前事件、历史痕迹与可执行动作
- 组织“地点选择 -> 角色遭遇 -> 事件推进 -> 对话反馈”的主体验闭环
- 让聊天成为主舞台，而不是附属说明区

建议落点：

- `frontend/src/placeGraph/`
- `frontend/src/characterEngine/`
- `frontend/src/eventEngine/`
- `frontend/src/chatScene/`
- 相关 panel / shell / hooks / services

原则：

- 地图是入口，不是内容本体
- 用户价值来自角色连续性、事件张力与地点记忆
- 聊天必须绑定地点、事件和状态，而不是漂浮的通用对话框

### 第五层：Writeback & Memory（写回与世界记忆层）

职责：

- 接收玩家动作、聊天选择、地点交互与事件推进结果
- 将行为写回地点状态、角色关系、事件冷却与世界记忆
- 为回访、广播、回声与后续编排器提供稳定输入

当前 / 未来落点：

- [`fablemap/writeback.py`](../fablemap/writeback.py)
- world / player / event state 相关模块
- memory graph 与后续地点记忆消费层

原则：

- 没有 writeback 的聊天体验只是一次性内容
- 地点与角色必须能记住玩家来过、说过、做过什么
- 写回结果必须能被前端稳定读取并再次显示

### 第六层：AI-Native Augmentation Boundary（AI-native 增强边界）

这不是当前主链路本体，而是下一阶段的增强层接线边界。

职责：

- 读取 `world_state / player_state / writeback_events / governance / time_folds`
- 生成事件建议、角色回应风格、地点排序建议、广播建议
- 在失败时回退到规则或静默降级，不影响主链路可用性

当前关联方向：

- [`fablemap/orchestrator/ai_engine.py`](../fablemap/orchestrator/ai_engine.py)
- [`fablemap/orchestrator/rule_engine.py`](../fablemap/orchestrator/rule_engine.py)
- [`docs/AI_NATIVE_WORLD_ORCHESTRATION.md`](AI_NATIVE_WORLD_ORCHESTRATION.md)
- [`docs/AIO1_WORLD_ORCHESTRATOR_PLAN.md`](AIO1_WORLD_ORCHESTRATOR_PLAN.md)

原则：

- AI 负责编排、解释、增强，不替代稳定世界底座
- AI 输出必须可被结构化消费
- 即使 AI 不可用，主链路也必须继续成立

---

## 当前唯一主链路

### 1. 坐标输入 / 定位

用户输入坐标、半径或使用当前位置，触发附近区域查询。

### 2. 真实底图载入

系统在真实地图容器中展示当前区域，提供稳定的空间认知与地点入口。

### 3. 地点选择

用户在地图或地点列表中选择一个可交互地点，进入地点详情上下文。

### 4. 角色遭遇 / 地点事件

系统根据地点状态、玩家状态、最近写回事件与规则/AI 编排结果，呈现当前角色、话题与事件。

### 5. 聊天叙事

用户与角色对话、观察、选择、推进事件，形成主要体验。

### 6. Writeback / Memory

用户动作与对话结果被写回地点状态、角色关系、事件历史与世界记忆。

### 7. Feedback / Revisit

前端展示结构化反馈、状态变化、关系变化与回访可见结果，形成最小闭环。

---

## 当前主线外的模块口径

以下能力仍然重要，但当前统一视为“增强模块”或“实验模块”，不再与主链路并列叙述：

### 增强模块

- 地点广播 / 电台
- disturbance / dynamic signals
- place legend
- 角色关系深化
- 多底图供应商切换

### 实验模块

- scene capsule
- city persona
- AI orchestrator 深度接线
- world memory graph 的进一步产品化表达
- 更重的生成式视觉层

边界要求：

1. 新需求优先服务主链路，而不是绕开主链路另起产品叙事
2. 增强模块必须挂接真实空间锚点与结构化世界状态
3. 实验模块失败时不得破坏底图入口、聊天主舞台与写回闭环

---

## 当前代码层职责边界

### 前端

#### 页面装配层

- [`frontend/src/App.jsx`](../frontend/src/App.jsx)
- 顶层页面流程、区域编排、状态接线

#### 会话层

- [`frontend/src/hooks/useNearbySession.js`](../frontend/src/hooks/useNearbySession.js)
- [`frontend/src/hooks/useWorldSession.js`](../frontend/src/hooks/useWorldSession.js)
- [`frontend/src/hooks/useWritebackSession.js`](../frontend/src/hooks/useWritebackSession.js)

职责边界：

- 负责页面状态、API 请求、会话编排
- 不应承担底图 provider 细节
- 不应承担事件生成与角色逻辑本体

#### 底图适配层

- `frontend/src/mapAdapter/`（建议新增）

职责边界：

- 只负责真实底图接入与统一接口
- 不负责故事逻辑、角色逻辑与 writeback 业务

#### 地点 / 角色 / 事件层

- `frontend/src/placeGraph/`（建议新增）
- `frontend/src/characterEngine/`（建议新增）
- `frontend/src/eventEngine/`（建议新增）
- `frontend/src/chatScene/`（建议新增）

职责边界：

- 地点摘要、角色上下文、事件线程、聊天体验
- 与 writeback / memory 明确对接
- 不把核心逻辑继续堆进单一地图组件

### 后端

#### 应用入口层

- [`fablemap/api.py`](../fablemap/api.py)
- [`fablemap/api_service.py`](../fablemap/api_service.py)
- Web / application 相关入口模块

职责边界：

- 作为 API facade 与应用入口
- 不应持续集中所有领域编排逻辑

#### 领域层

- `world builder`
- `writeback`
- `memory`
- `orchestration`
- 后续 `character / event` 相关模块

职责边界：

- 保持协议清晰
- 保持结构化输出
- 为前端体验层提供稳定输入

---

## 当前重构方向

围绕新主线，当前重构应优先做以下事情：

1. 停止继续扩张自绘地图渲染链路
2. 引入真实底图 adapter 抽象
3. 把前端主舞台重心从地图绘制切换到地点 / 角色 / 事件 / 聊天
4. 补齐 writeback 在聊天与事件上的消费链路
5. 为角色状态、地点记忆、事件历史定义统一协议
6. 保留 OSM / world / writeback / governance 这些稳定底座

---

## 明确不再作为近期主线的方向

1. 继续以自绘 Web-2D 地图作为产品核心
2. 继续优先堆地图视觉表现层
3. 为了“更像游戏地图”而引入更重的场景绘制系统
4. 让 AI 直接负责生成最终地图画面
5. 在角色与事件主体验缺位时，继续扩张地图资源包体系

---

## 架构判断标准

如果一个新需求满足以下条件，说明它方向正确：

1. 它强化了“地点 -> 角色 -> 事件 -> 对话 -> 写回 -> 回访”链路
2. 它依赖真实空间锚点，但不要求自研地图渲染
3. 它提升角色连续性、事件质量、地点记忆或回访体验
4. 它在 AI 失败时仍可通过规则或缓存结果降级运行

如果一个新需求满足以下特征，则应谨慎：

1. 主要目标是让地图更炫、更像手绘场景
2. 需要新增大量自绘几何、资源包和渲染细节
3. 无法直接加强聊天、事件、地点体验与 writeback
4. 会把前端重新拖回超大地图组件路线
