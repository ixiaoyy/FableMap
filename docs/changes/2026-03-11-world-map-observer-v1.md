# 2026-03-11 地图式世界观察窗 v1

## 本次做了什么

- 在 `fablemap.bundle` 中把当前 preview 从卡片优先推进为地图优先：基于 `world.json` 里的 `roads`、`pois`、`landmarks` 渲染 SVG 观察窗
- 为地图要素补上点选与键盘选择交互，切换右侧地点详情面板
- 更新 `tests/test_bundle.py` 与 `tests/test_page.py`，覆盖地图观察窗结构与交互脚本注入
- 更新 `README.md`，同步地图观察窗 v1 已落地的能力与下一步方向
- 同步 `docs/AI_SHARED_TASKLIST.md` 与认领说明状态，方便后续 AI 协作者接力

## 为什么要做

上一版 bundle 预览已经能展示世界信息，但主视图仍然偏向文字面板，无法把真实空间关系作为第一入口。

这次的目标是先用现有 world 数据把 nearby 小范围区域真正渲染成一张可选点的世界地图，让道路、POI 和地标先成为主舞台，而不是继续把地图退居到说明层。

## 影响范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `tests/test_page.py`
- `README.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-11-world-map-observer-v1.md`

## 明确没有改什么

- 没有修改 `WORLD_SCHEMA`
- 没有修改 `fablemap/world_builder.py` 的字段结构
- 没有引入第三方地图库、GIS SDK 或额外依赖
- 没有伪装成已经具备瓦片底图、导航、多尺度投影或完整 Web-2D 行走系统

## 验证方式

- `python -m unittest tests/test_bundle.py`
- `python -m unittest tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 备注

- 当前地图投影采用局部经纬度归一化，更适合 nearby 小范围世界切片观察，不等于完整 GIS 投影方案
- 本次交互只覆盖点选 / 键盘切换与详情联动；缩放、悬停与更强侧边交互仍属于后续 `W2 / W3`