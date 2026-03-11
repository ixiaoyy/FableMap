# 模块认领说明

- 模块名 / 区域名：镜像家园与现实住所锚点系统 C3
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

1. **home_style 派生**：`world_builder` 根据 `comfort_level` 赋予初始 `home_style`
   而不是始终 `blank_slate`
2. **现实住所锚点**：以世界 `source.lat/lon` 中心坐标投影位置，在 SVG 地图上
   渲染房屋形状（SVG path）+ 光晕，代表玩家的"现实住所"在世界中的映射
3. **镜像家园侧边面板**：在侧边详情面板下方追加 `<section class="home-panel">`，
   显示 `home_style`、`home_inventory` 数量、`reputation` 派系好感度

## 计划修改范围

- `fablemap/world_builder.py`：`home_style` 基于 `comfort_level` 派生
- `fablemap/bundle.py`：`_home_anchor_svg` 辅助函数；侧边栏 home-panel HTML；
  SVG 调用插入；CSS；i18n

## 明确不改范围

- 不修改 Schema、协议文档
- 不改现有 W3/V1/V2/V3/C1/C2 逻辑
- 不引入第三方库

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 C3）
- `docs/AI参与开发协议.md`
