---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_luming/
assets: frontend/public/assets/npcs/public-welfare/char_pw_luming/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_luming/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_luming/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_luming/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_luming/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_luming
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=be3b4540bf2245e44d0458133fdff8f6988929397def82f9d3445c3850cc6afd; joy=ccfb407b46ad5fb0612d0bcbdef5c61b95018c35568207e9ce611325aee732a9; anger=8ad6ae87b3363a983fae835d8a0d856bbf656ef231dff775175bb4154b15d757; embarrassment=5f890e5f985867dc410ab8d40f71a8b39e88c9584b5c4ed5a88480e2f6831165; curiosity=56783bbba50daf60823182e18d879ed50c3fc6c8d846afdb5aa8350d16950e46
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_luming, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_luming/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_luming/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_luming/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_luming/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_luming/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_luming
- expression: neutral
- same face/body plan/outfit/prop across expression set
- expression: joy
- expression: anger
- expression: embarrassment
- expression: curiosity

## Provenance notes

This expression-set sidecar was reverse-engineered from current repository images and metadata; it is not the original generation prompt unless a source manifest is cited.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Original prompt was not found in current manifests; do not relabel this as original-final.
