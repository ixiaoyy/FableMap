---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_anlan/
assets: frontend/public/assets/npcs/public-welfare/char_pw_anlan/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_anlan/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_anlan/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_anlan/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_anlan/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json
character_id: char_pw_anlan
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=dc3e68164c937ed46eb5f60687c6b5178f4672c9f0f8c2e1dcbcb30766d2b1b4; joy=69a562075f766c95fa1a83a38cd6386001f1b586bcfd254e0f5d63c7f37df081; anger=123bd097e383332c42e7284a9b98140994d29b4221f64061d5bd2fc9a72cf660; embarrassment=475b6abbb3073478f3deea8ce329432953a17e0b07fa59affc0ac9a6fc28606a; curiosity=dd377508566495b76d56234231529177696a930a2b7195f88f67d6a661605713
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 安澜 (char_pw_anlan). Subject identity: ordinary human midnight host with quiet shoulders, soft headphones, anonymous message notebook. Identity locks: soft headphones, low radio microphone, anonymous notebook, quiet boundary-safe expression. Signature prop: low radio microphone and unreadable message notebook. The portrait is visibly inside pw_midnight_treehole with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: lo-fi midnight radio mixed-media portrait, quiet white-line overlay on soft dark room; palette and light: deep navy, muted violet, low amber equipment LEDs, desaturated teal highlights / low-key studio lamp and city-window rim light; medium/texture: soft photo-grain blur, radio waveform arcs, handwritten-but-unreadable note strips, delicate white linework. Anti-repetition rule: not medical/therapy branding; not generic night platform; must keep microphone, anonymous notebook, boundary-safe radio mood. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_anlan/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_anlan/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_anlan/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_anlan/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_anlan/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- style_family: lo-fi midnight radio mixed-media portrait, quiet white-line overlay on soft dark room; palette_light: deep navy, muted violet, low amber equipment LEDs, desaturated teal highlights / low-key studio lamp and city-window rim light; material_system: soft photo-grain blur, radio waveform arcs, handwritten-but-unreadable note strips, delicate white linework; anti_repetition: not medical/therapy branding; not generic night platform; must keep microphone, anonymous notebook, boundary-safe radio mood

## Identity locks

- soft headphones
- low radio microphone
- anonymous notebook
- quiet boundary-safe expression
- signature prop: low radio microphone and unreadable message notebook

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
