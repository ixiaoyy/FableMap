# 变更说明：OSM -> 2D 建筑实体视觉转义规则库 V1

## 为什么改

W3 之后地图可以平移缩放了，但地图上所有 POI 仍然只是相同的圆圈 + 字母 "P"，所有地标是方块 + 字母 "L"，道路全部粗细相同颜色相同。用户无法通过地图本身读出任何语义信息——不知道哪里是公园、哪里是医院、哪里是深夜便利店。

V1 实现 OSM archetype -> 2D 视觉实体的第一批转义规则，让地图节点能够承载语义，让道路层级在视觉上可读。

## 改了什么

### `fablemap/bundle.py`

**道路分层渲染**

在 `_render_map_observer_html` 中新增 `_ROAD_TIER` 映射表：

| OSM kind | tier | 渲染效果 |
|---|---|---|
| motorway / trunk / primary / secondary | arterial | stroke `#7dd3fc`，宽度 5px |
| tertiary / residential / unclassified | street | stroke `#67e8f9`，宽度 3px |
| footway / path / cycleway / steps | path | stroke `#a5f3fc`，宽度 1.5px，虚线 |

每条 `<polyline>` 获得 `class="map-road map-road-{tier}"` 双类名。

**POI 语义图标（6 种 fantasy_type）**

`_POI_ICON` 字典，每种类型对应一段内联 SVG path（坐标系以原点为中心，±14px 范围内）：

| fantasy_type | 图形语义 | 主色 |
|---|---|---|
| `whispering_grove` | 叶形轮廓 + 内部星形 | 绿 `#4ade80` |
| `healing_sanctum` | 多尖形星 | 冰蓝 `#e0f2fe` |
| `supply_outpost` | 方框套方框 + 十字连接 | 橙 `#fb923c` |
| `judgement_tower` | 尖塔星形 | 紫 `#a78bfa` |
| `ember_parlor` | 水滴 / 火焰轮廓 | 玫瑰 `#fb7185` |
| `lore_academy` | 矩形框 + 内十字 + 顶凸起（书脊） | 金 `#facc15` |

每个 POI 节点改为 `<circle class="poi-bg"> + <path class="poi-icon">`；父 `<g>` 获得 `map-ft-{fantasy_type}` 类名，CSS 通过后代选择器按类型覆盖颜色。

未知类型 fallback 到 `supply_outpost` 图标（橙色通用补给站）。

**Landmark 专属图标**

`_LANDMARK_ICON`：较大的多尖星形（比 POI 图标更"古老感"），统一金色 `#fbbf24`，背景深棕 `#3b2a0a`。

**图例更新**

三条道路 legend（主干道 / 街道 / 步行路）替换原来的单条"道路骨架"legend。

**CSS**

- `.map-road` 基础类去掉固定颜色和宽度，改由 `.map-road-arterial` / `.map-road-street` / `.map-road-path` 子类提供
- `.poi-bg` / `.poi-icon` / `.landmark-bg` / `.landmark-icon`：基础样式
- `.map-ft-*` 后代覆盖规则（6 种）
- `.map-feature.is-active .poi-bg` / `.landmark-bg`：选中态描边加粗
- `.map-feature` transition 合并为单一规则；选中态整体 scale(1.12)
- `legend-swatch.road-arterial` / `.road-street` / `.road-path`：legend 色块

**i18n**

新增 `mapLegendArterial` / `mapLegendStreet` / `mapLegendPath`（中英双语）；
移除 `mapLegendRoads`（已被三条分层 key 取代）。

### `tests/test_bundle.py`

新增 14 条断言：

- `map-road-arterial` / `map-road-street` / `map-road-path`
- `poi-bg` / `poi-icon` / `landmark-bg` / `landmark-icon`
- `map-ft-`
- `data-i18n="mapLegendArterial"` / `mapLegendStreet` / `mapLegendPath`
- `legend-swatch road-arterial` / `road-street`

### `tests/test_page.py`

补充与 `tests/test_bundle.py` 对应的页面级断言，确保通过页面服务返回的 preview HTML 也稳定包含：

- 道路三层级类名：`map-road-arterial` / `map-road-street` / `map-road-path`
- POI / landmark 图标类：`poi-icon` / `landmark-icon`
- fantasy_type 类名前缀：`map-ft-`
- 图例 i18n key：`mapLegendArterial` / `mapLegendStreet` / `mapLegendPath`

## 影响了哪些文件或模块

- `fablemap/bundle.py`：`_render_map_observer_html` + CSS + i18n
- `tests/test_bundle.py`：新增断言
- `tests/test_page.py`：新增页面服务返回 preview 的视觉转义断言

## 没改什么

- `fablemap/world_builder.py`（RULES / fantasy_type 枚举不变）
- `docs/WORLD_SCHEMA.md`
- `docs/DUAL_TRACK_MAPPING.md`
- `fablemap/page.py`、`nearby.py`、`overpass.py`、`cache.py`
- 未引入第三方图标库、字体或 JS 依赖

## 是否涉及协议 / Schema / 命名变更

否。

## 做了哪些验证

- `python -m unittest tests/test_bundle.py tests/test_page.py`：通过
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`：17 个测试全部通过，零回归
- `git diff --check`：无 diff 格式错误（仅现有 LF/CRLF 提示）

## 风险点

- 图标 path 数据直接内联在 Python 字符串中，后续扩展时可统一提取为常量模块
- `map-ft-` 类名以 `fantasy_type` 下划线形式直接写入 HTML，需要保证 `world_builder.py` 的 fantasy_type 值不含 HTML 敏感字符（当前均为纯小写字母+下划线，无风险）
- 道路 tier fallback 为 `street`，能平稳处理未在 `_ROAD_TIER` 中注册的 highway 类型
