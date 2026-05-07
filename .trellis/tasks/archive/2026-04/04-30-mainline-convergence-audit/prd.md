# Mainline Convergence Audit

## Goal

暂停新功能扩张，只验收并收敛 FableMap 当前唯一主链路：

> 创建空间 → 配置 NPC / LLM → 访客进入 → 对话 → 写回状态 / 记忆 → 回访展示

本任务不新增功能、不改 Schema、不移动/删除既有文档；先把现有功能按闭环程度分类，给后续冻结、修补、删除提供依据。

## Source / Trigger

用户指出当前最大风险不是“没有工程”，而是：功能和任务增长太快，主链路收敛太慢；大量 uncommitted changes 与 MVP / preview / presentational 任务会让产品像“AI 堆出来的功能地毯”。

## Scope

### Allowed

- 新增/更新本任务目录内审计文档：
  - `prd.md`
  - `mainline-audit.md`
  - `feature-classification.md`
  - `freeze-list.md`
- 读取主线权威文档、Trellis 任务、后端/前端代码和测试作为证据。
- 运行只读/验证命令。

### Not Allowed

- 不继续实现短剧、玩法模板、preview、presentational 任务。
- 不修改产品代码、Schema、API contract、图片资源或现有 `docs/` 文档。
- 不删除、移动、重命名既有文档或任务目录。
- 不将“冻结/删除建议”直接执行成代码删除；本轮只产出清单。

## Classification Buckets

1. **真闭环**：用户能实际完成，数据可持久化，可回访，有基础验证。
2. **半闭环**：某层已做，但缺 API / UI / 存储 / 回访 / 测试中的关键一环。
3. **纯展示**：只有页面、卡片、preview、mock 或研究材料，无真实数据闭环。
4. **应冻结 / 删除**：偏离主链路、增加复杂度、违反不做清单，或当前阶段收益低。

## Evidence Sources

- `README.md`
- `docs/INDEX.md`
- `docs/PRODUCT_BRIEF.md`
- `docs/FABLEMAP_TAVERN_PLATFORM.md`
- `docs/ARCHITECTURE.md`
- `docs/WORLD_SCHEMA.md`
- `docs/WHAT_NOT_TO_BUILD.md`
- `docs/AI参与开发协议.md`
- `.trellis/spec/guides/cross-layer-thinking-guide.md`
- `.trellis/spec/backend/quality-guidelines.md`
- `.trellis/spec/frontend/quality-guidelines.md`
- Relevant backend/frontend files and tests cited in the audit docs.

## Acceptance Criteria

- [x] Create a Trellis task for mainline convergence instead of continuing feature expansion.
- [x] Document the exact core-loop data flow with code/test evidence.
- [x] Classify active/recent feature tasks into the four buckets.
- [x] Produce an explicit freeze list and thaw conditions.
- [x] Record verification commands and outcomes.

## Verification Plan

Documentation/task metadata pass:

```powershell
py -3 .trellis/scripts/task.py validate .trellis/tasks/04-30-04-30-mainline-convergence-audit
```

Core-loop confidence pass, if time allows:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q tests/test_tavern_create_wizard_regression.py tests/test_tavern_visitor_state_api.py tests/test_tavern_memory_atoms.py backend/tests/test_v1_state_cards.py --tb=short
npm --prefix .\frontend test
```

`npm --prefix .\frontend run build` is not required by this docs-only task, but should be run by the next code-changing convergence patch.

## 2026-04-30 Verification Results

- `py -3 .trellis/scripts/task.py validate .trellis/tasks/04-30-04-30-mainline-convergence-audit` — passed after replacing stale `.claude/commands/trellis/*.md` context paths with existing `.agents/skills/*/SKILL.md` paths.
- `py -3 -m compileall -q backend/src` — passed (exit 0, no output).
- `py -3 -m pytest -q tests/test_tavern_create_wizard_regression.py tests/test_tavern_visitor_state_api.py tests/test_tavern_memory_atoms.py backend/tests/test_v1_state_cards.py --tb=short` — passed (`10 passed in 1.78s`).
- `npm --prefix .\frontend test` — passed (all configured frontend script tests printed `ok` / passed; exit 0).

Not run:

- `npm --prefix .\frontend run build` — not required for this docs-only audit because no frontend source changed. Run it for the next code-changing convergence patch.
