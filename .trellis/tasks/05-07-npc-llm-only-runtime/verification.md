# Verification

- `py -3 -m pytest -q backend/tests/test_v1_runtime_features.py::test_v1_public_welfare_seed_chat_uses_system_public_welfare_llm backend/tests/test_v1_runtime_features.py::test_v1_public_welfare_default_rules_marker_is_not_reported_to_visitors backend/tests/test_v1_runtime_features.py::test_v1_llm_failure_does_not_return_local_rules_npc_reply backend/tests/test_v1_runtime_features.py::test_v1_user_tavern_without_llm_reports_configuration_mode --tb=short` → red before implementation: 4 failed; green after implementation: 4 passed.
- `py -3 -m pytest -q backend/tests/test_v1_runtime_features.py tests/test_tavern_llm_degradation.py tests/test_default_public_welfare_taverns.py tests/test_public_welfare_runtime_config.py --tb=short` → 55 passed, 4 warnings (existing `datetime.utcnow()` deprecation warning in MySQL test store).
- `py -3 -m compileall -q backend/src` → passed.
- `npm --prefix .\frontend test -- --runInBand` → passed (script suite ignores extra arg but completed all configured frontend contract scripts).
- `npm --prefix .\frontend run build` → passed.

## Follow-up: remove chat prompt banners

- User clarified no informational prompt/banner is needed in the chat area.
- Removed native workbench `notice` state/rendering for entry/password/successful chat/response_mode guidance; only hard request errors still render in the error style.
- Verification:
  - `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed.
  - `npm --prefix .\frontend run build` → passed.
- Re-ran after cleanup: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed; `npm --prefix .\frontend run build` → passed.

## Follow-up: no visible history replay + per-NPC entrance reactions

- User confirmed: do not keep previous context in chat area; keep memory/history in backend only.
- Native tavern workbench now stops loading `getTavernChatHistory` on entry and seeds only fresh, non-persisted entrance reaction bubbles for all NPCs in the current space.
- Verification:
  - Red first: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` failed on missing no-history/no-entrance-reaction assertions.
  - Green: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed.
  - `npm --prefix .\frontend run build` → passed.
  - Playwright desktop/mobile self-check against `http://127.0.0.1:5173/tavern/pw_lantern_helpdesk` → passed; screenshots:
    - `.trellis/tasks/05-07-npc-llm-only-runtime/evidence/entrance-reactions-desktop.png`
    - `.trellis/tasks/05-07-npc-llm-only-runtime/evidence/entrance-reactions-mobile.png`

## Follow-up: sync legacy chat surfaces

- User confirmed the same no-visible-history / per-NPC entrance reaction rule should apply to legacy chat surfaces too.
- Synchronized:
  - `frontend/app/product/TavernChatRoom.jsx`: removed visible single/group history replay; seeds fresh local entrance reactions for all NPCs.
  - `frontend/app/product/TavernInterior.jsx`: removed visible history replay; seeds fresh local entrance reactions after successful enter.
  - `frontend/app/features/tavern-chat/index.tsx`: replaces informational entry notice with local per-NPC entrance reactions.
- Verification:
  - Red first: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` failed on legacy history replay assertions.
  - Green: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed.
  - `npm --prefix .\frontend run build` → passed.
  - `npm --prefix .\frontend test` → passed.
  - `npm --prefix .\frontend run typecheck` → passed.

## Follow-up: public channel + NPC private chat

- User confirmed option A: enter a tavern into the public chat channel; clicking an NPC opens that NPC private chat; public composer supports `@NPC名`; shopkeeper guides visitors and points to tasks when `gameplay_definitions` exists.
- Implemented native Workbench public/private channel model and synchronized the legacy product chat room markers/behavior.
- Verification:
  - Red first: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` failed on missing public/private channel assertions.
  - Green: `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed.
  - `npm --prefix .\frontend run typecheck` → passed.
  - `npm --prefix .\frontend run build` → passed.
  - `npm --prefix .\frontend test` → passed.
  - Playwright desktop/mobile self-check against `http://127.0.0.1:5173/tavern/pw_lantern_helpdesk` → passed; screenshots:
    - `.trellis/tasks/05-07-npc-llm-only-runtime/evidence/public-private-chat-desktop.png`
    - `.trellis/tasks/05-07-npc-llm-only-runtime/evidence/public-private-chat-mobile.png`

## Pre-commit verification

- User requested git commit + push.
- Fresh verification before commit:
  - `node .\frontend\scripts\tavern-chat-workbench-test.mjs` → passed.
  - `py -3 -m compileall -q backend/src` → passed.
  - `py -3 -m pytest -q backend/tests/test_v1_runtime_features.py tests/test_tavern_llm_degradation.py tests/test_default_public_welfare_taverns.py tests/test_public_welfare_runtime_config.py --tb=short` → 55 passed, 4 warnings.
  - `npm --prefix .\frontend run typecheck` → passed.
  - `npm --prefix .\frontend run build` → passed.
  - `npm --prefix .\frontend test` → passed.
