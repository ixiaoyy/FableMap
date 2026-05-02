---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_suoyin/
assets: frontend/public/assets/npcs/public-welfare/char_pw_suoyin/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_suoyin/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_suoyin/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_suoyin/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_suoyin/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_suoyin
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=177ca38450c0c0faf2bc9fcdbc7053360d04219dcf536c99b1dacdeb4313a72f; joy=de5205f12a94f3b38a2881a32e1ccf728b77d9a84051fff365671a774f0a38dd; anger=f4f4c463af5fcfd76848f462beb0e1f0d8520862e4088781acb99a2e5d61263c; embarrassment=6da15699f0dfb7b2503c029e569be538565b3e25647d177ce580901b6db66f05; curiosity=057090530b3a7801588faa361309a7d890858168be31559ac5ac0cd0b216312c
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_suoyin, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_suoyin/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_suoyin/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_suoyin/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_suoyin/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_suoyin/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_suoyin
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
