# Map Assets Frontend Baseline（历史参考）

## 文档定位

这份文档记录的是一个已经降级的前端方向：

> 在保留浏览器自绘地图壳的前提下，逐步把地图图标、tile、scene pack 接入 [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx:1) 的旧地图主舞台。

当前这条路线**不再是主线实现方向**。

当前产品主线已经切换为：

> **真实底图 + 地点选择 + 角色遭遇 / 地点事件 + 聊天叙事 + writeback / memory**

因此，本文档保留的意义主要是：

- 解释旧地图资源化思路为什么出现过
- 说明旧前端地图链路为什么有 [`frontend/src/mapAssets/manifest.js`](../frontend/src/mapAssets/manifest.js:1) 与 [`frontend/src/mapAssets/iconMapping.js`](../frontend/src/mapAssets/iconMapping.js:1) 这类模块
- 为未来极少量的非主线视觉增强提供参考

如需当前方向，请优先阅读：

- [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md)
- [`docs/INDEX.md`](INDEX.md)

---

## 它当时试图解决什么

在旧地图主舞台阶段，前端已经具备：

- 程序绘制道路、POI、landmark、hover、active 态
- 基于 vibe 的配色变化
- [`map2d.renderables`](../frontend/src/WorldMap.jsx:1) 作为输入的地图渲染链路

因此当时的判断是：

1. 不立刻推翻旧 Canvas 地图交互壳
2. 先建立资源目录、manifest、图标映射
3. 再用资源逐步替换程序绘制
4. 最终让地图看起来更完整、更有风格一致性

这在“继续做地图体验”作为主线时是合理的。

---

## 它为什么被降级

后来这份基线不再成立，原因主要有四个：

### 1. 旧地图渲染链路不再值得继续扩张

[`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx:1) 已经承担了过多职责：

- 布局推导
- 几何换算
- 资源预载
- 命中与交互
- Canvas 绘制

继续在这条链路上叠加资源化，只会让旧系统更重。

### 2. 资源化不能解决核心产品问题

即使地图图标更精致、tile 更统一，也不能自动带来：

- 地点驱动叙事
- 角色遭遇系统
- 地点事件系统
- 聊天主舞台
- writeback / memory 闭环

而这些才是当前真正需要的主线能力。

### 3. 地图已经从“主体验”降级为“地点入口容器”

当前产品不再追求“把自绘地图做得更像异世界主舞台”，而是：

- 用真实底图承载现实空间
- 用地点面板进入场景
- 用角色 / 事件 / 聊天生成体验密度

因此旧地图资源接线不再是优先工程工作。

### 4. AI 地图资产生成不适合作为近期核心依赖

资源包生成、图标生产、场景包维护会持续放大：

- 视觉一致性问题
- 资源维护成本
- 渲染接线复杂度
- 非核心工作量

这与当前“收束到角色、事件、聊天与记忆”的方向冲突。

---

## 这份文档现在还能提供什么价值

虽然不再指导主线开发，但仍有三类有限参考价值。

### 1. 历史前端结构参考

它说明了旧前端为什么会出现以下模块：

- [`frontend/src/mapAssets/manifest.js`](../frontend/src/mapAssets/manifest.js:1)
- [`frontend/src/mapAssets/iconMapping.js`](../frontend/src/mapAssets/iconMapping.js:1)
- [`frontend/src/worldMap/renderers.js`](../frontend/src/worldMap/renderers.js:1)

### 2. 非主线视觉增强参考

如果未来要为以下内容增加可选视觉包装，可借用其部分命名或组织思路：

- 地点卡片插图
- 事件卡片图标
- 聊天场景氛围包
- scene capsule 的辅助视觉资源

### 3. 冻结边界参考

它能帮助团队明确：

- 哪些地图资源模块属于历史链路
- 哪些内容不要再变成当前任务中心
- 哪些前端工作只应做最小维护，而不应继续扩张

---

## 当前处理口径

### 可保留的部分

- 文件寻址与资源清单的组织思路
- 图标语义映射的方法
- “增强层可失败、主体验不依赖它”的思想

### 不再作为主线推进的部分

- 旧 Canvas 地图的资源化替换工程
- pack 驱动的地图视觉升级
- 以地图风格资源作为前端重构主目标
- 围绕旧 [`WorldMap`](../frontend/src/WorldMap.jsx:1) 的继续深化接线

---

## 与当前文档体系的关系

- 本文档属于历史参考
- 当前实现不应以本文档作为主需求来源
- 如果与 [`ARCHITECTURE.md`](ARCHITECTURE.md) 或 [`PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md) 冲突，以当前主线文档为准

---

## 一句话结论

[`docs/MAP_ASSETS_FRONTEND_BASELINE.md`](MAP_ASSETS_FRONTEND_BASELINE.md) 记录的是旧地图资源化接线思路，而不是当前“真实底图上的地点、角色、事件、聊天与记忆体验”主线。
