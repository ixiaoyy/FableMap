# Implementation — AI Assisted Tavern Drafts

## Summary

Implemented owner-confirmed AI-assisted tavern drafts for the `/create` flow. Draft generation uses the current owner default LLM configuration, returns a structured tavern + first-NPC draft, and only fills the create form. It does not create or publish Tavern / Character records until the owner clicks `创建空间`.

## Files changed

### Backend

- `backend/src/fablemap_api/domain/owner_llm_policy.py`
  - Normalizes and masks owner default LLM config.
  - Normalizes draft requests and sanitizes LLM draft JSON.
- `backend/src/fablemap_api/infrastructure/owner_config_store.py`
  - Adds JSON-backed `OwnerConfigStore` abstraction for MVP persistence.
  - Route / React code do not reference `owner_configs.json` directly.
- `backend/src/fablemap_api/application/taverns.py`
  - Wires `OwnerConfigStore` into `TavernApplicationService`.
- `backend/src/fablemap_api/main.py`
  - Creates the owner config store from `settings.output_root / "owner_configs.json"`.
- `backend/src/fablemap_api/application/services/owner_config.py`
  - Adds owner default LLM read/save.
  - Adds tavern draft generation using `core.llm_clients.create_client`.
  - Requires non-empty `X-User-Id`; no default owner fallback for these endpoints.
- `backend/src/fablemap_api/api/v1/owners.py`
  - Exposes:
    - `GET /api/v1/owners/me/default-llm`
    - `PUT /api/v1/owners/me/default-llm`
    - `POST /api/v1/owners/me/tavern-drafts/generate`
- `tests/test_ai_assisted_tavern_drafts.py`
  - Covers config persistence, owner isolation, API key masking, missing user ID, missing LLM config failure, successful draft generation without persistence, and invalid LLM JSON failure.

### Frontend

- `frontend/app/lib/taverns.ts`
  - Adds owner default LLM and tavern draft API helpers.
- `frontend/app/lib/tavern-drafts.js`
  - Adds request normalization and draft-to-create-form mapping helpers.
- `frontend/scripts/ai-tavern-drafts-test.mjs`
  - Covers draft request normalization and form mapping.
- `frontend/package.json`
  - Adds the new helper test to `npm test`.
- `frontend/app/routes/create.tsx`
  - Adds the `AI 辅助草稿` panel.
  - Allows checking/saving owner default LLM config.
  - Collects style tags, forbidden directions, and tone.
  - Generates a draft and fills the existing create form only.
- `frontend/app/components/NeighborhoodRumorBubble.tsx`
  - Fixed a pre-existing invalid Python-style triple-quote header that blocked production build.

## Validation

- `node frontend/scripts/ai-tavern-drafts-test.mjs` → passed.
- `npm --prefix .\frontend test` → passed.
- `npm --prefix .\frontend run typecheck` → passed (after fixing `LLMConfigForm` controlled props).`r`n- `npm --prefix .\frontend run build` → passed.
- `py -3 -m compileall -q backend/src` → passed (`compileall: ok`).
- `py -3 -m pytest -q tests/test_ai_assisted_tavern_drafts.py --tb=short` → passed (`7 passed`).
- `rg "logger\..*api_key|print\(.*api_key" backend/src frontend/app tests` → no matches.

## Spec updates`r`n`r`n- Added backend code-spec scenario: `.trellis/spec/backend/database-guidelines.md` → `Owner Default LLM Config Store`.`r`n- Added frontend code-spec scenario: `.trellis/spec/frontend/type-safety.md` → `Create-Page AI Tavern Draft Boundary`.`r`n`r`n## Follow-up

- JSON persistence is MVP-only. Long-term dynamic owner config should move behind the same `OwnerConfigStore` interface to a DB-backed store.
- No browser manual test was run in this session; production build and script tests passed.