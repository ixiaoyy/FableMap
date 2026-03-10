# FableMap 世界 Schema v0.1

## 设计目标

世界 Schema 是 FableMap 的核心中间协议，用来隔离：

- 上游的真实地图数据
- 中间的幻想语义系统
- 下游的 Godot 场景实例化逻辑

它必须稳定、易扩展、可追溯。

## 顶层结构

```json
{
  "world_id": "h3_or_grid_key",
  "seed": "stable-seed",
  "source": {
    "lat": 51.5237,
    "lon": -0.1585,
    "radius_m": 300,
    "provider": "overpass"
  },
  "region": {},
  "pois": [],
  "roads": [],
  "landmarks": [],
  "state": {}
}
```

## region

区域级信息用于定义整体风格和氛围。

字段建议：

- `name`：区域显示名
- `theme`：如 `mechanical_city` / `sacred_district`
- `atmosphere`：如 `foggy`, `charged`, `quiet`
- `dominant_landuse`：主土地用途
- `narrative_summary`：区域整体描述
- `visual_style`：供 Godot 选择视觉模板

## pois

每个 POI 代表一个现实地点的幻想映射对象。

字段建议：

- `id`：稳定标识
- `osm_type`：原始类别，如 `hospital`, `park`, `convenience`
- `real_name`：真实名称（如有）
- `fantasy_name`：幻想名称
- `fantasy_type`：幻想类型，如 `healing_sanctum`, `supply_outpost`
- `position`：局部坐标或地理坐标
- `description`：简短叙事描述
- `tags`：扩展标签
- `visual_hint`：建议预制体和材质参数
- `state_ref`：指向世界状态中的记录

## roads

道路用于表达移动结构和区域连接。

字段建议：

- `id`
- `kind`
- `points`
- `fantasy_role`，例如 `trade_route`, `ritual_path`, `iron_lane`

## landmarks

地标是区域级的视觉中心，可能由多个真实元素组合生成。

字段建议：

- `id`
- `name`
- `type`
- `description`
- `visual_hint`

## state

状态层用于支持世界记忆和后续任务传播。

字段建议：

- `version`
- `visited`
- `poi_states`
- `flags`
- `story_events`

## 映射示例

- `amenity=hospital` -> `healing_sanctum` / `plague_research_house`
- `shop=convenience` -> `supply_outpost`
- `amenity=police` -> `judgement_tower`
- `leisure=park` -> `whispering_grove`
- `landuse=industrial` -> `ironfound_district`

## 设计注意事项

- Schema 必须支持“规则生成”与“LLM 润色”共存
- Schema 必须保留原始 OSM 来源，便于回溯
- Godot 侧只依赖稳定字段，不直接依赖原始标签格式