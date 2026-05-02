---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_wenjian/
assets: frontend/public/assets/npcs/public-welfare/char_pw_wenjian/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_wenjian/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_wenjian/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_wenjian/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_wenjian/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json
character_id: char_pw_wenjian
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=26849c02497e694935460cb0bade3e68e9840f44be3c368f76091d3c97234ae6; joy=c2042acbaba077be06212ae4464cc4e24312d3ccf3d3c127abe8573e9c6d5aa7; anger=010f3dba8038097c6cb137f4a7f0bc4bf407da796a60906b21e95af2ccda6034; embarrassment=03408df0d167f56931c119da450c26d42b285852a6f0f10cf20a6830a3acbd25; curiosity=aca407075a867fa124a8959e4824697bdd4c2aa94999b29bfd12c80f0d340af5
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 闻笺 (char_pw_wenjian). Subject identity: ordinary human archive keeper behind glass booth, careful hands, numbered clue-card rhythm. Identity locks: glass archive booth, lost-found register, blank label strips, careful cataloging hands. Signature prop: three-column public-clue register with simulated marks. The portrait is visibly inside pw_lost_found_archive with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: industrial archive glass-booth collage anime/game portrait, pre-digital records desk; palette and light: aged paper, smoky glass gray, muted denim blue, label-tag cream, small tungsten desk-lamp amber / readable face under glass reflection; medium/texture: file cards, blank labels, copier grain, glass booth reflections, thin catalog grid lines. Anti-repetition rule: no generic librarian; must show lost-found register, safe public-clue sorting, non-private labels. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- style_family: industrial archive glass-booth collage anime/game portrait, pre-digital records desk; palette_light: aged paper, smoky glass gray, muted denim blue, label-tag cream, small tungsten desk-lamp amber / readable face under glass reflection; material_system: file cards, blank labels, copier grain, glass booth reflections, thin catalog grid lines; anti_repetition: no generic librarian; must show lost-found register, safe public-clue sorting, non-private labels

## Identity locks

- glass archive booth
- lost-found register
- blank label strips
- careful cataloging hands
- signature prop: three-column public-clue register with simulated marks

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
