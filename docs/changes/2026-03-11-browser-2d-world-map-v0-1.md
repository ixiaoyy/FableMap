# 2026-03-11 浏览器内 2D 世界地图骨架 v0.1

## 本次做了什么

- 在 `fablemap/bundle.py` 中把 preview 主结构从页面排版优先改成地图舞台优先：`world-shell`、`world-map-stage`、`world-map-viewport`、`world-map-sidebar`、`world-secondary-panels`
- 让 SVG 地图成为浏览器入口的主舞台，右侧详情与其余说明面板退到附属层
- 保留现有道路 / POI / 地标投影、语言切换、键盘选择与详情卡切换逻辑，不另起一套数据链路
- 更新 `tests/test_bundle.py` 与 `tests/test_page.py`，固定新的 map-stage-first 结构标记
- 同步更新共享任务表与本轮认领状态，避免 `W2` 结果只留在聊天记录里

## 为什么要做

前一轮 `W1` 已经证明 `roads / pois / landmarks` 可以进入浏览器地图观察窗，但整体 preview 仍然是“网页里有一个地图区块”，产品感知主体还是页面和卡片。

这次 `W2` 的目标，是把浏览器入口真正收束为 2D 世界地图骨架：地图舞台成为主入口，信息面板退为辅助层，为后续平移、缩放、聚焦与更强世界对象交互留下正确结构。

## 影响范围

- `fablemap/bundle.py`
- `tests/test_bundle.py`
- `tests/test_page.py`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-11-web-2d-world-map-v0.md`

## 明确没有改什么

- 没有修改 `docs/WORLD_SCHEMA.md`
- 没有修改 `fablemap/world_builder.py` 的字段结构
- 没有引入第三方地图 SDK、游戏引擎或在线瓦片依赖
- 没有在这一轮直接实现平移 / 缩放相机、建筑资源化、角色行走或持久化世界状态

## 验证方式

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 备注

- 当前主舞台仍使用 HTML / CSS / SVG 承载，但产品主语义已切到“地图本体优先”，不再是“页面里嵌地图”
- 下一步自然切口是 `W3`：补平移、缩放、悬停、选中态、聚焦与更强侧边栏交互