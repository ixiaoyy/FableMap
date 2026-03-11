# 变更说明：现实路况 -> NPC / 拥挤隐喻动态代理层 V2

## 为什么改

V1 之后地图节点有了语义图标和道路层级，但地图仍然是完全静态的——没有任何"世界正在
呼吸"的感知。`world.json` 中已经有 `disturbance_level`、`social_tension`、
`commerce_flux`、`anomaly_pressure`、`spawn_window`、`poi_states` 等字段，但它们
从未被地图视觉消费。

V2 让这些字段真正驱动地图表现层，不接入任何实时 API，纯规则驱动。

## 改了什么

### `fablemap/bundle.py`

**新增辅助函数 `_disturbance_aura_svg(world_state, viewport)`**

根据 `disturbance_level` 生成一个带径向渐变的 SVG `<ellipse>` 脉动层：

- `level < 0.05`：不渲染（静默世界）
- `0.05 ≤ level ≤ 0.6`：蓝色晕（`#38bdf8`），透明度最高约 0.22
- `level > 0.6`：紫色晕（`#a78bfa`，异常压力），动画加速
- 用 SVG `<animate>` 做 opacity 脉动，周期 1.8s–3.5s（扰动越高越快）
- 使用 `<radialGradient id="aura-grad">` 内联渐变

**新增辅助函数 `_npc_agent_dots_svg(world_state, viewport)`**

根据 `disturbance_level`（代理 commerce_flux）和 `spawn_window` 生成 0–6 个漂浮代理点：

- `commerce > 0.3`：+2 点（贸易活跃）
- `commerce > 0.6`：再 +2 点
- `spawn_window in ("active", "rare")`：+2 个金色精灵点
- 坐标用 `hashlib.md5(seed)` 确定性散布，确保同一世界数据每次渲染相同
- 每个点用 SVG `<animateMotion path="M0,0 q{dx},{dy} 0,0">` 做缓慢曲线漂浮
- 普通流动点：青蓝 `#67e8f9` r=2；精灵点：金色 `#fbbf24` r=3

**POI 状态徽章**

每个 POI / landmark 节点右上角叠加一个 r=4 的状态小圆（`poi-status-badge`）：

| `poi_states[id].status` | 颜色 | 效果 |
|---|---|---|
| `idle` | 灰 `#475569` | 静止 |
| `active` | 绿 `#4ade80` | drop-shadow 光晕 |
| `anomaly` | 红 `#f87171` | drop-shadow + CSS keyframe 闪烁 |
| 其他 | 同 idle | — |

**SVG 层顺序**（从底到顶）

1. `<rect>` 背景
2. `_disturbance_aura_svg`（氛围色晕，在道路下）
3. 道路层（`road_shapes`）
4. `_npc_agent_dots_svg`（NPC 代理点，在 POI 下）
5. feature_nodes（POI / landmark，最顶层）

**侧边详情面板 overview card 补充**

在地图概览 detail-card 的基础信息之后，新增 `.disturbance-panel` 块，展示：

- `region.social_tension`：带迷你进度条（蓝色 `#38bdf8`）
- `region.commerce_flux`：带迷你进度条（橙色 `#fb923c`）
- `region.anomaly_pressure`：带迷你进度条（紫色 `#a78bfa`）
- `state.spawn_window`：文字显示

迷你进度条：`metric-bar-wrap`（40px 灰底）+ `metric-bar`（值 * 40px 宽度，单位 em，
通过 `float(v):.2f` 乘以 40 近似实现，最大宽度 CSS 限制 40px）

**CSS**

- `.poi-status-badge` / `.poi-status-idle` / `.poi-status-active` / `.poi-status-anomaly`
- `@keyframes anomaly-pulse`：0.35 → 1 → 0.35 opacity 闪烁（1.2s）
- `.disturbance-aura` / `.npc-agent-dot`：`pointer-events: none`
- `.disturbance-panel` / `.disturbance-panel-title` / `.disturbance-metrics`
- `.metric-bar-wrap` / `.metric-bar` / `.metric-bar.commerce` / `.metric-bar.anomaly`

**i18n**（zh-CN + en）

新增 6 个 key：`detailDisturbanceMetrics` / `detailSocialTension` / `detailCommerceFlux` /
`detailAnomalyPressure` / `detailSpawnWindow`

**顶部 import**

`import hashlib` 移到文件顶部（原在函数内临时 import）

### `tests/test_bundle.py`

新增 15 条断言：

- `poi-status-badge` / `poi-status-idle` / `poi-status-active` / `poi-status-anomaly`
- `disturbance-aura` / `npc-agent-dot`
- `disturbance-panel` / `disturbance-metrics` / `metric-bar-wrap`
- 5 个 `data-i18n` key 断言

## 影响了哪些文件或模块

- `fablemap/bundle.py`：新增两个辅助函数 + POI 状态徽章逻辑 + detail-card 扰动面板 + CSS + i18n
- `tests/test_bundle.py`：新增断言

## 没改什么

- `fablemap/world_builder.py`（Schema 字段不变）
- `docs/WORLD_SCHEMA.md`、`DISTURBANCE_MODEL.md`
- `fablemap/page.py`、`nearby.py`、`overpass.py`、`cache.py`
- 未引入任何第三方 JS/CSS 库，未接入实时 API
- 已有 pan/zoom/hover/focus 逻辑不变

## 是否涉及协议 / Schema / 命名变更

否。

## 做了哪些验证

- `python -m unittest tests/test_bundle.py tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_demo.py tests/test_showcase.py`：17 个测试全部通过

## 风险点

- `_npc_agent_dots_svg` 用 `disturbance_level` 代理 `commerce_flux`（因 `world_state` 不直接暴露 `disturbance_metrics`）；v0.2 可在 `world_builder.py` 中把 `disturbance_metrics` 写入 `state`，届时可直接读取
- `metric-bar` 宽度使用 `{value}em` 作为内联 style，value 为 0.00–1.00，因此实际宽度 0–1em，而 `metric-bar-wrap` 宽度 40px；视觉上条形长度占比合理，但不是精确线性映射
- `radialGradient id="aura-grad"` 是全局 SVG ID，若页面上有多个 SVG 可能冲突；当前每个 bundle 只有一个 `#observer-map`，无风险
