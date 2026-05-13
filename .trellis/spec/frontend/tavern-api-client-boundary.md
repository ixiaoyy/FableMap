# Tavern API Client Boundary

> Frontend contract for consuming page-optimized tavern API responses.

## Scenario: Route modules consume additive tavern response views

### 1. Scope / Trigger

Use this when changing `frontend/app/lib/taverns.ts`, native route loaders, or route-level page data for homepage, discovery/search, or tavern entry. Backend details are defined in `../backend/tavern-api-response-contract.md`.

### 2. Signatures

```typescript
export type TavernDetailView = "entry"

export type TavernListResponse = {
  taverns: Tavern[]
  count: number
  total?: number | null
  limit?: number | null
  offset?: number
  has_more?: boolean
}

export function getTavern(
  tavernId: string,
  userId?: string,
  options?: { view?: TavernDetailView },
): Promise<Tavern>
```

### 3. Contracts

- Route modules must call `frontend/app/lib/taverns.ts` helpers rather than ad hoc `fetch`.
- Default `getTavern(tavernId, userId)` must remain a full/default detail request for existing callers.
- Tavern entry route must request `getTavern(tavernId, currentUserId, { view: "entry" })`.
- `TavernListResponse` consumers must keep reading `taverns` and `count`; metadata fields are optional/additive.
- UI must not depend on owner-hidden fields (`system_prompt`, `world_info`, prompt blocks, draft gameplay nodes) being present in visitor entry responses.
- Treat TypeScript as a boundary aid, not a runtime guarantee; route code must tolerate missing/empty arrays and loader errors as existing components already do.

### 4. Validation & Error Matrix

| Case | Expected |
|------|----------|
| Existing caller uses `getTavern(id, userId)` | URL has no `view` query |
| Tavern entry route loads | URL includes `view=entry` through the service helper |
| List response omits additive metadata | UI still works from `taverns` and `count` |
| List response includes metadata | UI may use `total`, `limit`, `offset`, `has_more` defensively |
| Component accesses hidden prompt fields on visitor entry payload | Bad; entry response intentionally redacts them |
| Route directly calls `fetch('/api/v1/taverns...')` | Bad; service helper boundary is bypassed |

### 5. Good/Base/Bad Cases

- Good: `queryString({ view: options.view })` is centralized inside `getTavern`.
- Base: optional metadata is typed optional so older/legacy responses remain accepted.
- Bad: route constructs query strings manually and forgets `encodeURIComponent`/identity headers.

### 6. Tests Required

```powershell
node .\frontend\scripts\tavern-chat-workbench-test.mjs
node .\frontend\scripts\tavern-entry-surface-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

Required assertion points:

- service exposes `TavernDetailView = "entry"`;
- service appends `view` via `queryString`;
- tavern route uses `currentUserId` and `{ view: "entry" }`;
- no route/component direct-fetch duplicate of the same API call.

### 7. Wrong vs Correct

#### Wrong

```tsx
const tavern = await readApiJson(`/api/v1/taverns/${tavernId}?view=entry`)
```

This duplicates service behavior and can lose viewer identity.

#### Correct

```tsx
const tavern = await getTavern(tavernId, currentUserId, { view: "entry" })
```

## Scenario: Chat fallback payload must not render progress badges

### 1. Scope / Trigger

Use this when changing `ChatResponse`, `GroupChatResponse`, `TavernChatWorkbench`, or legacy tavern chat panels that consume `/api/v1/taverns/{id}/chat`.

### 2. Signatures

```typescript
export type ChatResponse = {
  response: string
  is_fallback?: boolean
  fallback_notice?: string
  affinity?: AffinityResult | null
  created_memories?: unknown[]
  state_card_candidates?: StateCard[]
}
```

### 3. Contracts

- If `is_fallback === true`, frontend must not render `本轮有推进`, `记住了 N 件事`, relationship-stage progress, or state-card progress for that turn.
- `progressSignalsFromChatResult(result)` must return `[]` for fallback results even if backend/mock payload accidentally includes `created_memories`, `affinity`, or `state_card_candidates`.
- Fallback responses should show `fallback_notice` or equivalent retry copy near the assistant message instead of a green progress card.
- Local/legacy memory panels must only append `created_memories` when `is_fallback !== true`.

### 4. Validation

```powershell
node .\frontend\scripts\conversation-beats-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run build
```

For visible chat UI changes, run a Playwright self-check that mocks a fallback chat response containing fake progress artifacts and asserts `[data-conversation-progress-card]` is absent on desktop and mobile.
