---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/
assets: frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_mika_nurse
widths: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
heights: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
sha256s: neutral=fa1ff448952aa4fd2ea25ddfe923049787bdc5dadec200b5d862227d789b3cd3; joy=e8108b3fa32981db2c277f22e6523437b9d9cd93f27c562210f549a7a7db4125; anger=305405b99887724abad640cbea447a7a0e0a517c5d00b422a5481538431410f2; embarrassment=5742694064043ab6aaa1a0e672385e84e46669233498b9c9910e29e88320a339; curiosity=a172a86bca340ac941e1a63b82b59efbccec7f47b11f507a46a4e17ee41a83e8
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_mika_nurse, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_mika_nurse/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_mika_nurse
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
