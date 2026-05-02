---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_heguang/
assets: frontend/public/assets/npcs/public-welfare/char_pw_heguang/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_heguang/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_heguang/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_heguang/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_heguang/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_heguang
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=db972072fca34856a198fa7f2ca08a916f09f76fcb39dc0d734d95ea46b3814f; joy=ec57f8489c77a698a73d57b4a13608a910595663e073d25cfdc084823067f8d4; anger=daf372bb48efdf77c738ce0cbe0ec7c0436ec6ba60592e9af9c5e37a87fa0443; embarrassment=9aed6378dc5b9f20dd320a2d530727c11fa58dbd10e265f5e1c5392523b4155c; curiosity=d142608fcb1cf888f6c5e2c3c7b94494628ba8d2e1155644ed09ef23e58ab667
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 和光, communication mediator for relationship and key-conversation repair. Subject identity: ordinary human mediator, soft round posture, calm hands near two cups and blank sticky notes. Identity locks: round table, two water cups, blank sticky notes, soft denim-blue accent. Signature prop: blank shared-goal note card. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_heguang/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_heguang/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_heguang/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_heguang/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_heguang/curiosity.png` — `curiosity`

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

- round table
- two water cups
- blank sticky notes
- soft denim-blue accent
- signature prop: blank shared-goal note card

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
