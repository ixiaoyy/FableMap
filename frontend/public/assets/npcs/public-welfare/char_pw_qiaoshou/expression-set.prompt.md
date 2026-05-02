---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/
assets: frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_qiaoshou
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=fb463145e45913d5bceef723869e1c06b03caf8fb7181ed09e3217f53ee8279a; joy=3754a96c33376c0ae0eb16bf7d526e47d68d3e1f070005602321de6b104d279e; anger=a6e4dc69263c5aa3baba71fee3a077eb9ca13e1ae6cf02f27b38f156c6347b18; embarrassment=08c341ac05c19dd51ed942e7797dc89befa5f023c0c9ced8521ceeb4ed2220a6; curiosity=f3e7119258e134b25ac3e36af4f8998bf0e53dad5afb7271d5af2493a76e3f43
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 巧手, assistant who sorts messy tasks into recoverable and actionable parts. Subject identity: ordinary human practical assistant, quick bright gesture, utility pouch, buttons/wire rings sorted by color. Identity locks: utility pouch, buttons and wire rings, color-coded string, quick sorting gesture. Signature prop: small parts tray with simulated labels. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/curiosity.png` — `curiosity`

## Negative constraints

- owner-reviewable draft only until accepted
- original character only
- no existing IP or recognizable franchise species/characters
- no brand logo, no watermark, no readable invented slogan
- no living-artist imitation
- no owner API keys, no visitor-private data, no exact private address
- not a placeholder, not a UI mockup, not a blank gradient avatar
- visible tavern interior cues required
- identity must stay consistent across neutral/joy/anger/embarrassment/curiosity
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- art_style_and_genre: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette_color_science: aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting_signature: soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium_texture: silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood: practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; era_context: neighborhood repair bulletin, analog craft zine, public-welfare workshop; detail_density: medium around tools and labels, clean face and hand gesture; post_processing: soft print grain and paper edge wear, no heavy glitch; symbolic_motifs: ['buttons', 'loose wires', 'blank sticky labels', 'round table cups', 'checklist boxes as simulated marks']

## Identity locks

- utility pouch
- buttons and wire rings
- color-coded string
- quick sorting gesture
- signature prop: small parts tray with simulated labels

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
