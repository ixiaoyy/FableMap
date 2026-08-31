# Technical Design

## Boundaries

The release promotes one already-reviewed UI sheet and keeps rendering ownership in the client:

```text
IvoryRed official PNG
  -> repository_dispatch publication gate
  -> immutable game/media/v1 object
  -> manifest entry + production item-icons.ts frame map
  -> Hotbar.vue CSS background frame
```

Domain item IDs, inventory snapshots, GameSession, IndexedDB, maps, and action candidate code do not receive media fields.

## Production media contract

- Object key: `assets/vendor/ivoryred/gardens-2026-08-27/original/all-the-icons-gardens.png`.
- URL: same-origin runtime proxy `/game-media/v1/<object-key>` with hash query `?v=de4dbbb5`.
- Source: official IvoryRed itch.io page and exact locally preserved official PNG.
- Bytes remain unchanged; no crop, repack, resize, palette conversion, or re-encoding.
- The first rollout commit changes only the publication allowlist, which does not trigger the production deploy workflow. After that commit is on `main`, repository dispatch publishes and verifies the exact base64 payload through GitHub Secrets.
- The second rollout commit adds manifest, code, attribution, and documentation only after the object is publicly verified; this commit triggers the normal production deploy workflow.

## Client projection

Create `client/src/game/assets/item-icons.ts` as the single owner for production item-frame definitions:

- axe `(0,9)`, hoe `(0,1)`, watering can `(0,4)`, turnip seed `(6,5)` from GARDENS;
- turnip `(7,1)` from existing VectoRaith crops;
- wood `(6,5)` from existing VectoRaith details.

`Hotbar.vue` resolves an icon for every non-empty slot. It renders the image when mapped, otherwise retains `hotbarMark`. The small visible name remains for comprehension and accessibility.

Remove the duplicated icon mapping/type/helper from `tool-art-candidate.ts`, but keep its GARDENS dev spritesheet key/frame because the local planting-action preview still consumes that candidate.

## Attribution delivery

`public/THIRD_PARTY_NOTICES.txt` is copied into the client build root. `App.vue` links it from the non-playing footer as “素材鸣谢”. The notice records work, author, official URL, CC BY 4.0 URL, and no-modification statement.

## Compatibility and rollback

- No persistence or gameplay migration.
- If the CDN upload cannot be verified, do not land manifest/runtime references.
- If the deployed icon is visually wrong, forward-fix only the frame coordinates or revert the runtime mapping; immutable uploaded bytes remain harmless and registered.
- Current parallel work is protected by building and committing from a dedicated worktree based on remote `main`.
