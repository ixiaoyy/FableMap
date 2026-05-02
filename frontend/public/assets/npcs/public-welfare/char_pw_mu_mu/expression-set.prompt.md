---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/
assets: frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json
character_id: char_pw_mu_mu
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=317cf16d1e96f6ec333a3eb670ba6b7c72e23f72e574890d4d6798ddc16e8237; joy=a74bca2728cf6e4e37b92fe0d9c814d35f374b141a855a2e2c00552a67ca6506; anger=603467119aaa7670f466b5ba5101a13cf64af1eed7a43a33f11815d29370d544; embarrassment=6b82511216b1b563d6fd9b308dc9d1023ed304c0ad65a07f39f63f73cb88eaf9; curiosity=4e57e9a44b2c54ee8e202b75b88965485b0390ed379c13d1007396e96e9ab9ef
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 临时店员 Mu-Mu, temporary clerk trying too hard to pass as human. Subject identity: soft elastic non-human body wearing a slightly wrong human convenience-store vest, asymmetrical smile, harmless extra small tendril-hand for scanner. Identity locks: soft rounded silhouette, oversized vest, scanner held awkwardly, one harmless extra tendril-hand. Signature prop: barcode scanner held too carefully. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/curiosity.png` — `curiosity`

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

- soft rounded silhouette
- oversized vest
- scanner held awkwardly
- one harmless extra tendril-hand
- signature prop: barcode scanner held too carefully

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
