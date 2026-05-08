# brainstorm: bright visual theme

## Goal

Explore whether FableMap should provide a brighter / lighter visual theme for users who do not prefer the current dark cyber tavern style, and define a feasible MVP scope that broadens aesthetic appeal without replacing the product identity or starting a broad redesign.

## What I already know

* User concern: not everyone likes the current project style; a brighter theme may improve acceptance for a wider audience.
* This is a brainstorm task; no implementation should start before scope and direction are confirmed.
* FableMap's product identity remains: real-coordinate spaces, owner-authored taverns, AI NPC conversation, memory/revisit loop.
* The goal is likely an alternative visual mode or style direction, not platform-generated space content and not a traditional map/game visual overhaul.
* Current active implementation task `05-07-05-07-territory-map-claim-system` is separate and should not be modified by this brainstorm.

## Assumptions (temporary)

* "偏明亮的主题" means a product-level bright / daylight theme, not just making one banner or one territory page brighter.
* The current dark neon style should remain available unless the user explicitly wants to replace it.
* The first useful slice should cover high-traffic product entry surfaces before long-tail management/detail screens.
* The theme system should be maintainable via tokens / shared primitives rather than one-off Tailwind color rewrites on every component.

## Open Questions

* None for the brainstorm step. Implementation should be opened as a separate Trellis task when the user asks to start work.

## Requirements (evolving)

* Preserve FableMap's core identity: real map anchor, tavern/space entry, owner-authored content, AI NPC interaction.
* Define a brighter visual language that feels lighter and more public-shareable without becoming a generic admin dashboard.
* Avoid new large UI frameworks, state managers, or map rendering dependencies.
* Do not introduce new AI-generated image deliverables in this brainstorm.
* If implemented later, keep mobile / narrow-screen usability in scope.
* If implemented later, run `npm --prefix .\frontend run build`; for visible UI changes, plan desktop + narrow-screen Playwright self-check screenshots/reports.
* MVP proof slice should cover the shared product shell, homepage, and discovery page first.
* Bright theme must be optional and persisted as a user preference, not a one-off page variant.
* New users should keep the current dark theme by default; bright theme is available through an explicit user toggle.

## Acceptance Criteria (evolving)

* [x] Decide whether the bright theme is optional, default, or scoped to selected pages.
* [x] Identify MVP target surfaces, e.g. homepage + product shell + discovery before long-tail pages.
* [x] Compare 2-3 concrete implementation approaches with trade-offs.
* [x] Define what remains out of scope to prevent a broad visual rewrite.
* [x] If the brainstorm proceeds to implementation, record a small-step implementation plan and verification plan.

## Definition of Done (team quality bar)

* PRD captures the chosen theme direction and MVP scope.
* Relevant frontend style constraints are noted before implementation.
* Later implementation uses the existing service/component boundaries and avoids unrelated refactors.
* Later frontend changes are verified with build and, if user-visible, browser/Playwright visual self-check.
* Docs/task notes updated with final decisions.

## Out of Scope (explicit)

* No implementation in this brainstorm step.
* No removal of the current dark/cyber style unless explicitly approved.
* No platform-generated space/NPC/story content.
* No traditional map app redesign, route planning, POI scoring, RPG-map asset pack, combat, level, equipment, or ranking work.
* No broad rewrite of all frontend routes in one task unless the user explicitly chooses that cost.

## Technical Notes

### Source context inspected on 2026-05-08

* `docs/PRODUCT_BRIEF.md`: FableMap is a spatial UGC platform; the current validation loop is map browsing -> space discovery -> enter space -> configure AI NPC -> chat -> memory/revisit.
* `docs/WHAT_NOT_TO_BUILD.md`: avoid making map visuals the product value itself; do not introduce complex visual asset packs, traditional map features, RPG systems, or platform-authored content.
* `docs/ARCHITECTURE.md`: frontend is part of the map display / space experience layers; UI changes should support the existing tavern platform core rather than changing data contracts.
* `.trellis/tasks/05-07-page-focus-guidance-brainstorm/prd.md`: recent product principle says the first 30 seconds should become clearer, and features should serve a broad public use case rather than one person's private workflow.

### Current frontend observations

* `frontend/app/styles.css` currently sets `color-scheme: dark` and a dark radial / linear page background at the root.
* `frontend/app/shell/product-shell.tsx` hard-codes a dark shell: `bg-[#030512]`, `text-violet-50`, dark header/dock, cyan/violet neon surfaces.
* `frontend/app/routes/home.tsx` hard-codes many dark surfaces, e.g. dark sticky nav, white/violet text, cyan neon cards, and dark image overlays.
* Legacy product code already has a partial theme mechanism: `frontend/app/product/ThemeToggle.jsx` stores `fablemap_theme`, writes `data-theme`, and `frontend/app/product/styles.css` defines dark defaults plus `[data-theme="light"]` CSS variables.
* That existing `data-theme` mechanism appears limited to the legacy `product/` CSS path; the newer React Router shell and route modules largely use hard-coded Tailwind color classes.
* `frontend/app/features/territory-management/index.tsx` is already a bright/anime-styled surface (`bg-[#f8f9fe]`, slate text, colorful light gradients), which proves a brighter direction is visually feasible but also highlights the risk of page-by-page style fragmentation.

### Early Candidate Directions

