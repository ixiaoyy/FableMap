# 模块认领说明

- 模块名 / 区域名：Map Assets 前端接入基线（M3）
- 负责人：OpenClaw
- 改动类型：文档
- 当前状态：in_progress

## 目标

为地图资源包（Pack A / Pack B）补一份可执行的前端接入基线文档，明确资源目录、命名约定、WorldMap 资源映射入口与接入顺序，避免后续前端接入时临时生长。

## 计划修改范围

- `docs/claims/2026-03-16-map-assets-frontend-baseline.md`
- 新增一份 Map Assets 前端接入基线文档
- 视需要补对应 `docs/changes/` 说明

## 明确不改范围

- 不直接改 `frontend/src/WorldMap.jsx` 渲染实现
- 不新增真实图片资源
- 不调整 `scripts/generate_map_assets.py` 生成逻辑
- 不重构现有 Canvas 交互层

## 依据的协议文档

- `docs/MAP_ASSETS_PLAN.md`
- `docs/MAP_ASSETS_GENERATION_GUIDE.md`
- `docs/AI_SHARED_TASKLIST.md`
- `frontend/src/WorldMap.jsx`

## 预期产出

- 一份前端接入基线文档
- 一份对应 change 文档
- 为后续资源接入实现提供统一入口

## 验证方式

- 文档能明确描述资源目录、命名规范、映射关系与分阶段接入顺序
- 后续协作者可直接据此实现 `WorldMap` 资源化接入

## 风险与备注

- 本次仅定义接入基线，不应越界到大规模前端重构
- 当前前端仍以程序绘制为主，因此接入方案应强调“渐进替换”，而不是一次性推翻