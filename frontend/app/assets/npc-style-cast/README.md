# NPC Style Cast Assets

`frontend/app/assets/npc-style-cast/` now contains the project-bound NPC fallback portrait assets for `features/tavern-npc-stage/`.

Usage contract:

- Canonical runtime assets live under `portraits/`:
  - `merchant-a.png`, `merchant-b.png`
  - `guardian-a.png`, `guardian-b.png`
  - `healer-a.png`, `healer-b.png`
  - `scholar-a.png`, `scholar-b.png`
  - `wanderer-a.png`, `wanderer-b.png`
  - `spirit-a.png`, `spirit-b.png`
- `features/tavern-npc-stage/portraitCatalog.ts` resolves fallback portraits by archetype + deterministic variant.
- `TavernNpcStage` uses these portrait assets only when a character does not provide owner-authored `sprites.neutral`, `avatar`, or `image_url`.
- `tavern-npc-style-cast.png` is retained as an earlier style reference sheet, not the canonical runtime fallback.
- The asset must remain tavern-themed: visible bar/counter, mugs, shelves, lanterns, menu boards, map-table, bottles, or equivalent tavern interior cues.
- Do not replace this with abstract placeholders, circles, square dummy avatars, generic empty portraits, or non-tavern character art.
- Do not use copyrighted IP, franchise-specific UI, logos, or living-artist style imitation.

The original generated files remain in the Codex generated-images directory; the workspace copies under `portraits/` are the project-bound assets.
