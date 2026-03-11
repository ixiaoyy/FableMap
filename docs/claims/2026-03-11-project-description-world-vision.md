# 模块认领说明

- 模块名 / 区域名：project description and world vision
- 负责人：Augment Agent
- 改动类型：文档
- 当前状态：in_progress

## 目标

完善项目对外描述，把 FableMap 从“基于真实地图生成幻想世界”的抽象表述，补强为一个更具象、可理解的长期世界愿景，说明它最终想成为一个什么样的世界，同时保持当前 Web-2D / nearby 入口与长期目标之间的边界清晰。

## 计划修改范围

- `README.md`
- `index.html`
- `docs/PRODUCT_BRIEF.md`
- `docs/LONG_TERM_EXPERIENCE.md`
- `docs/claims/2026-03-11-project-description-world-vision.md`
- `docs/changes/2026-03-11-project-description-world-vision.md`

## 明确不改范围

- 不修改 Python CLI、bundle、page、world builder 或测试代码
- 不宣称尚未实现的多人系统、持久化系统或渲染栈已经完成
- 不调整协议字段、Schema 或运行时接口

## 依据的协议文档

- `README.md`
- `docs/PRODUCT_BRIEF.md`
- `docs/LONG_TERM_EXPERIENCE.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `CONTRIBUTING.md`

## 预期产出

- 更完整的 README 项目简介
- 一段对“最终世界效果”的具象描述
- 首页 Hero 文案与产品文档口径同步
- 一份对应的变更说明文档

## 验证方式

- 文档术语一致性检查
- `git diff --check`

## 风险与备注

- 本次只完善表述，不把未来路线包装成当前已交付能力
- 文案会同时强调：当前仍在验证 Web-2D 入口闭环，长期目标则是活的神话城市世界

