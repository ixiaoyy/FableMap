# 2026-04-30 Tavern GM Layer Preview

## 为什么改

父任务把 AI 酒馆定义为可持续的叙事体验：玩家需要冲突、机会和下一步钩子，但这些内容不能绕过店主主权或访客确认直接写入正史。

## 改了什么

- 新增 deterministic GM Layer 预览核心：`backend/src/fablemap_api/core/gm_layer.py`。
- 新增 API：`POST /api/v1/taverns/{id}/gm-layer/preview`。
- 新增前端 typed/product 服务方法：`previewGmLayer(...)`。
- 新增测试：
  - `tests/test_tavern_gm_layer.py`
  - `backend/tests/test_v1_gm_layer.py`
  - `frontend/scripts/gm-layer-test.mjs`
- 新增 Trellis backend/frontend 规范，明确 preview-only / no-persistence / State Card 确认边界。

## 没改什么

- 不自动保存 GM 候选到 `_state_cards`。
- 不新增持久化 Schema 字段。
- 不接入 LLM，不自动生成完整剧情，不替店主创作酒馆内容。
- 不修改 Tavern / TavernCharacter / WorldInfoEntry / owner LLM 配置。

## 验证

本变更应至少运行：

```powershell
py -3 -m pytest -q tests/test_tavern_gm_layer.py backend/tests/test_v1_gm_layer.py --tb=short
node .\frontend\scripts\gm-layer-test.mjs
py -3 -m compileall -q backend/src
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## 风险

- 当前抽取是关键词规则，只适合作为安全预览 MVP；不是完整 GM 叙事引擎。
- 未来若接入 LLM，仍必须保留 preview-only 与 State Card 确认边界。
