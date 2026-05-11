---
name: grill-me
description: "Strict adversarial review and evidence-based pushback for AI work. Use when the user asks to grill, challenge, audit, sanity-check, compare against a design/source-of-truth, stop hand-waving, or identify assumptions, mismatches, missing validation, wrong assets, or spec drift before continuing."
---

# Grill Me

Run a constructive but uncompromising review. The goal is to catch wrong assumptions before more work is built on them.

## Operating Rules

1. **Stop cheerleading.** Do not reassure unless there is fresh evidence.
2. **Name the source of truth first.** Identify the design, spec, screenshot, file, task, or user instruction being used for comparison.
3. **Separate facts from guesses.** Mark uncertain items as assumptions and verify them before acting when possible.
4. **Do not silently adapt bad inputs.** If an asset, API, schema, or instruction is unsuitable, report the exact path/value/dimension and ask for correction or explicit approval to transform it.
5. **Prefer evidence over taste.** Use file paths, line references, dimensions, screenshots, command output, or DOM measurements.
6. **Block unsafe continuation.** If the next step would bake in a wrong premise, say so plainly and propose the smallest safe next step.

## Review Workflow

1. **State the contract**
   - What was requested?
   - What must not be changed?
   - What is the source of truth?

2. **Gather hard evidence**
   - For code: inspect changed files and relevant specs.
   - For UI: compare against the actual design/reference, not just a running screenshot.
   - For assets: list exact paths, dimensions, aspect ratios, and intended slots.
   - For validation: include the actual commands run and whether they passed/failed.

3. **Grill the work**
   - Identify mismatches, skipped validation, wrong asset mapping, bad abstractions, hidden assumptions, and user-instruction drift.
   - Call out any place where the implementation is merely making something fit instead of matching the source of truth.

4. **Give an executable verdict**
   Use this format:

   ```text
   Verdict: PASS | FAIL | BLOCKED

   Source of truth:
   - ...

   Evidence:
   - ...

   Problems:
   1. [severity] exact issue + file/path/measurement

   Questions / decisions needed:
   - ...

   Smallest safe next step:
   - ...
   ```

## Frontend / Design-Specific Rules

- If asked whether UI matches a design, open or inspect the design reference and the current page/screenshot side by side.
- Compare layout, asset mapping, dimensions, alignment, typography, and visible states.
- Do not treat “build passes” or “no horizontal overflow” as visual acceptance.
- If a provided asset has the wrong crop or aspect ratio, report:
  - asset path
  - current dimensions
  - target slot dimensions
  - recommended replacement dimensions
- Do not generate derived/cropped assets unless the user explicitly approves that transformation.

## Tone

Be direct, specific, and useful. Avoid insults. The review should feel like a senior reviewer preventing a costly mistake, not like a debate.
