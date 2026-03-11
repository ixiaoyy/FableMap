# 模块认领说明

- 模块名 / 区域名：语义坍缩与缩放变形效果钩子 D1
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

本轮按**敏捷小切片**只完成一个可直接感知的缩放语义变化 MVP：

1. 地图缩放时切换 `survey / district / intimate` 三档 semantic zoom tier
2. 在地图舞台上显示一个轻量语义提示条，让用户知道当前镜头语义层级
3. 让标签、POI / landmark 强调度、回声 / 胶囊显隐随缩放层级发生第一层可见变化

## 计划修改范围

- `fablemap/bundle.py`：新增 semantic zoom indicator、tier 样式与 JS 同步逻辑
- `tests/test_bundle.py`：补 D1 关键 DOM / JS 钩子断言
- `tests/test_page.py`：补页面服务返回 preview 的 D1 断言
- `docs/AI_SHARED_TASKLIST.md`：同步 D1 状态

## 明确不改范围

- 不做复杂 shader、粒子或完整“现实剥落”系统
- 不改 world schema、协议字段与 `world_builder` 数据模型
- 不扩展多人写回、权限治理或长期共创机制
- 不引入第三方库

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/AI参与开发协议.md`
- `CONTRIBUTING.md`

## 验证方式

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 实际完成情况

- `bundle.py` 已新增 `semantic-zoom-indicator` 与 `updateSemanticZoomTier()`
- `applyViewBox()` 已同步更新 `world-map-viewport` / `observer-map` 的 `data-zoom-tier`
- CSS 已让标签、POI / landmark、echo / capsule / sprite / home anchor 在三档 zoom tier 下呈现不同强调度
- `tests/test_bundle.py` 与 `tests/test_page.py` 已锁定 D1 最小结构与钩子