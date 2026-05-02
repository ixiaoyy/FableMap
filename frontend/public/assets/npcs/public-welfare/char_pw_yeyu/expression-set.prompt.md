---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_yeyu/
assets: frontend/public/assets/npcs/public-welfare/char_pw_yeyu/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_yeyu/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_yeyu/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_yeyu/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_yeyu/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_yeyu
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=1ffea36d633fc8edf3c3c2cda80991313beef710b8f19157aab91209c33dbf60; joy=ca2043bec87c220cf17b5dceeccd53ed41e76e58d97f2ab5a34c8cd42534dc8e; anger=e648c01aa20deabdf0b24458d7a125667ffba32ee03481c28f4133e8ac822c8a; embarrassment=66057dfa8a7321b39c0095dff037de4b8e1f07b75390d5eeb9a2f2fa3a09b7de; curiosity=547a392fc23e769200522c9c236eb50b0bed7d4c10b927c57be232a7dcbe5cfa
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_yeyu, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_yeyu/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_yeyu/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_yeyu/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_yeyu/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_yeyu/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_yeyu
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
