# FableMap Godot 集成设计 v0.1

## 目标

Godot 端的目标不是复刻真实地图，而是把世界 JSON 转化成一个“可走动、可点击、可感受氛围”的幻想切片。

## Godot 端职责

- 读取世界 JSON
- 根据 `region.theme` 选择区域视觉风格
- 根据 `poi.fantasy_type` 生成占位预制体
- 根据 `visual_hint` 选择材质、特效和高度变化
- 提供移动、点击和文本展示能力

## 不应由 Godot 端负责的内容

- 直接解析 OSM 原始数据
- 重新决定幻想语义
- 自行推断 POI 类型

这些都应该由 Python 侧在世界生成阶段完成。

## 推荐 JSON 消费方式

Godot 只读取稳定字段：

- `world_id`
- `region.theme`
- `region.visual_style`
- `pois[*].fantasy_type`
- `pois[*].position`
- `pois[*].description`
- `pois[*].visual_hint`

## 节点生成建议

### 区域层

- 地面材质
- 雾效 / 光照色调
- 背景氛围对象

### POI 层

- `healing_sanctum` -> 圣所类建筑占位体
- `supply_outpost` -> 营地/商铺类占位体
- `judgement_tower` -> 高塔类占位体
- `whispering_grove` -> 森林/树群类占位体

### 道路层

- 将 `roads` 作为路径、材质带或导航参考渲染

## 第一版玩法建议

- WASD 移动
- 鼠标点击 POI
- UI 面板展示：
  - 幻想名称
  - 原始类别
  - 简短描述
  - 状态标签

## 文件约定建议

- `godot/scenes/`：主场景与 UI
- `godot/scripts/`：JSON 加载和实例化逻辑
- `godot/assets/`：占位模型与材质
- `godot/prefabs/`：POI 预制体

## 第一版成功标准

- 能加载一个标准 `world.json`
- 能渲染至少 3 种 POI 类型
- 玩家可自由移动并查看描述
- JSON 字段变化不需要 Godot 端重写大量逻辑