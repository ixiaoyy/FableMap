# 状态卡 Prompt 注入测试

## 概述

为 `tests/test_tavern_prompt_blocks.py` 新增测试，并在 PromptBuilder / 默认 Prompt Block 层加入状态卡格式化与注入支持，覆盖 `fixed_canon=true` 的 confirmed 状态卡注入到 AI Prompt 的局部行为。

## 改动内容

### 新增/修改内容

* `backend/src/fablemap_api/core/prompt_blocks.py`：新增内置 `state_cards` block 类型。
* `backend/src/fablemap_api/core/prompt_builder.py`：新增 `PromptBuildConfig.state_cards` 与 block 渲染逻辑。
* `backend/src/fablemap_api/core/state_cards.py`：新增 prompt 格式化 helper。
* `tests/test_tavern_prompt_blocks.py`：新增 focused builder/block 测试。

### 新增测试

| 测试 | 目标 |
|------|------|
| `test_state_cards_injected_into_prompt_when_configured` | confirmed+fixed_canon 卡会被注入到 prompt；fixed_canon=False 卡不会 |
| `test_state_cards_fixed_canon_filter` | 同时验证两个过滤条件：confirmed+fixed_canon 才注入；pending+fixed_canon 不会；confirmed+fixed_canon=False 不会 |
| `test_state_cards_render_empty_when_no_cards` | 无 confirmed+fixed_canon 卡时，prompt 中不出现任何状态卡内容 |
| `test_state_cards_block_respects_token_budget` | 多个 confirmed+fixed_canon 卡内容过长时，按 block token_budget 截断 |
| `test_state_cards_block_id_and_type` | state_cards block 的 id 和 type 正确 |

## 验证

- `py -3 -m pytest tests/test_tavern_prompt_blocks.py -v` → 9 passed
- `py -3 -m pytest tests/ --ignore=tests/test_api.py -q` → 266 passed（无回归）

## 风险

- 风险已降低：runtime chat / owner prompt preview 已接线，focused runtime 测试覆盖 store → PromptBuildConfig → PromptBuilder 路径。
- 剩余风险：尚未提交，仍需 review 确认无无关改动混入。
- 边界清晰：测试覆盖 confirmed/fixed_canon 双条件过滤、空状态、token budget 截断，并覆盖非 fixed confirmed 卡不会进入 runtime prompt。

## 2026-04-30 Runtime Wiring Follow-up

SC-03 已从局部 PromptBuilder 支持推进到 runtime 接线：

* `WebService._build_tavern_character_prompt(...)` 现在会从 `TavernStore.list_state_cards(...)` 读取 tavern `_state_cards` 并传入 `PromptBuildConfig.state_cards`。
* `WebService.preview_prompt_blocks_payload(...)` 与 `OwnerConfigApplicationMixin.preview_prompt_blocks(...)` 也会传入同一来源的状态卡。
* `PromptBuilder` 继续集中执行 `confirmed + fixed_canon` 过滤，普通 confirmed visitor 卡不会进入 prompt。
* 新增 runtime 回归测试先 RED 后 GREEN，验证真实聊天 prompt construction 会注入 fixed canon，同时排除非 fixed confirmed 卡。

验证：

* `py -3 -m pytest -q tests/test_tavern_prompt_blocks.py tests/test_tavern_state_cards.py --tb=short` → 12 passed
* `py -3 -m pytest -q --tb=short` → 533 passed, 103 warnings
* `py -3 -m compileall -q backend/src` → passed
* `npm --prefix .\frontend run build` → passed
