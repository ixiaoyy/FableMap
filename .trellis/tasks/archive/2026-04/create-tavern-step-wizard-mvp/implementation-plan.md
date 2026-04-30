# Create Tavern Step-by-step Wizard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or equivalent TDD execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/create` into a clearly staged tavern-opening wizard surface without changing backend API or persisted schema.

**Architecture:** Keep the native React Router route as the source UI. Add static route-level wizard metadata, a mobile-safe stepper, and section cards that map existing fields into four owner-facing steps. Add a lightweight static script test to protect route copy/boundaries.

**Tech Stack:** React Router route module, Tailwind utility classes, existing lucide icons, Node script tests.

---

## File Structure / Change Map

- Modify: `frontend/app/routes/create.tsx`
  - Add `CREATE_WIZARD_STEPS` metadata and active-step state.
  - Render a mobile-safe wizard header with `aria-label="创建酒馆分步向导"`.
  - Group existing fields into designed step cards; do not alter submitted field names.
  - Keep AI draft copy as draft-only, owner-confirmed, no automatic persistence.
- Create: `frontend/scripts/create-wizard-route-test.mjs`
  - Static assertions for route wizard structure, copy, mobile-safe controls, and no forbidden schema/API drift.
- Modify: `frontend/package.json`
  - Add the new script to `npm --prefix .\frontend test`.
- Modify: `.trellis/tasks/04-30-create-tavern-step-wizard-mvp/prd.md`
  - Append implementation notes and verification output.

## TDD Steps

- [ ] RED: add `frontend/scripts/create-wizard-route-test.mjs` and wire it into `frontend/package.json`.
- [ ] RED: run `node frontend/scripts/create-wizard-route-test.mjs`; expected failure because `/create` does not yet contain the new wizard route contract.
- [ ] GREEN: update `frontend/app/routes/create.tsx` with the stepper and section grouping while preserving existing field names/services.
- [ ] GREEN: rerun `node frontend/scripts/create-wizard-route-test.mjs`; expected pass.
- [ ] Verify broader frontend: run `npm --prefix .\frontend test` and `npm --prefix .\frontend run build`.
- [ ] Append implementation/verification notes to task PRD.

## Guardrails

- No backend/API/schema changes.
- No new dependencies.
- No AI draft auto-create path; draft generation may only fill editable form fields.
- No owner API key display/logging; LLM config remains behind existing service helpers and controlled form.
- Keep mobile tap targets at least `min-h-11` for step buttons and main submit.
