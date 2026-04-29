# Preset Import Preview UI Boundary

## Scope

Use this spec when changing the owner-facing preset import preview modal,
frontend preset import service methods, or script tests for the preview-only
contract.

## Service contract

Shared typed clients belong in `frontend/app/lib/taverns.ts`:

```typescript
previewPresetImport(tavernId, data, userId)
```

Product-parity helpers in `frontend/app/product/services/tavernService.js`
should expose the same `previewPresetImport(...)` method when product
components or script tests need it.

Endpoint:

```http
POST /api/v1/taverns/{tavern_id}/preset-import/preview
```

## UI contract

`PresetImportPreviewModal` must:

- Open only from owner surfaces (`TavernOwnerPanel` card actions or advanced
  tools), not visitor chat controls.
- Parse pasted JSON client-side and show a readable parse error before calling
  the API when JSON is invalid.
- State clearly that this is `preview only`: nothing is applied, saved, or
  overwritten.
- Show summary counts plus supported / warning / blocked groups.
- Surface blocked modules with reasons so the owner can recognize risks.
- Avoid showing owner API keys or secrets in UI copy.
- Keep loading and error states visible.

## Forbidden patterns

- Direct `fetch` inside owner UI components instead of service helpers.
- Copy implying imported presets are automatically applied to live tavern state.
- Applying prompt blocks, runtime presets, world info, characters, memory, State
  Cards, or skill packs from the preview modal.
- Visitor-facing controls for importing or previewing owner-private prompts.

## Required verification

```powershell
node frontend/scripts/preset-import-preview-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```
