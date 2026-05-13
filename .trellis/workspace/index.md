# Workspace Index

Compact index for AI session records.

## Purpose

`.trellis/workspace/` stores short per-developer session records. Do not use it as a large knowledge base; durable rules belong in `.trellis/spec/` and product docs.

## Commands

```powershell
py -3 ./.trellis/scripts/init_developer.py <your-name>
py -3 ./.trellis/scripts/get_developer.py
py -3 ./.trellis/scripts/add_session.py --title "..." --commit "..." --summary "..."
```

## Hygiene

- Keep journals compact.
- Do not store raw logs, screenshots, or large debug output here.
- Prefer `.trellis/tasks/<task>/task.json` and concise `prd.md` for task state.
