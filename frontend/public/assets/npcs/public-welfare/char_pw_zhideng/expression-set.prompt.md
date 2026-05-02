---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_zhideng/
assets: frontend/public/assets/npcs/public-welfare/char_pw_zhideng/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_zhideng/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_zhideng/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_zhideng/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_zhideng/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_zhideng
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=5360697c6913483f01e400a92262f41735bf4a7241dab75d7b60f600c7ec0881; joy=60fc9d73e5b19ee2392b989889e1cd5768a8a94e6e5d6b36e7f5ff42d9c36112; anger=ac49e4cbf616325fd0e62d824ddbac55874bea56346e687206806bcba89a35df; embarrassment=75c7d42560455a5e95f336ab55fd37792f710fc98d47faabe56bbad60dd2b950; curiosity=96e5b082b41cd138185227d83a8a45a8e7594b919f305b73283db4d0c0f08766
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 栀灯, anomaly registrar who records urban rumors as safe observable incidents. Subject identity: ordinary human registrar, precise posture, small stamp-pad gloves, clock-shadow hairpin motif. Identity locks: stamp-pad gloves, clock-shadow motif, registration window frame, cool violet accent. Signature prop: non-readable anomaly ledger and stamp. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/curiosity.png` — `curiosity`

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

- art_style_and_genre: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette_color_science: ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting_signature: single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium_texture: screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood: quietly investigative, reliable, low-risk; not combat, not thriller violence; era_context: late-night neighborhood bulletin board and analog mystery zine; detail_density: high around board/tickets/clue props, low around face silhouette; post_processing: mild print misregistration, grain, no extreme glitch; symbolic_motifs: ['commission tickets', 'red string arcs', 'map pins', 'stamp shapes', 'pencil annotations as simulated text']

## Identity locks

- stamp-pad gloves
- clock-shadow motif
- registration window frame
- cool violet accent
- signature prop: non-readable anomaly ledger and stamp

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
