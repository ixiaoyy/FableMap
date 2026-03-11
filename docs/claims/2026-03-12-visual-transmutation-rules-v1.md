# 模块认领说明

- 模块名 / 区域名：OSM -> 2D 建筑实体视觉转义规则库 V1
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

把地图主舞台上的 POI 和地标从纯字母占位符（"P" / "L"）升级为带语义的 SVG 图标，
同时为不同 road kind 应用差异化的粗细和颜色，让地图骨架和世界对象在视觉上具备可读性。

具体：

- 每种 `fantasy_type`（whispering_grove / healing_sanctum / supply_outpost / judgement_tower / ember_parlor / lore_academy）对应一个专属 SVG 图标路径，绘制在地图节点上
- landmark 节点使用独立的"记忆锚"图标，区别于普通 POI
- 道路按 `kind` 分为三个视觉层级：主干道（motorway/primary/secondary）/ 街道（tertiary/residential）/ 步行道（footway/path）

## 计划修改范围

- `fablemap/bundle.py`：
  - `_render_map_observer_html`：图标路径数据注入 SVG `<defs>/<symbol>` 或直接内联 path
  - `_render_preview_html`：CSS 添加各 fantasy_type 的颜色 token 和道路分层样式

## 明确不改范围

- 不修改 `fablemap/world_builder.py`（不改 RULES / fantasy_type 枚举）
- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `docs/DUAL_TRACK_MAPPING.md`（只是实现它的视觉层，不改协议）
- 不修改 `fablemap/page.py`、`nearby.py`、`overpass.py`、`cache.py`
- 不引入第三方图标库或字体

## 依据的协议文档

- `docs/AI_SHARED_TASKLIST.md`（任务 V1）
- `docs/WEB_2D_SPIRIT_VIEW.md`（现实要素 -> 2D 实体最小转义表）
- `docs/DUAL_TRACK_MAPPING.md`（archetype -> 视觉身份）
- `docs/UNIVERSAL_TRANSMUTATION_PROTOCOL.md`
- `docs/AI参与开发协议.md`

## 预期产出

- POI 节点显示与 fantasy_type 对应的 SVG 图标（6 种）
- landmark 节点显示专属图标
- 道路按三层级渲染（粗细 + 颜色区分）
- 图例更新以反映新图标
- 对应测试断言通过

## 验证方式

- `python -m unittest tests/test_bundle.py` 及完整回归套件
- 手动生成 demo bundle 在浏览器中验证图标可见

## 风险与备注

- 图标全部用内联 SVG path，无外部依赖
- 图标设计原则：同 archetype 的 Cynic / Muse 两轨共享同一图形，颜色区分氛围（当前 V1 只做单一颜色，双轨切换留给后续 V2）
