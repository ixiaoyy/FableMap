---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/
assets: frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_yinpiao
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=f9b8518537603034645450c1f541c5d46eaa28fb1661a0c512b50301481b0f53; joy=8bf666489d25a9928e8c2003e1e448dbd098ea24af4806fd46dd882a5eaa6ad6; anger=f102e3148ae417706d426fc854d4db2ddbf8a76e5f18558411d3bbd8e07da752; embarrassment=03d6a39cc2431c40f205bef90ca2f3dbaa0ad4a2a6bf58be004694953c7d2a4d; curiosity=71f2e6cecc421798c999f8f5d2a08a0bc71c0712c8fb89a037a169c6a4dab6f5
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_yinpiao, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_yinpiao/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_yinpiao
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
