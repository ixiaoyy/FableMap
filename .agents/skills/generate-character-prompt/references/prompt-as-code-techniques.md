# Prompt-as-Code Techniques for FableMap Image Assets

> Source reviewed: local external project `D:\work\awesome-gpt-image-2` (`README.md`, `LICENSE`, `docs/templates.md`, selected gallery examples) on 2026-04-30. The project uses an MIT license, but its README also notes that some cases are derived from public community sources. For FableMap, reuse the **methods and schemas only**; do not copy third-party images, logos, characters, exact case prompts, or brand-specific layouts into shipped assets.

## Deep audit summary

The external project is useful less as a prompt library and more as a **pattern corpus**. A local parse of the gallery found these repeatable control patterns:

- Hundreds of cases are not short prose prompts; many are JSON-like protocols with fields such as `type`, `layout`, `subject`, `style`, `background`, `text`, `position`, `count`, `panels`, and `composition`.
- Strong cases usually lock **output type + ratio/grid + visual hierarchy** before style.
- Cases with text-heavy outputs repeatedly separate **title / subtitle / short labels / body-like simulated blocks** instead of asking for arbitrary long text.
- Batch/series cases rely on **count, panel positions, row/column semantics, and consistency constraints**.
- Realistic/photo/product cases work by combining **camera/lens/light/material** fields; illustration/poster cases work by combining **Style DNA + composition + texture/post-processing** fields.

FableMap should therefore evolve toward a **capability registry** rather than one giant universal prompt.

## Core lesson

Treat image generation as a structured protocol, not a bag of style words:

```text
task type → intended use → subject → context/anchor → layout skeleton → text policy → style DNA → material/camera → constraints → output checks
```

For Agent or batch usage, prefer a JSON-like envelope. For final image-model prompts, convert the envelope into fluent prose after the structure is stable.

## Extensible system architecture

Use five layers. Add new capabilities by extending the lowest necessary layer, not by rewriting every template.

```text
Layer 0: Rights & product guardrails
  real-coordinate anchor, owner confirmation, no IP/logo/private data, asset placement

Layer 1: Asset-use registry
  what surface is this? portrait, sprite set, card, map, infographic, poster, UI mockup...

Layer 2: Capability modules
  layout, text policy, series consistency, Style DNA, camera/material, diagram/map, safety constraints

Layer 3: Renderer profile
  image-model-friendly prose, JSON envelope, batch manifest, or future script/API payload

Layer 4: Validation & landing
  prompt lint, expected dimensions, project path, file existence, build/test/manual review
```

### Asset-use registry

| Asset use | Primary control module | Text mode | FableMap guardrail |
| --- | --- | --- | --- |
| `npc_portrait` | identity + tavern cues + Style DNA | `none` | real tavern NPC art, not placeholder |
| `npc_expression_sprite_set` | identity locks + allowed variations | `none` | expressions change, identity does not |
| `tavern_entry_card` | hero subject + entry atmosphere | `owner_exact` or `simulated` | owner-provided tavern name only |
| `discovery_campaign_card` | poster hierarchy + mobile crop | `owner_exact` | no fake platform marketing claims |
| `coordinate_map_card` | map/atlas composition | `simulated` or `owner_exact` | coordinate-inspired, not real navigation |
| `owner_guide_infographic` | module budget + icons | `owner_exact` | short verified copy only |
| `visual_souvenir_prompt_preview` | privacy-redacted memory motif | `none` or `simulated` | no visitor-private data |
| `series_grid_or_contact_sheet` | grid/panel count + consistency locks | `none` or `owner_exact` | stable identity across panels |
| `exploded_diagram_card` | layered assembly / callout layout | `owner_exact` | only for fictional/owned props or product-safe concepts |
| `editorial_mood_poster` | typography hierarchy + Style DNA | `owner_exact` | no copied title treatments, no unauthorized brands |

When adding a new asset use, define: purpose, dimensions, required input fields, allowed text mode, layout module, style module, safety constraints, output path, and checks.

### Capability modules

Keep these modules composable:

```text
rights_module:
  owner-confirmed content only; no existing IP/logos/living-artist imitation; no private data

anchor_module:
  real place / approximate area / abstract coordinate memory; never replaces actual map provider

layout_module:
  aspect_ratio, grid, module_count, hierarchy, crop-safe zones, foreground/midground/background roles

text_module:
  none | owner_exact | simulated; exact short strings only; no invented legal/brand/private text

identity_module:
  species/body plan, silhouette, palette, signature prop, expression variation rules

style_dna_module:
  genre, color science, lighting, medium texture, mood, era, detail density, post-processing, motifs

camera_material_module:
  lens, depth of field, light source, physical material, reflections, surface texture

diagram_module:
  exploded layers, callout count, numbered labels, arrows/flow lines, legend, scale discipline

series_module:
  panel count, row/column semantics, fixed identity, allowed variation axis, contact-sheet consistency

validation_module:
  expected path, dimensions, no .codex-only deliverables, build/test requirement, manual review notes
```

