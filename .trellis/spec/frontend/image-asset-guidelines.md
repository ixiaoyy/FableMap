# Image Asset Guidelines

> Contract for AI-generated bitmap assets and project-local image placement.

## Scope / Trigger

Use this spec whenever a task generates, replaces, resizes, optimizes, or wires image assets for the frontend or product documentation, including:

- NPC portraits / sprites.
- Homepage, discovery, tavern, or module illustration assets.
- Public URL assets under `frontend/public/`.
- Imported runtime assets under `frontend/app/assets/`.
- Reference or audit images kept under `artifacts/` or a documented design-reference directory.

This spec covers asset placement and verification. It does not change product schema, backend API payload semantics, owner permissions, or SillyTavern compatibility.

## Scenario: Project-Local AI Generated Image Placement

### 1. Scope / Trigger

Trigger this contract whenever Codex / AI image generation creates a file under a tool-owned location such as:

```text
%USERPROFILE%\.codex\generated_images\
C:\Users\<user>\.codex\generated_images\
```

Built-in generation output is not a project asset until it is copied, transformed, or intentionally archived inside this repository.

### 2. Signatures / Paths

Canonical project destinations:

```text
frontend/public/assets/...              # stable public URL assets, referenced as /assets/...
frontend/app/assets/...                 # imported frontend runtime assets
artifacts/...                           # project-local review/audit/contact-sheet artifacts
docs/...                                # documented reference images only when intentionally part of docs
```

For public URL assets, backend/frontend references must use the project-served URL, not a local absolute path:

```text
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png -> /assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png
```

### 3. Contracts

- A generated image that is part of the deliverable must be present inside the repository before the task is reported.
- Do not leave deliverable images only in `.codex/generated_images`, OS temp folders, browser downloads, or chat previews.
- If the generated source is resized, cropped, optimized, or otherwise transformed, the transformed project-local file is the deliverable; the original `.codex` file is only provenance.
- If a generated image is rejected or kept only as a visual reference, say so explicitly in the final report; do not imply it has replaced a runtime asset.
- Code, seed payloads, markdown, and tests must reference repository paths or served URLs, never `C:\Users\...\generated_images\...`.
- When replacing an existing asset, overwrite the exact path only when replacement was requested; otherwise use a versioned sibling name.
- After replacement, verify the project path, dimensions/format, and if applicable the build output or runtime copy.

### 4. Validation & Error Matrix

| Case | Expected |
| --- | --- |
| Generated image exists only under `.codex/generated_images` | Not complete; copy/transform it into a project path or mark it as rejected/reference-only |
| Code references `C:\Users\...\generated_images\...` | Invalid; replace with project URL/import path |
| Existing public image was meant to be replaced but file size/hash/mtime is unchanged | Not complete; overwrite the actual referenced file |
| Resized/optimized image exists in `frontend/public/...` and source remains in `.codex` | Acceptable; report project path as deliverable |
| Unused generation variants remain in `.codex` | Acceptable only if final report identifies them as unused drafts or reference-only |

### 5. Good / Base / Bad Cases

Good:

- Generate an NPC sprite, resize to `512×512`, save as `frontend/public/assets/npcs/public-welfare/name/neutral.png`, update `sprites.neutral` to `/assets/npcs/public-welfare/name/neutral.png`, then run focused asset tests and frontend build.

Base:

- Generate a design reference, save a contact sheet under `artifacts/`, and state that it is reference-only with no runtime code reference.

Bad:

- Generate a new image, show it in chat, but leave the frontend still loading the old `frontend/public/...` file.
- Report “image replaced” while only `.codex/generated_images/...` changed.

### 6. Tests / Checks Required

For image-only changes:

```powershell
# Confirm the project file exists and changed.
Get-ChildItem frontend\public\assets -Recurse -File | Where-Object Name -like "*.png"
Get-FileHash <project-image-path> -Algorithm SHA256
```

For assets loaded by frontend routes:

```powershell
npm --prefix .\frontend run build
```

For backend seed/public URL assets:

```powershell
py -3 -m pytest -q <focused asset/seed test> --tb=short
```

Before final reporting, audit generated-image leftovers from the current session:

```powershell
Get-ChildItem "$env:USERPROFILE\.codex\generated_images" -Recurse -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 20 FullName,Length,LastWriteTime
```

Then compare those files with the intended project paths by hash, dimensions, or explicit source-to-target mapping.

## Scenario: Default Style Extraction Before Material Generation

### 1. Scope / Trigger

Use this scenario before generating or replacing FableMap visual material assets, including NPC portraits/sprites, posters, campaign illustrations, homepage/discovery/tavern illustrations, and design-reference images.

### 2. Signatures / Paths

Default skill and recipe memory:

```text
.agents/skills/image-style-prompt-extractor/SKILL.md
.agents/skills/generate-character-prompt/references/style-recipes.md
```

### 3. Contracts