**Approach A: Optional global bright theme via shared design tokens** (likely recommended)

* Add/extend a theme switcher and gradually move shell + top entry pages to semantic CSS variables / reusable UI primitives.
* Dark remains available; bright mode becomes a first-class preference.
* Pros: respects different user tastes, avoids forcing a style change, creates maintainable foundation.
* Cons: requires refactoring hard-coded Tailwind colors; full coverage may need several slices.

**Approach B: Bright default for public entry surfaces only**

* Make homepage, discovery, and maybe create-entry pages brighter by default, while deeper tavern/chat/owner surfaces can stay darker initially.
* Pros: faster visible change for first impressions and social sharing.
* Cons: risks inconsistent transitions and does not solve theme preference globally.

**Approach C: Page-level visual style packs**

* Allow selected routes or tavern types to opt into bright / cyber / anime-like skins.
* Pros: expressive and can fit owner-authored spaces later.
* Cons: high complexity, likely violates the current need for product focus; easy to become visual customization creep.

## Current Recommendation (not final)

Start with Approach A as the product direction, but implement it later in a small proof slice: root shell + homepage + one discovery/entry surface. Use this to validate whether the bright theme improves first impression before expanding to all pages.

## Decision (ADR-lite)

**Context**: The current dark cyber tavern style is distinctive, but not all users prefer that aesthetic. The product needs a brighter option without discarding the existing identity or creating page-by-page style fragmentation.

**Decision**: Choose **Approach A: Optional global bright theme via shared design tokens**. Keep the current dark style available, add a first-class bright/daylight theme, and migrate surfaces gradually through shared tokens/primitives instead of one-off Tailwind rewrites.

**Consequences**:

* Positive: supports different user tastes, improves first-impression accessibility/shareability, and creates a maintainable theme foundation.
* Trade-off: requires refactoring hard-coded dark route classes over multiple slices; full visual parity should not be promised in one task.
* Risk control: begin with a proof slice and keep long-tail pages out of scope until the token pattern is stable.
* Default strategy: keep the current dark theme as default for new users, so existing product identity and screenshots remain stable; bright theme is opt-in and persisted.

## MVP Scope Candidates

**Slice 1: Shell + homepage + discovery** (recommended)

* Convert the global product shell, home entry, and discovery entry to theme-aware tokens.
* Gives users the most visible bright-mode improvement in the first 30 seconds.
* Leaves deeper owner/chat/detail pages for later once the pattern is proven.
* **Chosen for MVP.**

**Slice 2: Theme foundation only**

* Add root theme tokens and a new toggle path, but only lightly touch pages.
* Safer technically, but may not visibly address the user's style concern.

**Slice 3: Broad top-route pass**

* Convert shell, homepage, discovery, create, owner, tavern, notifications, quests in one larger task.
* More complete, but higher risk of visual regressions and unrelated churn.

## Brainstorm Capture

* 2026-05-08: User requested a Trellis brainstorm because the current project style may not fit all users and asked whether a brighter theme could be explored.
* 2026-05-08: User chose Approach A: optional global bright theme via shared design tokens.
* 2026-05-08: User chose MVP Slice 1: shell + homepage + discovery.
* 2026-05-08: User chose default strategy 1: keep dark as the default, expose bright as an optional persisted theme.

## Final Understanding Draft

**Goal**: Add a first-class optional bright/daylight theme so FableMap can appeal to users who dislike the current dark cyber style, while preserving the existing dark identity as the default.

**MVP Requirements**:

* Use shared theme tokens / primitives rather than route-by-route ad hoc color rewrites.
* Keep dark theme as the default for new users.
* Provide a user-visible theme toggle and persist the selected theme.
* Convert the first proof slice only: shared product shell, homepage, and discovery page.
* Ensure bright mode still feels like FableMap: real-coordinate, tavern/space, owner-authored, AI NPC atmosphere.
* Keep mobile and narrow-screen layouts usable.

**Acceptance Criteria**:

* [ ] User can switch between dark and bright themes.
* [ ] Theme preference persists across reloads.
* [ ] New users without a saved preference start in dark mode.
* [ ] Product shell, homepage, and discovery page have usable bright-mode colors, contrast, surfaces, and navigation states.
* [ ] Dark mode remains visually close to the current product style on the MVP slice.
* [ ] Build passes with `npm --prefix .\frontend run build`.
* [ ] Visible UI changes get desktop + narrow-screen Playwright self-check screenshots/reports if implementation proceeds.

**Out of Scope for MVP**:

* Converting create / owner / tavern / chat / notifications / quests in the first slice.
* Replacing the dark theme as the default.
* Owner-customizable style packs or per-tavern skins.
* New image generation or asset replacement.
* Any backend/API/schema work.

**Implementation Plan (small PRs / slices)**:

* Slice A: Add/normalize root theme tokens, initialize persisted theme with dark default, and expose a reusable toggle path.
* Slice B: Convert `ProductShell` and shared navigation/dock surfaces to semantic theme tokens.
* Slice C: Convert homepage and discovery route surfaces enough to pass bright-mode first-impression review.
* Slice D: Run build + visual self-check, record screenshots/report paths in the task.

## Final Confirmation

* 2026-05-08: User approved the final brainstorm direction and agreed this should be treated as a completed brainstorm, with implementation opened separately later.
