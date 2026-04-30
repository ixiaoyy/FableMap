# NPC Art Guidelines

> Contract for FableMap NPC portrait generation and frontend fallback usage.

## Scope / Trigger

Use this spec whenever changing:

- `frontend/app/features/tavern-npc-stage/`
- `frontend/app/assets/npc-style-cast/`
- NPC portrait prompts, generated NPC bitmap assets, or visual fallback logic
- Tavern route UI that presents NPC portraits before chat

This is a frontend presentation contract. It must not change API, backend schema, persisted `TavernCharacter` fields, owner permissions, or SillyTavern compatibility.

## Visual Contract

NPC art must be real tavern-themed character art, not symbolic placeholders.

Required:

- Real cartoon/anime/game-style NPC portrait, bust or waist-up. The NPC may be human, humanoid, beastkin, spirit, robot, alien, object-folk, or another original non-human tavern regular when the tavern theme supports it.
- The NPC must visibly belong inside a tavern: bar counter, wooden shelves, mugs, lanterns, menu board, bottles, map-table, glowing terminal, door signage, or equivalent tavern interior cues.
- The role should read as tavern staff, host, guide, storyteller, keeper, attendant, or regular NPC.
- The style can vary by tavern skin, but must preserve FableMap's product meaning: real place → owner-authored tavern → AI NPC → memory/revisit.
- Generated portrait files must follow `image-asset-guidelines.md`: final deliverables live in repository asset paths, not only in `.codex/generated_images` or chat previews.

Forbidden:

- Circles, squares, geometric dummy avatars, abstract silhouettes, empty profile placeholders.
- Generic anime portraits with no tavern environment or tavern props.
- Platform-generated character content being saved as if it were owner-authored role/card data.
- Specific copyrighted IP, franchise logos/UI, recognizable existing characters, or imitation of a living artist's personal style.
- Fantasy / isekai shop casts that default every role to ordinary humans without a deliberate owner or setting reason.

## Scenario: Fantasy / Isekai Species Diversity Contract

Use this contract when generating or rebuilding NPC role drafts, portrait prompts, expression sprites, public-welfare seed casts, tavern presets, or owner-facing character prompt templates for fantasy, isekai, alien, mythic, magical, monster-town, spirit-market, or otherwise non-realistic tavern themes.

Contracts:

- Do not default a fantasy / isekai cast to all ordinary human NPCs. At least one primary role in a multi-NPC fantasy shop should have a clear original non-human or non-ordinary body plan unless the owner explicitly requested an all-human cast.
- Treat species / body plan as a design dimension inside existing fields and prompt text, not a new persisted schema field. Encode it through `description`, `personality`, `scenario`, `system_prompt`, `tags`, and visual prompts.
- Non-human does not mean random decoration. The species/body plan must support the NPC's tavern job and chat behavior: e.g. a lantern moth archivist who navigates dusty shelves, a stone golem bouncer who remembers house rules, a slime tea brewer who senses cup temperature, a clockwork fox courier who tracks route cards.
- Keep the character original. Avoid specific copyrighted races, named franchise species, recognizable monster designs, or brand/franchise visual marks.
- Maintain chat readability: even non-human NPCs need understandable facial/body expression cues across `neutral`, `joy/happy`, `anger/angry`, `embarrassment/shy`, and `curiosity/curious`.

Validation matrix:

| Case | Expected |
| --- | --- |
| Fantasy shop has 3 NPCs and all are ordinary humans by accident | Weak cast; revise at least one role into an original non-human or non-ordinary tavern regular |
| Owner explicitly requests all-human fantasy inn staff | Acceptable; record the owner intent and differentiate by role, silhouette, outfit, and props |
| Non-human visual prompt has no tavern job or no readable expression | Invalid; add role-specific props and expression readability |
| Prompt adds a new `species` schema field | Invalid; keep it in existing text/tags unless a separate schema task is approved |
| Non-human design resembles a specific franchise race/character | Invalid for project assets; convert to generic original anatomy, motifs, and color language |

Good: A floating candle-spirit bartender, a beetle-shell map keeper, and a human runaway knight each have different silhouettes, jobs, props, and chat boundaries inside the same tavern.

Base: Mostly human cast, but one role is a clearly original robot, spirit, animal-folk, or object-folk NPC tied to the tavern's service loop.

Bad: Three attractive human anime staff with only hair color and outfit color changed in an isekai tavern.

## Frontend Fallback Contract

`TavernNpcStage` chooses portrait imagery in this order:

```typescript
character.sprites?.neutral
  || character.avatar
  || character.image_url
  || style-specific project fallback art
```

Rules:

