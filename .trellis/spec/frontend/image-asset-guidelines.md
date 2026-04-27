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
frontend/public/assets/npcs/mimi-nya-neutral.png -> /assets/npcs/mimi-nya-neutral.png
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

- Generate an NPC sprite, resize to `512×512`, save as `frontend/public/assets/npcs/name-neutral.png`, update `sprites.neutral` to `/assets/npcs/name-neutral.png`, then run focused asset tests and frontend build.

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
frontend/public/assets/npcs/mimi-nya-neutral.png

Runtime reference:
/assets/npcs/mimi-nya-neutral.png
```
