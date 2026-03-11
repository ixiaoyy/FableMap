# 模块认领说明

- 模块名 / 区域名：world map observer v1（地图式世界观察窗）
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

把当前 bundle 预览页从以文字面板为主的世界观察窗，推进为以真实空间关系为主舞台的地图式世界观察窗：基于既有 `world.json` 中的 `roads`、`pois`、`landmarks` 几何数据，在静态 `bundle/index.html` 中渲染第一版 SVG 地图。

## 计划修改范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `README.md`
- `docs/changes/2026-03-11-world-map-observer-v1.md`

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `fablemap/world_builder.py` 的字段结构
- 不引入第三方依赖或在线地图 SDK
- 不在本次实现跨区域切换、持久化世界状态或新的 bundle 协议版本

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/WORLD_SCHEMA.md`
- `docs/ARCHITECTURE.md`
- `docs/claims/README.md`

## 预期产出

- `bundle/index.html` 中可直接打开的 SVG 地图主视图
- 基于真实坐标关系的道路、POI、地标渲染
- 点击/选中后的地图详情面板
- 对应测试、README 与变更说明更新

## 验证方式

- `python -m unittest tests/test_bundle.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 风险与备注

- 本次地图投影采用局部经纬度归一化，只适用于当前 nearby 小范围区域观察，不等于完整 GIS 投影系统
- 地图表现优先复用现有 world 数据，不能伪装成已经具备瓦片底图、真实导航或多尺度地图库能力
- 该任务解决的是“先把地图主舞台接进 bundle/page”，不是最终的浏览器 2D 世界地图本体；后续主目标应继续落到 `W2 / W3`