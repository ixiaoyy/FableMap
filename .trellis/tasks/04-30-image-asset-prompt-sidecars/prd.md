# Image asset prompt sidecars and inventory

> Archived compact summary. Verbose historical PRD/brainstorm content was removed to reduce AI context noise.

- Status: completed
- Created: 2026-04-30
- Completed: 2026-05-02
- Scope: image-assets/prompt-sidecars
- Notes: Completed 2026-05-02 and revised per follow-up feedback. Inventory now supports same-directory prompt provenance with <image-stem>.prompt.md for independent images and one expression-set.prompt.md per NPC expression set. The group sidecar keeps only the natural/neutral single-image prompt to avoid five-expression contact-sheet generation, while validation still covers grouped assets, dimensions, hashes, prompt type, Style DNA, and identity locks. Updated AGENTS.md, docs/IMAGE_ASSETS_SPEC.md, frontend image/NPC specs, and image prompt skills with the grouped sidecar rule.

## Context policy
- Use current product docs/spec files as source of truth; do not load removed historical brainstorm detail unless restored from git history.
