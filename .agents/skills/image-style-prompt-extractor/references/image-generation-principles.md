# General Image Generation Principles

> Project memory for pure image-generation technique, independent of any single product domain. Use this when creating, reverse-engineering, improving, or systematizing prompts for GPT Image / Nano Banana / Midjourney / Flux / Stable Diffusion style workflows.

## Core formula

```text
controllable image = clear use case + locked structure + controlled text + concrete composition + lighting/material physics + Style DNA + task-specific negative constraints
```

Do not start with style words. Start with the picture's job.

## Quality and anti-sameness rule

Traceable prompts are only the floor. A generated image is not good enough just because it is compliant, safe, and on-topic. It must also pass a visual quality and non-genericity bar.

Avoid the default AI look:

```text
generic cozy room + warm amber light + teal glow + centered subject + shallow anime concept-art polish
```

This pattern quickly becomes visual wallpaper. For any new asset, deliberately choose a distinct visual thesis:

- What is the **dominant visual idea**?
- What makes this image different from the last 5 images?
- What is the specific composition device: diagonal entry, exploded layers, negative-space poster, cutaway, macro detail, contact sheet, top-down map, silhouette hierarchy?
- What is the specific material system: lacquered wood, rain glass, concrete, brass, paper archive, enamel, ceramic, fabric, neon acrylic, ink wash, risograph grain?
- What is the specific palette beyond “warm + teal”?
- What should be intentionally absent to avoid sameness?

For batches, define a diversity matrix before generation:

```text
asset | layout | palette | light | material | style family | camera/composition | unique motif
```

Do not let every output share the same tavern decor, same lighting, same bar shelves, same cyber glow, same character framing, or same anime polish unless the task explicitly asks for a unified series.

## Quality bar

A prompt should target finished art direction, not generic “nice AI art.” Check:

- **Strong focal hierarchy**: one clear hero, supporting details do not compete.
- **Composition specificity**: identifiable layout device, not just “beautiful scene.”
- **Style specificity**: one or two coherent style families, not vague keyword soup.
- **Material specificity**: surfaces have believable texture and light behavior.
- **Palette discipline**: intentional color system, not default teal/orange or amber/cyan every time.
- **Freshness**: the image would still be recognizable if placed beside prior assets.
- **Finish**: production-ready image, not sketch, placeholder, moodboard, or generic concept-art sample.
- **Task fit**: it works for its intended surface, crop, and use case.

If a prompt cannot explain why the result will look visually different from previous images, revise the prompt before generating.

## Prompt-first rule

For actual bitmap generation, always use a two-step process:

```text
step 1: write/review/save the final prompt
step 2: generate the image from that prompt
```

Do not directly call an image generator from hidden reasoning or an unstated description. The prompt is part of the artifact: it enables review, iteration, batching, regeneration, and future debugging.

Minimum handoff record:

```text
asset_use:
final_prompt:
negative_constraints:
intended_size_or_ratio:
generation_status: accepted | reference-only | rejected
project_path: <only if landed>
```

## Prompt order that tends to work

```text
1. image type / deliverable
2. subject and purpose
3. aspect ratio and layout skeleton
4. camera / shot / composition
5. text policy and information hierarchy
6. Style DNA: genre, palette, lighting, medium, texture, mood
7. physical details: material, reflections, imperfections, depth
8. output quality and finish
9. negative constraints tied to the failure modes of this task
```

## Structure before style

Most failed images are not ugly; they are structurally uncontrolled. Lock these before adding aesthetics:

- Aspect ratio: `1:1`, `4:5`, `9:16`, `16:9`, panoramic, square grid.
- Layout: single hero, split screen, title + modules, 2x2 grid, 4x4 reference sheet, exploded view, map, flat lay.
- Hierarchy: primary visual anchor, secondary supporting elements, background texture, label/footer area.
- Safe area: what must remain visible after crop, especially for mobile cards or posters.

Useful composition language:

```text
centered composition, rule of thirds, diagonal tension, top-heavy hierarchy,
frame within frame, large negative space, low-angle shot, high-angle POV,
top-down flat lay, wide establishing shot, macro close-up, exploded assembly view,
2x2 grid, 4x4 reference sheet, sequential panels, layered collage, compressed depth
```

## Text policy

Image models are unreliable at long text. Choose one mode:

| Mode | Use when | Prompt rule |
| --- | --- | --- |
| `none` | portraits, atmosphere, most art assets | no readable text, no labels, no logos |
| `exact_short` | title/poster/header needs one or two phrases | spell this exact text, do not translate or add text |
| `simulated` | magazine/editorial texture, UI mockups, background documents | simulated unreadable text blocks only |
| `structured_short_labels` | infographic, diagram, reference sheet | short labels only, 1-5 words each, strict module count |

