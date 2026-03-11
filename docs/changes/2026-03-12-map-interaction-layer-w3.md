# 变更说明：2D 世界地图交互层 W3

## 为什么改

W2 已经把浏览器入口重组为地图主舞台优先结构，但 SVG 地图仍是纯静态的：
用户无法平移、无法缩放、悬停没有反馈、点选要素后地图画面也不移动。
这让地图在地点密集或区域较大时几乎无法探索，与"2D 世界地图本体"的目标不符。

W3 补齐这一块交互能力，让地图成为真正可操控的观察窗。

## 改了什么

### `fablemap/bundle.py`

**CSS 层**

- `#observer-map` 添加 `cursor: grab` / `.is-panning { cursor: grabbing }` 拖拽光标
- 新增 `.map-tooltip` 样式：`position: fixed`，`opacity` 过渡，跟随鼠标显示地点名称
- 新增 `.map-zoom-controls` / `.map-zoom-btn` 样式：绝对定位在 `world-map-canvas` 右上角
- `.world-map-canvas` 添加 `position: relative` 以支持 zoom controls 绝对定位

**HTML 层**（`_render_map_observer_html`）

- 在 `world-map-canvas` 内、SVG 之前插入三个缩放按钮：`map-zoom-in`、`map-zoom-out`、`map-zoom-reset`

**JS 层**（`_render_preview_html` 的 `<script>`）

- **Map camera state**：`vbX / vbY / vbW / vbH` 跟踪当前 viewBox；`vbW0 / vbH0` 保存初始值用于重置
- **`clampViewBox()`**：限制缩放范围（MIN_ZOOM=0.25 / MAX_ZOOM 约 4x）和平移边界
- **`applyViewBox()`**：clamp 后写入 SVG `viewBox` 属性
- **`svgCoordsFromClient(clientX, clientY)`**：将屏幕坐标转换为当前 viewBox 下的 SVG 坐标
- **`zoomAroundPoint(svgX, svgY, factor)`**：以指定 SVG 坐标为焦点缩放，保持该点位置不偏移
- **Pan（鼠标拖拽）**：`mousedown` 记录起始 viewBox 和 SVG 坐标，`mousemove` 实时更新 vbX/vbY，`mouseup` 结束；添加 `is-panning` class 切换光标
- **Zoom（滚轮）**：`wheel` 事件以鼠标位置为焦点调用 `zoomAroundPoint`，`passive: false` 阻止页面滚动
- **Touch pan / pinch-zoom**：`touchstart` / `touchmove` / `touchend` 支持单指平移和双指捏合缩放
- **Zoom buttons**：`map-zoom-in` / `map-zoom-out` 以当前视口中心为焦点缩放；`map-zoom-reset` 恢复初始 viewBox
- **Hover tooltip**：动态创建 `.map-tooltip` div，追加到 `document.body`；`mouseenter` 显示、`mousemove` 跟随、`mouseleave` 隐藏；键盘聚焦（`focus` / `blur`）也触发显示/隐藏
- **`featureSvgCenter(featureId)`**：从 SVG `<circle>` 或 `<rect>` 属性读取要素中心坐标（SVG 空间）
- **`focusToFeature(featureId)`**：以 easeInOut 缓动（320ms）平滑移动 viewBox 使要素居中
- **`setActiveFeature(featureId)`**：在原有选中逻辑基础上，对非 `map-overview` 要素调用 `focusToFeature`

### `tests/test_bundle.py` / `tests/test_page.py`

新增 12 条断言，验证生成 HTML 包含：

- `id="map-zoom-in"` / `id="map-zoom-out"` / `id="map-zoom-reset"`
- `class="map-zoom-controls"`
- `map-tooltip`
- `function zoomAroundPoint(` / `function focusToFeature(` / `function applyViewBox(`
- `panActive` / `is-panning` / `cursor: grab`

## 影响了哪些文件或模块

- `fablemap/bundle.py`：CSS / HTML / JS 变更，全部在 `_render_map_observer_html` 和 `_render_preview_html` 内
- `tests/test_bundle.py`：新增断言
- `tests/test_page.py`：新增页面服务返回 preview 的交互层断言

## 没改什么

- `fablemap/world_builder.py`、`showcase.py`、`cli.py`、`page.py`、`nearby.py`、`overpass.py`、`cache.py` 均未修改
- `docs/WORLD_SCHEMA.md` 未修改，无字段变更
- `index.html`（仓库根目录）未修改
- 未引入任何第三方 JS 依赖

## 是否涉及协议 / Schema / 命名变更

否。

## 做了哪些验证

- `python -m unittest tests/test_bundle.py tests/test_page.py`：通过
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`：17 个测试全部通过
- `git diff --check`：无 diff 格式错误（仅现有 LF/CRLF 提示）

## 风险点

- `svgCoordsFromClient` 依赖 `getBoundingClientRect()`，在 SVG 不可见或 `display:none` 时返回零矩形；当前场景下地图始终可见，影响为零
- pan 的 `mousemove` 监听绑定在 `window`，确保鼠标移出 SVG 边界时仍能连续平移，这是预期行为
- `focusToFeature` 在 `requestAnimationFrame` 动画进行中若用户再次触发平移，动画会被下一帧的 `applyViewBox` 覆盖，这是可接受的自然行为
