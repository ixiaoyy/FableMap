---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_ahuai/
assets: frontend/public/assets/npcs/public-welfare/char_pw_ahuai/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_ahuai/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_ahuai/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_ahuai/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_ahuai/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_ahuai
widths: neutral=1254; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=1254; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=a4b7e5e50d0565a831f85af7f3c454d54eac3edee37b15dd4ac2fff4e28b4d22; joy=cd8f3e54656f0336a04c69f8bafeb20dae50158a49cd4eb4da373d42455c26b6; anger=6ba9ea6789c9d32c298c284940f74653dcb779aa11fdac0ecd05d14f560fb266; embarrassment=b73791ebcef4b56f33a173942aad66a7c7b1b762123e19ce4a44aa27f57328b0; curiosity=529a741e4d88da5ecc1a17e3b63e4fe2ad17b3ebefb9a698854e23ff61e12619
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 阿槐, volunteer repair master who turns small broken objects into doable first steps. Subject identity: ordinary human repair volunteer, sturdy practical silhouette, rolled apron, kind no-nonsense expression. Identity locks: rolled apron, screwdriver bundle, warm orange lamp, half-open toolbox. Signature prop: repair checklist card with simulated marks. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/curiosity.png` — `curiosity`

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

- rolled apron
- screwdriver bundle
- warm orange lamp
- half-open toolbox
- signature prop: repair checklist card with simulated marks

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