- Owner-authored or imported character art always wins.
- Project fallback art is display-only. It must not be written back into `TavernCharacter`.
- Style resolution may use `appearance.active_preset_id`, wardrobe IDs, tags, name, description, personality, scenario, first message, and tavern text.
- Fallback images must be real tavern-themed NPC art assets under `frontend/app/assets/npc-style-cast/`.

## Scenario: New NPC Character Completion Contract

### 1. Scope / Trigger

Use this contract whenever a Trellis task claims a new **formal NPC role** is implemented, including default public-welfare seed NPCs, tavern presets, system character presets, or demo NPCs that ship with the product. Text-only character cards are design drafts, not completed NPC implementation.

This contract does not apply to temporary `AI 草稿` previews before the owner confirms/saves a role.

### 2. Signatures

Persisted / shipped NPC payloads must expose at least one direct portrait path:

```typescript
type TavernCharacter = {
  avatar?: string
  image_url?: string
  sprites?: {
    neutral?: string
    happy?: string
    angry?: string
    shy?: string
    curious?: string
    // Current expression engine aliases are also accepted and recommended:
    joy?: string
    anger?: string
    embarrassment?: string
    curiosity?: string
  }
}
```

Minimum asset set for a formal NPC:

```text
neutral portrait/立绘: required
happy / angry / shy / curious: required unless the task explicitly scopes to avatar-only prototype
```

In the current product expression taxonomy, map semantic names to engine keys like this:

| Required semantic expression | Current engine key | Alias to include when possible |
| --- | --- | --- |
| happy | `joy` | `happy` |
| angry | `anger` | `angry` |
| shy | `embarrassment` | `shy` |
| curious | `curiosity` | `curious` |

### 3. Contracts

- `sprites.neutral` or `avatar` must point to a project-owned asset path, not an empty string.
- Owner/imported art still takes precedence over project fallback art.
- Project fallback art is only for missing user art; it does not make a new shipped NPC “complete”.
- For default/demo NPCs, assets should live in a stable public or imported asset folder and the character seed must reference those paths directly.
- Asset filenames should include the NPC slug and expression, for example:

```text
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/neutral.png
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/joy.png
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/anger.png
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/embarrassment.png
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/curiosity.png
```

### 4. Validation & Error Matrix

| Case | Expected |
| --- | --- |
| New NPC has text fields but no `avatar` / `sprites.neutral` | Not complete; add art before claiming implementation done |
| New NPC has only generic fallback via UI | Not complete; fallback is display-only |
| `sprites.neutral` points to missing file | Test failure; fix path or asset |
| Has `joy/anger/embarrassment/curiosity` but no semantic aliases | Acceptable for current engine; prefer adding `happy/angry/shy/curious` aliases for user-facing clarity |
| Owner uploads/imports `sprites.neutral` or `avatar` | Owner art wins over project fallback |

### 5. Good / Base / Bad Cases

Good:

- NPC payload includes `avatar`, `sprites.neutral`, and expression entries for happy/angry/shy/curious semantics; tests verify the files exist.

Base:

- MVP role has `avatar` and `sprites.neutral` only, and the Trellis task explicitly calls it an avatar-only prototype rather than “fully completed NPC”.

Bad:

- A new NPC seed has complete prompt text but empty `avatar` and `{}` sprites, relying on default placeholder or generic style fallback.

### 6. Tests Required

When adding a formal NPC role, tests must assert:

```python
assert character["avatar"] or character["sprites"].get("neutral")
assert character["sprites"].get("neutral")
assert character["sprites"].get("joy") or character["sprites"].get("happy")
assert character["sprites"].get("anger") or character["sprites"].get("angry")
assert character["sprites"].get("embarrassment") or character["sprites"].get("shy")
assert character["sprites"].get("curiosity") or character["sprites"].get("curious")
```

For project-local assets, also assert the referenced files exist and are valid image assets. For PNG:

```python
sprite_path = Path("frontend/public") / sprite_url.removeprefix("/")
assert sprite_path.exists()
assert sprite_path.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
```

Run at least:

```powershell
py -3 -m pytest -q <focused NPC/default-tavern test> --tb=short
npm --prefix .\frontend run build
```

### 7. Wrong vs Correct

#### Wrong

```python
_character(
    name="新 NPC",
    # Text is complete, but art is missing.
    avatar="",
    sprites={},
)
```

#### Correct

