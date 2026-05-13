---
name: start
description: "Initializes an AI development session by reading workflow guides, developer identity, git status, active tasks, and project guidelines from .trellis/. Classifies incoming tasks and routes to brainstorm, direct edit, or task workflow. Use when beginning a new coding session, resuming work, starting a new task, or re-establishing project context."
---

# Start Session

Use this skill to begin or resume a coding task without overloading context.

## Minimal startup

1. Read `AGENTS.md`.
2. Check `git status --short`.
3. Read `.trellis/workflow.md`.
4. Read `.trellis/spec/<layer>/index.md` only for the layer touched.
5. Read only specific spec files required by that index/checklist.
6. Inspect the target code before editing.

## Routing

- Unclear / multi-path feature: use `brainstorm` first.
- Small bug or direct request: implement directly with a short task note if needed.
- Cross-layer/API/schema change: use Trellis task + focused spec update.

## Context hygiene

- Do not bulk-read completed `.trellis/tasks/**`.
- Do not load old journals unless asked.
- Prefer active task files and current specs.
- Keep progress updates concise and executable.
