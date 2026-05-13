---
name: before-dev
description: "Discovers and injects project-specific coding guidelines from .trellis/spec/ before implementation begins. Reads spec indexes and only the focused guideline files needed for the target change. Use when starting a new coding task, before writing code, or switching package/layer."
---

Read minimal project guidelines before editing.

1. Run: `py -3 ./.trellis/scripts/get_context.py --mode packages`
2. Identify touched layer: backend, frontend, docs, assets, tests.
3. Read only `.trellis/spec/<layer>/index.md` and the focused spec(s) it points to for this change.
4. Do not bulk-read completed `.trellis/tasks/**` or old journals.
5. Proceed with the smallest scoped implementation.
