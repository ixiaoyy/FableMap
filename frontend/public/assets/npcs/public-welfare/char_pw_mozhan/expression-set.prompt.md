---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_mozhan/
assets: frontend/public/assets/npcs/public-welfare/char_pw_mozhan/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_mozhan/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_mozhan/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_mozhan/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_mozhan/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_mozhan
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=8e4dd3f6b0310a5bd5649afc16c50f5223aac9c48d91e6eb220e61ed75de3dec; joy=8446a3057af0d905e77ea1439d7bd68f1dbb24facab861db116bf0b8b72cb7fb; anger=975783803ab96bf9b1aad6afb585ba79c0d2774ebbf9f06fd11a7964aec132d9; embarrassment=42f15241adcd8412f6ca4c65654380db1e74a70d36d090093a3b9f62ffa91957; curiosity=4653ccb255f762140804f579ad91a5139dfd5a605e272ef2f5f3d37e915d5a88
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 墨栈, night-duty commission organizer turning vague wishes into safe small tasks. Subject identity: ordinary human tavern clerk, calm mature silhouette, ink-stained sleeves, warm practical gaze. Identity locks: ink-stained sleeve, wooden commission board, graphite pencil, calm organizer posture. Signature prop: three-category task cards with simulated marks. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/curiosity.png` — `curiosity`

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

- ink-stained sleeve
- wooden commission board
- graphite pencil
- calm organizer posture
- signature prop: three-category task cards with simulated marks

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
