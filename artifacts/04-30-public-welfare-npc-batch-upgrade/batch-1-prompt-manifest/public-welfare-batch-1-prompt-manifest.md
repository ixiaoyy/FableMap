# Batch 1 Prompt Manifest — Public-welfare NPC rebuild

本文件先锁定 Prompt-as-Code、风格多样性和落盘路径。后续生成与替换结果见
`artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-generated-assets/batch-1-generated-assets-manifest.md`。

## Scope / guardrails

- Source audit: `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-0-audit/public-welfare-npc-batch-0-audit.json`
- Prompt-first：后续必须先使用本 manifest 的 prompt/envelope，再调用生图工具。
- Final project path: `frontend/public/assets/npcs/public-welfare/<char_id>/{neutral,joy,anger,embarrassment,curiosity}.png`.
- Final sprite size: follow current spec/tests as `256×256 PNG` for legacy replacements unless the same implementation slice updates tests/spec. High-res source/reference images may be archived under `artifacts/.../batch-1-*`.
- 本文件对应 prompt-first 步骤；正式生成/替换由 Batch 1 generated assets manifest 单独记录。

## Diversity matrix

| Tavern | Style family | Palette / light | Body-plan axis | Material system | Main anti-repetition rule |
| --- | --- | --- | --- | --- | --- |
| `pw_third_shelf_observatory` | high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror | thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight / cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow | each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern | receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core | ordinary human anime cashier only; same centered bust for all four; no shelf/tavern cues; unreadable expression because of alien anatomy |
| `pw_midnight_commission_board` | underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere | ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents / single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable | three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter | screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers | generic detective with gun; combat/ranking visual language; same black coat portrait repeated; readable invented legal/police text |
| `pw_community_repair` | warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture | aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights / soft late-afternoon workshop light, small lamp glow on tools, gentle shadows | three realistic roles differ by job posture: tool repair, mediation, sortable action checklist | silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines | same apron human trio; generic craftsman without tavern cues; professional legal/therapy implication; no action checklist cues |

## Character prompt map

| Tavern | Character | Species/body plan | Identity locks | Target files |
| --- | --- | --- | --- | --- |
| `pw_third_shelf_observatory` | `char_pw_9_delta` 社长 9-Delta | slender original alien with elongated fingers, layered observation lenses, narrow luminous pupils, clipboard-like analysis slate | tall thin silhouette; multi-layer observation lenses; convenience vest over lab apron; analysis slate | `frontend/public/assets/npcs/public-welfare/char_pw_9_delta/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_9_delta/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_9_delta/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_9_delta/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_9_delta/curiosity.png` |
| `pw_third_shelf_observatory` | `char_pw_mu_mu` 临时店员 Mu-Mu | soft elastic non-human body wearing a slightly wrong human convenience-store vest, asymmetrical smile, harmless extra small tendril-hand for scanner | soft rounded silhouette; oversized vest; scanner held awkwardly; one harmless extra tendril-hand | `frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mu_mu/curiosity.png` |
| `pw_third_shelf_observatory` | `char_pw_v17` 样本保管员 V-17 | semi-mechanical transparent archive being with glass panel torso, receipt-roll core, gentle face display, small storage drawers | glass/metal archive body; receipt-roll core; drawer-like hip pouch; gentle face display | `frontend/public/assets/npcs/public-welfare/char_pw_v17/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_v17/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_v17/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_v17/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_v17/curiosity.png` |
| `pw_third_shelf_observatory` | `char_pw_pi_pi` 地球礼仪实习生 Pi-Pi | small floating original alien intern with compact multi-limb silhouette, tiny apron, etiquette flashcards, expressive antennae | small floating silhouette; tiny apron; expressive antennae; etiquette flashcards | `frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_pi_pi/curiosity.png` |
| `pw_midnight_commission_board` | `char_pw_mozhan` 墨栈 | ordinary human tavern clerk, calm mature silhouette, ink-stained sleeves, warm practical gaze | ink-stained sleeve; wooden commission board; graphite pencil; calm organizer posture | `frontend/public/assets/npcs/public-welfare/char_pw_mozhan/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mozhan/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mozhan/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mozhan/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_mozhan/curiosity.png` |
| `pw_midnight_commission_board` | `char_pw_zhideng` 栀灯 | ordinary human registrar, precise posture, small stamp-pad gloves, clock-shadow hairpin motif | stamp-pad gloves; clock-shadow motif; registration window frame; cool violet accent | `frontend/public/assets/npcs/public-welfare/char_pw_zhideng/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhideng/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhideng/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhideng/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_zhideng/curiosity.png` |
| `pw_midnight_commission_board` | `char_pw_huoyan` 火眼 | ordinary human safety sorter, direct gaze, rolled sleeves, reflective boundary sash, protective stance | reflective boundary sash; red boundary circles; two pencils; protective stance | `frontend/public/assets/npcs/public-welfare/char_pw_huoyan/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_huoyan/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_huoyan/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_huoyan/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_huoyan/curiosity.png` |
| `pw_community_repair` | `char_pw_ahuai` 阿槐 | ordinary human repair volunteer, sturdy practical silhouette, rolled apron, kind no-nonsense expression | rolled apron; screwdriver bundle; warm orange lamp; half-open toolbox | `frontend/public/assets/npcs/public-welfare/char_pw_ahuai/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_ahuai/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_ahuai/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_ahuai/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_ahuai/curiosity.png` |
| `pw_community_repair` | `char_pw_heguang` 和光 | ordinary human mediator, soft round posture, calm hands near two cups and blank sticky notes | round table; two water cups; blank sticky notes; soft denim-blue accent | `frontend/public/assets/npcs/public-welfare/char_pw_heguang/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_heguang/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_heguang/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_heguang/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_heguang/curiosity.png` |
| `pw_community_repair` | `char_pw_qiaoshou` 巧手 | ordinary human practical assistant, quick bright gesture, utility pouch, buttons/wire rings sorted by color | utility pouch; buttons and wire rings; color-coded string; quick sorting gesture | `frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/neutral.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/joy.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/anger.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/embarrassment.png`<br>`frontend/public/assets/npcs/public-welfare/char_pw_qiaoshou/curiosity.png` |

