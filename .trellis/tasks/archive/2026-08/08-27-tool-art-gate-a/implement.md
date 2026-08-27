# 实施计划

## 1. Source acquisition and evidence

1. Download HelloRumin and GARDENS from their official itch.io download endpoints into ignored local research storage.
2. Verify official page license text, ZIP SHA-256, selected PNG dimensions/bytes/SHA-256 and unchanged source bytes.
3. Copy only full original selected PNGs into ignored `public/tool-art-candidate/`; do not crop/repack/re-encode.
4. Record draft attribution and source matrix in task research.

## 2. Candidate media profile

1. Add a dev-only query resolver and typed client presentation profile.
2. Register the VectoRaith plowing sheet and HelloRumin tool sheet only when the candidate flag is enabled.
3. Decode/review explicit frame rectangles for four-direction plowing plus left/right axe/watering overlays.
4. Keep default player/entity media and production URLs unchanged.

## 3. Candidate action rendering

1. Extend the player view with candidate action sprite layers while retaining the current placeholder container for default mode.
2. Route tree interactions to axe frames.
3. Route FarmTile pre-action phases to plow/plant/water/harvest visuals without changing command dispatch or impact timing.
4. Ensure scene teardown/region transition clears candidate sprites and restores idle projection.

## 4. Candidate Hotbar icons

1. Add a client-only item-icon mapping and dev-only candidate source URL.
2. Render GARDENS tool/seed frames using the full original sheet and CSS/element clipping without generated image derivatives.
3. Reuse reviewed VectoRaith crop/material frames only when legible; otherwise retain text for uncovered items and record the gap.
4. Preserve labels, quantities, keyboard indices and accessibility text.

## 5. Visual Gate A evidence

1. Run the actual Farm at 2× integer scale with the candidate flag.
   - Local URL: `/?toolArt=preview`; no Keycloak login is required in dev.
2. Capture: Hotbar with current six item types; hoe/plowing frame; axe/tree frame; watering frame; default-vs-candidate comparison.
3. Inspect NEAREST pixels, player/tool alignment, tool depth, direction mirroring and action-to-impact timing.
4. Present evidence for user selection; do not promote or deploy before approval.

## 6. Verification

1. Formal map decoder and current Life Loop/Town Population contracts remain green.
2. Typecheck and client build pass without candidate images present.
3. Default mode does not request `/tool-art-candidate/` URLs.
4. Git diff contains no PNG/GIF/ZIP/TMJ/domain/save/migration changes.
5. Record any uncovered item/action instead of hiding it with the old generic tool.
