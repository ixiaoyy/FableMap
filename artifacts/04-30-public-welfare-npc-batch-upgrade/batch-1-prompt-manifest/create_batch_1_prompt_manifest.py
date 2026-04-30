from __future__ import annotations

import json
from pathlib import Path

OUT_DIR = Path('artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest')
EXPRESSIONS = {
    'neutral': 'neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language',
    'joy': 'joy/happy expression, warmer eyes and open smile, same face, same body plan, same outfit and signature prop',
    'anger': 'angry/boundary-setting expression, firm brows and protective posture, not violent, same face, same body plan, same outfit and signature prop',
    'embarrassment': 'embarrassment/shy expression, slightly averted gaze or modest gesture, same face, same body plan, same outfit and signature prop',
    'curiosity': 'curious expression, inquisitive eyes and subtle lean toward a clue/object, same face, same body plan, same outfit and signature prop',
}
BASE_CONSTRAINTS = [
    'owner-reviewable draft only until accepted',
    'original character only',
    'no existing IP or recognizable franchise species/characters',
    'no brand logo, no watermark, no readable invented slogan',
    'no living-artist imitation',
    'no owner API keys, no visitor-private data, no exact private address',
    'not a placeholder, not a UI mockup, not a blank gradient avatar',
    'visible tavern interior cues required',
    'identity must stay consistent across neutral/joy/anger/embarrassment/curiosity',
]
TARGET_OUTPUT = {
    'aspect_ratio': '1:1 square portrait',
    'source_generation': 'high-resolution square source allowed',
    'project_final': 'crop/resize final sprite to 256x256 PNG unless tests/spec are updated in the same implementation slice',
    'paths': 'frontend/public/assets/npcs/public-welfare/<char_id>/{neutral,joy,anger,embarrassment,curiosity}.png',
}

