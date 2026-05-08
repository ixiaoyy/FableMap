# Home light AI roles fine slice

## Goal

Continue the accepted gradual 1:1 split. This step only fine-splits the existing `03-ai-roles` slice into smaller horizontal rows without redesigning anything.

## Scope

Parent slice:

- `03-ai-roles` — `y=765`, `height=170`

New runtime slices:

1. `03a-ai-roles-heading` — `y=765`, `height=48`: section eyebrow/title, sparkle decorations, and the “查看全部角色” action area.
2. `03b-ai-roles-card-row` — `y=813`, `height=112`: four AI role cards, portraits, snippets, and dialogue chips.
3. `03c-ai-roles-bottom` — `y=925`, `height=10`: card-shadow tail and section-to-section spacing transition.

Runtime now stacks 11 slices total. Transparent hotspots remain on the full-artboard overlay so links are not clipped by slice boundaries.

## Guardrails

- No redraw.
- No typography/card/portrait recreation.
- No design interpretation.
- Keep source artboard visual 1:1.
- Keep the old parent slice in the asset directory for comparison, but do not import it in the runtime manifest.
- Playwright visual self-check was not run because the user confirmed they can manually inspect; use static/build validation only unless the user asks for a screenshot/self-check.

## Validation

Passed on 2026-05-09:

```powershell
node .\frontend\scripts\home-visual-density-test.mjs
node .\frontend\scripts\home-pc-polish-test.mjs
node .\frontend\scripts\homepage-dynamic-entry-test.mjs
node .\frontend\scripts\home-links-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

## Next possible slice

If accepted, next split can target `04-memory-echoes` into heading / memory-card row / bottom transition, or split `03b-ai-roles-card-row` horizontally into per-role card pieces with a more careful absolute-layout pass.
