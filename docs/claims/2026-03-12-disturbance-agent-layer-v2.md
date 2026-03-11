# 模块认领说明

- 模块名 / 区域名：现实路况 -> NPC / 拥挤隐喻动态代理层 V2
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

基于已有 `world.json` 中的 `disturbance_level`、`social_tension`、`commerce_flux`、
`anomaly_pressure`、`spawn_window`、`poi_states` 等字段，在 2D 地图主舞台上叠加"世界
正在呼吸"的动态代理层。不接入任何实时 API，纯规则驱动。

具体产出：

1. **区域氛围脉动**：根据 `disturbance_level` 在 SVG 背景上叠加径向色晕，使用
   CSS keyframe animation 制造微弱脉动感
2. **NPC 流动代理点**：根据 `commerce_flux` 和 `spawn_window` 在视口内生成
   少量漂浮小圆点，用 CSS animation 模拟流动感
3. **POI 状态徽章**：根据 `poi_states[id].status`（idle / active / anomaly）
   在 POI 图标右上角叠加一个小圆形状态点
4. **侧边详情面板扰动指标**：在地图概览 detail-card 中补充展示
   `social_tension`、`commerce_flux`、`anomaly_pressure`、`spawn_window`

## 计划修改范围

- `fablemap/bundle.py`：`_render_map_observer_html` + `_render_preview_html`
  的 CSS / HTML / i18n

## 明确不改范围

- 不修改 `fablemap/world_builder.py`（Schema 字段已存在，不改）
- 不修改 `docs/WORLD_SCHEMA.md`、`DISTURBANCE_MODEL.md`
- 不引入任何第三方 JS/CSS 库
- 不接入实时 API
- 不改变已有 pan/zoom/hover/focus 逻辑

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 V2）
- `docs/DISTURBANCE_MODEL.md`
- `docs/DISTURBANCE_INTERFACE_ALIGNMENT.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/AI参与开发协议.md`

## 验证方式

- `python -m unittest tests/test_bundle.py` 及完整回归套件通过
