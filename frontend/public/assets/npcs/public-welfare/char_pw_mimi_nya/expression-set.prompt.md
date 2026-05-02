---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/
assets: frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_mimi_nya
widths: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
heights: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
sha256s: neutral=d3dee5e9d87dd06e30abd00769a807cfbeb5759c923af876323aa079fdae6600; joy=caf7b0037ede2ccc64b9502654ac0879d478a51f4ee34353b415272e0c8ecb56; anger=48c5a43b11597caa3438ae2979e0720b8f6daed88c8f93f442f302e8f029967c; embarrassment=cac9de1292a6b64ce5c029edf2df3be8a2acbe680ec5ddd88a06662f564cc1a0; curiosity=2c37a7a9ee614ab4bfb50cfe4cef44adf84de58074b697dedbc8fa7d31ab7dc4
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_mimi_nya, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_mimi_nya
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