## Copyable base prompts

### 公益·第三货架观测站 / `pw_third_shelf_observatory`

#### 社长 9-Delta / `char_pw_9_delta`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 社长 9-Delta, alien anthropology club president and store-behavior observer. Subject identity: slender original alien with elongated fingers, layered observation lenses, narrow luminous pupils, clipboard-like analysis slate. Identity locks: tall thin silhouette, multi-layer observation lenses, convenience vest over lab apron, analysis slate. Signature prop: non-readable behavior observation slate. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 临时店员 Mu-Mu / `char_pw_mu_mu`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 临时店员 Mu-Mu, temporary clerk trying too hard to pass as human. Subject identity: soft elastic non-human body wearing a slightly wrong human convenience-store vest, asymmetrical smile, harmless extra small tendril-hand for scanner. Identity locks: soft rounded silhouette, oversized vest, scanner held awkwardly, one harmless extra tendril-hand. Signature prop: barcode scanner held too carefully. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 样本保管员 V-17 / `char_pw_v17`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 样本保管员 V-17, sample keeper and revisit archive custodian. Subject identity: semi-mechanical transparent archive being with glass panel torso, receipt-roll core, gentle face display, small storage drawers. Identity locks: glass/metal archive body, receipt-roll core, drawer-like hip pouch, gentle face display. Signature prop: transparent revisit-label drawer. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 地球礼仪实习生 Pi-Pi / `char_pw_pi_pi`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 地球礼仪实习生 Pi-Pi, small etiquette intern learning human greetings. Subject identity: small floating original alien intern with compact multi-limb silhouette, tiny apron, etiquette flashcards, expressive antennae. Identity locks: small floating silhouette, tiny apron, expressive antennae, etiquette flashcards. Signature prop: non-readable etiquette flashcard ring. The portrait is visibly inside 公益·第三货架观测站 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror; palette thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight; lighting cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow; medium texture receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core; mood absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror; symbolic motifs receipt fragments, inventory scan windows, abstract shelf labels, oden steam glyphs, tiny map-coordinate stickers. Composition: waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue; bust or waist-up, eye-level or slight low angle per role; flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm. Quality diversity thesis: each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

### 公益·午夜委托局 / `pw_midnight_commission_board`

