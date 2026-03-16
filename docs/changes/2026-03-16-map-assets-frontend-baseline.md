# 2026-03-16 map assets frontend baseline

## 背景

仓库已经新增地图资源规划与生成脚本，但前端当前仍以 `frontend/src/WorldMap.jsx` 的 Canvas 程序绘制为主，尚未形成正式的资源接入基线。

如果直接推进资源接入实现，容易出现：

- 资源目录临时生长
- `vibe_profile` 与 pack 映射关系散落在实现细节里
- `fantasy_type` 与 icon 资源文件名直接耦合
- 没有降级策略，导致资源不齐时地图直接退化

## 本次变更

新增：

- `docs/MAP_ASSETS_FRONTEND_BASELINE.md`
- `docs/claims/2026-03-16-map-assets-frontend-baseline.md`

文档明确了：

- 建议的前端资源目录结构
- `vibe_profile -> pack` 的首版映射策略
- `fantasy_type -> icon asset` 的首版映射策略
- `manifest / packSelector / iconMapping / loadImage` 的模块拆分建议
- 图标资源化 -> 场景底图 -> tile 局部替换 -> 完整资源驱动渲染的渐进顺序
- 资源加载失败时的降级路径

## 结果

Map Assets 主线不再停留在“生成资源”，而是补上了“如何进入当前前端地图壳”的基线说明。后续协作者可以据此继续推进 `WorldMap` 的渐进资源化接入。 
