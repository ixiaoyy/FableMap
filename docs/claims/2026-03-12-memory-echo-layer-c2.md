# 模块认领说明

- 模块名 / 区域名：地点记忆回声与情绪胶囊 MVP C2
- 负责人：Augment Agent
- 改动类型：功能
- 当前状态：done

## 目标

本轮按**敏捷小切片**收缩为只读记忆入口 MVP，只做当前地图主舞台已经能稳定承载的三件事：

1. **历史回声叠加层**：把 `historical_echoes[]` 以地标旁悬浮文字的形式接入 SVG 地图
2. **情绪胶囊标记**：把 `state.private_marks[]` 以轻量留言泡泡标记接入地图
3. **地标 detail-card 扩展**：在地标详情中补一条历史回声摘要，形成最小历史深度入口

## 计划修改范围

- `fablemap/world_builder.py`：生成 `historical_echoes` 与 `state.private_marks` 的最小示例数据
- `fablemap/bundle.py`：渲染 `echo-node`、`capsule-mark` 与地标 `echo-panel`，补充 CSS 与 i18n
- `tests/test_bundle.py`：补充 C2 关键标识断言
- `tests/test_page.py`：补充页面服务返回 preview 的 C2 断言

## 明确不改范围

- 不修改 Schema、协议文档与字段命名
- 不做用户写入、权限模型、好友可见性、照片/时间胶囊等长期机制
- 不改现有 W3 / V1 / V2 / V3 / C1 / C3 逻辑
- 不引入第三方库

## 依据文档

- `docs/AI_SHARED_TASKLIST.md`（任务 C2）
- `docs/WEB_2D_SPIRIT_VIEW.md`
- `docs/AI参与开发协议.md`

## 验证方式

- `python -m unittest tests/test_bundle.py tests/test_page.py`
- `python -m unittest tests/test_page.py tests/test_nearby.py tests/test_cli.py tests/test_bundle.py tests/test_demo.py tests/test_showcase.py`
- `git diff --check`

## 实际完成情况

- `fablemap/world_builder.py` 已生成 `historical_echoes` 与 `state.private_marks` 的最小示例数据
- `fablemap/bundle.py` 已实现 `echo-node`、`echo-text`、`capsule-mark`、`capsule-bubble` 与地标 `echo-panel`
- `tests/test_bundle.py` 已锁定上述 C2 关键结构与 `detailEchoTitle`
- 本轮补充了 `tests/test_page.py` 断言，确保页面服务返回的 preview 也稳定包含 C2 关键标识
- 本轮将 claim 口径收缩为更符合当前节奏的 MVP：只读展示，不扩张到长期写回与权限系统
