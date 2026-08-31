# 正式发布工具图标素材

## Goal

Replace the production Hotbar's large Chinese placeholder marks with the already-reviewed pixel-art item icons, while preserving readable item names and all existing gameplay behavior.

## Background

- Tool Art Gate A visually approved IvoryRed GARDENS frames for axe, hoe, watering can, and turnip seed, plus existing VectoRaith crop/detail frames for turnip and wood.
- Commit `f421ab52` deliberately kept those images behind `import.meta.env.DEV` and local ignored URLs; production therefore still renders `ItemDefinition.hotbarMark`.
- The exact GARDENS PNG is available locally as an unchanged official file: 160×176, 13,130 bytes, SHA-256 `de4dbbb56936520882e1217aad9dae22e60a5f57dde15512f673ec031b581536`.
- GARDENS is CC BY 4.0 and requires product-delivered attribution.
- The current working directory contains unrelated parallel work; this release must be built from remote `main` in an isolated worktree.

## Requirements

- Publish only the exact reviewed GARDENS PNG under a versioned immutable `game/media/v1` object key; do not upload its archive or any unused files.
- Extend the media publication allowlist before uploading the object, then verify public bytes, dimensions, MIME type, SHA-256, and immutable cache headers.
- Register the object in `deploy/cdn/game-media-manifest.json` with official source, snapshot evidence, CC-BY-4.0 license, transformation, dimensions, bytes, MIME type, hash, key, and URL.
- Add a product-delivered `THIRD_PARTY_NOTICES.txt` and a discoverable start-screen/footer link crediting IvoryRed, the work, official source, CC BY 4.0, and that the file is unmodified.
- Move the approved item-frame projection to a production client module. Hotbar must always use images when a reviewed frame exists and fall back to text only for genuinely unmapped items.
- Keep small accessible item names, quantities, selection state, keyboard/mouse behavior, domain item IDs, GameSession, saves, and IndexedDB unchanged.
- Keep the remaining plowing/axe/watering action candidates development-only; this task promotes Hotbar icons only.
- Do not add any image binary to Git or include unrelated staged/unstaged work.

## Acceptance Criteria

- [x] The immutable GARDENS object is publicly available with exact reviewed bytes/hash/dimensions/MIME/cache policy and is the only new CDN image.
- [x] Manifest totals increase from 13 images / 201,601 bytes to 14 images / 214,731 bytes and all entries verify.
- [x] Production Hotbar shows pixel-art images for hoe, watering can, axe, seed, turnip, and wood; large Chinese placeholder marks are absent for those mapped items.
- [x] Item names remain readable/accessible, quantities and selected state remain correct, and gameplay/save behavior is unchanged.
- [x] `/THIRD_PARTY_NOTICES.txt` is shipped and linked from the public start UI with complete CC-BY attribution.
- [x] Typecheck, client build, media-manifest checks, CDN checks, and Git tracked-image count pass.
- [x] Production deployment succeeds and a real browser confirms the icons load from `/game-media/v1` without 404 or text fallback.

## Out of Scope

- Promoting HelloRumin tool overlays or VectoRaith plowing animations to production.
- Changing Hotbar layout, inventory rules, tools, economy, item definitions, save schema, or gameplay commands.
- Uploading complete asset packs, source archives, screenshots, derivatives, or unused images.
