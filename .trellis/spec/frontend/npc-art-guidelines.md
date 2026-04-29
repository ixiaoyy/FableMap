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

- Real cartoon/anime/game-style human NPC portrait, bust or waist-up.
- The NPC must visibly belong inside a tavern: bar counter, wooden shelves, mugs, lanterns, menu board, bottles, map-table, glowing terminal, door signage, or equivalent tavern interior cues.
- The role should read as tavern staff, host, guide, storyteller, keeper, attendant, or regular NPC.
- The style can vary by tavern skin, but must preserve FableMap's product meaning: real place → owner-authored tavern → AI NPC → memory/revisit.
- Generated portrait files must follow `image-asset-guidelines.md`: final deliverables live in repository asset paths, not only in `.codex/generated_images` or chat previews.

Forbidden:

- Circles, squares, geometric dummy avatars, abstract silhouettes, empty profile placeholders.
- Generic anime portraits with no tavern environment or tavern props.
- Platform-generated character content being saved as if it were owner-authored role/card data.
- Specific copyrighted IP, franchise logos/UI, recognizable existing characters, or imitation of a living artist's personal style.

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
Primary request: actual finished cartoon/anime/game-style human NPC portrait, not placeholder, not icon, not UI mockup.
Core tavern requirement: the NPC must visibly belong inside a tavern with bar/counter, mugs, shelves, lanterns, menu board, bottles, map-table, cyber terminal glow, or equivalent tavern interior details.
Subject: <role + age range + outfit + tavern job>
Style/medium: polished original anime game concept art, expressive eyes, clean linework, soft cel shading.
Composition/framing: bust or waist-up portrait, tavern interior background visible.
Lighting/mood: cozy indoor tavern lighting with theme-specific accents.
Constraints: original character only; no text; no logos; no watermark; no abstract placeholder; no specific IP; no living-artist imitation.
```

## Good / Base / Bad Cases

Good:

- A warm tavern guide behind a wooden bar with mugs, candlelight, copper apron, and a glowing map tablet.
- A neon night host at a rain-window bar booth with bottle shelves, old microphone, and cyberpunk tavern lighting.

Base:

- A portrait where the person is clear and the background contains at least two tavern cues.

Bad:

- A pretty anime face on a blank gradient background.
- A circular initial avatar or geometric dummy body.
- A fantasy warrior portrait with no tavern role or tavern setting.

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
