---
name: record-session
description: "Records completed work progress to .trellis/workspace/ after human testing and commit. Use only when the session is truly complete and a compact record is useful."
---

Use only after human testing/commit or explicit request.

Keep records short:

- title/date;
- commit hash(es);
- changed areas;
- validation;
- unresolved risks.

Do not append long logs, screenshots, raw scans, or verbose implementation notes.

Commands when needed:

```powershell
py -3 ./.trellis/scripts/get_context.py --mode record
py -3 ./.trellis/scripts/add_session.py --title "..." --commit "..." --summary "..."
py -3 ./.trellis/scripts/task.py archive <task-name>
```
