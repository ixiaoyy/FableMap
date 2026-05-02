---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_dengxin/
assets: frontend/public/assets/npcs/public-welfare/char_pw_dengxin/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_dengxin/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_dengxin/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_dengxin/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_dengxin/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_dengxin
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=74aa93b2c05a9d45c982e6b9c43bec5bf5b30d130af1f2003e47d7ec8676987a; joy=8f37e44e04a8916266d24e55b13d961de0f19f862e16727ba75adafc60be9b42; anger=4d820791c1c5acc944d5f16acf51366a445e056f7e2bf55052d50d2865ad9cd6; embarrassment=218c4e89520fb8533472f042b20075d4c73bcce9f301b7b83cb88094e0a1dff6; curiosity=c14ff97ebc71972f77860c1433a1b7e6bea544accf087b261351f8f5c666afee
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_dengxin, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_dengxin/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_dengxin/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_dengxin/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_dengxin/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_dengxin/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_dengxin
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
