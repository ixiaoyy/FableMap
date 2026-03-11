# 模块认领说明

- 模块名 / 区域名：2D 世界地图交互层 W3（平移 / 缩放 / 悬停 / 聚焦）
- 负责人：Cascade
- 改动类型：功能
- 当前状态：in_progress

## 目标

为 `bundle/index.html` 的 SVG 地图主舞台补齐基础交互能力：

- **平移（pan）**：鼠标拖拽 / 触摸滑动在地图视口内移动画布
- **缩放（zoom）**：滚轮 / 触摸双指缩放，保持焦点坐标不偏移
- **悬停（hover）**：鼠标悬停在 POI / 地标节点上时显示浮层名称提示
- **聚焦（focus to feature）**：点击选中某个要素时，地图相机平滑移动到该要素中心

这些能力全部在已有的 `world-map-viewport` + SVG 层内用原生 JS 实现，不引入任何第三方地图或游戏引擎 SDK。

## 计划修改范围

- `fablemap/bundle.py`：在 `_render_preview_html` 的 `<style>` 和 `<script>` 区块中添加交互逻辑
- `tests/test_bundle.py`：补充断言，验证交互关键标识符存在于生成 HTML 中

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `fablemap/world_builder.py`、`fablemap/showcase.py`、`fablemap/cli.py`
- 不修改 `fablemap/page.py`、`fablemap/nearby.py`、`fablemap/overpass.py`、`fablemap/cache.py`
- 不修改 `index.html`（仓库根目录入口页）
- 不引入第三方 JS 依赖、地图 SDK 或游戏引擎
- 不改变 `world.json` Schema 字段结构
- 不改变已有的 i18n / 语言切换 / `setActiveFeature` 选中逻辑

## 依据的协议文档

- `README.md`
- `docs/AI_SHARED_TASKLIST.md`（任务 W3）
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/WORLD_SCHEMA.md`
- `docs/AI参与开发协议.md`
- `docs/claims/README.md`

## 预期产出

- `bundle/index.html` 生成的地图可被用户拖拽平移、滚轮缩放
- 悬停 POI / 地标节点时显示名称浮层（tooltip）
- 点击选中要素时地图相机平滑聚焦到该要素
- 对应测试断言通过

## 验证方式

- `python -m unittest tests/test_bundle.py`
- 回归：`python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_demo.py tests/test_showcase.py`
- 生成 demo bundle 后在浏览器中手动验证平移 / 缩放 / 悬停 / 聚焦效果

## 风险与备注

- 交互逻辑全部在 `<script>` 中实现，不影响服务端 Python 逻辑
- SVG transform 方案采用 `viewBox` 动态更新（无外部依赖，兼容性好）
- 平滑聚焦采用 CSS transition + JS 动态更新 viewBox 实现，不依赖 Web Animations API