shops = [
    {
        'tavern_id': 'pw_third_shelf_observatory',
        'tavern_name': '公益·第三货架观测站',
        'priority': 'P0',
        'real_coordinate_anchor': {'place_name_or_area': 'public 24-hour convenience-store-like urban corner, abstracted', 'privacy_level': 'public_area_only', 'must_not_include': ['exact private address', 'official convenience-store branding', 'official map-provider imitation']},
        'style_dna': {
            'art_style_and_genre': 'high-contrast digital industrial glitch anime/game concept portrait, convenience-store sci-fi comedy rather than horror',
            'palette_color_science': 'thermal-paper off-white, cool gray, deep black linework, acid green/violet scan accents, tiny warm oden-lamp amber only as local highlight',
            'lighting_signature': 'cold fluorescent shelf light mixed with narrow scanner glow; crisp hard rim light, no generic teal wooden bar glow',
            'medium_texture': 'receipt-scan noise, copier grain, subtle pixel sorting, thin vector inventory marks, clean cel-shaded character core',
            'mood': 'absurd, observant, slightly awkward, safe and welcoming; not threatening, not horror',
            'era_context': 'post-digital convenience-store anthropology, low-budget zine sci-fi, public-welfare tavern demo',
            'detail_density': 'medium-high around props/shelves/receipt fragments, clean readable face and silhouette',
            'post_processing': 'controlled chromatic edge offsets, thermal-print speckles, no messy overglitch',
            'symbolic_motifs': ['receipt fragments', 'inventory scan windows', 'abstract shelf labels', 'oden steam glyphs', 'tiny map-coordinate stickers'],
        },
        'composition': {
            'layout': 'waist-up portrait in asymmetric scan-window frame; foreground shelf/receipt edge acts as depth cue',
            'shot_type_angle': 'bust or waist-up, eye-level or slight low angle per role',
            'spatial_logic': 'flattened layers plus rectangular inventory windows; background supplies convenience-tavern rhythm',
        },
        'quality_diversity': {
            'visual_thesis': 'each alien role differs by body plan/material: lens-thin scholar, soft failed-disguise clerk, glass/mechanical archive keeper, tiny floating intern',
            'must_differ_from_recent_assets': ['species/body-plan silhouette', 'material system', 'composition frame', 'palette accent distribution'],
            'rejection_criteria': ['ordinary human anime cashier only', 'same centered bust for all four', 'no shelf/tavern cues', 'unreadable expression because of alien anatomy'],
        },
        'characters': [
            {'char_id': 'char_pw_9_delta', 'name': '社长 9-Delta', 'role': 'alien anthropology club president and store-behavior observer', 'species_or_body_plan': 'slender original alien with elongated fingers, layered observation lenses, narrow luminous pupils, clipboard-like analysis slate', 'identity_locks': ['tall thin silhouette', 'multi-layer observation lenses', 'convenience vest over lab apron', 'analysis slate'], 'signature_prop': 'non-readable behavior observation slate'},
            {'char_id': 'char_pw_mu_mu', 'name': '临时店员 Mu-Mu', 'role': 'temporary clerk trying too hard to pass as human', 'species_or_body_plan': 'soft elastic non-human body wearing a slightly wrong human convenience-store vest, asymmetrical smile, harmless extra small tendril-hand for scanner', 'identity_locks': ['soft rounded silhouette', 'oversized vest', 'scanner held awkwardly', 'one harmless extra tendril-hand'], 'signature_prop': 'barcode scanner held too carefully'},
            {'char_id': 'char_pw_v17', 'name': '样本保管员 V-17', 'role': 'sample keeper and revisit archive custodian', 'species_or_body_plan': 'semi-mechanical transparent archive being with glass panel torso, receipt-roll core, gentle face display, small storage drawers', 'identity_locks': ['glass/metal archive body', 'receipt-roll core', 'drawer-like hip pouch', 'gentle face display'], 'signature_prop': 'transparent revisit-label drawer'},
            {'char_id': 'char_pw_pi_pi', 'name': '地球礼仪实习生 Pi-Pi', 'role': 'small etiquette intern learning human greetings', 'species_or_body_plan': 'small floating original alien intern with compact multi-limb silhouette, tiny apron, etiquette flashcards, expressive antennae', 'identity_locks': ['small floating silhouette', 'tiny apron', 'expressive antennae', 'etiquette flashcards'], 'signature_prop': 'non-readable etiquette flashcard ring'},
        ],
    },
    {
        'tavern_id': 'pw_midnight_commission_board',
        'tavern_name': '公益·午夜委托局',
        'priority': 'P1',
        'real_coordinate_anchor': {'place_name_or_area': 'abstract public late-night tavern commission board', 'privacy_level': 'abstracted', 'must_not_include': ['exact private address', 'official brand signage', 'real emergency/police claim']},
        'style_dna': {
            'art_style_and_genre': 'underground noir zine anime/game portrait, halftone collage, low-horror safe text-adventure atmosphere',
            'palette_color_science': 'ink black, smoked violet, aged cream paper, restrained amber task-slip highlights, tiny red string accents',
            'lighting_signature': 'single desk lantern plus rim light from rainy doorway; strong shadows but face remains readable',
            'medium_texture': 'screenprint halftone, torn task tickets, graphite marks, stamp-pad ink, paper fibers',
            'mood': 'quietly investigative, reliable, low-risk; not combat, not thriller violence',
            'era_context': 'late-night neighborhood bulletin board and analog mystery zine',
            'detail_density': 'high around board/tickets/clue props, low around face silhouette',
            'post_processing': 'mild print misregistration, grain, no extreme glitch',
            'symbolic_motifs': ['commission tickets', 'red string arcs', 'map pins', 'stamp shapes', 'pencil annotations as simulated text'],
        },
        'composition': {
            'layout': 'waist-up portrait beside or in front of a layered commission board; diagonal task slips frame the subject',
            'shot_type_angle': 'medium bust, eye-level, slight dutch angle only for anomaly registrar',
            'spatial_logic': 'flat collage layers with clear foreground ticket silhouettes and warm lantern midground',
        },
        'quality_diversity': {
            'visual_thesis': 'three human-like roles differ by task object and posture: calm organizer, anomaly registrar, safety boundary sorter',
            'must_differ_from_recent_assets': ['prop system', 'pose/gesture', 'light color', 'paper texture density'],
            'rejection_criteria': ['generic detective with gun', 'combat/ranking visual language', 'same black coat portrait repeated', 'readable invented legal/police text'],
        },
        'characters': [
            {'char_id': 'char_pw_mozhan', 'name': '墨栈', 'role': 'night-duty commission organizer turning vague wishes into safe small tasks', 'species_or_body_plan': 'ordinary human tavern clerk, calm mature silhouette, ink-stained sleeves, warm practical gaze', 'identity_locks': ['ink-stained sleeve', 'wooden commission board', 'graphite pencil', 'calm organizer posture'], 'signature_prop': 'three-category task cards with simulated marks'},
            {'char_id': 'char_pw_zhideng', 'name': '栀灯', 'role': 'anomaly registrar who records urban rumors as safe observable incidents', 'species_or_body_plan': 'ordinary human registrar, precise posture, small stamp-pad gloves, clock-shadow hairpin motif', 'identity_locks': ['stamp-pad gloves', 'clock-shadow motif', 'registration window frame', 'cool violet accent'], 'signature_prop': 'non-readable anomaly ledger and stamp'},
            {'char_id': 'char_pw_huoyan', 'name': '火眼', 'role': 'field safety sorter separating story clues from risky real-world action', 'species_or_body_plan': 'ordinary human safety sorter, direct gaze, rolled sleeves, reflective boundary sash, protective stance', 'identity_locks': ['reflective boundary sash', 'red boundary circles', 'two pencils', 'protective stance'], 'signature_prop': 'safe/unsafe boundary ring cards'},
        ],
    },
    {
        'tavern_id': 'pw_community_repair',
        'tavern_name': '公益·街角修补工坊',
        'priority': 'P1',
        'real_coordinate_anchor': {'place_name_or_area': 'public neighborhood corner repair workshop, abstracted', 'privacy_level': 'public_area_only', 'must_not_include': ['exact private address', 'brand logo', 'professional legal/medical/financial claim']},
        'style_dna': {
            'art_style_and_genre': 'warm 70/80s street poster collage anime/game portrait, community workshop screenprint texture',
            'palette_color_science': 'aged cream paper, muted repair-shop orange, denim blue, graphite gray, tiny brass screw highlights',
            'lighting_signature': 'soft late-afternoon workshop light, small lamp glow on tools, gentle shadows',
            'medium_texture': 'silkscreen grain, torn notebook paper, fabric tape, graphite smudges, hand-repair diagram lines',
            'mood': 'practical, kind, slightly humorous, action-oriented; not corporate helpdesk and not combat crafting',
            'era_context': 'neighborhood repair bulletin, analog craft zine, public-welfare workshop',
            'detail_density': 'medium around tools and labels, clean face and hand gesture',
            'post_processing': 'soft print grain and paper edge wear, no heavy glitch',
            'symbolic_motifs': ['buttons', 'loose wires', 'blank sticky labels', 'round table cups', 'checklist boxes as simulated marks'],
        },
        'composition': {
            'layout': 'waist-up portrait at a repair counter or round mediation table, props form a triangular role frame',
            'shot_type_angle': 'eye-level friendly portrait; hands visible when role requires action',
            'spatial_logic': 'flat poster layers with foreground tools and midground tavern-workshop counter',
        },
        'quality_diversity': {
            'visual_thesis': 'three realistic roles differ by job posture: tool repair, mediation, sortable action checklist',
            'must_differ_from_recent_assets': ['hand gesture', 'prop cluster', 'background counter shape', 'dominant accent color'],
            'rejection_criteria': ['same apron human trio', 'generic craftsman without tavern cues', 'professional legal/therapy implication', 'no action checklist cues'],
        },
        'characters': [
            {'char_id': 'char_pw_ahuai', 'name': '阿槐', 'role': 'volunteer repair master who turns small broken objects into doable first steps', 'species_or_body_plan': 'ordinary human repair volunteer, sturdy practical silhouette, rolled apron, kind no-nonsense expression', 'identity_locks': ['rolled apron', 'screwdriver bundle', 'warm orange lamp', 'half-open toolbox'], 'signature_prop': 'repair checklist card with simulated marks'},
            {'char_id': 'char_pw_heguang', 'name': '和光', 'role': 'communication mediator for relationship and key-conversation repair', 'species_or_body_plan': 'ordinary human mediator, soft round posture, calm hands near two cups and blank sticky notes', 'identity_locks': ['round table', 'two water cups', 'blank sticky notes', 'soft denim-blue accent'], 'signature_prop': 'blank shared-goal note card'},
            {'char_id': 'char_pw_qiaoshou', 'name': '巧手', 'role': 'assistant who sorts messy tasks into recoverable and actionable parts', 'species_or_body_plan': 'ordinary human practical assistant, quick bright gesture, utility pouch, buttons/wire rings sorted by color', 'identity_locks': ['utility pouch', 'buttons and wire rings', 'color-coded string', 'quick sorting gesture'], 'signature_prop': 'small parts tray with simulated labels'},
        ],
    },
]

