# Mobile Single-mainline Experience

> Contract for keeping narrow-screen navigation focused on the visitor path: locate/discover → enter tavern → return/owner secondary actions.

---

## Scope / Trigger

Use this contract when changing:

- `frontend/app/shell/product-shell.tsx`
- `frontend/app/routes/tavern.tsx`
- `frontend/app/features/tavern-layout-showcase/index.tsx`
- mobile navigation, first-screen tavern entry, or tavern secondary-panel visibility

This guide does not introduce new API, schema, persistence, or mobile-framework requirements.

---

## Contracts

- Mobile bottom dock order is exactly `首页 / 发现 / 进店 / 清单 / 管理`.
- Mobile dock `/create` label is `进店`, not `创建空间`; desktop top navigation keeps `创建空间` so owner creation remains discoverable but secondary on mobile.
- Primary top navigation is hidden below `lg` so it does not duplicate the mobile dock or expose owner/create wording in the mobile first line.
- Product shell content keeps enough bottom padding (`pb-28`) so fixed bottom dock does not cover key CTAs or footer actions.
- Mobile tavern route renders `TavernActivitySignalsCard` before secondary tavern panels, so liveliness/entry context is visible before expansion.
- Mobile secondary panels (`PlaceHomePanel`, `VisitorNotesPanel`, `NeighborhoodRumorBubble`) live behind a collapsed `<details>` summary labelled `更多酒馆信息`.
- Advanced roleplay management and desktop-only secondary panels stay in a `hidden lg:block` section.
- `CreatorConversionCard` / `creatorSlot` stays desktop-only (`hidden lg:block`) so mobile first screen remains visitor-first instead of owner-create-first.
- No new mobile framework or large route/UI dependency is required for this contract.

---

## Forbidden Drift

- Do not re-label the mobile primary CTA as `创建空间`.
- Do not move owner creation/configuration panels into the mobile first screen.
- Do not expose a public visitor wall, cross-tavern social graph, friend/DM flow, ranking, combat, level, equipment, token recharge, or settlement feature while polishing mobile flow.
- Do not make the mobile path depend on generated platform tavern/NPC/story content; owner-authored/confirmed content remains the boundary.

---

## Validation Matrix

| Case | Expected |
|------|----------|
| Mobile shell | Fixed bottom dock has accessible label, touch-safe items, visitor-first labels, and no duplicate top nav |
| 320px/narrow viewport | Key CTAs remain reachable above the dock; no horizontal overflow from this contract |
| Mobile tavern | Activity signals are visible before collapsed secondary panels |
| Mobile tavern secondary | `PlaceHomePanel`, `VisitorNotesPanel`, and `NeighborhoodRumorBubble` are hidden by default behind `更多酒馆信息` |
| Desktop tavern | Secondary panels and creator conversion slot are visible in lg-only areas |
| Dependencies | `package.json` does not gain Capacitor/Ionic/React Native/Onsen UI |

---

## Tests Required

Run after changes touching this contract:

```powershell
node frontend/scripts/mobile-single-mainline-test.mjs
npm --prefix .\frontend test
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

For user-facing visual changes, also run Playwright self-acceptance with at least one desktop and one narrow/mobile viewport and record screenshot/report paths in the Trellis task.

---

## Good / Base / Bad

- Good: desktop top nav says `创建空间`, while mobile bottom dock says `进店` and tavern secondary owner panels are collapsed.
- Base: mobile guide copy points users to the page mainline anchor; desktop keeps richer owner/secondary surfaces.
- Bad: moving the creator conversion card into the mobile tavern first screen, or hiding the only create entry on desktop.