```python
_character(
    name="新 NPC",
    avatar="/assets/npcs/public-welfare/new-npc/neutral.png",
    sprites={
        "neutral": "/assets/npcs/public-welfare/new-npc/neutral.png",
        "happy": "/assets/npcs/public-welfare/new-npc/joy.png",
        "joy": "/assets/npcs/public-welfare/new-npc/joy.png",
        "angry": "/assets/npcs/public-welfare/new-npc/anger.png",
        "anger": "/assets/npcs/public-welfare/new-npc/anger.png",
        "shy": "/assets/npcs/public-welfare/new-npc/embarrassment.png",
        "embarrassment": "/assets/npcs/public-welfare/new-npc/embarrassment.png",
        "curious": "/assets/npcs/public-welfare/new-npc/curiosity.png",
        "curiosity": "/assets/npcs/public-welfare/new-npc/curiosity.png",
    },
)
```

## Prompt Contract for Generated NPC Assets

Use this structure when generating new NPC fallback art:

```text
Use case: stylized-concept
Asset type: FableMap cyber tavern NPC portrait asset
Primary request: actual finished cartoon/anime/game-style NPC portrait; choose human or original non-human species/body plan according to tavern theme, not placeholder, not icon, not UI mockup.
Core tavern requirement: the NPC must visibly belong inside a tavern with bar/counter, mugs, shelves, lanterns, menu board, bottles, map-table, cyber terminal glow, or equivalent tavern interior details.
Subject: <species/body plan + role + age/maturity range + outfit/surface texture + tavern job>
Style/medium: polished original anime game concept art, expressive eyes, clean linework, soft cel shading.
Composition/framing: bust or waist-up portrait, tavern interior background visible.
Lighting/mood: cozy indoor tavern lighting with theme-specific accents.
Constraints: original character only; no text; no logos; no watermark; no abstract placeholder; no specific IP; no living-artist imitation.
```

## Character Prompt Meta-Generation Contract

Use this contract whenever a task asks AI to create or refine prompts for NPC role drafts, portrait prompts, expression sprite prompts, or reusable visual style prompts.

Rules:

- Treat generated character content as an owner-reviewable draft only. Do not save or present it as published `TavernCharacter` content before owner confirmation.
- Keep generated role prompts aligned with existing `NpcDraftPreview` / `TavernCharacter` fields: `name`, `description`, `personality`, `scenario`, `gender`, `system_prompt`, `first_mes`, `mes_example`, `alternate_greetings`, and `tags`.
- Do not invent persisted schema fields for prompt convenience.
- Decompose prompts into explicit layers: subject identity, species/body plan, real-place tavern anchor, owner intent, visitor feeling, interaction boundary, visual composition, color/light, medium/texture, and constraints.
- For fantasy / isekai / non-realistic taverns, actively decide the cast's species/body-plan mix; do not let every NPC become an ordinary human by default. Keep species details inside existing character text/tags and visual prompts unless a schema task explicitly adds a field.
- When adapting a visual reference, extract a transferable style kernel and remove source-specific characters, story text, brands, franchise marks, and living-artist style imitation.
- For reusable image style templates, split the result into:
  - **Style DNA Prompt**: the transferable aesthetic constant (art style/genre, color science, lighting, medium/texture, mood, render/post-processing, era/cultural context, detail-density zoning, dynamic state, symbolic visual language). It must contain the subject placeholder and remain usable without a separate composition module.
  - **Composition Module**: optional, abstract space/framing instructions only (composition technique, shot type/angle, perspective/spatial logic, and foreground/midground/background visual roles), with no concrete scene objects.
  - **Subject Recommendations**: high-affinity, cross-genre, and contrast-mashup subject suggestions to help owners choose a fitting original tavern subject.
- Keep abstraction strict: do not preserve source-image characters, readable text, specific story events, brands, logos, living-artist imitation, or fixed props; convert concrete objects into visual-function categories such as ritual display items, lived-in prop clusters, abstract coordinate traces, or archive fragments.
- Distinguish medium texture from medium carrier. For example, "Risograph halftone texture" is allowed as a rendering/texture technique; do not imply the final asset must be a full magazine cover, barcode poster, or branded commercial layout unless that carrier itself is explicitly in scope.
- Prefer one or two strong visual style families over long keyword piles. The style must support the NPC's tavern role and desired visitor emotion.
- For expression sets, require identity consistency across `neutral`, `joy/happy`, `anger/angry`, `embarrassment/shy`, and `curiosity/curious`; expression changes must not alter core face, outfit silhouette, palette, or signature prop.
- For deliverable generated images, follow `image-asset-guidelines.md`; prompt text alone is not a shipped asset.
- When a user contributes a tested reusable visual prompt recipe, preserve the full recipe in a skill reference before reducing it to a short style keyword. Keep user notes such as palette fatigue, element pile-up, or favorite/use-case guidance because they affect future prompt selection.
- For future FableMap material resources, use `image-style-prompt-extractor` by default as the style extraction/normalization step before generating images or final visual prompts. If a needed project style is missing, add a complete recipe to `style-recipes.md` before relying on it.
- For batch or Agent-generated NPC assets, use the Prompt-as-Code technique reference before writing final prose prompts. Lock `schema_version`, `asset_use`, species/body-plan, identity continuity, tavern cues, Style DNA, composition, text policy, and negative constraints separately so sprite sets and public-welfare batches remain consistent.
- NPC-specific extensions should be additive modules such as `series.identity-locks.v1` or `sprite.expression-set.v1`; do not add persisted character fields or mutate `TavernCharacter` schema to support prompt convenience.
- NPC image quality and diversity are mandatory. Do not accept a cast where every NPC is the same centered anime bust in the same warm wooden cyber bar with the same teal glow. For non-series NPC batches, vary at least one major visual axis per asset: tavern skin/interior architecture, material system, palette, lighting, shot/composition, species/body-plan silhouette, or style family.

