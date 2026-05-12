# SoulLink 05-10 runtime assets

Runtime assets generated from owner-provided Trellis design drafts or derived local placeholders.

- Discover/Search runtime materials for both light and black live under `discover/cards/` as one shared set of atomic `512×512` image slots only.
- Discover/Search navigation, filters, search controls, lists, cards, stats, right rail, and copy must be DOM/CSS, not screenshot PNGs.
- Do not add loose `main.png`, `right-rail.png`, `sidebar.png`, or `*-2x.png` screenshot slices back under `discover-light/` or `discover-black/`.
- Original full design drafts remain archived under `.trellis/tasks/05-10-05-10-ui-ux-design-audit-and-polish/reference-designs/` for audit only and must not be imported by runtime code.
- Source processing and SHA-256 hashes for runtime materials are recorded in `manifest.json`.
