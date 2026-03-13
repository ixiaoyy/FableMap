# 模块认领说明

- 模块名 / 区域名：玩家参与感与城市神话共创主线 D3
- 负责人：Roo
- 改动类型：功能 + 文档化收束
- 当前状态：in_progress

## 目标

1. 为世界数据补齐最小可展示的 `co_creation` 共创层，形成玩家参与城市神话的统一入口。
2. 在 showcase 与 bundle 预览页暴露 `co_creation_storyline`、`mythline_threads`、`participation_entries`，让共创线索可被浏览、阅读与进入。
3. 将当前阶段的共创能力边界明确收口为“可展示、可引导、暂不真实写回”的 D3 基线，避免提前扩展到完整权限系统。

## 计划修改范围

- `fablemap/world_builder.py`：生成 `world.co_creation` 数据块（`city_myth_stage`、`writing_rights`、`participation_modes`、`memory_policy`、`open_threads`）
- `fablemap/showcase.py`：生成 `co_creation_storyline`、`mythline_threads`、`participation_entries` 与相关 markdown 摘要
- `fablemap/bundle.py`：在 bundle HTML 中增加神话线索面板与参与入口面板，并接入双语 i18n 文案
- `tests/test_showcase.py`、`tests/test_bundle.py`：补充共创主线字段与页面内容断言
- `docs/AI_SHARED_TASKLIST.md`、`docs/changes/`：同步任务状态与变更说明

## 明确不改范围

- 不实现真实玩家写回 API
- 不定义完整 moderation、审核流、账号体系或社区治理机制
- 不改 `P3` / `P4` 的协议正文，不提前落地历史深度与写回治理完整规范
- 不引入第三方依赖

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 D3）
- `docs/NEXT_PHASE_PROTOCOL_FOCUS.md`
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/AI参与开发协议.md`
