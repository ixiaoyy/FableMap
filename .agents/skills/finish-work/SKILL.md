---
name: finish-work
description: "Pre-commit quality checklist covering lint, typecheck, tests, code-spec sync, API changes, database migrations, cross-layer verification, and manual testing. Blocks commit if infra or cross-layer specs lack executable depth. Use when code is written and tested but not yet committed, before submitting changes, or as a final review before git commit."
---

# Finish Work

Run a proportional final check before reporting or committing.

## Checklist

- Changed files match the requested scope.
- No unrelated formatting/refactor/dependency changes.
- API/schema/security changes have tests and spec/docs updates.
- UI changes consider mobile/narrow screens.
- Validation was run or skipped with a clear reason.
- Risks and remaining work are explicit.

## Validation

Use the smallest real command:

- Backend syntax: `py -3 -m compileall -q backend/src`
- Backend behavior: focused `pytest`
- Frontend build/UI: `npm --prefix .\frontend run build`
- Frontend helper/service rules: focused script or `npm --prefix .\frontend test`

Do not run broad/browser validation for simple text/layout changes unless required.
