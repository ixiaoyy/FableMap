# 模块认领说明

- 模块名 / 区域名：world_builder OSM 映射规则库扩展 v1
- 负责人：AI 协作者
- 改动类型：功能
- 当前状态：in_progress

## 目标

当前 `world_builder.py` 的 `RULES` 只覆盖 6 种 OSM 类型
（park / hospital / convenience / police / cafe / school），
大量高频城市要素（银行、餐厅、图书馆、药店、健身房、写字楼、停车场等）
或被完全丢弃，或 fallback 到错误类型（所有 shop 都退化成 supply_outpost）。

本次扩展目标：
- 新增 9 种 OSM → fantasy_type 映射规则，覆盖城市主力要素
- 为每种新类型补充完整字段（faction / satire / emotion / vibe / palette / secret_slot / sprite_spawn_hint）
- 在 `_match_mapping` 中补充 `office=*` 通配兜底逻辑
- 在 `bundle.py` 中为新类型补充对应 SVG 图标路径与 CSS 颜色 token
- 更新 fixture 与测试，确保新类型可被端到端验证

新增类型列表：
1. `amenity=bank` → `debt_cathedral`
2. `amenity=restaurant` → `feast_hall`
3. `amenity=fast_food` → `refuel_station`
4. `amenity=library` → `memory_archive`
5. `amenity=place_of_worship` → `spirit_sanctum`
6. `amenity=parking` → `dormant_lot`
7. `amenity=pharmacy` → `remedy_post`
8. `leisure=fitness_centre` → `labor_forge`
9. `office=*`（通配）→ `contract_spire`

## 计划修改范围

- `fablemap/world_builder.py`：
  - `RULES` 列表：追加 8 条精确规则
  - `_match_mapping`：追加 `office` 通配兜底逻辑
- `fablemap/bundle.py`：
  - `_POI_ICON` 字典：追加 9 种新 fantasy_type 的 SVG path
  - `_render_preview_html` CSS 块：追加 9 种新类型的颜色 token
- `tests/fixtures/overpass_sample.json`：
  - 追加 6 个新节点，覆盖代表性新类型
- `tests/test_world_builder.py`：
  - 补充新类型 fantasy_type 断言

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`（新类型 fantasy_type 属于已有枚举扩展，不需要改协议）
- 不修改 `docs/DUAL_TRACK_MAPPING.md`（新规则基于已有双轨定义落地，不改协议本体）
- 不修改 `fablemap/page.py`、`nearby.py`、`overpass.py`、`cache.py`
- 不修改已有 6 种 fantasy_type 的任何字段语义
- 不引入新阵营（使用已有 5 个阵营）
- 不修改 `FACTION_DETAILS` 字典

## 依据的协议文档

- `docs/AI_SHARED_TASKLIST.md`（无直接任务 ID，属于 world builder 基础能力补全）
- `docs/DUAL_TRACK_MAPPING.md`（bank / restaurant / library / office / parking / pharmacy 等已有 archetype 定义）
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/AI参与开发协议.md`

## 预期产出

- `world_builder.py` RULES 从 6 条扩展到 14 条
- `_match_mapping` 新增 office 通配兜底
- `bundle.py` 新增 9 种 SVG 图标 + 9 种 CSS 颜色 token
- fixture 新增 6 个测试节点
- `test_world_builder.py` 新增新类型断言，全部通过

## 验证方式

- `python -m pytest tests/test_world_builder.py -v`
- `python -m pytest tests/test_bundle.py -v`
- `python -m pytest tests/ -v`

## 风险点

- 新增规则不影响已有规则优先级（RULES 仍按顺序匹配，精确优先）
- office 通配兜底放在精确规则之后，不干扰其他标签匹配
- fixture 新节点 ID 不与现有 ID 冲突（现有 101-107，新增从 110 开始）
