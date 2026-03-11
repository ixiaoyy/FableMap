# 变更说明：全城播报系统 C1

## 为什么改

V2/V3 完成后地图有了扰动感知层和治愈层，但这些信息只能通过 overview 面板被动查看。
C1 在地图底部添加一条持续滚动的"世界播报栏"，把 `disturbance_level`、
`social_tension`、`commerce_flux`、`anomaly_pressure`、`comfort_level`、
`spawn_window`、`active_lens` 等指标主动翻译成世界事件文字，营造"城市正在呼吸"的播报感。

## 改了什么

### `fablemap/bundle.py`

**新增 `_broadcast_messages(world, world_state) -> list[str]`**

纯规则驱动的文字生成函数，无 AI/LLM 调用。根据指标阈值组合生成 1–7 条播报：

| 指标 | 阈值 | 消息示例 |
|---|---|---|
| `social_tension` | ≥0.5 / ≥0.25 | 社会压力提升 / 摩擦可感知 |
| `commerce_flux` | ≥0.5 / ≥0.2 | 贸易流高 / 路线稳定 |
| `anomaly_pressure` | ≥0.6 / ≥0.35 | 异常压力临界 / 上升 |
| `comfort_level` | ≥0.4 / ≥0.2 | 治愈指数良好 / 情感锚点可访问 |
| `spawn_window` | `rare` / `active` | RARE 窗口开放 / 精灵可见 |
| `active_lens` | 6 种 vibe | 世界镜头描述 |
| `disturbance_level` | ≥0.6 / ≥0.3 | 扰动 CRITICAL / moderate |
| 无触发 | — | 全系统正常备用消息 |

**新增 `_broadcast_bar_html(world, world_state) -> str`**

生成播报栏 HTML 结构：

```html
<div class="world-broadcast-bar" role="marquee" aria-label="World broadcast">
  <span class="broadcast-label" data-i18n="broadcastBarTitle"></span>
  <div class="broadcast-scroll-wrap">
    <span class="broadcast-track">
      <!-- items × 2，实现无缝循环 -->
      <span class="broadcast-item">…</span>
      <span class="broadcast-sep" aria-hidden="true">◆</span>
      …
    </span>
  </div>
</div>
```

track 内容**重复两遍**，配合 CSS `translateX(-50%)` 实现视觉无缝循环。

**插入位置**：`_render_map_observer_html` 中，SVG canvas 之后、`map-note` 之后、
viewport div 关闭之前——播报条始终位于地图下方。

**CSS**

- `.world-broadcast-bar`：flex 行，深色半透明背景，border-radius 10px，overflow hidden
- `.broadcast-label`：`世界播报 / World Broadcast`，右侧分隔线，蓝色高亮
- `.broadcast-scroll-wrap`：flex:1，overflow hidden
- `.broadcast-track`：inline-flex，`animation: broadcast-scroll 38s linear infinite`；
  `:hover` 暂停动画（`animation-play-state: paused`）
- `.broadcast-item`：12px `#cbd5e1`，左右 padding 18px
- `.broadcast-sep`：暗色分隔钻石符号 `◆`
- `@keyframes broadcast-scroll`：`from: translateX(0)` → `to: translateX(-50%)`；
  因为 track = items×2，移动 −50% 时回到视觉起点，形成无缝循环

**i18n**（zh-CN + en）

- `"broadcastBarTitle": "世界播报"` / `"World Broadcast"`

### `tests/test_bundle.py`

新增 5 条断言：`world-broadcast-bar` / `broadcast-track` / `broadcast-item` /
`broadcast-scroll` / `data-i18n="broadcastBarTitle"`

## 影响范围

- `fablemap/bundle.py`：2 个新函数 + 1 处调用插入 + CSS + i18n
- `tests/test_bundle.py`：新增 5 条断言

## 没改什么

- `fablemap/world_builder.py`
- Schema、协议文档、其他模块
- 无第三方库，无 JS 动画（纯 CSS keyframe）

## 验证

- 17 个测试全部通过（无回归）
- fixture 数据（anomaly_pressure=0.45, spawn_window=active, active_lens=neon_nostalgia）
  生成约 5 条播报文字，包含扰动中等、精灵活跃、镜头描述等

## 设计注记

- `broadcast-track` 内容重复两遍是 CSS 无缝滚动的标准做法，无 JS 依赖
- 38s 滚动周期适中，不会过快造成焦虑感，也不会过慢失去播报感
- `:hover` 暂停让用户可以读完某条信息
- `role="marquee"` + `aria-label` 满足无障碍基础要求；`aria-live="off"` 避免屏幕阅读器
  反复朗读滚动内容
