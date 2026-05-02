---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/
assets: frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_qingyou_records
widths: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
heights: neutral=512; joy=512; anger=512; embarrassment=512; curiosity=512
sha256s: neutral=2dbf85f3e137c1007106bda48f95543dbe317628502461c20dfdea7877720376; joy=0311a5ee36d9e3045938cd24e58f5b04f79e81279bba729ac8213c748966617c; anger=b96ed6b4bcc7250f3f9c09c069b1896a7cb465f7f12e37145afa0b87b5853c78; embarrassment=c5ffb03d2b2085d5876d704845c2963b2a4204d7607852f83134e4507a6fdf9e; curiosity=d9b665ee5d9c33d478a5e3245a0195884bc3e9c9d7a6a8da292576b8c6a12c9f
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_qingyou_records, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_qingyou_records/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_qingyou_records
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