Reusable project skill:

```text
.agents/skills/generate-character-prompt/SKILL.md
.agents/skills/generate-character-prompt/references/prompt-as-code-techniques.md
.agents/skills/generate-character-prompt/references/style-recipes.md
.agents/skills/image-style-prompt-extractor/SKILL.md
```

Use `generate-character-prompt` when turning owner briefs or style-reference notes into character-card generator prompts and NPC visual asset prompts. Use `image-style-prompt-extractor` first when the input is an actual reference image, when the requested output is a reusable style prompt, or when a material-generation task needs a normalized style prompt before image generation.

Validation matrix:

| Case | Expected |
| --- | --- |
| Prompt generator outputs fields outside `TavernCharacter` / `NpcDraftPreview` | Invalid; revise to existing fields or design a separate schema task |
| Character draft omits tavern place, role, or visitor interaction purpose | Weak prompt; add real-place tavern anchor and job-to-be-done |
| Fantasy / isekai cast prompt makes every NPC human by default | Weak prompt; add original non-human or non-ordinary species/body-plan options tied to tavern jobs |
| Batch NPC portraits share the same decor, pose, lighting, and generic anime finish | Weak prompt; add a diversity matrix and distinct visual theses |
| Visual prompt references a specific IP character, logo, or living artist | Invalid for project assets; convert to generic style/shape/color language |
| Expression prompts change hair, face, outfit silhouette, or signature prop across emotions | Invalid sprite set; enforce identity consistency |
| Generated image is accepted for runtime use but remains outside the repository | Not complete; move to a project asset path and verify per `image-asset-guidelines.md` |

Good:

- Generate a prompt that asks for `name`, `description`, `personality`, `scenario`, `gender`, `system_prompt`, `first_mes`, `mes_example`, `alternate_greetings`, and `tags`, while stating the result is an owner-confirmable draft.
- Generate a five-expression visual prompt set with the same character identity, explicit species/body-plan continuity, and explicit tavern interior cues.

Bad:

- Generate a complete NPC persona and claim it is already saved to the tavern.
- Ask for “in the style of <living artist>” or “as <copyrighted character>” for a project-shipped NPC asset.

## Good / Base / Bad Cases

Good:

- A warm tavern guide behind a wooden bar with mugs, candlelight, copper apron, and a glowing map tablet.
- A neon night host at a rain-window bar booth with bottle shelves, old microphone, and cyberpunk tavern lighting.
- An original non-human tavern regular, such as a lantern-moth archivist or clockwork fox courier, whose anatomy, props, and service role are readable in the tavern space.

Base:

- A portrait where the person is clear and the background contains at least two tavern cues.
- A mostly human cast where one clearly original non-human NPC provides visual contrast and a job-relevant chat role.

Bad:

- A pretty anime face on a blank gradient background.
- A circular initial avatar or geometric dummy body.
- A fantasy warrior portrait with no tavern role or tavern setting.
- An isekai tavern roster where every NPC is the same human anime template with only hair/outfit color changes.

## Tests Required

For implementation changes:

```powershell
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
```

Run `npm --prefix .\frontend test` when changing service contracts or rule scripts.

Manual/visual check:

- Confirm the no-avatar path displays a real tavern-themed NPC image.
- Confirm uploaded/imported `sprites.neutral`, `avatar`, or `image_url` still override fallback art.
- Confirm narrow screens keep the portrait and chat usable.

## Wrong vs Correct

### Wrong

```tsx
// Bad: abstract placeholder instead of tavern-themed character art.
<div className="rounded-full bg-cyan-300">{character.name[0]}</div>
```

### Correct

```tsx
// Good: owner art first, then real project tavern NPC art fallback.
const avatar = character.sprites?.neutral || character.avatar || character.image_url
return avatar ? <img src={avatar} alt={character.name} /> : <NpcStyleFallback style={style} />
```
