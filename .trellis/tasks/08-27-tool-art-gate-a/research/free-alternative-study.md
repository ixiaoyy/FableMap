# Free tool-art alternatives

## Decision constraints

- Budget: 0.
- Required: axe, hoe, watering can, seed/crop/material Hotbar imagery, and top-down action visuals.
- Preferred: native 16×16, commercial Web game use, modification allowed, no NC/ND/unknown source.
- Current VectoRaith farmer/world remains the visual baseline; a candidate that requires replacing the player is lower priority.

## Shortlist

### 1. HelloRumin — Pixel Farm Asset Pack

- Official source: `https://hellorumin.itch.io/pixel-farm-asset-pack`
- Cost: free / name your own price.
- License text: free and commercial projects allowed; modification allowed; redistribution/resale and ownership claims forbidden; credit requested.
- Official ZIP: `Pixel Farm_Assets.zip`, 20 kB.
- Downloaded official ZIP SHA-256: `5a4a15cb3ddcedc495cef95a91833135b30bde885ea608c84ed13909003cccab`.
- Relevant originals:
  - `PixelFarm_Tool Animation-Sheet.png`: 192×192, separate transparent hand+tool actions for watering, hoe, axe and pickaxe.
  - `PixelFarm_Item.png`: 144×48, small item/tool/material sheet.
  - `PixelFarm_Farmer-Sheet.png`: 128×96, 32×32 character; not proposed as a VectoRaith replacement.
- Strength: the tool animation is a separate overlay rather than a replacement character, so it can be tested against the existing VectoRaith farmer.
- Risk: pink/red palette and original 32×32 alignment may not match the current 16×32 farmer without per-direction frame positioning.

### 2. IvoryRed — GARDENS 16×16 icon pack

- Official source: `https://ivoryred.itch.io/gardens-16x16-icon-pack`
- Cost: free / name your own price.
- License: CC-BY 4.0; product credit is mandatory.
- Contents: 80 16×16 icons; four tiers each for hoe, watering can, axe, shovel, pitchfork, sickle, rake, wheelbarrow, scythe, shears, pickaxe, saw, basket, seed pack and others.
- Strength: the clearest zero-cost Hotbar candidate; native 16×16 and complete for the current three tools plus seed bag.
- Gap: icons only, no character action frames; crop and wood icons should continue to use existing VectoRaith crop/details frames or be separately reviewed.

### 3. Cocophany — Bloomseed 1.2.0

- Official source: `https://cocophany.itch.io/bloomseed`
- Cost: free.
- License: commercial/non-commercial projects allowed, modification allowed, redistribution of games allowed, asset pack redistribution forbidden, credit required.
- Official ZIP SHA-256: `94bcd7ef5c7a6bf3e482a85755d46f9c289b324200d7e400e0e106ca41e13912`.
- Relevant originals:
  - `Equipment/Icons/Tool_Icons.png`: 128×80, 16×16 cells.
  - Axe/Hoe/Pickaxe tool layers: 256×64 per direction, 64×64 action cells.
  - Watering-can tool layers: 320×64 per direction, 64×64 action cells.
  - Female body smash/watering frames are separate from tool layers.
- Strength: one free source supplies icons, per-direction action tool layers and explicit commercial-game permission.
- Risk: its body/action timing and bold black-outline palette are visibly different from VectoRaith; using the full character would violate the current player direction, while using only tools still requires alignment work.

## Rejected or lower-priority candidates

- OpenGameArt `CC0 Tool Icons`: valid CC0, but the 16×16 subset contains only hoe/pick/shovel and combines multiple visual sources; incomplete and inconsistent.
- OpenGameArt `Free Farm Assets 2D`: CC0 but the actual tool PNGs are roughly 200×200 smooth vector-style images, not native pixel art.
- OpenGameArt `Winter Story`: CC0 with chopping references, but thick-outline survival style is incompatible and the published page describes several tool actions as “yet to come”.
- Kettoman free character base: free commercial 32×32 but only watering among required actions.
- Mana Seed Farmer Sprite System: full action coverage but the relevant complete pack is paid; its license also prohibits use alongside AI-generated project content and public asset redistribution, conflicting with project direction.
- Tiny Wonder / JellyBeam free versions: non-commercial restriction or paid full content, excluded.

## Recommended Gate A comparison

1. Keep VectoRaith `$farmer.png` for idle/walk and `!$farmer_plowing.png` for hoe.
2. Prototype HelloRumin axe/watering overlays on the current farmer.
3. Prototype GARDENS icons in the current Hotbar, with a draft NOTICE credit.
4. Compare against a Bloomseed-only tool/icon variant.
5. Select by real 2× in-game screenshots; do not decide from isolated sprite sheets.
