# Verification

Date: 2026-05-13

## Fix summary

- Backend `send_chat` now detects generic/non-answer fallback replies and returns `is_fallback` plus `fallback_notice` in chat payloads.
- Fallback turns are persisted as chat messages but do **not** award affinity progress, create MemoryAtom entries, create StateCard candidates, or produce continuity conflict reports.
- Group-chat responses carry the same fallback marker; all-fallback group turns skip progress artifacts.
- Frontend chat progress builders return no progress signals when `is_fallback === true`, do not append fallback-created memories, and show an explicit retry/fallback notice instead of the green “本轮有推进” card.
- Updated Trellis specs for backend fallback truthfulness and frontend chat API gating.

## Commands run

```powershell
py -3 -m compileall -q backend/src
```

Result: passed.

```powershell
py -3 -m pytest -q backend/tests/test_v1_dynamic_npc_responses.py::test_rules_backend_non_answer_fallback_is_flagged_without_progress backend/tests/test_v1_dynamic_npc_responses.py::test_generic_llm_non_answer_template_is_flagged_without_progress --tb=short
```

Result: passed (`2 passed`).

```powershell
npm --prefix .\frontend test
```

Result: passed.

```powershell
npm --prefix .\frontend run build
```

Result: passed.

## Browser self-acceptance

Local React Router dev server: `http://127.0.0.1:5173`

Playwright mocked `/tavern/pw_lantern_helpdesk` so the chat API returned:

- `is_fallback: true`
- `fallback_notice`
- fake `created_memories`, `affinity.stage_changed`, and `state_card_candidates` artifacts that should be ignored by UI

Assertions on desktop `1440x1000` and mobile `390x844`:

- `@灯灯 你好` routed to `character_id: "lamp"`, `message: "你好"`, `display_message: "@灯灯 你好"`.
- Fallback assistant reply was visible.
- Explicit fallback notice was visible.
- `[data-conversation-progress-card]` count was `0`.
- No `记住了 N 件事` progress text was rendered.
- No browser console warnings/errors were captured.

Evidence files:

- `evidence/fallback-ui-check.mjs`
- `evidence/fallback-no-progress-browser-check.json`
- `evidence/fallback-no-progress-desktop.png`
- `evidence/fallback-no-progress-mobile.png`

## Broader regression note

```powershell
py -3 -m pytest -q backend/tests/test_v1_dynamic_npc_responses.py -q --tb=short
```

Result: failed in two existing identity/voice prompt contract tests:

- `test_runtime_prompt_injects_distinct_identity_and_voice_per_npc`
- `test_group_chat_prompt_uses_current_speaker_voice_contract`

The failures assert missing `你现在只能作为「...」回应` prompt text. This is outside the fallback-progress change; the two new fallback tests in the same file pass.

## Remaining risk

- Fallback detection is intentionally conservative. It covers the known rules fallback phrases and short generic English/Chinese non-answer templates; richer but low-quality LLM replies may need future classifier/policy work.
