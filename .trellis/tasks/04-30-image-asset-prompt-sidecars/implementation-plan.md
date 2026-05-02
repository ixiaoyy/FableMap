# Image asset prompt sidecars implementation plan

## Claim / scope

- Owner: lijin
- Status: claimed for implementation on 2026-05-02
- Goal: co-locate prompt sidecars beside current project image assets, generate an inventory, and add validation tooling.
- Allowed files: prompt sidecars under `frontend/public/`, `frontend/app/assets/`, selected formal `artifacts/` image evidence, task-local scripts/inventory, and image prompt rules in `AGENTS.md`, `docs/IMAGE_ASSETS_SPEC.md`, `.trellis/spec/frontend/`, and image prompt skills.
- Not allowed: regenerate or replace bitmap images, change runtime image references, change schema/API fields, delete existing docs/assets, or relabel reverse-engineered prompts as original prompts.

## Research summary

### Relevant specs

- `AGENTS.md`: global asset landing and reporting constraints.
- `docs/IMAGE_ASSETS_SPEC.md`: canonical image asset spec and Prompt-first protocol.
- `.trellis/spec/frontend/image-asset-guidelines.md`: frontend image asset placement/verification.
- `.trellis/spec/frontend/npc-art-guidelines.md`: NPC sprite/expression asset contracts.
- `.agents/skills/generate-character-prompt/SKILL.md`: prompt-first NPC visual workflow.
- `.agents/skills/image-style-prompt-extractor/SKILL.md`: reverse prompt / 15D style extraction workflow.

### Code / artifact patterns found

- Public-welfare batch prompt manifests preserve original prompts for 70 sprites:
  - `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-1-prompt-manifest/public-welfare-batch-1-prompt-manifest.json`
  - `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json`
- Existing asset audit scripts live under task artifacts, e.g. `artifacts/04-30-public-welfare-npc-batch-upgrade/final-verification/verify_public_welfare_final_assets.py`.
- Formal project asset roots currently include `frontend/public/`, `frontend/app/assets/`, and selected task evidence under `artifacts/`.

### Files to modify / create

- Create task-local scripts and tests under `artifacts/04-30-image-asset-prompt-sidecars/`.
- Generate `<image-stem>.prompt.md` beside scanned images.
- Generate `image-prompt-sidecar-inventory.json` and `.md`.
- Update global/spec/skill docs with the sidecar contract.

## Execution plan

1. Write failing tests for sidecar metadata, rendering/parsing, and validation behavior.
2. Implement task-local inventory/generation/validation script.
3. Generate sidecars from original manifests where available; otherwise create explicit `reverse-engineered` or `reference-only` sidecars.
4. Sync policy docs and skills.
5. Run validation: unit-style script test, sidecar validator, Python compile, Trellis validate, frontend build.