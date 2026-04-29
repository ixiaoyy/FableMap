# 2026-04-30 Serial Episode Export

## 为什么改

父任务提出 “AI 酒馆像连续小说一样可回顾”。在 State Cards 和 GM Layer 已有基础上，需要一个安全的记录导出能力，让访客或店主把单个访客会话整理成可读剧集草稿，而不是让平台自动编写新剧情。

## 改了什么

- 新增 deterministic episode builder：`backend/src/fablemap_api/core/episode_builder.py`。
- 新增 API：`POST /api/v1/taverns/{id}/episodes/export`。
- 新增前端 typed/product 服务方法：`exportEpisode(...)`。
- 新增测试：
  - `tests/test_episode_builder.py`
  - `backend/tests/test_v1_episode_export.py`
  - `frontend/scripts/episode-export-test.mjs`
- 新增 Trellis backend/frontend 规范，明确 no-LLM、no-persistence、explicit visitor scope 和 hidden prompt 过滤边界。

## 没改什么

- 不调用 LLM 润色或续写。
- 不保存导出结果。
- 不导出全部访客会话。
- 不暴露 hidden system prompt、owner API Key、私密记忆或其他访客记录。
- 不新增持久化 Schema 字段。

## 验证

本变更应至少运行：

```powershell
py -3 -m pytest -q tests/test_episode_builder.py backend/tests/test_v1_episode_export.py --tb=short
node .\frontend\scripts\episode-export-test.mjs
py -3 -m compileall -q backend/src
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## 风险

- 当前导出只是格式化现有记录，不会生成“文学化成稿”；如果未来接入 LLM，仍必须保持显式用户动作、访客范围和 no-persistence / privacy 边界。