- **Prompt-first is mandatory.** Before any bitmap generation call, produce and preserve the final image Prompt (or prompt manifest for batches). Do not generate images directly from unstated assistant reasoning.
- The preserved Prompt must be available in one of: task artifact, prompt manifest, implementation note, final report, or project-local recipe. A tool-call-only prompt is not sufficient for project memory.
- **Image quality and diversity are mandatory.** A generated asset is not acceptable merely because it is compliant and tavern-related. Reject generic AI concept art, weak focal hierarchy, and repeated decor/lighting/palette/camera formulas unless the task explicitly asks for a unified series.
- For any batch or sequence, define a diversity matrix or equivalent plan before generation: asset, visual thesis, layout, palette, lighting, material system, style family, camera/composition, and unique motif.
- Before generating a material image, first establish a reusable style prompt with `image-style-prompt-extractor` or its Style DNA + Composition framework.
- If the user supplies a reference image, extract transferable style only; remove specific characters, text, story details, brands, franchise marks, and living-artist imitation.
- If the user supplies a text style recipe, preserve the complete recipe under `style-recipes.md` when it is new and project-useful; do not reduce it to a short keyword only.
- If no reference or recipe exists, create a new project-specific recipe only when needed by the task, and include FableMap adaptation notes plus safety/IP constraints.
- For project-reusable templates, prefer the three-part output shape: `Style DNA Prompt` for transferable aesthetics, optional `Composition Module` for abstract spatial structure, and `Subject Recommendations` for high-affinity / cross-genre / contrast-mashup candidates.
- Style DNA must cover art style/genre, color science, lighting, medium/texture, mood, rendering/post-processing, era/cultural context, detail-density zoning, dynamic state, and symbolic visual language. Composition modules must avoid concrete source-scene objects and use only composition, shot, perspective, and spatial-role terminology.
- Do not confuse a texture technique with a carrier format: using halftone, paper grain, scan noise, or poster-like layout is allowed; forcing titles, barcodes, real prices, or brand-like publication elements is not allowed unless those are explicitly authorized design requirements.
- For Agent/batch workflows, use a Prompt-as-Code envelope before prose prompting: declare `asset_use`, real-coordinate privacy, owner-confirmed content, subject identity locks, Style DNA, composition, text policy, constraints, and output checks.
- Keep the envelope extensible and versioned. Current baseline is `schema_version: fablemap.visual_prompt.v1`; future capabilities should be additive `extension_modules` (for example `diagram.callouts.v1`, `series.identity-locks.v1`, `map.coordinate-memory.v1`) rather than rewrites of the base prompt.
- New `asset_use` values must define purpose, expected dimensions/path, required input fields, text policy, layout module, style module, safety constraints, and verification checks before the asset can be considered a project convention.
- Add `quality_diversity` to non-trivial prompt manifests: include visual thesis, required differences from recent assets, anti-repetition notes, and rejection criteria.
- When learning from external prompt/template repositories, reuse only general structure and techniques unless license and third-party rights are clear. Do not import external generated images, exact case prompts, logos, brands, recognizable characters, or platform screenshots into FableMap shipped assets.
- After style extraction, still follow project asset placement rules: accepted deliverables must be copied/transformed into repository paths and referenced by project URLs/imports.

### 3.1 Extensibility baseline

Prompt capability modules should stay composable:

| Module | Contract |
| --- | --- |
| `rights_module` | owner-confirmed content, no existing IP/logo/living-artist imitation/private data |
| `anchor_module` | real place / approximate area / abstract coordinate memory, never a fake map provider |
| `layout_module` | aspect ratio, grid, hierarchy, crop-safe zones, spatial roles |
| `text_module` | `none`, `owner_exact`, or `simulated`; no invented legal/brand/private text |
| `identity_module` | species/body plan, silhouette, palette, signature prop, allowed variations |
| `style_dna_module` | genre, color science, lighting, medium texture, mood, era, detail density, post-processing, motifs |
| `quality_diversity_module` | visual thesis, required differences from recent assets, anti-repetition notes, rejection criteria |
| `diagram_module` | exploded layers, callout count, arrows/flow lines, legend, scale discipline |
| `series_module` | panel count, row/column semantics, fixed identity, allowed variation axis |
| `validation_module` | expected path, dimensions, no `.codex`-only deliverables, build/test/manual review |

### 4. Validation & Error Matrix

| Case | Expected |
| --- | --- |
| Image is generated directly from a vague style word and no reusable prompt is recorded | Incomplete; extract/choose/write a reusable style recipe first |
| Image tool is called before a final prompt/prompt manifest is written | Invalid; write the prompt first, then regenerate from that prompt if needed |
| Prompt exists only inside a hidden/tool call and not in task/report memory | Incomplete; copy the prompt into a task artifact, prompt manifest, or final report |
| Multiple assets repeat the same warm wood bar + teal glow + centered subject formula without intent | Reject; revise with a diversity matrix and stronger visual thesis |
| Prompt is compliant but has weak focal hierarchy or generic “nice AI art” style | Reject; strengthen composition, material, palette, and finish direction |
| New useful style appears only in chat history | Incomplete; preserve it in `style-recipes.md` or the task artifact |
| Reference image contains a copyrighted character or brand logo | Extract generic aesthetics only; do not reproduce protected identity/marks in project assets |
| Generated file remains only in `.codex/generated_images` | Not complete; move accepted deliverable into a project path or mark as rejected/reference-only |

### 5. Good / Base / Bad Cases

Good:

- Use a reference image to produce one reusable Chinese style prompt, adapt it to an original tavern NPC, generate the image, save it under `frontend/public/assets/...`, and report verification.

Base:

- Choose an existing recipe from `style-recipes.md`, adapt subject/tavern cues, and generate a reference-only artifact under `artifacts/...`.

Bad:

- Generate a project asset from “make it cyberpunk anime” without a reusable style prompt, then leave the output only in a chat preview.
- Directly call image generation with an ad-hoc hidden prompt and then ask the user to judge the result without preserving the prompt.
- Accept a batch where every tavern/NPC image has the same decor, same amber/teal lighting, same centered composition, and no distinct visual thesis.

### 7. Wrong vs Correct

#### Wrong

```text
Generated:
C:\Users\phpxi\.codex\generated_images\...\new-npc.png

Code still references:
/assets/npcs/old-placeholder.png
```

#### Correct

```text
Generated source:
C:\Users\phpxi\.codex\generated_images\...\new-npc.png

Project deliverable:
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png

Runtime reference:
/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png
```
