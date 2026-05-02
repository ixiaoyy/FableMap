---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_aheng/
assets: frontend/public/assets/npcs/public-welfare/char_pw_aheng/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_aheng/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_aheng/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_aheng/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_aheng/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_aheng
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=ae555d4020c7c5ad5369c6f9d3439de444aa755ff07fc831cad9629144c22030; joy=2b748816a4582cc40f0ce05356e45739d9ddac6cf68ffe9fdce02a91a21bbc36; anger=5b028bd6fa960802a2e1a0bb867da6de442b677b557bf39aebde3aacd8a26bfd; embarrassment=d266d827a32c0fd38165b0292b01af499b04e6ef9b2c7f29431de86e761dcd1f; curiosity=3a2910782dfd6db5187d63946f2dd8340ab5d117881ac2fb2c105642f3ade654
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_aheng, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_aheng/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_aheng/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_aheng/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_aheng/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_aheng/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_aheng
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
