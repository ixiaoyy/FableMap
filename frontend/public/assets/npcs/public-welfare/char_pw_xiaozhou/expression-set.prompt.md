---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/
assets: frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json
character_id: char_pw_xiaozhou
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=5d1f60d3de36c4b2b67425c4c1d1d068824a917ec7047001130376d20d8df735; joy=3084c6b57c927f20b83be13d0d772ba34c6c4ef645bb2b252887042bc07c4f43; anger=008d197fda8a72e7e0504515f7f0f067ca569558693c5271dc18da823c92fbc8; embarrassment=ed22814ba62c5ec6592706e0a7271c3e9647273b08f37f8d4b35d1272eb5ffc4; curiosity=00135c484c065a3b392542e6e819a6a1846aee9cfcc1b690351869bf2a46b5ee
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 小舟 (char_pw_xiaozhou). Subject identity: ordinary human volunteer guide with crisp map-table posture, small lantern pin, route-card fan. Identity locks: map-table guide posture, white service lamp, route-card fan, calm step-by-step gesture. Signature prop: blank route-step cards with abstract marks. The portrait is visibly inside pw_lantern_helpdesk with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: civic lantern wayfinding anime/game portrait, clean map-table collage; palette and light: warm paper white, soft lighthouse yellow, civic cyan, leaf green, graphite linework / clear desk-lamp glow and gentle map reflection; medium/texture: paper map layers, sticky-note blocks without readable text, translucent route lines, clean cel-shaded character core. Anti-repetition rule: no generic museum docent bust; must show map-table/lantern/helpdesk wayfinding cues and practical guidance posture. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- style_family: civic lantern wayfinding anime/game portrait, clean map-table collage; palette_light: warm paper white, soft lighthouse yellow, civic cyan, leaf green, graphite linework / clear desk-lamp glow and gentle map reflection; material_system: paper map layers, sticky-note blocks without readable text, translucent route lines, clean cel-shaded character core; anti_repetition: no generic museum docent bust; must show map-table/lantern/helpdesk wayfinding cues and practical guidance posture

## Identity locks

- map-table guide posture
- white service lamp
- route-card fan
- calm step-by-step gesture
- signature prop: blank route-step cards with abstract marks

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
