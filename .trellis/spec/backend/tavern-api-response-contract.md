# Tavern API Response Contract

> Executable response contract for page-based `/api/v1/taverns` optimization slices.

## Scenario: Page-based tavern response optimization

### 1. Scope / Trigger

Use this when changing tavern list/detail response shapes, route query parameters, frontend route loaders, or public/visitor redaction for:

- `backend/src/fablemap_api/api/v1/taverns.py`
- `backend/src/fablemap_api/application/services/management.py`
- `backend/src/fablemap_api/core/tavern.py`
- `frontend/app/lib/taverns.ts`
- route modules such as `frontend/app/routes/home.tsx`, `discover.tsx`, and `tavern.tsx`

The rollout is page-based and additive. Do not introduce a global `{ data, meta }` envelope from a page slice.

### 2. Signatures

```http
GET /api/v1/taverns?q=&search=&access=&status=&place_type=&special_type=&limit=&offset=
GET /api/v1/taverns/{tavern_id}
GET /api/v1/taverns/{tavern_id}?view=entry
```

```python
TavernManagementApplicationMixin.list_taverns(..., limit: int | None = None, offset: int = 0) -> dict[str, Any]
TavernManagementApplicationMixin.get_tavern(tavern_id: str, user_id: str = "", view: str = "") -> dict[str, Any]
TavernService.get_tavern(tavern_id: str, user_id: str = "", view: str = "") -> dict[str, Any]
Tavern.to_dict_entry() -> dict[str, Any]
```

```typescript
listTaverns(filters?: TavernListFilters): Promise<TavernListResponse>
getTavern(tavernId: string, userId?: string, options?: { view?: "entry" }): Promise<Tavern>
```

### 3. Contracts

#### List response

- Preserve existing shape: `{"taverns": [...], "count": returned_count}`.
- Add pagination metadata only additively: `total`, `limit`, `offset`, `has_more`.
- `count` is the number of returned rows after pagination.
- `total` is the number after filters and before pagination.
- `limit` is normalized to a bounded value; `null` means unbounded legacy behavior.
- `offset` is normalized to a non-negative integer.
- `search` is an alias for `q`; if both are present, `q` wins.
- `place_type` and `special_type` filters must use the same normalization as persisted tavern fields.
- Home remains excluded from public discovery/list results unless owner-scoped behavior explicitly includes it.

#### Detail response

- Default `GET /api/v1/taverns/{id}` remains backward-compatible for existing full-detail callers.
- `view=entry` is explicit and additive. It returns a slim public-safe shape for first render and sets `response_view: "entry"`.
- `view=entry` must preserve tavern visibility checks; private taverns still require owner identity.
- Entry payload may include public identity/copy/coordinates/access/status/roleplay/layout/place/special type, safe character first-render fields, safe LLM backend mode, and published gameplay summaries.
- Entry payload must not include owner-hidden authoring data, provider secrets, prompt blocks, world info, private memory policies, draft gameplay node graphs, private visitor state, transcripts, password hashes, or raw provider payloads.

#### Response-time SLA

- Page-critical endpoints in a child slice must be measured locally.
- `max <= 1s` is `PASS_UNDER_1S`.
- `max > 1s` must be recorded as `待优化` / `PENDING_OPTIMIZATION_OVER_1S`; do not hide it behind a green build.

### 4. Validation & Error Matrix

| Case | Expected |
|------|----------|
| List with no `limit` | Existing callers still receive all visible rows plus additive metadata |
| List with `limit=12&offset=0` | Returns at most 12 rows; `count <= 12`, `total >= count`, `has_more` reflects remaining rows |
| `search` without `q` | Filters like `q` |
| Both `q` and `search` | `q` takes precedence |
| `place_type=cafe&status=open` | Only matching public open cafes are returned |
| Public list includes Home | Bad; Home is not publicly discoverable by default |
| Default detail request | Full/default response remains compatible; no `response_view: entry` requirement |
| Entry detail request | `response_view == "entry"` and first-render fields exist |
| Entry includes `system_prompt`, `mes_example`, `world_info`, raw `nodes`, or provider secrets | Bad; test must fail |
| Private tavern entry requested by non-owner | `403` using stable error envelope |
| Any measured page-critical endpoint max > 1s | Mark child task `PENDING_OPTIMIZATION_OVER_1S` / `待优化` |

### 5. Good/Base/Bad Cases

- Good: `frontend/app/routes/tavern.tsx` calls `getTavern(tavernId, currentUserId, { view: "entry" })`, and the backend routes through service/core helpers to build a redacted entry view.
- Base: default `getTavern(tavernId, userId)` still hits `/api/v1/taverns/{id}` without query params.
- Good: list pages request bounded counts with `limit` and tolerate additive metadata.
- Bad: wrapping list/detail responses in a new global envelope without migrating every caller and test.
- Bad: building entry redaction in the frontend after the backend has already exposed hidden prompt fields to visitors.

### 6. Tests Required

For backend/list/detail contract changes:

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q backend/tests/test_api_smoke.py backend/tests/test_v1_place_home_mvp.py --tb=short
```

For route/client changes:

```powershell
node .\frontend\scripts\tavern-entry-surface-test.mjs
node .\frontend\scripts\tavern-chat-workbench-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

Required assertion points:

- list response metadata preserves `taverns` + `count` compatibility;
- discover filters are additive and do not expose Home;
- default detail remains compatible;
- `view=entry` redacts hidden prompt/config fields;
- route loader uses the typed service helper, not ad hoc `fetch`;
- response-time evidence records max/mean/p95 and SLA status.

### 7. Wrong vs Correct

#### Wrong

```python
# Visitor endpoint returns the full authoring payload and relies on the browser to hide it.
return tavern.to_dict_public()
```

#### Correct

```python
entry_view = str(view or "").strip().lower() == "entry"
return tavern.to_dict_entry() if entry_view else tavern.to_dict_public()
```

#### Wrong

```tsx
const response = await fetch(`/api/v1/taverns/${tavernId}`)
const tavern = await response.json()
```

#### Correct

```tsx
const tavern = await getTavern(tavernId, currentUserId, { view: "entry" })
```
