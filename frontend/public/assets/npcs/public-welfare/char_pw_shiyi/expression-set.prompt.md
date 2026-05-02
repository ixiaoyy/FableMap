---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_shiyi/
assets: frontend/public/assets/npcs/public-welfare/char_pw_shiyi/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_shiyi/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_shiyi/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_shiyi/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_shiyi/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_shiyi
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=0e932a25139358e43acc2de8fde5034f5d7d7d91c36dbbf17460d6ad4b87a4a3; joy=678547f1dd71b0f16a86d34b50bea9e0a0e6d91b37006695cc7da708999298ba; anger=01bfd469c0d1efbd8b0534612fbc22930186ef18ee4e1f3fb679eb9380cf3f91; embarrassment=810cb6f952f681bab1f0595a8b4c0ed4e98d4441697ce1405a5604c05cb49b93; curiosity=bfad318caca398e26047bbda42170891818f15a03314df751053692c371ca020
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_shiyi, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_shiyi/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_shiyi/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_shiyi/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_shiyi/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_shiyi/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_shiyi
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
