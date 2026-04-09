# FableMap AI 协作共享任务列表（真实底图 + 角色事件叙事版）

## 文档定位

这份文档是当前仓库里**唯一有效的共享任务认领入口**。

它服务于三件事：

1. 协作者判断当前值得投入的任务
2. 协作者在开始改动前明确任务边界
3. 协作者在完成后同步更新认领与变更记录

如果与其他阶段性任务文档冲突，以本文件、[`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md) 与当前协议文档为准。

---

## 使用方式

1. 先阅读 [`docs/README.md`](README.md) 理解当前文档入口
2. 阅读 [`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md) 判断当前主线
3. 在本表中选择一个任务
4. 若任务属于协议、新模块、跨文件或高风险改动，先在 [`docs/claims/`](claims/) 新增认领说明
5. 完成后补 [`docs/changes/`](changes/) 变更记录，并同步任务状态

---

## 状态约定

- `planned`：已进入共享列表，但还没人认领
- `claimed`：已认领，尚未进入实现
- `in_progress`：正在推进
- `blocked`：存在依赖或阻塞
- `done`：已完成并并入主线
- `reference_only`：仅保留参考价值，不作为当前优先认领项

---

## 当前基础能力（已完成，不再作为优先认领项）

- `generate / inspect / demo / showcase / bundle / nearby / page / api` 基础闭环
- FastAPI + React + Vite 当前工程化结构
- 结构化 `world` 数据与最小写回后端实现
- 写回治理协议与时间褶皱协议基础
- 可作为后续角色 / 事件 / 聊天主线底座的世界状态与 API 能力

---

## P0：当前最高优先级任务

### T0. 产品主线重构与工程收敛

