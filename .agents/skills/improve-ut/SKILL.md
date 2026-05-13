---
name: improve-ut
description: "Adds or updates focused tests for changed behavior using existing project patterns. Use when code changes need real regression coverage; do not add brittle tests for incidental copy/layout changes."
---

# Improve Tests

1. Inspect changed files and existing nearby tests.
2. Add the smallest test that protects behavior/API/security/schema boundaries.
3. Prefer existing test style and no new dependencies.
4. Run focused validation only.

Common commands:

```powershell
py -3 -m pytest backend/tests/<file>.py -q --tb=short
py -3 -m pytest tests/<file>.py -q --tb=short
node .\frontend\scripts\<script>.mjs
npm --prefix .\frontend test
```

Avoid adding tests that assert exact UI copy, CSS classes, or component source internals unless they guard a real contract.
