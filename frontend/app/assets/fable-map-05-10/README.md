# FableMap 05-10 runtime assets

Runtime assets generated from owner-provided Trellis design drafts or derived local placeholders.

- Runtime shell uses the black SoulLink layout only; the previous light theme runtime materials were removed.
- Desktop home must use DOM/CSS for dynamic/data content. Do **not** use `reference/soullink-index-1536x1024.png` as the visible runtime layer.
- `reference/soullink-index-1536x1024.png` is retained only as a comparison/reference asset, not as the homepage implementation.
- `reference/soullink-static-base-1536x1024.png` is the visible static background/card layer derived from the design with dynamic/data text stripped; dynamic user/node/activity/stat text is rendered as DOM overlays.
- Active node cards keep the static card/background imagery in the base layer, while status/title/NODE id/description/entities text are DOM overlays.
- Discover/Search runtime materials live under `discover/cards/` as one shared set of atomic `512×512` image slots only.
- Discover/Search navigation, filters, search controls, lists, cards, stats, right rail, and copy must be DOM/CSS, not screenshot PNGs.
- Exception: brand identity lockups can be a single raster slice when matching owner-provided SoulLink design drafts; current low-res placeholder is `brand/soullink-logo-low.png`, displayed at roughly `194×88` CSS px on desktop home, and should be replaced with SVG or `656×248` px at the same aspect ratio.
- Do not add loose `main.png`, `right-rail.png`, `sidebar.png`, `home-slices/`, or `*-2x.png` screenshot slices back under runtime folders.
- Original full design drafts remain archived under `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/` for audit only and must not be imported by runtime code.
- Source processing and SHA-256 hashes for runtime materials are recorded in `manifest.json`.
