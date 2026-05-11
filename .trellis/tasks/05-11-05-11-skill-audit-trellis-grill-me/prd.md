# Skill audit: Trellis + grill-me gate

## Request

User instruction on 2026-05-11:

> 以后用 trellis + grill-me，你看看其他 skill 是否有重复的，可以清理

## Source of truth

- `.agents/skills/*/SKILL.md`
- `.codex/skills/parallel/SKILL.md`
- User instruction above
- `AGENTS.md` workflow requirements: Trellis task/spec traceability and honest validation

## Audit result

No skill was deleted in this pass.

Reason: the apparent overlaps are workflow-stage overlaps, not true duplicates. Deleting them would remove useful gates:

| Skill(s) | Verdict | Rationale |
| --- | --- | --- |
| `start` vs `before-dev` | Keep both | `start` initializes/resumes a session; `before-dev` injects package/spec rules immediately before coding. |
| `brainstorm` vs Trellis task workflow | Keep | `brainstorm` is the requirements-discovery entry for unclear or multi-path work, not a replacement for Trellis. |
| `check` vs `finish-work` | Keep both | `check` validates recent code against specs midstream; `finish-work` is the final pre-commit completeness gate. |
| `check-cross-layer` vs `finish-work` | Keep both | `check-cross-layer` is deeper cross-layer analysis; `finish-work` decides when to invoke it. |
| `improve-ut` vs `finish-work` | Keep both | `improve-ut` adds/repairs test coverage; `finish-work` only requires tests to be considered/run. |
| `create-command` vs system `skill-creator` | Candidate overlap, keep for now | Local Trellis scaffolding may still be useful; removing it needs a usage/reference check first. |
| `generate-character-prompt` vs `image-style-prompt-extractor` | Keep both | One creates FableMap/NPC prompt assets; one extracts reusable style DNA from references. |
| `.codex/skills/parallel` vs sub-agent tooling | Keep | The skill defines project pipeline rules; tools only provide execution capability. |

## New operating rule

For future AI work in this repository:

1. Use Trellis for task traceability whenever the work is non-trivial, visual/product-facing, or likely to span multiple files.
2. Use `grill-me` as a hard review gate when any of the following apply:
   - UI/design fidelity is being judged.
   - User-provided assets or cut images are mapped into the product.
   - The user challenges correctness, asks for audit/sanity-check, or points out mismatch/drift.
   - We are about to finalize work that could bake in a wrong source-of-truth assumption.
3. `grill-me` must name the source of truth and evidence. Build success or “looks okay” is not visual acceptance.

## Changes made

- Add the `grill-me` gate to `.trellis/workflow.md`.
- Add the `grill-me` gate to `check` and `finish-work` skills.
- Keep existing skills; do not delete candidates without a separate reference/usage audit.

## Validation

- Documentation-only update.
- Verify changed files and final diff.
