# 变更说明：Web-2D 灵觉视图设计说明

## 本次改动

- 新增 `docs/WEB_2D_SPIRIT_VIEW.md`
- 新增对应模块认领说明
- 更新 `README.md` 文档导航与近期方向
- 更新 `docs/ROADMAP.md`，补充浏览器 Web-2D 的短期执行顺序

## 改动目的

把用户给出的暗黑赛博 / 治愈审美参考图，沉淀成仓库内可引用的正式设计资产，明确 FableMap 为什么先做浏览器 2D、共享地理骨架如何支持多审美切换，以及 MVP 应优先落哪些层。

## 影响范围

- 只影响设计文档、路线说明与导航
- 不修改 `world.json` schema
- 不修改 Python CLI / nearby / page / bundle 协议与实现

## 验证

- 对照 `docs/AESTHETIC_EMOTION_SYSTEMS.md` 与 `docs/STYLE_VIBES_MANIFESTO.md` 保持术语一致
- 对照 README 当前 nearby/page/bundle 现状，避免把未实现能力写成已实现
- 计划执行：`git diff --check`

## 备注

这次是 Web-2D 方向的规格沉淀，不等于已经完成 PixiJS、Canvas 或 Shader 版渲染实现。

