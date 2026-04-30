# Batch 2 Prompt Manifest — Public-welfare pending rejected-expression cleanup

This prompt-first manifest covers the remaining `pending_regeneration` rejected-expression assets not included in Batch 1.

## Scope / guardrails

- Target characters: `char_pw_xiaozhou`, `char_pw_anlan`, `char_pw_wenjian`, `char_pw_zhijian`.
- Final project path pattern: `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.
- Final sprite size: 256×256 PNG; 512×512 source/reference images are archived in Batch 2 generated assets.
- Prompt-first only; generated/replaced files are recorded separately in Batch 2 generated assets manifest.
- Reusable style recipes recorded in `.agents/skills/generate-character-prompt/references/style-recipes.md` sections 21–24.

## Diversity matrix

| Tavern | Style family | Palette / light | Material system | Anti-repetition rule |
| --- | --- | --- | --- | --- |
| `pw_lantern_helpdesk` | civic lantern wayfinding anime/game portrait, clean map-table collage | warm paper white, soft lighthouse yellow, civic cyan, leaf green, graphite linework / clear desk-lamp glow and gentle map reflection | paper map layers, sticky-note blocks without readable text, translucent route lines, clean cel-shaded character core | no generic museum docent bust; must show map-table/lantern/helpdesk wayfinding cues and practical guidance posture |
| `pw_midnight_treehole` | lo-fi midnight radio mixed-media portrait, quiet white-line overlay on soft dark room | deep navy, muted violet, low amber equipment LEDs, desaturated teal highlights / low-key studio lamp and city-window rim light | soft photo-grain blur, radio waveform arcs, handwritten-but-unreadable note strips, delicate white linework | not medical/therapy branding; not generic night platform; must keep microphone, anonymous notebook, boundary-safe radio mood |
| `pw_lost_found_archive` | industrial archive glass-booth collage anime/game portrait, pre-digital records desk | aged paper, smoky glass gray, muted denim blue, label-tag cream, small tungsten desk-lamp amber / readable face under glass reflection | file cards, blank labels, copier grain, glass booth reflections, thin catalog grid lines | no generic librarian; must show lost-found register, safe public-clue sorting, non-private labels |
| `pw_after_school_hero_supply` | after-school sticker toybox riso portrait, paper-shadow magical realism without horror | sunset cream, hero-card red, schoolbag blue, paper-white silhouette, golden after-school glow / soft toy-shop light | sticker edges, riso grain, folded-paper shadow, old hero-card frames, abstract badge shapes | not battle RPG; not ghost horror; paper sword must be harmless and childhood-memory oriented |

## Character prompt map

| Character | Species/body plan | Identity locks | Target files |
| --- | --- | --- | --- |
| `char_pw_xiaozhou` 小舟 | ordinary human volunteer guide with crisp map-table posture, small lantern pin, route-card fan | map-table guide posture, white service lamp, route-card fan, calm step-by-step gesture | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/curiosity.png` |
| `char_pw_anlan` 安澜 | ordinary human midnight host with quiet shoulders, soft headphones, anonymous message notebook | soft headphones, low radio microphone, anonymous notebook, quiet boundary-safe expression | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_anlan/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_anlan/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_anlan/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_anlan/curiosity.png` |
| `char_pw_wenjian` 闻笺 | ordinary human archive keeper behind glass booth, careful hands, numbered clue-card rhythm | glass archive booth, lost-found register, blank label strips, careful cataloging hands | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_wenjian/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_wenjian/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_wenjian/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_wenjian/curiosity.png` |
| `char_pw_zhijian` 纸剑 | small harmless paper-shadow child echo, folded-paper silhouette, translucent edge, origami sword | folded-paper silhouette, harmless origami sword, old hero-card sleeve, sunset drawer reflection | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhijian/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhijian/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhijian/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhijian/curiosity.png` |

## Copyable base prompts

### 小舟 / `char_pw_xiaozhou`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 小舟 (char_pw_xiaozhou). Subject identity: ordinary human volunteer guide with crisp map-table posture, small lantern pin, route-card fan. Identity locks: map-table guide posture, white service lamp, route-card fan, calm step-by-step gesture. Signature prop: blank route-step cards with abstract marks. The portrait is visibly inside pw_lantern_helpdesk with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: civic lantern wayfinding anime/game portrait, clean map-table collage; palette and light: warm paper white, soft lighthouse yellow, civic cyan, leaf green, graphite linework / clear desk-lamp glow and gentle map reflection; medium/texture: paper map layers, sticky-note blocks without readable text, translucent route lines, clean cel-shaded character core. Anti-repetition rule: no generic museum docent bust; must show map-table/lantern/helpdesk wayfinding cues and practical guidance posture. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

### 安澜 / `char_pw_anlan`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 安澜 (char_pw_anlan). Subject identity: ordinary human midnight host with quiet shoulders, soft headphones, anonymous message notebook. Identity locks: soft headphones, low radio microphone, anonymous notebook, quiet boundary-safe expression. Signature prop: low radio microphone and unreadable message notebook. The portrait is visibly inside pw_midnight_treehole with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: lo-fi midnight radio mixed-media portrait, quiet white-line overlay on soft dark room; palette and light: deep navy, muted violet, low amber equipment LEDs, desaturated teal highlights / low-key studio lamp and city-window rim light; medium/texture: soft photo-grain blur, radio waveform arcs, handwritten-but-unreadable note strips, delicate white linework. Anti-repetition rule: not medical/therapy branding; not generic night platform; must keep microphone, anonymous notebook, boundary-safe radio mood. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

### 闻笺 / `char_pw_wenjian`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 闻笺 (char_pw_wenjian). Subject identity: ordinary human archive keeper behind glass booth, careful hands, numbered clue-card rhythm. Identity locks: glass archive booth, lost-found register, blank label strips, careful cataloging hands. Signature prop: three-column public-clue register with simulated marks. The portrait is visibly inside pw_lost_found_archive with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: industrial archive glass-booth collage anime/game portrait, pre-digital records desk; palette and light: aged paper, smoky glass gray, muted denim blue, label-tag cream, small tungsten desk-lamp amber / readable face under glass reflection; medium/texture: file cards, blank labels, copier grain, glass booth reflections, thin catalog grid lines. Anti-repetition rule: no generic librarian; must show lost-found register, safe public-clue sorting, non-private labels. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

### 纸剑 / `char_pw_zhijian`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 纸剑 (char_pw_zhijian). Subject identity: small harmless paper-shadow child echo, folded-paper silhouette, translucent edge, origami sword. Identity locks: folded-paper silhouette, harmless origami sword, old hero-card sleeve, sunset drawer reflection. Signature prop: folded paper sword and blank hero-card sleeve. The portrait is visibly inside pw_after_school_hero_supply with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: after-school sticker toybox riso portrait, paper-shadow magical realism without horror; palette and light: sunset cream, hero-card red, schoolbag blue, paper-white silhouette, golden after-school glow / soft toy-shop light; medium/texture: sticker edges, riso grain, folded-paper shadow, old hero-card frames, abstract badge shapes. Anti-repetition rule: not battle RPG; not ghost horror; paper sword must be harmless and childhood-memory oriented. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop
