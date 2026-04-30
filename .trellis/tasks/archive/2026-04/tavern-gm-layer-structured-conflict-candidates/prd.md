# Tavern GM Layer Structured Conflict Candidates

## Goal

把父任务中的 “Tavern GM Layer” 落成一个小而安全的 MVP：在当前酒馆对话回合中，GM Layer 可以把可观察文本预览成结构化的 `task` / `resource` / `conflict` / `event_log` 状态卡候选，供访客或店主后续确认；预览本身不写入 `_state_cards`、不修改酒馆设定、不调用 LLM。

## Scope

### In scope

- 新增 deterministic preview-only GM Layer 后端能力：
  - 输入当前 user / assistant 回合文本、visitor/character/source message 信息。
  - 输出 pending 状态卡候选、分类计数、可读 notes。
  - 复用现有 State Card / Canon Ledger 候选结构与权限边界。
- 新增 `/api/v1/taverns/{id}/gm-layer/preview`。
- 新增前端服务方法，供后续 UI 或 owner/visitor 工具面板调用。
- 补充 Trellis spec、README / ARCHITECTURE / change note。
- 采用 TDD：先写失败测试，再实现。

### Out of scope / Not done

- 不自动确认或持久化 GM Layer 候选。
- 不接入外部 LLM，不生成完整剧情，不替店主创作酒馆内容。
- 不新增持久化 Schema 字段，不修改 `Tavern` / `TavernCharacter` / `WorldInfoEntry`。
- 不做战斗、等级、装备、排行榜或访客间社交。
- 不做完整 GM 可视化工作台；本切片只提供 API 与服务边界。

## Requirements

- 预览结果必须是 `preview_only=true`、`applied=false`。
- 所有候选卡必须：
  - `status="pending"`；
  - `canon_scope="visitor"`；
  - `fixed_canon=false`；
  - `metadata.requires_confirmation=true`；
  - 带有 `metadata.gm_layer="structured_conflict_v1"` 与 `metadata.preview_only=true`。
- GM Layer 只根据显式文本关键词抽取可观察摘要，不保存 chain-of-thought / hidden prompt。
- 访客只能预览自己的 `visitor_id`；店主可以为任意访客预览。
- 私密酒馆仍遵守现有可见性规则。
- 缺少用户身份或缺少回合文本时返回稳定错误。
- 前端必须通过 service helper 调用，不在组件中散落 raw `fetch`。

## Acceptance Criteria

- [x] Core helper 能从包含任务、钥匙/线索、强敌/风险/机会的文本中输出 GM Layer 候选，并保留 StateCard 兼容字段。
- [x] API `POST /api/v1/taverns/{id}/gm-layer/preview` 返回预览候选且不写入 `_state_cards`。
- [x] API 权限覆盖缺少身份、非店主代替其他访客、私密酒馆不可见。
- [x] 前端 native/product 服务均有 `previewGmLayer` helper，路径和请求体正确。
- [x] README、ARCHITECTURE、Trellis spec 和 changes 文档说明 preview-only / no-persistence 边界。
- [x] 验证命令记录在本文件和 `task.json` 中。

## Technical Notes

- 后端优先新增 `backend/src/fablemap_api/core/gm_layer.py`，复用 `extract_state_card_candidates_from_turn(...)`，避免复制分类规则。
- v1 路由放在 `backend/src/fablemap_api/api/v1/state_cards.py`，应用层放在 `application/services/state_cards.py`。
- 前端 route-client 方法放在 `frontend/app/lib/taverns.ts`，product parity 方法放在 `frontend/app/product/services/tavernService.js`。
- 测试：
  - `tests/test_tavern_gm_layer.py`
  - `backend/tests/test_v1_gm_layer.py`
  - `frontend/scripts/gm-layer-test.mjs`

## Verification Log

### RED（已观察预期失败）

```powershell
py -3 -m pytest -q tests/test_tavern_gm_layer.py backend/tests/test_v1_gm_layer.py --tb=short
```

结果：失败，`ModuleNotFoundError: No module named 'fablemap_api.core.gm_layer'`。

```powershell
node .\frontend\scripts\gm-layer-test.mjs
```

结果：失败，`TypeError: service.previewGmLayer is not a function`。

### GREEN / 完整验证

```powershell
py -3 -m pytest -q tests/test_tavern_gm_layer.py backend/tests/test_v1_gm_layer.py --tb=short
```

结果：`5 passed in 1.49s`。

```powershell
node .\frontend\scripts\gm-layer-test.mjs
```

结果：`gm-layer-test: ok`。

```powershell
py -3 -m compileall -q backend/src
```

结果：通过（无输出）。

```powershell
npm --prefix .\frontend test
```

结果：通过，包含 `gm-layer-test: ok`。

```powershell
npm --prefix .\frontend run typecheck
```

结果：通过。

```powershell
npm --prefix .\frontend run build
```

结果：通过。

```powershell
py -3 -m pytest -q --tb=short
```

结果：`517 passed, 103 warnings in 39.20s`。