Add a quality/diversity module for all non-trivial material work:

```text
quality_diversity_module:
  visual thesis, composition device, palette difference, material system,
  lighting difference, style family, anti-repetition notes, rejection criteria
```

Do not ship a batch where every asset has the same decor, lighting, camera, and palette unless the task explicitly asks for one unified campaign system.

## Reusable techniques

### 1. Declare the asset type first

Start with the concrete output surface, because portraits, maps, UI screenshots, posters, infographics, and expression sheets need different control language.

FableMap asset types:

- `npc_portrait`
- `npc_expression_sprite_set`
- `tavern_entry_card`
- `discovery_campaign_card`
- `coordinate_map_card`
- `owner_guide_infographic`
- `visual_souvenir_prompt_preview`
- `series_grid_or_contact_sheet`
- `exploded_diagram_card`
- `editorial_mood_poster`

### 2. Lock the layout before adding style

Write ratio, grid, module count, shot type, and hierarchy before style words:

- ratio: `1:1`, `4:5`, `9:16`, `16:9`
- structure: `single hero subject`, `2x2 seasonal grid`, `4x4 reference sheet`, `title + 3-5 modules`, `exploded view`, `hand-drawn map`
- hierarchy: primary visual anchor, secondary details, labels/captions, footer/meta area

This prevents visually attractive but unusable outputs.

### 3. Make text explicit or avoid it

Use one of three text modes:

- `none`: no readable text; safest for portraits and atmosphere art.
- `owner_exact`: only render text supplied by the owner; require exact spelling.
- `simulated`: use unreadable or pseudo text blocks for editorial texture.

Do not ask the model to invent brand slogans, legal copy, visitor data, addresses, API keys, or long body text.

### 4. Separate content from Style DNA

Content says **what FableMap needs**: real coordinate anchor, tavern role, owner intent, visitor feeling, NPC job.

Style DNA says **how it looks**: genre, color science, lighting, medium texture, mood, era, information density, post-processing, symbolic motifs.

Do not let a reference image's character, story, or brand leak into the FableMap subject.

### 5. Use series consistency locks

For expression sets, card grids, seasonal campaigns, or public-welfare NPC batches:

- Fix identity: species/body plan, face/head silhouette, main palette, core outfit silhouette, signature prop.
- Vary only the allowed axis: expression, gesture, local lighting, background accent, or seasonal palette.
- Specify panel count and layout if outputting a contact sheet.

### 6. Use “module budgets” for information graphics

Information-heavy images work best with a hard module budget:

```text
title area + 3-5 modules + 1 summary strip
each module = icon/mini visual + short title + 1-2 short lines
```

Avoid long paragraphs. If the information must be accurate and readable, generate text externally and place it in UI/docs rather than asking the image model to typeset a full article.

### 7. Translate commercial templates into tavern-safe assets

External templates often include brand campaigns, social screenshots, product ads, or magazine layouts. For FableMap:

- Replace brands/logos with owner-provided tavern signage only when authorized.
- Replace commercial product hero shots with tavern entry cards, NPC props, menu objects, or coordinate souvenirs.
- Keep “premium hierarchy / grid / lighting / material detail” but remove promotional pricing, fake endorsements, platform UI, and unauthorized marks.

### 8. Use camera/material parameters when realism matters

For photo-like or product-like assets, specify:

- lens/focal feel: `24mm wide phone camera`, `50mm documentary`, `85mm portrait`
- depth of field: shallow / deep / f-stop if helpful
- light source: softbox, rim light, reflected window light, neon bounce, tavern lantern
- material: wood grain, brass, glass, enamel, paper fiber, ink bleed, fabric weave

For stylized assets, use medium language instead: cel shading, risograph grain, watercolor wash, lithograph, collage, pixel art, ink wash.

### 9. Map and coordinate assets must not fake the product’s real map

Hand-drawn maps, coordinate cards, and atlas-like diagrams are useful as atmospheric assets, but they must not replace or contradict the real map anchor.

Prompt them as:

```text
coordinate-inspired illustration / abstract neighborhood memory map / hand-drawn tavern route card
```

Avoid claiming survey precision, real navigation, exact addresses, or official map provider styling.

### 10. End with negative constraints

For FableMap image assets, include:

```text
original asset only, no existing IP, no franchise marks, no living-artist imitation,
no readable text unless owner_exact, no logo, no watermark,
no API keys, no visitor-private data, no exact private address,
not a placeholder, not a UI mockup unless explicitly requested
```

## FableMap Prompt-as-Code JSON envelope

