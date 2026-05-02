---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_huoyan/
assets: frontend/public/assets/npcs/public-welfare/char_pw_huoyan/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_huoyan/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_huoyan/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_huoyan/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_huoyan/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_huoyan
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=0b1a83fcee0b723c7bdde90c609a7fcbbaa8d0a72abd9da2723e4d37ef7a6946; joy=002c8e8aceac5d1c80ad9cf9c68ca8411c7f81b03bf18cf4bf587e6a0838702f; anger=5177906e047dbe9f57f65b52f830987640f991ddf6414439c13f79f449649e5f; embarrassment=6c9215b894dcfa4f97238ad30c3662bc64cb42d3958fd70c8798fc01bd7bd1e2; curiosity=43c4e4f419b853ec771570e8107bb627cc8e13e9abc016a77195414c346b60a9
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 火眼, field safety sorter separating story clues from risky real-world action. Subject identity: ordinary human safety sorter, direct gaze, rolled sleeves, reflective boundary sash, protective stance. Identity locks: reflective boundary sash, red boundary circles, two pencils, protective stance. Signature prop: safe/unsafe boundary ring cards. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/curiosity.png` — `curiosity`

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

- reflective boundary sash
- red boundary circles
- two pencils
- protective stance
- signature prop: safe/unsafe boundary ring cards

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
