---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_tongling/
assets: frontend/public/assets/npcs/public-welfare/char_pw_tongling/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_tongling/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_tongling/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_tongling/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_tongling/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: reverse-engineered
source_type: reverse-engineered-current-asset
character_id: char_pw_tongling
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=3cb44f8a9c041489c6d98f418870e5864d796c587ac166ddae49328056b32e5f; joy=617b72ca5460844a4b0b6556b8133ca4be284268c36b747196d0682cb1de8443; anger=27c28401ba3195c958c9550f12267268379118a13135abbaba6b027449b7f8f9; embarrassment=9192072b89e2b618ad562d1aac6b36ae7092e3d12dd3925d2ead2e8efbc20d81; curiosity=4b1c8d749000702a55dac1bcbee3a7369d5e077be1e628a1862235bfc50f3eb6
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Reverse-engineered FableMap public-welfare NPC expression sprite for char_pw_tongling, expression neutral. Create an original square cyber-tavern NPC portrait with clear expression/body language, visible tavern or service-counter context, stable identity for future one-at-a-time expression variants, readable anime/game-style finish, role-appropriate prop language, and no generic placeholder background. Preserve current sprite semantics from the repository path and use the existing image as visual reference for silhouette, palette, costume, and signature prop. This is a reverse prompt, not the original generation prompt.

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_tongling/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_tongling/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_tongling/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_tongling/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_tongling/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- image-style-prompt-extractor 15D framework summarized from current repository sprite metadata/path; human visual review recommended before regeneration.

## Identity locks

- character_id: char_pw_tongling
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