#### 墨栈 / `char_pw_mozhan`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 墨栈, night-duty commission organizer turning vague wishes into safe small tasks. Subject identity: ordinary human tavern clerk, calm mature silhouette, ink-stained sleeves, warm practical gaze. Identity locks: ink-stained sleeve, wooden commission board, graphite pencil, calm organizer posture. Signature prop: three-category task cards with simulated marks. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 栀灯 / `char_pw_zhideng`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 栀灯, anomaly registrar who records urban rumors as safe observable incidents. Subject identity: ordinary human registrar, precise posture, small stamp-pad gloves, clock-shadow hairpin motif. Identity locks: stamp-pad gloves, clock-shadow motif, registration window frame, cool violet accent. Signature prop: non-readable anomaly ledger and stamp. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 火眼 / `char_pw_huoyan`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 火眼, field safety sorter separating story clues from risky real-world action. Subject identity: ordinary human safety sorter, direct gaze, rolled sleeves, reflective boundary sash, protective stance. Identity locks: reflective boundary sash, red boundary circles, two pencils, protective stance. Signature prop: safe/unsafe boundary ring cards. The portrait is visibly inside 公益·午夜委托局 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere; palette ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents; lighting single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable; medium texture screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers; mood quietly investigative, reliable, low-risk; not combat, not thriller violence; symbolic motifs commission tickets, red string arcs, map pins, stamp shapes, pencil annotations as simulated text. Composition: waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject; medium bust, eye-level, slight dutch angle only for anomaly registrar; flat collage layers with clear foreground ticket silhouettes and warm lantern midground. Quality diversity thesis: three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

### 公益·街角修补工坊 / `pw_community_repair`

#### 阿槐 / `char_pw_ahuai`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 阿槐, volunteer repair master who turns small broken objects into doable first steps. Subject identity: ordinary human repair volunteer, sturdy practical silhouette, rolled apron, kind no-nonsense expression. Identity locks: rolled apron, screwdriver bundle, warm orange lamp, half-open toolbox. Signature prop: repair checklist card with simulated marks. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 和光 / `char_pw_heguang`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 和光, communication mediator for relationship and key-conversation repair. Subject identity: ordinary human mediator, soft round posture, calm hands near two cups and blank sticky notes. Identity locks: round table, two water cups, blank sticky notes, soft denim-blue accent. Signature prop: blank shared-goal note card. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

#### 巧手 / `char_pw_qiaoshou`

Base prompt:

```text
Create a finished original FableMap cyber-tavern NPC square portrait sprite for 巧手, assistant who sorts messy tasks into recoverable and actionable parts. Subject identity: ordinary human practical assistant, quick bright gesture, utility pouch, buttons/wire rings sorted by color. Identity locks: utility pouch, buttons and wire rings, color-coded string, quick sorting gesture. Signature prop: small parts tray with simulated labels. The portrait is visibly inside 公益·街角修补工坊 with tavern/service cues: bar/counter or service counter, mugs or cups, shelves, lantern or task light, map-table or coordinate card. Style DNA: warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture; palette aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights; lighting soft late-afternoon workshop light, small lamp glow on tools, gentle shadows; medium texture silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines; mood practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting; symbolic motifs buttons, loose wires, blank sticky labels, round table cups, checklist boxes as simulated marks. Composition: waist-up portrait at a repair counter or round mediation table, props form a triangular role frame; eye-level friendly portrait; hands visible when role requires action; flat poster layers with foreground tools and midground tavern-workshop counter. Quality diversity thesis: three realistic roles differ by job posture: tool repair, mediation, sortable action checklist. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data.
```

Expression suffixes:
- `neutral`: neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language
- `joy`: joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop
- `anger`: angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop
- `embarrassment`: embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop
- `curiosity`: curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop

## Next implementation notes

- 先为每个角色生成 source/reference 图并存入 `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-sources/`，记录原始文件、prompt、hash。
- 再裁剪/缩放为正式五表情 PNG，覆盖前先保存源→目标映射和旧 hash。
- 如果把当前测试固定为 256×256 的角色升到 512×512，必须同一改动更新测试/规范；否则保持 256×256。
- 图落盘后运行：`py -3 -m pytest -q tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py --tb=short`，涉及前端引用再跑 `npm --prefix .\frontend run build`。
