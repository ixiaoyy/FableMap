---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/
assets: frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_pi_pi
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=cf5f36f880f2bc7cc15e2126d2b70bbe1336d11aed1ec405bdd7863823e5ca3f; joy=921371c344518ee77ca36d4216d3542d798e23e60e49ade2d1a89345314ebc0a; anger=532f15ec2bba765ac049c0aaa116e007293939bb415edecafa7bbe29b443dfbf; embarrassment=410df5bcccf1de29f6f26273a27cbcc0050d382c280245b57230a70757219a0b; curiosity=234ecb8965080359239eba3ef9de56838ee87ebba43b6804796181c101a8bdbb
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 地球礼仪实习生 Pi-Pi, small etiquette intern learning human greetings. Subject identity: small floating original alien intern with compact multi-limb silhouette, tiny apron, etiquette flashcards, expressive antennae. Identity locks: small floating silhouette, tiny apron, expressive antennae, etiquette flashcards. Signature prop: non-readable etiquette flashcard ring. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/curiosity.png` — `curiosity`

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

- art_style_and_genre: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette_color_science: thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting_signature: cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium_texture: receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood: absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; era_context: post-digital convenience-store anthropology, low-budget zine sci-fi, public-welfare tavern demo; detail_density: medium-high around props/shelves/receipt fragments, clean readable face and silhouette; post_processing: controlled chromatic edge offsets, thermal-print speckles, no messy overglitch; symbolic_motifs: ['receipt fragments', 'inventory scan windows', 'abstract shelf labels', 'oden steam glyphs', 'tiny map-coordinate stickers']

## Identity locks

- small floating silhouette
- tiny apron
- expressive antennae
- etiquette flashcards
- signature prop: non-readable etiquette flashcard ring

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