- `T0.1` · `planned` · 主链路收束：将当前唯一主链路固定为 `坐标输入 / 定位 -> 真实底图 -> 地点选择 -> 角色遭遇 / 地点事件 -> 聊天叙事 -> writeback / memory -> 回访反馈`，把旧自绘地图主舞台口径降级为历史参考。依据：[`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md)。
- `T0.2` · `planned` · 文档记忆重写：同步更新 [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)、[`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)、[`README.md`](../README.md)、[`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md) 与 [`docs/INDEX.md`](INDEX.md)，统一新产品方向。
- `T0.3` · `planned` · 前端边界重构：停止继续扩写 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx)，转而规划 `mapAdapter / placeGraph / characterEngine / eventEngine / chatScene / worldMemory` 新边界。
- `T0.4` · `planned` · 后端服务层收敛：以 [`fablemap/api_service.py`](../fablemap/api_service.py) 为当前应用入口基线，为地点、角色、事件、聊天与记忆能力预留独立 application / domain 模块。
- `T0.5` · `planned` · 质量护栏补齐：为 nearby、writeback、event flow、memory flow 等核心链路补 contract test、纯函数测试，以及 lint / format / type-check 基线。

### P. 真实底图入口

- `P0-R1` · `planned` · `MapAdapter` 抽象：定义统一底图能力接口，支持 `createMap / setCenter / setZoom / addMarker / addOverlay / fitBounds`。
- `P0-R2` · `planned` · 首个底图 provider 接入：评估并接入 Google Maps / Mapbox / 高德 / Leaflet 中的一个实现，但保持 provider 无关架构。
- `P0-R3` · `planned` · 底图降级策略：当地图 SDK 不可用时，仍可回退到地点列表 / 简化上下文入口，不阻断主流程。

### L. 地点体验主线

- `L1` · `planned` · 地点协议收束：定义 place summary、place detail、place state、place memory 的前后端结构。
- `L2` · `planned` · 地点详情面板：让地点成为一等入口，展示当前角色、事件、历史与可行动作。
- `L3` · `planned` · 地点进入状态流：明确地图点击、地点激活、面板切换与聊天上下文同步逻辑。

### C. 角色与事件系统

- `C1` · `planned` · Character Engine MVP：定义 `character / persona / mood / relationship / agenda / memory` 结构。
- `C2` · `planned` · Event Engine MVP：定义 `place_event / encounter / choice / outcome / cooldown / world_effect` 结构。
- `C3` · `planned` · 角色与事件接线：让地点上下文、玩家状态与最近写回事件共同驱动当前遭遇。

### W. 写回与记忆主线

- `W1` · `planned` · 聊天写回模型：把聊天选择、地点动作与事件推进统一映射到 writeback 事件。
- `W2` · `planned` · 回访反馈验证：验证重新进入同一地点后，角色记忆、地点状态与事件冷却可见。
- `W3` · `planned` · World Memory 消费层：为地点历史、角色关系变化与世界回声提供稳定前端消费接口。

### AIO. AI-native 架构演进准备

- `AIO1-R1` · `planned` · 编排器落地准备：在 [`docs/WORLD_ORCHESTRATOR_PROTOCOL.md`](WORLD_ORCHESTRATOR_PROTOCOL.md) 已完成的前提下，把输入输出边界从“地图主舞台”切换到“地点 / 角色 / 事件主线”消费口径。
- `AIO2-R1` · `planned` · 角色回应与事件排序建议：基于已完成协议，为角色语气、事件优先级、地点高亮与广播建议建立明确接线点。
- `AIO3-AIO6` · `reference_only` · 世界记忆图谱、行为到意义编译器、城市人格代理、生成式场景胶囊协议均保留为下一阶段参考，不作为当前最高优先实现主线。

---

## P1：可继续推进，但不应盖过主线的任务

### A. 稳定世界底座

- `B1` · `done` · OSM / Overpass 现实骨架与 world 生成能力
- `B2` · `done` · 最小世界写回后端实现
- `B3` · `done` · FastAPI + React + Vite 当前工程化结构

### B. 旧地图主舞台能力

以下内容保留历史参考价值，但不再作为当前优先认领主线：

- `WM1` · `reference_only` · [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx) 自绘地图主舞台
- `WM2` · `reference_only` · [`frontend/src/worldMap/renderers.js`](../frontend/src/worldMap/renderers.js) 与相关 Canvas 渲染链路
- `WM3` · `reference_only` · [`frontend/src/mapAssets/`](../frontend/src/mapAssets/) 资源映射与旧资产接线

### C. 既有世界增强能力

以下任务仍可保留成果，但当前不应压过新主线：

- `E2` · `done` · 公共地标修复任务与城市荣誉榜
- `E3` · `done` · 玩家命名权、地点传说与地点气质演化
- `E4` · `done` · 玩家据点、幽灵回放与城市身份系统
- `F2` · `done` · 现实行为输入与人为扰动接口

---

## P2：依赖上游成立后再推进的任务

### R. 角色关系与多地点叙事

- `R1` · `planned` · 多角色关系网与长期记忆
- `R2` · `planned` · 多地点连续故事线程
- `R3` · `planned` · 地点间事件传播与街区传闻

### G. 公共体验层

- `G1` · `planned` · 城市广播 / 传闻层
- `G2` · `planned` · 区域公共事件与城市级世界状态
- `G3` · `planned` · 轻社区可见性与公共叙事入口

### F. 世界规则治理与现实输入

- `F1` · `planned` · 审美宪法投票与社区转义规则治理
- `F3` · `planned` · 地理脚本注入与创作者权限模型

---

## 当前推荐认领顺序

### 第一优先级

1. `T0.1-T0.3`：先完成主线重构、文档记忆统一与前端边界改造
2. `P0-R1-P0-R3`：建立真实底图 adapter 能力与降级策略
3. `L1-L3`：让地点成为可进入的故事入口
4. `C1-C3`：建立角色与事件 MVP
5. `W1-W3`：把聊天、事件推进与世界记忆真正写回

### 第二优先级

6. `T0.4-T0.5`：补齐后端服务层收敛与测试 / type-check / lint 护栏
7. `AIO1-R1`：把编排器协议从文档层推进到新主线接线准备
8. `AIO2-R1`：明确角色回应、事件排序与广播建议的接线点

### 第三优先级

9. `R1-R3`：扩展多角色、多地点、多回访叙事
10. `G1-G3 / F1 / F3`：保留为中长期方向

---

## 当前不建议继续作为主线扩写的方向

以下内容可以保留历史价值，但不应继续作为当前优先任务口径：

1. 单纯继续堆地图表现层
2. 在旧 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx) 上继续叠加核心逻辑
3. 继续扩写地图资源包、图标包、装饰贴图与场景画面
4. 把 bundle 页面继续当成长期核心产品形态
5. 继续以 Godot-first 或 Web-2D 地图-first 作为近期项目叙事
6. 让 AI 直接负责最终地图画面生成

边界参考：

- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
- [`docs/WHAT_NOT_TO_BUILD.md`](WHAT_NOT_TO_BUILD.md)

---

## 当前会话与历史文档的处理口径

- 本表保留“当前值得认领”的任务，不再堆叠旧地图时期的执行口径
- 历史细节以 [`docs/changes/`](changes/) 与 [`docs/claims/`](claims/) 为准
- 若旧文档与本表冲突，应优先更新旧文档或将其降级为参考材料
- 旧的 Web-2D 地图主舞台、地图资源与自绘渲染相关任务，原则上不再作为最高优先入口

---

## 维护原则

1. 同类任务只保留一个当前有效入口
2. 协议优先于实现，边界优先于扩写
3. 任何新任务都应说明它属于：底图、地点、角色、事件、聊天、记忆还是编排
4. 若任务与当前产品方向不一致，应先修正文档口径再继续推进
