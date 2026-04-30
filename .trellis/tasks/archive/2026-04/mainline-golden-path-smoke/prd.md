# Mainline Golden Path Smoke

## Goal

Add the smallest real backend verification for the current FableMap mainline:

> create tavern with real coordinates → configure NPC / LLM-compatible rules backend → visitor enters → visitor chats → chat history, visitor state, memory/state-card writeback, and owner-visible revisit feedback are retrievable.

## Source

- Parent recommendation: `.trellis/tasks/04-30-04-30-mainline-convergence-audit/mainline-audit.md`
- User decision: pause new feature growth and converge on the core loop.

## Scope

Allowed:

- Add one focused pytest smoke test under `tests/`.
- If the test exposes a real mainline gap, make the smallest backend fix required for the test.
- Update this PRD with TDD and verification results.

Not allowed:

- No new schema fields.
- No frontend UI polish.
- No short-drama/gameplay/preview/media expansion.
- No external LLM call; use the existing rules/local backend path.
- No broad refactor or unrelated formatting.

## Expected Golden Path Assertions

The smoke should prove:

1. `POST /api/v1/taverns` creates a real-coordinate tavern owned by the requester.
2. Tavern starts `open` when rules/local LLM config is configured.
3. `POST /api/v1/taverns/{id}/characters` persists at least one NPC.
4. `POST /api/v1/taverns/{id}/enter` returns a visitor state with `visit_count >= 1`.
5. `POST /api/v1/taverns/{id}/chat` returns an assistant response without external provider credentials.
6. Chat response returns updated `visitor_state` plus `created_memories` and/or `state_card_candidates` evidence.
7. `GET /api/v1/taverns/{id}/chat` retrieves persisted messages.
8. `GET /api/v1/taverns/{id}/memory-atoms` retrieves visitor-scoped memory if created.
9. `GET /api/v1/taverns/{id}/state-cards` retrieves pending visitor candidates if created.
10. `GET /api/v1/taverns/{id}/visitors` lets the owner see the visitor’s revisit state and message count.

## TDD Plan

1. Write `backend/tests/test_v1_mainline_golden_path_smoke.py` first.
2. Run the new test and confirm it fails for the expected missing coverage/gap.
3. Implement the smallest backend change only if needed.
4. Re-run the focused test until green.
5. Run backend compile and relevant existing focused tests.

## Verification Commands

```powershell
py -3 -m pytest -q backend/tests/test_v1_mainline_golden_path_smoke.py --tb=short
py -3 -m compileall -q backend/src
py -3 -m pytest -q tests/test_tavern_create_wizard_regression.py tests/test_tavern_visitor_state_api.py tests/test_tavern_memory_atoms.py backend/tests/test_v1_state_cards.py backend/tests/test_v1_mainline_golden_path_smoke.py --tb=short
py -3 .trellis/scripts/task.py validate .trellis/tasks/04-30-mainline-golden-path-smoke
```


## 2026-04-30 TDD Notes

- Wrote `backend/tests/test_v1_mainline_golden_path_smoke.py` before touching production code.
- Ran `py -3 -m pytest -q backend/tests/test_v1_mainline_golden_path_smoke.py --tb=short` immediately after writing it.
- Result: passed (`1 passed in 1.11s`). This means the desired backend mainline behavior already exists; no production code change was needed.
- Because there was no production code change, the TDD red/green implementation step stopped at characterization coverage rather than forcing an artificial code edit.

## 2026-04-30 Verification Results

- `py -3 -m pytest -q backend/tests/test_v1_mainline_golden_path_smoke.py --tb=short` — passed (`1 passed in 1.11s`) immediately after writing the smoke test.
- `py -3 -m pytest -q backend/tests/test_v1_mainline_golden_path_smoke.py tests/test_tavern_create_wizard_regression.py tests/test_tavern_visitor_state_api.py tests/test_tavern_memory_atoms.py backend/tests/test_v1_state_cards.py --tb=short` — passed (`11 passed in 1.75s`).
- `py -3 .trellis/scripts/task.py validate .trellis/tasks/04-30-mainline-golden-path-smoke` — passed (implement/check/debug context files valid).
- `py -3 -m compileall -q backend/src` — passed (`compileall backend/src: ok`).

Not run:

- `npm --prefix .\frontend test` and `npm --prefix .\frontend run build` — not required for this backend-test-only change because no frontend source changed.

## 2026-04-30 Playwright Browser Simulation

- Ran a Playwright-driven browser simulation against the built frontend served by the backend at `http://127.0.0.1:8951`.
- Result: passed. Browser form creation, tavern page navigation, visitor enter/chat/writeback/revisit, and owner-visible visitor feedback all verified. After the initial system-Chrome run, the flow was rerun with the existing Playwright-managed Chromium cache at `%LOCALAPPDATA%\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe`.
- Report: `.trellis/tasks/04-30-mainline-golden-path-smoke/playwright-mainline-report.json`.
- Summary: `.trellis/tasks/04-30-mainline-golden-path-smoke/playwright-simulation.md`.
- Runtime screenshots are in `.trellis/tmp/playwright-mainline/evidence/`.
## 2026-04-30 Playwright Managed Chromium Rerun

- Installed Playwright-managed Chromium through local proxy `http://127.0.0.1:7890` after identifying that previous install attempts had cleared `HTTP_PROXY/HTTPS_PROXY`.
- Reran the browser simulation with the newly installed managed Chromium at `%LOCALAPPDATA%\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- Result: passed. Latest report: `.trellis/tasks/archive/2026-04/mainline-golden-path-smoke/playwright-mainline-report.json`.
- Latest run tavern: `tavern_53e992f5a4f8`; writeback: `memoryAtoms=4`, `pendingStateCards=3`; revisit: `visit_count=2`.

