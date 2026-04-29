# State Card / Canon Ledger API Contract

> Backend contract for long-running tavern continuity records.

## Scope

Use this guide when changing:

- `backend/src/fablemap_api/core/state_cards.py`
- `backend/src/fablemap_api/core/tavern.py` `_state_cards` store methods
- `backend/src/fablemap_api/application/services/state_cards.py`
- `backend/src/fablemap_api/application/services/runtime.py` chat candidate generation
- `backend/src/fablemap_api/api/v1/state_cards.py`

## Contract

State cards are private runtime records stored in `TavernStore` under `_state_cards`.

```typescript
type StateCardCategory = "character" | "task" | "resource" | "conflict" | "event_log"
type StateCardStatus = "pending" | "confirmed" | "rejected" | "superseded"
type StateCardScope = "visitor" | "tavern"
```

Routes:

```http
GET /api/v1/taverns/{tavern_id}/state-cards
POST /api/v1/taverns/{tavern_id}/state-cards
PUT /api/v1/taverns/{tavern_id}/state-cards/{card_id}/decision
```

Chat responses may include:

```json
{
  "state_card_candidates": [
    {
      "category": "task",
      "status": "pending",
      "canon_scope": "visitor",
      "metadata": { "contradiction_candidate": false }
    }
  ]
}
```

## Rules

- AI/chat extraction creates `pending` candidates only.
- Candidate generation must not mutate `Tavern`, `TavernCharacter`, `WorldInfoEntry`, access rules, owner LLM config, or other owner-authored canon.
- Non-owner visitors may only create/decide their own `visitor` scope cards.
- `canon_scope=tavern` and `fixed_canon=true` are owner-only.
- `_state_cards` must be preserved across normal `TavernStore.update_tavern(...)`.
- `_state_cards` must not appear in public Tavern payloads or tavern package exports.
- Summaries must be observable summaries only; do not store chain-of-thought or hidden prompts.

## Validation matrix

| Case | Expected |
|------|----------|
| Chat mentions task/resource/event | Response includes pending task/resource/event_log candidates |
| Visitor confirms own pending card | Card becomes `confirmed`, `confirmed_by` is visitor ID |
| Other visitor decides card | 403 |
| Owner lists cards | Owner sees visible cards for the tavern |
| Tavern metadata update | `_state_cards` survive |
| Tavern package export | `_state_cards` absent |

## Required tests

```powershell
py -3 -m pytest -q tests/test_tavern_state_cards.py backend/tests/test_v1_state_cards.py --tb=short
py -3 -m compileall -q backend/src
```
