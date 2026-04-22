# Frontend Component Guidelines

> How React components are built in FableMap.

---

## Overview

Components are function components in both `.tsx` route modules under `frontend/app/` and `.jsx` files under `frontend/app/product/`. New product routes use React hooks, Tailwind CSS utilities, Radix primitives, and owned UI components from `frontend/app/ui/`.

Preferred shape:

```javascript
export default function ComponentName({ value = '', onChange, disabled = false }) {
  const [draft, setDraft] = useState(() => normalizeDraft(value))
  // derived state with useMemo; effects only for sync/side effects
  return <section className="domain-panel">...</section>
}
```

---

## Component structure

Use this order where practical:

1. Imports.
2. Module constants and pure helper functions.
3. Small local subcomponents used only in this file.
4. Main exported component.
5. Large local subcomponents if extracting would not yet help.

Examples:

- `frontend/app/product/App.jsx`: imports, constants, route/search helpers, then `export default function App()`.
- `frontend/app/product/ChatPanel.jsx`: local `ChatBubble`, `CharacterHeader`, `ChatInput`, then exported `ChatPanel`.
- `frontend/app/product/TavernOwnerPanel.jsx`: owner-specific helper functions and subcomponents live with the owner panel.

---

## Props conventions

- Destructure props in the function signature.
- Provide safe defaults for optional arrays/objects/booleans.
- Callback props should be named `onX`, e.g. `onSave`, `onClose`, `onStart`, `onResume`.
- Keep service instances or IDs explicit: examples include `ownerId`, `visitorId`, `tavernId`.
- Do not rely on implicit globals for user identity or API base.

Example from existing code:

```javascript
export default function TavernGameplayLauncher({
  gameplays = [],
  activeSessions = [],
  busy = false,
  onStart,
  onResume,
}) { ... }
```

---

## Draft/editing patterns

Editors should normalize incoming values into a local draft, then emit cleaned payloads.

Examples:

```javascript
function normalizeCharacterDraft(character = {}) {
  return {
    id: character.id || '',
    name: toText(character.name),
    tags_text: listToTags(character.tags),
    sprites: cleanSpriteMap(character.sprites),
  }
}
```

```javascript
export function normalizeCharacterPayload(draft) {
  const payload = {
    name: draft.name.trim(),
    tags: splitTags(draft.tags_text),
    sprites: cleanSpriteMap(draft.sprites),
  }
  if (draft.id) payload.id = draft.id
  return payload
}
```

Follow this pattern for owner-editable tavern, character, gameplay, prompt, memory, or rule configuration.

---

## Styling patterns

### Product UI direction after enterprise refactor

FableMap is not an admin dashboard. New UI should feel like a consumer/creator cyber-tavern product:

- Application framework: React Router Framework Mode.
- UI direction: owned design-system components in `frontend/app/ui/`, with future Radix/shadcn-style primitives as needed.
- Avoid Ant Design/admin-template defaults unless a future decision explicitly changes the product UI direction.

- Use CSS class names and existing product CSS (`frontend/app/product/styles.css`) or focused domain CSS (`tavernGameplay.css`, `tavernMiniGames.css`).
- Reuse existing class vocabulary where possible: `panel`, `card`, `note`, `muted`, `primary`, `secondary`, `form-grid`, `mini-label`, etc.
- Tailwind CSS and Radix/shadcn-style owned primitives are approved for `frontend/app/`; do not introduce additional UI frameworks, CSS-in-JS systems, or global resets without a new decision.
- UI changes should remain usable on narrow screens; prefer wrapping grids, stacked controls, and readable touch targets.

---

## Accessibility and UX

- Inputs should have labels or visible text context.
- Buttons should have clear text; icon-only controls need accessible labels if introduced.
- Disabled/busy states should be explicit (`disabled={busy}` and visible status text).
- Error messages should be user-readable and not expose secrets or raw backend traces.
- For advanced/raw JSON controls, hide complexity behind `<details>` when possible, as in `GameplayDefinitionEditor.jsx`.

---

## Real examples to follow

1. `frontend/app/product/CharacterEditor.jsx`: form draft normalization, completion preview, template filtering, and controlled inputs.
2. `frontend/app/product/GameplayDefinitionEditor.jsx`: simple owner-friendly fields plus advanced JSON in `<details>`; default forbidden items avoid sensitive/dangerous actions.
3. `frontend/app/product/GameplaySessionPanel.jsx`: visitor-facing session panel with choice/free-text handlers and busy state.
4. `frontend/app/product/ChatPanel.jsx`: separates chat bubble/header/input helpers from main chat panel props.

---

## Common mistakes

- Passing raw backend payloads through multiple components and mutating them in place.
- Adding direct `fetch` calls inside presentational components.
- Creating a generic component that knows too much about Tavern schema and unrelated world-map state.
- Adding desktop-only modals/panels without narrow-screen consideration.
- Replacing owner-authored content with platform-generated defaults without explicit owner action.