manifest = {
    'version': 1,
    'created_at': '2026-04-30',
    'task': '04-30-public-welfare-npc-batch-upgrade',
    'scope': 'Batch 1 prompt manifest only; no images generated, no project sprite files overwritten.',
    'source_audit': 'artifacts/04-30-public-welfare-npc-batch-upgrade/batch-0-audit/public-welfare-npc-batch-0-audit.json',
    'style_recipe_sources': [
        '.agents/skills/image-style-prompt-extractor/SKILL.md',
        '.agents/skills/generate-character-prompt/references/style-recipes.md#10-地下黑客朋克半调拼贴',
        '.agents/skills/generate-character-prompt/references/style-recipes.md#12-高对比数字工业故障',
        '.agents/skills/generate-character-prompt/references/style-recipes.md#16-波普艺术-拼贴-70-80-年代街头海报',
        '.agents/skills/generate-character-prompt/references/style-recipes.md#17-工业档案袋风格-前数字时代技术档案',
    ],
    'target_output': TARGET_OUTPUT,
    'expressions': EXPRESSIONS,
    'negative_constraints': BASE_CONSTRAINTS,
    'shops': [],
}

for shop in shops:
    shop_entry = {k: shop[k] for k in ['tavern_id', 'tavern_name', 'priority', 'real_coordinate_anchor', 'style_dna', 'composition', 'quality_diversity']}
    shop_entry['characters'] = []
    for char in shop['characters']:
        target_paths = {expr: f"frontend/public/assets/npcs/public-welfare/{char['char_id']}/{expr}.png" for expr in EXPRESSIONS}
        tavern_cues = ['bar/counter or service counter', 'mugs or cups', 'shelves', 'lantern or task light', 'map-table or coordinate card']
        envelope = {
            'schema_version': 'fablemap.visual_prompt.v1',
            'type': 'FableMap Visual Asset Prompt',
            'asset_use': 'npc_expression_sprite_set',
            'renderer_profile': 'batch_prompt_manifest',
            'real_coordinate_anchor': shop['real_coordinate_anchor'],
            'owner_confirmed_content': {
                'tavern_name': shop['tavern_name'],
                'tavern_theme': shop['tavern_id'],
                'npc_or_subject_role': char['role'],
                'visitor_feeling': 'safe, welcome, able to talk with this NPC and understand their responsibility',
                'must_keep': [char['name'], char['role'], char['species_or_body_plan'], char['signature_prop']],
                'must_avoid': ['platform-generated final content without review', 'schema field changes', 'combat/ranking/equipment framing'],
            },
            'subject': {
                'description': f"{char['name']} — {char['role']}",
                'species_or_body_plan': char['species_or_body_plan'],
                'identity_locks': char['identity_locks'],
                'allowed_variations': ['expression only', 'small gesture', 'local accent light'],
            },
            'tavern_cues': tavern_cues,
            'style_dna': shop['style_dna'],
            'quality_diversity': shop['quality_diversity'],
            'composition': {**shop['composition'], 'aspect_ratio': TARGET_OUTPUT['aspect_ratio'], 'mobile_crop_safe_area': 'face and signature prop remain readable in a circular or square avatar crop'},
            'text_policy': {'mode': 'simulated', 'allowed_text': [], 'forbidden_text': ['readable slogans', 'logos', 'API keys', 'private visitor data', 'exact private addresses']},
            'constraints': BASE_CONSTRAINTS,
            'extension_modules': ['sprite.expression-set.v1', 'series.identity-locks.v1'],
            'output_checks': ['five expressions generated', 'identity consistent', 'tavern cues visible', 'final files copied to project paths', 'PNG dimensions/hash recorded', 'backend public-welfare tests pass'],
        }
        base_prompt = (
            f"Create a finished original FableMap cyber-tavern NPC square portrait sprite for {char['name']}, {char['role']}. "
            f"Subject identity: {char['species_or_body_plan']}. Identity locks: {', '.join(char['identity_locks'])}. "
            f"Signature prop: {char['signature_prop']}. The portrait is visibly inside {shop['tavern_name']} with tavern/service cues: {', '.join(tavern_cues)}. "
            f"Style DNA: {shop['style_dna']['art_style_and_genre']}; palette {shop['style_dna']['palette_color_science']}; lighting {shop['style_dna']['lighting_signature']}; medium texture {shop['style_dna']['medium_texture']}; mood {shop['style_dna']['mood']}; symbolic motifs {', '.join(shop['style_dna']['symbolic_motifs'])}. "
            f"Composition: {shop['composition']['layout']}; {shop['composition']['shot_type_angle']}; {shop['composition']['spatial_logic']}. "
            f"Quality diversity thesis: {shop['quality_diversity']['visual_thesis']}. "
            f"No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data."
        )
        char_entry = {
            **char,
            'target_paths': target_paths,
            'prompt_envelope': envelope,
            'base_prompt': base_prompt,
            'expression_prompt_suffixes': EXPRESSIONS,
            'assembly_rule': 'final prompt = base_prompt + one expression_prompt_suffix; preserve identity locks across all five outputs',
        }
        shop_entry['characters'].append(char_entry)
    manifest['shops'].append(shop_entry)

