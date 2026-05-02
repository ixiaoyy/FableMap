---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_xingdai/
assets: frontend/public/assets/npcs/public-welfare/char_pw_xingdai/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_xingdai/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_xingdai/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_xingdai/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_xingdai/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_xingdai
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=8eaa983cd62d372a5d7962e8d120285c46fef6464d05f7a67e7418e949248015; joy=dcad6774aa8c7572aab89d50464a21632ed666dc42df679a59429674a4c1e844; anger=435ff802cfd54244e8cbfebff8b3936db250fa7fe30bd81ac5d6078e9d2547ad; embarrassment=a93c7be122633367df33a865bc0d259a1b964dd4788b1c19c47892aff7572c36; curiosity=218aac66d4f5f072f975e2b38978955e3c6fff2fad0968c5c2dc3e5d024afdea
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_xingdai, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_xingdai/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_xingdai/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_xingdai/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_xingdai/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_xingdai/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_xingdai
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
