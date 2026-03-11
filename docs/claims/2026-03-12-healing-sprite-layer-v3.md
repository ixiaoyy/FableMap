# 模块认领说明

- 模块名 / 区域名：治愈向精灵收集与情感锚点 MVP 钩子 V3
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

基于 `world.json` 中已有的 `sprites`、`memory_anchors`、`region.comfort_level` 字段，
在 2D 地图上叠加治愈向视觉层：

1. **精灵收集节点**：`sprites` 中每个精灵根据关联 POI 位置，在 SVG 上渲染为
   菱形可收集节点，带柔光脉动动画；`spawn_window=active/rare` 时才显示
2. **情感锚点标记**：`memory_anchors` 中每个锚点根据关联 POI 位置，渲染为
   心形小标记（SVG path），`secret_slot` POI 旁边的私密入口
3. **comfort 背景柔化**：`region.comfort_level` 越高，地图背景叠加越温暖的
   暖橙/金色渐变色晕（与 disturbance aura 区分）

## 计划修改范围

- `fablemap/bundle.py`：新增 `_sprite_nodes_svg`、`_anchor_nodes_svg`、
  `_comfort_aura_svg` 三个辅助函数；在 `_render_map_observer_html` 的 SVG
  层中插入；添加 CSS；添加 i18n key
- `tests/test_bundle.py`：补充断言，验证生成 HTML 中包含 V3 关键标识
- `tests/test_page.py`：补充断言，验证页面服务返回的 preview 同样包含 V3 关键标识

## 明确不改范围

- 不修改 `fablemap/world_builder.py`（sprites/memory_anchors 已存在）
- 不修改 `docs/WORLD_SCHEMA.md` 等协议文件
- 不引入任何第三方库
- 不改变已有 W3/V1/V2 的逻辑

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 V3）
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/DISTURBANCE_MODEL.md`
- `docs/AI参与开发协议.md`

## 验证方式

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 实际完成情况

- `fablemap/bundle.py` 已实现 `comfort-aura`、`sprite-node`、`anchor-node` 三层治愈向地图覆盖物，以及详情面板中的 comfort/sprite/anchor 指标展示
- `tests/test_bundle.py` 已锁定 `comfort-aura`、`sprite-node`、`sprite-gem`、`anchor-node`、`anchor-heart` 与相关 i18n 标识
- 本轮补充了 `tests/test_page.py` 断言，确保通过页面服务返回的 preview 也稳定包含 V3 关键结构
- 本轮将 claim 负责人与状态同步为当前仓库真实完成状态
