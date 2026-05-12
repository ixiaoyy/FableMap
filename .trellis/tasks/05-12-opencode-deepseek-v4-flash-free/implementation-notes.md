# Implementation Notes

## External source checked
- 2026-05-12: OpenCode Zen docs list `DeepSeek V4 Flash Free` model id `deepseek-v4-flash-free` on `https://opencode.ai/zen/v1/chat/completions` and describe it as limited-time free.

## Decisions
- Reused the existing `custom` OpenAI-compatible backend instead of adding a new persistent backend enum. The configured base URL is `https://opencode.ai/zen`, which the existing custom adapter expands to `/v1/chat/completions`.
- Removed the committed Kilo credential from `backend/config/system_public_welfare_llm.json` and added `api_key_env: OPENCODE_API_KEY`.
- Preserved system/public-welfare hydration for legacy managed markers (`kilo-auto/free`, `glm-4.7-flash`) so existing public-welfare records can migrate to the current OpenCode model without ordinary user taverns inheriting a system key.
- If `OPENCODE_API_KEY` is absent, system/public-welfare spaces keep the local `rules` fallback and do not consume external-token accounting.

## Verification
- `py -3 -m compileall -q backend/src` — passed.
- `py -3 -m pytest -q backend/tests/test_v1_runtime_features.py::test_v1_public_welfare_seed_chat_uses_system_public_welfare_llm backend/tests/test_v1_runtime_features.py::test_v1_public_welfare_default_rules_marker_is_not_reported_to_visitors backend/tests/test_v1_runtime_features.py::test_v1_public_welfare_uses_versioned_opencode_config_when_free_model_is_selected --tb=short` — passed, 3 tests.
- `node .\frontend\scripts\llm-config-presets-test.mjs` — passed.
- `npm --prefix .\frontend test` — failed before reaching this slice's preset test at existing `frontend/scripts/mini-games-test.mjs:12`, `9 !== 6`.
- `npm --prefix .\frontend run build` — failed at existing `frontend/app/routes/discover.tsx?__react-router-build-client-route:1206`, `Unexpected token` around `onPublicOnlyChange`.
- `rg -n "eyJhbGci|api\.kilo|kilo-auto/free|Kilo" backend\config -S` — no matches.
