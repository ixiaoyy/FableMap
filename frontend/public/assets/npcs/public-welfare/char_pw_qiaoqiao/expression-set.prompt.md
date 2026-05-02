---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/
assets: frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_qiaoqiao
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=7b04fbf0c03265bcf6de1b89bd9b1fe58bbf0fb7e50b3ff5d4c2a857159e4389; joy=a0825488f39331f64b09568b2a75542e3d160b4dd4a5b3a3c8dc70261b76b607; anger=eb0c370c59db85c575154bd56ce751ee503c076a58f209c0bde529fa62e448c5; embarrassment=2d12396a465f198bb87f40bef5a5124bc55df034502602535c7226ca6bbabe01; curiosity=51666b59f5607d75e750a1cd695d942ef0662fea03d480bb8d1ea8a09a7d29fa
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_qiaoqiao, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoqiao/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_qiaoqiao
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
