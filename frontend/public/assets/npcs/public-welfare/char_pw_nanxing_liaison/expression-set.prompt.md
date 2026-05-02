---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/
assets: frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_nanxing_liaison
widths: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
heights: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
sha256s: neutral=21cf3e4363c8dff3acce93b27f0a2b2a44bae02385449f6134ba717e2fe088c5; joy=c66ad3d04c9f6f5ad0fbbe52960d4a4ac487cee3b066fb66b05d689140768406; anger=bebe715daedaca89e6a8b1b3c5c1a84ed727ff9b26536c64717d6d08051deb00; embarrassment=d3211a96744fb6ab698ab2f225fc236641831b8e9d93a228df233fbea7fd085c; curiosity=696e221dc11ad9359fa7ccac3fdb5640e74f9acfb3afe27b58d3eace8d86434e
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_nanxing_liaison, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_nanxing_liaison/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_nanxing_liaison
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
