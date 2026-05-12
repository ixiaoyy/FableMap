# Replace public welfare free LLM with OpenCode DeepSeek V4 Flash Free

## Goal
Replace the current Kilo free-model route with an OpenCode Zen DeepSeek V4 Flash Free calling option for FableMap's owner-selectable/free/public-welfare LLM path.

## Requirements
- Expose an OpenCode/OpenAI-compatible preset using OpenCode Zen's `deepseek-v4-flash-free` model through the existing `custom` backend route.
- Replace the current Kilo free preset/fallback references in frontend creation/config UI with OpenCode DeepSeek V4 Flash Free.
- Replace the versioned system/public-welfare LLM config so system/public-welfare taverns can hydrate to OpenCode when a project environment API key is configured.
- Do not commit or expose a provider API key; use an environment variable contract instead.
- Preserve the existing `public_welfare` marker behavior for ordinary taverns: no owner key means rules fallback/degraded flow remains available, and ordinary user taverns must not inherit system credentials.
- Keep persisted legacy free-model markers (`kilo-auto/free`, previous managed free marker) compatible for system/public-welfare taverns where feasible.
- Update focused backend/frontend regression tests and Trellis spec notes that mention the managed free model.

## Acceptance Criteria
- [x] OpenCode DeepSeek V4 Flash Free preset/model metadata is available in the frontend LLM config choices.
- [x] Frontend free-model preset no longer recommends Kilo; it recommends OpenCode DeepSeek V4 Flash Free with limited-free caveat.
- [x] Create flows use `public_welfare` + `deepseek-v4-flash-free` as the free/demo marker instead of `kilo-auto/free`.
- [x] `backend/config/system_public_welfare_llm.json` contains no committed provider secret and points to OpenCode Zen chat completions via environment API key.
- [x] System/public-welfare hydration tests prove the versioned OpenCode config is used when the env key is set.
- [x] Focused frontend preset test expects OpenCode DeepSeek V4 Flash Free.
- [x] Validation commands and any pre-existing failures are recorded.

## Source / Current External Fact Check
- OpenCode Zen docs (checked 2026-05-12) list `DeepSeek V4 Flash Free` with model id `deepseek-v4-flash-free` and endpoint `https://opencode.ai/zen/v1/chat/completions`.
- The same docs state the free model is available for a limited time and may collect feedback/model-improvement data during the free period.

## Scope
Allowed modifications:
- `backend/config/system_public_welfare_llm.json`
- `backend/src/fablemap_api/core/llm_clients.py`
- `backend/src/fablemap_api/core/tavern.py`
- focused backend tests around public-welfare runtime config
- `frontend/app/product/LLMConfigForm.jsx`
- `frontend/app/product/TavernCreatePanel.jsx`
- `frontend/app/routes/create.tsx`
- focused frontend script tests around LLM presets
- `.trellis/spec/backend/database-guidelines.md`
- this task directory

Out of scope / do not modify:
- No platform billing/recharge/token-market implementation.
- No schema field additions for Tavern/LLMConfig beyond runtime config loading support.
- No unrelated UI redesign or public-welfare tavern content changes.
- Do not touch existing unrelated uncommitted work (`personalityTemplates`, visual audit files, soul-link artboards, etc.).

## Validation Plan
- `py -3 -m compileall -q backend/src`
- Focused pytest for public-welfare runtime tests in `backend/tests/test_v1_runtime_features.py`
- `node .\frontend\scripts\llm-config-presets-test.mjs`
- If feasible, `npm --prefix .\frontend test` and `npm --prefix .\frontend run build`; report any unrelated existing failures separately.


