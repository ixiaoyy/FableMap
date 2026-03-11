# 变更说明：语义坍缩与缩放变形效果钩子 D1

## 为什么改

在 `W3` 之后，地图已经能缩放、平移与聚焦，但“镜头变化只是看得更近 / 更远”还不够。

`D1` 的目标不是一次做完整现实剥落系统，而是先补上一个**浏览器 2D 世界地图本体感**更强的最小信号：

- 视角远时，地图更像世界骨架
- 视角中时，地图更像区域脉冲
- 视角近时，地图更像街区低语

## 改了什么

### `fablemap/bundle.py`

- 新增 `semantic-zoom-indicator`
- 为 `world-map-viewport` 与 `observer-map` 增加 `data-zoom-tier`
- 新增 `updateSemanticZoomTier()`，由 `applyViewBox()` 驱动同步
- 增加三档语义缩放文案：
  - `semanticZoomSurvey`
  - `semanticZoomDistrict`
  - `semanticZoomIntimate`
- 增加三档 tier 的 CSS 反馈：
  - 标签显隐强度变化
  - POI / landmark 强调度变化
  - echo / capsule / sprite / home anchor 显隐强度变化

### `tests/test_bundle.py`

- 新增 `semantic-zoom-indicator`
- 新增 `semantic-zoom-value`
- 新增 `data-zoom-tier="survey"`
- 新增 `function updateSemanticZoomTier(`
- 新增 `data-i18n="semanticZoomTitle"`

### `tests/test_page.py`

- 同步新增 D1 的页面服务级断言，确保 `page.py` 返回的 preview 也稳定包含上述结构

### `docs/AI_SHARED_TASKLIST.md`

- 将 `D1` 从 `planned` 收口为 `done`

## 没改什么

- 没有新增新的世界数据字段
- 没有实现复杂变形动画或 shader 层
- 没有改动 `world_builder.py`
- 没有扩展到 `D2` / `D3`

## 验证

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 设计备注

- 这次的重点是先让缩放具备语义感，而不是把“现实剥落”一次做满
- 后续如果继续扩展，可以在这个 tier 钩子上叠加强一点的地表变形、层级替换或叙事触发