# FableMap

> Turn real places into living fantasy worlds.

## 项目简介

FableMap（寓言地图）是一个基于真实世界地理数据生成幻想 RPG 世界的开源项目。

它把现实中的道路、建筑、公园、医院、商店等 OSM 地图元素，映射成一个可以探索、叙事、持续演化的异世界地图。目标不是做一个普通地图工具，而是做一个“现实空间幻想化生成引擎”。

## 核心理念

- **真实地图是骨架**：使用 OSM / Overpass 数据作为不可违背的空间约束
- **LLM/规则系统是灵魂**：把现实地点翻译成异世界语义、任务和叙事
- **游戏引擎是身体**：让生成结果在 Godot 中变成可行走、可交互的场景

## MVP 目标

第一版只证明一个闭环：

1. 输入一个现实坐标
2. 抓取周边 OSM 数据
3. 生成幻想世界 JSON
4. 保持同一区域生成结果稳定
5. 在 Godot 中实例化为可探索场景

## 第一版模块

- **Geo-Semantic Parser**：解析 OSM 标签并生成异世界语义
- **World Memory**：为区域提供稳定 ID 与持久化记忆
- **Narrative Orchestrator**：生成地点描述、背景设定与任务钩子
- **Procedural Visual Builder**：将 JSON 转为 Godot 中的节点与预制体

## 文档导航

- [产品概述](docs/PRODUCT_BRIEF.md)
- [PRD v0.1](docs/PRD_V0.1.md)
- [系统架构](docs/ARCHITECTURE.md)
- [世界 Schema](docs/WORLD_SCHEMA.md)
- [开发路线图](docs/ROADMAP.md)

## 推荐命名策略

当前项目名保留为 **FableMap**，中文名为 **寓言地图**。

如果未来需要更强的品牌表达，可以把 `FableMap` 作为仓库/技术名，后续再评估 `Worldfold`、`LoreWalk` 等展示名。

## 近期交付物

- 一个 CLI：输入坐标，输出世界描述 JSON
- 一个本地持久化层：保证同一区域描述一致
- 一个 Godot Demo：支持加载 JSON 并进行基础探索

## 项目状态

当前阶段：**文档与工程设计初始化**

下一阶段：定义目录结构、CLI 接口与第一版数据协议，实现最小可运行原型。