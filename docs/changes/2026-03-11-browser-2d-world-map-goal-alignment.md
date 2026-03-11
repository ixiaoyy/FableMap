# 2026-03-11 浏览器内 2D 世界地图目标对齐说明

## 本次做了什么

- 更新 `README.md`、`docs/AI_SHARED_TASKLIST.md` 与相关认领说明，明确 FableMap 浏览器端的主目标不是“像地图的页面”，而是“浏览器内 2D 世界地图本体”
- 把 `W1` 明确为过渡里程碑：它验证了地图主舞台接入 bundle/page 的链路，但不代表最终形态已经完成
- 新增 `docs/claims/2026-03-11-web-2d-world-map-v0.md`，为 `W2` 的后续实现提供统一目标与边界

## 为什么要做

在当前原型阶段，`bundle/index.html` 已经可以渲染第一版地图观察窗，但如果不把目标口径写清，后续协作者很容易继续把主任务理解成“优化网页预览”。

这次文档对齐的作用，是把下一阶段实现目标正式固定为：浏览器中的 2D 世界地图主舞台，而不是继续强化卡片页或普通 HTML 布局。

## 影响范围

- `README.md`
- `docs/AI_SHARED_TASKLIST.md`
- `docs/claims/2026-03-11-world-map-observer-v1.md`
- `docs/claims/2026-03-11-web-2d-world-map-v0.md`

## 明确没有改什么

- 没有修改 `WORLD_SCHEMA`
- 没有修改 `world_builder` 输出结构
- 没有直接引入新的渲染框架或第三方依赖
- 没有宣称当前已经完成最终 Web-2D 世界地图实现

## 验证方式

- 回看相关 README / tasklist / claim 文档是否一致表达“浏览器内 2D 世界地图本体”目标
- `git diff --check`

## 备注

- 当前 `W1` 的 SVG 地图观察窗仍然保留，它是后续 `W2 / W3` 的实现起点，不是需要推翻的无效工作