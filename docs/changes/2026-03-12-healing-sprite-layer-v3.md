# 变更说明：治愈向精灵收集与情感锚点 MVP 钩子 V3

## 为什么改

V2 完成后地图有了扰动感知层，但缺少"治愈向"对应物——`sprites`、`memory_anchors`、
`region.comfort_level` 三个字段在 `world.json` 中已存在，却从未被地图视觉消费。
V3 把这三个字段接入地图渲染层，形成"黑暗讽刺（扰动）"与"治愈情感（comfort）"
两股力量在同一地图上的视觉共存。

## 改了什么

### `fablemap/bundle.py`

**新增 `_comfort_aura_svg(region, viewport)`**

根据 `region.comfort_level` 生成暖金色径向渐变色晕：

- `level < 0.15`：不渲染
- 颜色固定为暖金 `#fbbf24`，与扰动的蓝/紫色晕形成对比
- 透明度最高 0.18，周期 2.5s–5.0s（comfort 越高越慢，越稳定）
- 使用 `<radialGradient id="comfort-grad">` 独立渐变 ID，不与 aura-grad 冲突
- 层顺序：comfort 色晕在 disturbance 色晕之下，两层叠加形成混合感

**新增 `_sprite_nodes_svg(world, world_state, project)`**

当 `spawn_window in ("active", "rare")` 时，为每个 `sprites` 列表项渲染可收集节点：

- 位置：通过 `linked_poi` 关联到对应 POI 的投影坐标
- 形状：旋转菱形（`<path d="M..L..L..L..Z">`），自带 `animateTransform rotate` 360°/8s
- 颜色：`common → #86efac`（绿），`uncommon → #a78bfa`（紫），`rare → #e879f9`（粉紫）
- 透明度脉动：`rare` 时 2.4s，`active` 时 3.2s
- 中心白色小核心 `sprite-core`（r=3）增加识别感
- `spawn_window="stable"` 时不渲染任何精灵（符合设计意图）

**新增 `_anchor_nodes_svg(world, project)`**

为每个 `memory_anchors` 渲染情感锚点心形标记：

- 位置：通过 `linked_pois[0]` 关联 POI，坐标偏移 (−16, −16) 避免与主图标重叠
- 形状：心形 SVG path `_HEART`，尺寸约 12px
- 颜色：玫瑰红 `#fb7185` + `drop-shadow` 柔光
- 透明度脉动 3.8s，比精灵更缓慢，强调"私密感"
- 仅 `secret_slot=True` 的 POI 关联锚点，即公园（whispering_grove）和咖啡馆（ember_parlor）

**SVG 层顺序**（底到顶，完整）

1. `<rect>` 背景
2. `_comfort_aura_svg`（暖金色晕）
3. `_disturbance_aura_svg`（蓝/紫扰动色晕）
4. 道路层
5. `_npc_agent_dots_svg`（贸易流动点）
6. `_anchor_nodes_svg`（情感锚点，在精灵之下）
7. `_sprite_nodes_svg`（精灵收集节点）
8. `feature_nodes`（POI/landmark，最顶层）

**overview detail-card 补充**

新增三行：
- `comfort_level` 带暖金进度条
- `detailSpriteCount`：可收集精灵数量
- `detailAnchorCount`：情感锚点数量

**CSS**

- `.comfort-aura`：`pointer-events: none`
- `.sprite-node`：`pointer-events: none`
- `.sprite-gem`：`filter: drop-shadow(0 0 5px currentColor)` — 精灵自发光
- `.sprite-core`：`pointer-events: none`
- `.anchor-node`：`pointer-events: none`
- `.anchor-heart`：`fill: #fb7185; filter: drop-shadow(0 0 3px #fb7185)`

**i18n**（zh-CN + en）

新增 3 个 key：`detailComfortLevel` / `detailSpriteCount` / `detailAnchorCount`

### `tests/test_bundle.py`

新增 9 条断言：`comfort-aura` / `sprite-node` / `sprite-gem` / `anchor-node` /
`anchor-heart` / 3 个 data-i18n key

### `tests/test_page.py`

补充页面服务级断言，确保通过 `page.py` 返回的 preview HTML 也稳定包含：

- `comfort-aura` / `sprite-node` / `sprite-gem`
- `anchor-node` / `anchor-heart`
- `detailComfortLevel` / `detailSpriteCount` / `detailAnchorCount`

## 影响范围

- `fablemap/bundle.py`：3 个新辅助函数 + SVG 调用点 + detail-card + CSS + i18n
- `tests/test_bundle.py`：新增 9 条断言
- `tests/test_page.py`：新增页面服务返回 preview 的 V3 断言

## 没改什么

- `fablemap/world_builder.py`（sprites/memory_anchors/comfort_level 字段早已存在）
- 未修改 Schema、协议文档、其他模块
- 未引入任何第三方库

## 验证

- `python -m unittest tests/test_bundle.py tests/test_page.py`：通过
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`：17 个测试全部通过
- `git diff --check`：无 diff 格式错误（仅现有 LF/CRLF 提示）
- `spawn_window=active` 时（fixture 数据 `anomaly_pressure=0.45>=0.4`）精灵节点正确渲染
- `comfort_level=0.38` 时 comfort 色晕正确渲染
- `memory_anchors` 有 2 条（fixture 数据有 2 个 `secret_slot=True` 的 POI）

## 设计注记

- 精灵节点与 POI 图标同坐标叠加，视觉上形成"精灵守护地点"的感知
- `animateTransform rotate` 与 `animateMotion` 是 SVG SMIL 动画，无 JS 依赖
- `comfort-grad` 和 `aura-grad` 是独立 SVG ID，互不干扰
