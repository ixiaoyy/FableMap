# 子任务：空间能力聚合枢纽 MVP（D1/D2）

## Goal

在不改 Schema 的前提下，落地“空间属性驱动的能力聚合”第一版：先将现有能力按 `place_type / layout_style / world_info / skill_packs` 映射为可见卡片，并接入现有聊天/回访闭环。

## Parent

`D:\work\ai-\.trellis\tasks\05-07-05-07-embedded-story-minigames-game-workshop-brainstorm\`

## 需求范围

- 定义前端能力映射配置（纯静态）
  - 输入：`place_type`（默认值映射）、`layout_style`（排序偏好）、`world_info.scene_prompt` 关键词加权、`skill_packs` 显式开关。
  - 输出：能力卡片列表与展示排序。
- 在“更多空间功能”区块中新增 **能力卡片组**：
  - 体验核心：聊天陪伴、NPC 入口、回访反馈
  - 互动玩法：现有 `GameplayDefinition` 列表入口
  - 工作助手：需求整理 / 流程提示 / 任务清单（轻量模板）
  - 小游戏工坊：后续 child 任务接入的占位入口
- 对于 `school`/`hospital` 等高优先空间，仅做“默认排序差异”，不实现行业级流程判断引擎。
- 增加「完成后回到聊天 + 可给店主复核摘要」的统一交互语义（仅复用既有能力，不新增新 API）。

## 接受标准

- [ ] 进入不同空间详情时，能力卡片可根据空间属性自动出现，且不会新增/变更数据库字段。
- [ ] 以 `quest-play` 为主的空间至少突出玩法卡片；以 `npc-chat` / `home` 风格为主的空间优先展示陪伴/回访类入口。
- [ ] 同一套能力卡片模板可用于多个空间，只有文案与排序不同。
- [ ] 未配套 schema 变更；前端仅基于现有字段展示。

## 风险与边界

- 不做行业化流程判断（法律、医疗、教育等），仅输出“待确认草稿 + 风险边界提示”。
- 不做跨空间社交、排行榜、奖励体系。

## 依赖

- `frontend/app/features/tavern-chat-workbench/*`
- `frontend/app/lib/gameplay*`
- `backend` 现有 `Tavern` 字段：`place_type`、`layout_style`、`world_info`、`skill_packs`。

## 验收补充

*本轮仅拆任务，不执行实现。*
