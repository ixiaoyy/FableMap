# 模块认领说明

- 模块名 / 区域名：browser-native 2D world map v0（浏览器内 2D 世界地图骨架）
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：claimed

## 目标

把 FableMap 在浏览器中的主入口正式收束为“2D 世界地图本体”，而不是继续把产品主体做成 HTML 页面 + 说明卡片。

本次方向重点不是“做得像地图”，而是让地图舞台本身承担主体：道路、建筑、POI、地标、世界对象、相机与交互都围绕同一张 2D 世界地图组织。

## 计划修改范围

- `fablemap/bundle.py`
- `fablemap/page.py`
- `tests/test_bundle.py`
- `tests/test_page.py`
- `README.md`
- 视需要补充 `docs/changes/` 对应说明

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `fablemap/world_builder.py` 的既有字段结构
- 不引入第三方地图 SDK、游戏引擎或在线瓦片依赖
- 不在这一轮直接实现完整角色行走、多人同步、持久化世界状态或完整像素资源管线

## 依据的协议文档

- `README.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/WORLD_SCHEMA.md`
- `docs/ARCHITECTURE.md`
- `docs/claims/README.md`

## 预期产出

- 一个以 2D 世界地图舞台为主的浏览器入口骨架
- 更明确的地图图层、视口 / 相机与交互抽象
- 让侧边信息面板退到附属层，而不是继续做成卡片主视图
- 与现有 `nearby -> world -> bundle/page` 链路兼容的第一版实现切口

## 验证方式

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- 视改动范围回归 `tests/test_nearby.py tests/test_cli.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 风险与备注

- 当前浏览器实现仍会使用 HTML / CSS / JS 作为承载层，但目标必须是“2D 世界地图本体”，而不是“带地图感的网页”
- 本任务应优先建立地图舞台、图层、相机与交互抽象；视觉资源精修、像素资产与更强渲染管线可后续继续迭代