Use this when asking another model/agent to generate image prompts or when batching assets:

```json
{
  "schema_version": "fablemap.visual_prompt.v1",
  "type": "FableMap Visual Asset Prompt",
  "asset_use": "npc_portrait | npc_expression_sprite_set | tavern_entry_card | discovery_campaign_card | coordinate_map_card | owner_guide_infographic | visual_souvenir_prompt_preview | series_grid_or_contact_sheet | exploded_diagram_card | editorial_mood_poster",
  "renderer_profile": "single_image_prompt | batch_prompt_manifest | prompt_preview_only | future_api_payload",
  "real_coordinate_anchor": {
    "place_name_or_area": "",
    "privacy_level": "public_area_only | approximate | abstracted",
    "must_not_include": ["exact private address", "official map-provider imitation"]
  },
  "owner_confirmed_content": {
    "tavern_name": "",
    "tavern_theme": "",
    "npc_or_subject_role": "",
    "visitor_feeling": "",
    "must_keep": [],
    "must_avoid": []
  },
  "subject": {
    "description": "",
    "species_or_body_plan": "",
    "identity_locks": ["silhouette", "main palette", "signature prop"],
    "allowed_variations": ["expression", "gesture", "local accent light"]
  },
  "tavern_cues": ["bar counter", "mugs", "shelves", "lanterns", "map-table", "cyber terminal glow"],
  "style_dna": {
    "art_style_and_genre": "",
    "palette_color_science": "",
    "lighting_signature": "",
    "medium_texture": "",
    "mood": "",
    "era_context": "",
    "detail_density": "",
    "post_processing": "",
    "symbolic_motifs": []
  },
  "quality_diversity": {
    "visual_thesis": "",
    "must_differ_from_recent_assets": ["composition", "palette", "material system", "lighting", "style family"],
    "anti_repetition_notes": ["avoid repeating the same warm wood bar + teal glow formula unless intentional"],
    "rejection_criteria": ["generic AI concept art", "same decor as previous batch", "weak focal hierarchy"]
  },
  "composition": {
    "aspect_ratio": "",
    "layout": "",
    "shot_type_angle": "",
    "spatial_logic": "",
    "module_budget": "",
    "mobile_crop_safe_area": ""
  },
  "text_policy": {
    "mode": "none | owner_exact | simulated",
    "allowed_text": [],
    "forbidden_text": ["logos", "fake brand slogans", "visitor-private data"]
  },
  "constraints": [
    "owner-reviewable draft only",
    "original character/asset only",
    "no existing IP",
    "no living-artist imitation",
    "no watermark"
  ],
  "extension_modules": [],
  "output_checks": [
    "project asset path required if generated",
    "tavern cues visible",
    "mobile/narrow use case considered",
    "identity consistency checked for sprite sets"
  ]
}
```

### Extension module shape

Use this shape when a future feature needs a new capability without changing the whole schema:

```json
{
  "module_id": "diagram.callouts.v1",
  "applies_to": ["exploded_diagram_card", "owner_guide_infographic"],
  "inputs": {
    "callout_count": "3-7",
    "label_mode": "owner_exact",
    "connector_style": "thin arrows | numbered pins | flow lines"
  },
  "constraints": [
    "short labels only",
    "no invented technical claims",
    "keep main subject readable"
  ]
}
```

Rules:

- Add modules under `extension_modules` only when an existing field is insufficient.
- Keep module IDs stable and versioned: `domain.name.v1`.
- Never use extension modules to bypass product guardrails or introduce schema fields into `TavernCharacter`.
- If a module becomes common across three or more asset uses, promote it into the capability module list above.

## Conversion pattern: JSON envelope → final prompt

1. Convert `asset_use`, `subject`, and `tavern_cues` into the opening sentence.
2. Insert Style DNA as one fluent paragraph.
3. Append composition only if it helps the asset use.
4. Append text policy and constraints at the end.
5. If image generation is performed, follow `.trellis/spec/frontend/image-asset-guidelines.md` and move accepted files into project paths.

## Future expansion checklist

Before adding a new image-making capability:

1. Is this a new **asset use** or just a new **style recipe**?
2. Does it need a new capability module, or can it use layout/text/style/series modules?
3. What product guardrail is at risk: map precision, owner authorship, IP/logo, visitor privacy, or schema drift?
4. What is the canonical project path and expected dimensions?
5. What can be validated automatically: prompt lint, filename, file existence, dimensions, public URL, seed payload, frontend build?
6. What needs manual visual review: identity consistency, mobile crop, tavern cues, readability, style fit?

Prefer additive modules and versioned recipes over rewriting the base prompt. This keeps future features—visual souvenirs, owner campaign cards, map memory postcards, NPC cast sheets, or technical explainers—compatible with the same prompt system.
