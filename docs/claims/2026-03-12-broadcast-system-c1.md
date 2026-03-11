# 模块认领说明

- 模块名 / 区域名：全城播报系统 C1
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

在地图主舞台底部添加一条"世界播报栏"，基于已有的
`disturbance_level`、`social_tension`、`commerce_flux`、`anomaly_pressure`、
`spawn_window`、`active_lens`、`dominant_faction` 等字段，生成一组世界事件文字条目，
用 CSS animation 实现横向无缝滚动，营造"城市此刻正在播报"的氛围感。

具体产出：

1. **`_broadcast_messages(world, world_state)`**：纯 Python 函数，根据扰动指标组合生成
   3–6 条中英文播报文字列表（规则驱动，不调用 AI）
2. **播报栏 HTML**：`<div class="world-broadcast-bar">` 插入地图舞台底部（SVG 之外）
3. **CSS marquee 动画**：`@keyframes broadcast-scroll` 横向无缝滚动，无 JS 依赖
4. **i18n**：播报栏标题 key `broadcastBarTitle`

## 计划修改范围

- `fablemap/bundle.py`：新增 `_broadcast_messages` + `_broadcast_bar_html`；
  在 `_render_map_observer_html` 中插入；添加 CSS；添加 i18n key

## 明确不改范围

- 不修改 `world_builder.py`、Schema、其他模块
- 不引入第三方库
- 不使用 JS 实现滚动（纯 CSS animation）

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 C1）
- `docs/DISTURBANCE_MODEL.md`
- `docs/AI参与开发协议.md`
