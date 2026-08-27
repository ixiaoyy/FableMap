# Gate A candidate evidence

## Exact local source evidence

| Source | Official artifact | Bytes | Dimensions | SHA-256 | Local role |
|---|---|---:|---:|---|---|
| HelloRumin Pixel Farm | `Pixel Farm_Assets.zip` | 21,368 | archive | `5a4a15cb3ddcedc495cef95a91833135b30bde885ea608c84ed13909003cccab` | official package snapshot |
| HelloRumin Pixel Farm | `PixelFarm_Tool Animation-Sheet.png` | 2,291 | 192×192 | `ebb2c618f9cf6952640b5d68740e4c9806d3df443977f437b4e86d27d3435845` | axe/watering pose candidate |
| IvoryRed GARDENS | `all the icons (gardens).png` | 13,130 | 160×176 | `de4dbbb56936520882e1217aad9dae22e60a5f57dde15512f673ec031b581536` | Hotbar icon candidate |
| VectoRaith Farming Sim v1.08 | `!$farmer_plowing.png` | 3,467 | 96×128 | `112536c27a4de057c6b2ec1cd6b18ebfef03cbbe301a851e23741f53b8398a62` | four-direction plowing candidate |

All three runtime candidate PNGs are byte-identical copies of their official source files. No crop, resize, palette change, repack or re-encode was applied.

## Frame study

### VectoRaith plowing

- 3 columns × 4 directional rows, 32×32 frames.
- Direction order follows the official farmer sheet: down, left, right, up.
- Frame rows: down `0–2`, left `3–5`, right `6–8`, up `9–11`.

### HelloRumin tool poses

- The 192×192 source is a pose palette arranged on a 32×32 inspection grid, not a documented complete character animation.
- Gate A therefore selects one axe pose and one watering pose and lets the existing Phaser ActionTimeline provide windup/impact motion.
- Reviewed provisional frames: watering `6`, axe `27`; left-facing is an engine mirror of the same candidate pose.
- If real 2× play shows incorrect hand/tool alignment, this source must be rejected rather than physically edited into a replacement atlas.

### GARDENS icons

- Full sheet is 10 columns × 11 rows of native 16×16 cells.
- First category block uses columns `0–3` for four tiers and rows by tool type; Gate A selects the first/basic tier:
  - hoe `(0, 1)`;
  - watering can `(0, 4)`;
  - axe `(0, 9)`.
- Second category block uses columns `6–9`; basic seed pack is `(6, 5)`.
- Turnip and wood remain frame selections from current VectoRaith crops/details originals, avoiding another icon source.

## Draft product credits

- “Pixel Farm Asset Pack” by HelloRumin — `https://hellorumin.itch.io/pixel-farm-asset-pack`; used under the author's free commercial-use and modification terms.
- “GARDENS, 16x16 icon pack” by IvoryRed — `https://ivoryred.itch.io/gardens-16x16-icon-pack`; licensed under CC BY 4.0.

These credits are research drafts only. A production adoption must add them to the product-delivered Credits/THIRD_PARTY_NOTICES surface before manifest/CDN publication.
