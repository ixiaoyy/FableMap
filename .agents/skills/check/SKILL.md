---
name: check
description: "Validates recently written code against project-specific guidelines from .trellis/spec/. Use after code changes or before commit when focused quality verification is needed."
---

Run a proportional check.

1. Inspect changed files: `git diff --name-only`.
2. Read only relevant spec index/focused spec.
3. Review for scope drift, owner/visitor boundary, schema/API alignment, and secret leakage.
4. Run the smallest real validation:
   - Backend: `py -3 -m compileall -q backend/src` plus focused pytest if behavior changed.
   - Frontend: `npm --prefix .\frontend run build` for UI/build changes; focused script or `npm --prefix .\frontend test` for helper/service contracts.
5. Use `$grill-me` only for contested visual/source-of-truth fidelity, not routine small copy/layout edits.