(OUT_DIR / 'public-welfare-batch-1-prompt-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

md = []
md.append('# Batch 1 Prompt Manifest — Public-welfare NPC rebuild')
md.append('')
md.append('本文件只锁定 Prompt-as-Code、风格多样性和落盘路径；本批次尚未生成图片，也未覆盖任何正式 sprite。')
md.append('')
md.append('## Scope / guardrails')
md.append('')
md.append(f"- Source audit: `{manifest['source_audit']}`")
md.append('- Prompt-first：后续必须先使用本 manifest 的 prompt/envelope，再调用生图工具。')
md.append('- Final project path: `frontend/public/assets/npcs/public-welfare/<char_id>/{neutral,joy,anger,embarrassment,curiosity}.png`.')
md.append('- Final sprite size: follow current spec/tests as `256×256 PNG` for legacy replacements unless the same implementation slice updates tests/spec. High-res source/reference images may be archived under `artifacts/.../batch-1-*`.')
md.append('- No image has been generated or accepted in this step.')
md.append('')
md.append('## Diversity matrix')
md.append('')
md.append('| Tavern | Style family | Palette / light | Body-plan axis | Material system | Main anti-repetition rule |')
md.append('| --- | --- | --- | --- | --- | --- |')
for shop in manifest['shops']:
    q = shop['quality_diversity']
    s = shop['style_dna']
    md.append(f"| `{shop['tavern_id']}` | {s['art_style_and_genre']} | {s['palette_color_science']} / {s['lighting_signature']} | {q['visual_thesis']} | {s['medium_texture']} | {'; '.join(q['rejection_criteria'])} |")
md.append('')
md.append('## Character prompt map')
md.append('')
md.append('| Tavern | Character | Species/body plan | Identity locks | Target files |')
md.append('| --- | --- | --- | --- | --- |')
for shop in manifest['shops']:
    for char in shop['characters']:
        paths = '<br>'.join(f"`{p}`" for p in char['target_paths'].values())
        md.append(f"| `{shop['tavern_id']}` | `{char['char_id']}` {char['name']} | {char['species_or_body_plan']} | {'; '.join(char['identity_locks'])} | {paths} |")
md.append('')
md.append('## Copyable base prompts')
md.append('')
for shop in manifest['shops']:
    md.append(f"### {shop['tavern_name']} / `{shop['tavern_id']}`")
    md.append('')
    for char in shop['characters']:
        md.append(f"#### {char['name']} / `{char['char_id']}`")
        md.append('')
        md.append('Base prompt:')
        md.append('')
        md.append('```text')
        md.append(char['base_prompt'])
        md.append('```')
        md.append('')
        md.append('Expression suffixes:')
        for expr, suffix in EXPRESSIONS.items():
            md.append(f"- `{expr}`: {suffix}")
        md.append('')
md.append('## Next implementation notes')
md.append('')
md.append('- 先为每个角色生成 source/reference 图并存入 `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-sources/`，记录原始文件、prompt、hash。')
md.append('- 再裁剪/缩放为正式五表情 PNG，覆盖前先保存源→目标映射和旧 hash。')
md.append('- 如果把当前测试固定为 256×256 的角色升到 512×512，必须同一改动更新测试/规范；否则保持 256×256。')
md.append('- 图落盘后运行：`py -3 -m pytest -q tests/test_default_public_welfare_taverns.py tests/test_default_public_welfare_gameplays.py --tb=short`，涉及前端引用再跑 `npm --prefix .\\frontend run build`。')
(OUT_DIR / 'public-welfare-batch-1-prompt-manifest.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
print(OUT_DIR / 'public-welfare-batch-1-prompt-manifest.md')
print(OUT_DIR / 'public-welfare-batch-1-prompt-manifest.json')
