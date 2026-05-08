# Home light full page HD artboard

## Goal

Use `设计参考/index_light.png` as the visible reference for the homepage light theme so the previously missing lower sections are present:

- Hero with real-coordinate premise and metrics.
- Featured glowing regions.
- AI role encounter cards.
- Memory echo cards.
- Additional recommended coordinates.
- Bottom creator CTA and footer.

The delivered image must avoid blurry stretch by keeping the original artboard width and serving a 2x high-density source.

## Scope

### In scope

- Copy the user-provided `index_light.png` into a project-local homepage asset path.
- Produce a 2x HD retina variant from that project-local source.
- Wire the light-mode homepage to the full-page artboard via `srcSet`.
- Keep navigation, theme toggle, hero CTA, featured cards, lower section links, and final CTA accessible through transparent hotspots.
- Update focused homepage static checks and Playwright self-acceptance.

### Out of scope

- No schema/API changes.
- No platform-generated tavern/NPC/story content.
- No new image generation model output; the 2x asset is a technical upscale from the provided reference.
- No dark-theme redesign.

## Implementation notes

- Runtime assets:
  - `frontend/app/assets/homepage/light/home-light-index-reference.png` — 958x1642, copied from `设计参考/index_light.png`.
  - `frontend/app/assets/homepage/light/home-light-index-reference-2x.png` — 1916x3284, Pillow LANCZOS + light unsharp-mask upscale for HD/retina delivery.
- Each asset has a same-directory prompt/provenance sidecar with hash and source notes.
- The light page uses `data-home-light-reference="index-light-full-hd"` and inner artboard marker `data-home-light-artboard="index-light-958x1642"`.
- The artboard is capped at `max-w-[958px]` so the 1x source is not stretched; high-density screens can select the 2x source.

## Validation

Passed on 2026-05-09:

```powershell
node .\frontend\scripts\home-visual-density-test.mjs
node .\frontend\scripts\home-pc-polish-test.mjs
node .\frontend\scripts\homepage-dynamic-entry-test.mjs
node .\frontend\scripts\home-links-test.mjs
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
node .\frontend\scripts\playwright-home-light-reference-check.mjs
```

Playwright evidence:

- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-full-page-hd\artifacts\playwright\home-light-reference-desktop.png`
- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-full-page-hd\artifacts\playwright\home-light-reference-mobile.png`
- `D:\work\ai-\.trellis\tasks\05-09-05-09-home-light-full-page-hd\artifacts\playwright\report.md`

## Known trade-off

This remains an artboard-first 1:1/reference-match slice. It is visually faithful and HD on desktop/retina via `srcSet`, but the text is still raster content. A future componentization task can convert the full page into live HTML/CSS cards for better mobile readability and smaller runtime image payloads.
