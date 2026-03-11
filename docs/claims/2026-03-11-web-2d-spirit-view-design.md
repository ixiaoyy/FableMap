# 模块认领说明

- 模块名 / 区域名：Web-2D spirit view design（浏览器灵觉视图设计）
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：in_progress

## 目标

把用户提供的暗黑赛博 / 治愈审美两组参考图，沉淀为 FableMap 当前浏览器方向可执行的 Web-2D 设计说明，明确共享地理骨架、多审美切换、分层渲染与 MVP 里程碑。

## 计划修改范围

- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/claims/2026-03-11-web-2d-spirit-view-design.md`
- `docs/changes/2026-03-11-web-2d-spirit-view-design.md`
- `docs/ROADMAP.md`
- `README.md`

## 明确不改范围

- 不修改 `docs/WORLD_SCHEMA.md`
- 不修改 `fablemap/world_builder.py` 或现有 CLI 协议
- 不引入第三方前端框架或渲染库
- 不在本次直接实现 PixiJS / Canvas / Shader 代码

## 依据的协议文档

- `README.md`
- `CONTRIBUTING.md`
- `docs/AI参与开发协议.md`
- `docs/AESTHETIC_EMOTION_SYSTEMS.md`
- `docs/STYLE_VIBES_MANIFESTO.md`
- `docs/claims/README.md`

## 预期产出

- 一份 Web-2D 灵觉视图设计说明
- README 导航与近期方向更新
- ROADMAP 中的浏览器 2D 补充执行顺序
- 对应变更说明文档

## 验证方式

- 检查新增文档与既有术语是否一致
- `git diff --check`

## 风险与备注

- 本次只沉淀方向与里程碑，不代表视觉资产或渲染代码已落地
- 文档需与现有 `nearby -> page -> bundle` 浏览器体验链保持一致，避免虚构当前能力