Avoid asking for long body copy, legal text, dense paragraphs, or many exact labels unless you are prepared to manually fix typography later.

## Style DNA

Style DNA is the transferable aesthetic layer. It should cover:

- art style / genre / taste lineage
- color science: primary, secondary, accent colors; contrast and saturation strategy
- lighting: source direction, hardness, contrast, shadows, glow, time of day
- medium and texture: cel shading, watercolor, risograph, film grain, paper fiber, ink bleed, CGI, photography
- mood: precise emotional temperature, not vague adjectives
- era / cultural context: not just decade, but taste segment
- detail density: where detail is dense vs simplified
- motion state: static, frozen instant, motion blur, slow-shutter feel
- post-processing: chromatic aberration, halftone, scan noise, lens bloom, grain
- symbolic motifs: functional visual categories, not fixed story objects

## Camera and realism controls

For realistic images, replace generic “hyperrealistic” with physical controls:

```text
camera type, focal length, angle, depth of field, exposure, light source,
skin pores, fabric weave, wood grain, fingerprints, micro-scratches,
realistic shadows, reflections, imperfect symmetry, film grain
```

Examples:

- `24mm phone front camera, high-angle POV, deep depth of field, mild wide-angle distortion`
- `85mm portrait lens, shallow depth of field, soft window key light, subtle rim light`
- `studio softbox, glossy specular highlights, matte surface contrast`

## Material and commercial polish

Product, ad, and premium poster images need material specificity:

```text
matte metal, frosted glass, glossy plastic, enamel, brushed steel,
paper fibers, silkscreen ink, velvet, denim, ceramic glaze, water droplets,
softbox reflection, rim light, cast shadow, contact shadow
```

Commercial images usually improve when the prompt limits clutter:

- one hero subject
- 1-3 selling points or labels
- clean background
- controlled accent colors
- no random badges, no fake logos, no excessive stickers

## Infographic and diagram rules

Use a module budget:

```text
title area + 3-5 modules + one summary strip
each module = icon / mini visual + short heading + 1-2 short lines
```

For diagrams:

```text
exploded layers, callout count, numbered pins, thin connector lines,
legend area, consistent label style, no overfilled text, main subject remains readable
```

## Series and batch consistency

For grids, cards, expression sheets, and multi-image sets:

```text
same subject, same silhouette, same outfit/material language, same palette,
same lighting logic, same rendering style
only [expression / pose / local accent / background color / panel theme] changes
```

Specify panel count and layout:

```text
2x2 seasonal grid, four quadrants
4x4 action reference sheet, 16 equal panels, numbered 1-16
10-card series, identical frame treatment, unique subject in each card
```

## Negative constraints should match the task

Generic negatives are weaker than task-specific negatives.

Good negatives:

- `single poster only, no moodboard, no grid of alternatives`
- `do not misspell the title, do not add extra readable text`
- `do not change character identity across panels`
- `no complex background, no extra people, no random logo`
- `do not turn this into a UI screenshot`
- `not a placeholder, not a concept sketch, finished image only`

## Reusable asset-type patterns

### Poster / editorial

```text
single finished poster, one dominant visual metaphor, exact short title, strong hierarchy,
large negative space or deliberate dense collage, restrained palette, typography interacts with image,
no moodboard, no unrelated text, no fake logos
```

### Character / portrait

```text
identity first, readable silhouette, consistent face/head shape, signature prop,
shot type, expression, clothing material, background only supports subject,
no extra characters, no blank avatar, no identity drift
```

### Product / commercial

```text
hero product, 3/4 angle or macro close-up, precise material, studio lighting,
clean background, 1-3 short labels max, realistic contact shadows/reflections
```

### Infographic / knowledge card

```text
title, 3-5 modules, short labels, icons or mini diagrams, clear reading path,
consistent spacing, no long paragraphs, no cluttered background
```

### Map / atlas / route card

```text
stylized map or atlas, simplified landmarks, route rhythm, legend or label zones,
not survey-accurate unless exact data is provided, no fake official map branding
```

### Exploded view / technical diagram

```text
central object split into layered components, consistent alignment axis,
numbered callouts, thin connector lines, material detail, readable spacing,
no impossible extra parts, no unreadable microtext
```

## Self-check before using a prompt

- Can I identify the image type from the first sentence?
- Are ratio, layout, and hierarchy specified?
- Is text controlled?
- Are material/light/camera details concrete?
- Is Style DNA separate from subject content?
- Are negative constraints task-specific?
- For series: are identity locks and allowed variations clear?
- If exact text matters, is it short enough to be feasible?
