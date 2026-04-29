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

---

## Scenario: Mobile Product Shell Navigation Dock

### 1. Scope / Trigger

Use this contract when changing `frontend/app/shell/product-shell.tsx` or global route navigation on mobile/narrow screens.

### 2. Signatures

```tsx
<ProductShell eyebrow="Create">...</ProductShell>
```

Navigation source of truth:

```typescript
const navItems = [
  { to: "/", label: "首页", icon },
  { to: "/discover", label: "发现", icon },
  { to: "/create", label: "创建空间", icon },
  { to: "/owner", label: "主人", icon },
]
```

### 3. Contracts

- Desktop keeps the sticky top navigation.
- Mobile/narrow screens get a fixed bottom navigation dock with `aria-label="Mobile navigation"`.
- Bottom dock items must use at least `min-h-14` plus `touch-manipulation`.
- Main content must reserve bottom padding (`pb-28`) so the fixed dock does not cover page actions or footer content.
- The bottom dock must be hidden on large screens (`lg:hidden`) to avoid duplicate desktop navigation.
- Do not add another global UI framework or route library for this behavior.

### 4. Validation & Error Matrix

| Case | Expected |
|------|----------|
| 320px width | bottom dock remains usable and content is not hidden |
| desktop width | bottom dock is hidden; top nav remains visible |
| active route | active nav item has visible state in top nav and bottom dock |
| keyboard/screen reader | bottom dock exposes navigation label and text labels |

### 5. Good/Base/Bad Cases

- Good: one shared `navItems` array feeds both top nav and mobile dock.
- Base: mobile dock is visual-only navigation and does not introduce new state.
- Bad: fixed dock without content bottom padding, or icon-only items without labels.

### 6. Tests Required

```powershell
node frontend/scripts/mobile-shell-layout-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

The script must assert the dock, accessibility label, large-screen hiding, touch target size, and content bottom padding.

### 7. Wrong vs Correct

#### Wrong

```tsx
<nav className="fixed bottom-0">
  <a><Icon /></a>
</nav>
```

This can cover content and creates unlabeled icon-only controls.

#### Correct

```tsx
<nav className="mobile-bottom-dock ... lg:hidden" aria-label="Mobile navigation">
  <NavLink className="min-h-14 touch-manipulation">
    <Icon />
    <span>发现</span>
  </NavLink>
</nav>
```

---

## Scenario: Global High Visual Quality Page Standard

### 1. Scope / Trigger

Use this contract for every user-facing page, route module, major panel, card list, creation flow, and discovery/owner/tavern surface under `frontend/app/`. The expected bar is **consumer-grade cyber tavern product UI**, not admin-form MVP UI.

### 2. Signatures

Common route/page shells:

```tsx
<ProductShell eyebrow="Discover">...</ProductShell>
<Card>...</Card>
<Button size="lg">...</Button>
```

Common visual metadata/config patterns:

```typescript
const items = [
  { id, label, icon, description, tone, cardClass },
]
```

### 3. Contracts

- Every important page must have a clear visual hierarchy: page eyebrow/title, explanatory copy, primary action, secondary action or status, and a designed empty/error state.
- Do not ship bare admin UI: a plain select/table/form is not enough for a primary product interaction. Wrap it in a designed panel, card grid, preview, or step-like surface.
- Product surfaces should feel like FableMap: dark luminous base, translucent panels, rounded corners, soft borders, cyan/violet/fuchsia/amber accents, and real-coordinate / tavern metaphors where appropriate.
- Reusable visual choices belong in config or helpers (`PLACE_TYPES`, layout configs, shell nav items), not duplicated as one-off labels/classes in route files.
- Primary tap targets must remain mobile-safe: at least `min-h-11` for normal controls and `min-h-14` for bottom dock / high-priority mobile navigation.
- Cards and panels should avoid flat blocks: prefer `rounded-[1.75rem]` or existing card primitives, `border-white/10`, translucent background, and visible hover/active state.
- Every interactive list/grid must show active/selected state using text + color/shape; color alone is not enough.
- Visual enhancements must not violate product boundaries: do not invent platform-authored tavern content, fake social feeds, combat/ranking visuals, or sensitive owner data displays.
- Mobile/narrow screens are first-class: grids must collapse/wrap, fixed UI must reserve content padding, and important actions must remain reachable.
- If an AI/generated bitmap is part of the deliverable, it must follow `image-asset-guidelines.md`; chat preview/temp files are not acceptable source assets.

### 4. Validation & Error Matrix

| Case | Expected |
|------|----------|
| New route page | Has designed hero/header, visual sectioning, primary action, empty/error states |
| Main form flow | Uses cards/steps/previews; not just stacked browser-native controls |
| Mobile 320px | No horizontal overflow for primary content; actions remain touchable |
| Selected option/card | Has `aria-pressed` or equivalent state plus visible active treatment |
| Visual config expanded | Tests or scripts assert required display metadata exists |
| Loading/empty/error | Styled in-product states, not raw text dumps or uncaught traces |

### 5. Good/Base/Bad Cases

- Good: `/create` place type selection uses shared `PLACE_TYPES` metadata, visual cards, active state, explanatory copy, and a hidden field preserving the data contract.
- Base: a secondary settings section may use compact controls, but it still sits inside a styled panel with labels and helpful copy.
- Bad: adding a raw `<select>` plus a submit button as the whole feature UI; adding a public social-wall visual that violates `WHAT_NOT_TO_BUILD.md`; hiding mobile actions behind content covered by fixed navigation.

### 6. Tests Required

For visual/page work, run at minimum:

```powershell
npm --prefix .\frontend run build
```

If the change touches script-tested helpers, route contracts, visual metadata, or mobile shell behavior, also run:

```powershell
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
```

When possible, manually check at least one desktop width and one narrow/mobile width. If manual browser/device testing was not run, explicitly report that.

### 7. Wrong vs Correct

#### Wrong

```tsx
<label>类型</label>
<select name="place_type">...</select>
<button>保存</button>
```

This may function, but it is visually below the product quality bar for a primary creation flow.

#### Correct

```tsx
<section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4">
  <input type="hidden" name="place_type" value={placeType} />
  {PLACE_TYPES.map((type) => (
    <button
      type="button"
      aria-pressed={placeType === type.id}
      className="min-h-24 touch-manipulation rounded-2xl border p-3 text-left transition"
    >
      <span aria-hidden="true">{type.icon}</span>
      <span>{type.label}</span>
      <span>{type.tone}</span>
    </button>
  ))}
</section>
```

The correct version is still data-safe but gives users a clear, tactile, high-quality product experience.
