---
name: generate-character-prompt
description: "Generate or refine FableMap NPC character-card prompts, visual asset prompts, expression sprite prompts, and prompt-generating prompts from owner briefs, style references, or image-style notes. Use when creating character materials, NPC role drafts, anime/game portrait prompt templates, or extracting a reusable visual style while preserving owner-confirmed tavern content and project asset/IP constraints."
---

# Generate Character Prompt

Use this skill to turn an owner brief, tavern concept, or visual-style reference into reusable prompts for FableMap NPC creation.

## Core workflow

1. **Identify the deliverable.** If the user does not specify, output both:
   - a character-card generator prompt for `TavernCharacter` / `NpcDraftPreview` fields;
   - a visual asset prompt for portrait or expression sprites.
2. **Extract the content core.** Capture tavern location/anchor, owner intent, NPC role, visitor feeling, interaction boundary, and any forbidden directions.
3. **Extract or choose a style kernel.** For visual materials, default to `.agents/skills/image-style-prompt-extractor/SKILL.md` as the style extraction/normalization step. Describe transferable aesthetics, not exact copyrighted characters, brands, logos, or living-artist style imitation.
4. **Compose prompts in layers:** subject → species/body plan → tavern context → role behavior → Style DNA → optional Composition Module → color/light → medium/texture → constraints → output format.
5. **Keep drafts owner-confirmed.** Generated character text is a draft for the shop owner to review; do not present it as saved owner-authored content.

## FableMap guardrails

- Preserve the product chain: real coordinate/place → owner-authored tavern → AI NPC → chat/memory/revisit.
- Do not invent schema fields. Use existing character draft fields: `name`, `description`, `personality`, `scenario`, `gender`, `system_prompt`, `first_mes`, `mes_example`, `alternate_greetings`, `tags`, and optional `sprites`/`avatar` references.
- For fantasy, isekai, alien, spirit, monster-town, or otherwise non-realistic taverns, do not default every NPC to ordinary humans. Propose an original species/body-plan mix and keep those details inside existing text fields, tags, and visual prompts unless a separate schema task is approved.
- Do not write owner API keys, token settings, or private visitor data into prompts.
- For image prompts, require real tavern cues: bar/counter, mugs, shelves, lanterns, menu board, bottles, map-table, cyber terminal glow, or equivalent interior details.
- Avoid specific IP characters, franchise marks, brand logos, and living-artist imitation unless the task is explicitly a private reference draft and final project assets remain original.
- If images are actually generated for delivery, follow `.trellis/spec/frontend/image-asset-guidelines.md`: move accepted outputs into project paths and verify them.
- Prompt-first is mandatory for actual image generation: first generate and preserve the final visual Prompt (or expression-prompt set), then call the image tool with that Prompt. Do not directly generate images from unstated/hidden instructions.
- Image quality and diversity are mandatory: do not default every NPC/tavern image to the same warm wooden cyber bar, amber/teal lighting, centered bust, shelves, and generic anime concept-art finish. Define a distinct visual thesis, material system, palette, and composition for each non-series asset; for batches, use a diversity matrix before generation.

## Style DNA method

When reverse-engineering or inventing a visual style, default to the three-part template from `image-style-prompt-extractor`: Style DNA Prompt, optional Composition Module, and Subject Recommendations. If the user explicitly asks for a shorter visual prompt, compress these dimensions into one compact paragraph:

1. image style and medium, 2. visual components, 3. composition, 4. shot/framing, 5. lighting, 6. palette/color science, 7. texture/material, 8. mood, 9. render/camera parameters, 10. era/cultural context, 11. perspective/space logic, 12. information density/negative space, 13. motion or frozen instant, 14. post-processing/digital artifacts, 15. symbolic motifs.

Prefer one or two strong style families over a long list of unrelated keywords. Style should serve the tavern role and visitor emotion.

## Templates

Read `references/prompt-templates.md` when the user needs copyable prompts, style recipes, or a prompt that generates other prompts.
Read `references/style-recipes.md` when the user provides or asks for concrete reusable visual style templates; preserve tested recipes there before summarizing.
Read `references/prompt-as-code-techniques.md` when the user asks to learn from an external image-prompt project, reuse image-generation capabilities, batch assets, create structured prompt schemas, design future-extensible prompt modules, or make prompts more controllable for Agent/script workflows.
For pure image-generation technique not tied to FableMap content, read `.agents/skills/image-style-prompt-extractor/references/image-generation-principles.md`.
If the user uploads a reference image and wants only the visual style reverse-engineered into a reusable prompt, use `.agents/skills/image-style-prompt-extractor/SKILL.md` first, then adapt the extracted style back into FableMap NPC prompts if needed.
If a project-needed visual style is missing from `references/style-recipes.md`, add a complete reusable recipe with the tested prompt, FableMap adaptation notes, and any user quality notes before using it as project memory.

## Image generation handoff

When the user asks to actually create bitmap素材:

1. Output or record the final prompt(s) first.
2. For single images, use the exact recorded prompt for generation.
3. For expression sets or batches, generate a prompt manifest first, including identity locks and allowed variations.
4. After generation, report source generated-image path and whether each image is accepted, project-landed, or reference-only.

## Output format

Return concise Chinese by default:

```text
## 角色卡生成 Prompt
<copyable prompt>

## 视觉素材 Prompt
<copyable prompt(s)>

## 负面约束 / 风险
- <IP/schema/asset/safety notes>
```
