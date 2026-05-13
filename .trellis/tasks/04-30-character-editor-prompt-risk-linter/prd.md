# Character Editor Prompt Risk Linter

> Compact archive for a completed Trellis task. Historical implementation details were removed to reduce AI context noise.

- Status: completed
- Created: 2026-04-30
- Completed: 2026-05-03
- Scope: Frontend-only NPC prompt risk linter for CharacterEditor save, SillyTavern card import, and batch NPC confirm paths; no schema/API changes.
- Notes: Implemented frontend-only Character Prompt Risk Linter. Blocks unsafe prompt saves/imports for jailbreak, absolute obedience, CoT forcing, PII/secrets, and forced/minor adult-content patterns; warns on visitor agency and real-person visual prompt risks; no schema/API changes. Verification recorded in prd.md.

## Deferred / not done
- No backend moderation API or persistent prompt_risk_status.
- No adult-content governance system beyond local blocked patterns.
- No full preset conversion or prompt composer.

## Context policy
- Prefer current docs/specs/code over this archived task. Restore old details from git history only on explicit request.
