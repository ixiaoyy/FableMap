# Remove easysdd and migrate legacy notes to Trellis

## Goal

Stop using the legacy `easysdd/` project directory while preserving repo-specific knowledge as Trellis task artifacts.

## Scope

### Allowed

- Inventory all tracked `easysdd/` files and active references.
- Migrate useful content into `.trellis/tasks/`.
- Remove the legacy `easysdd/` directory after migration.
- Update stale references that still point readers to the removed directory.

### Not Allowed

- No product code changes.
- No API, schema, prompt, or image asset changes.
- No deletion, movement, or rename of existing `docs/` documents; only text updates for stale references.
- No destructive git commands such as reset, clean, or broad rollback.

## Inventory

| Legacy file | Trellis destination | Reason |
|---|---|---|
| `easysdd/compound/2026-04-30-explore-fablemap-reality-audit.md` | `.trellis/tasks/archive/2026-04/04-30-mainline-convergence-audit/reality-audit.md` | This is evidence for the mainline convergence audit. |
| `easysdd/issues/2026-04-28-homepage-serves-stale-dist/homepage-serves-stale-dist-fix-note.md` | `.trellis/tasks/04-30-remove-easysdd-migrate-to-trellis/homepage-serves-stale-dist-fix-note.md` | This is a historical fix note with no existing matching Trellis task. |

## Acceptance Criteria

- [x] Create a Trellis task for the cleanup/migration.
- [x] Preserve both tracked legacy notes under `.trellis/tasks/`.
- [x] Remove the legacy `easysdd/` directory from the repository tree.
- [x] Update stale non-source references that pointed at the legacy directory.
- [x] Run task validation and reference checks.

## Verification Plan

```powershell
& 'C:\Users\phpxi\miniconda3\python.exe' .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-remove-easysdd-migrate-to-trellis
& 'C:\Users\phpxi\miniconda3\python.exe' .\.trellis\scripts\task.py validate .\.trellis\tasks\archive\2026-04\04-30-mainline-convergence-audit
Test-Path .\easysdd
git -c safe.directory=D:/work/ai- status --short -- easysdd
git -c safe.directory=D:/work/ai- grep -n -I -e easysdd -e EasySDD -e SDD -- ':!easysdd/**' ':!.trellis/tmp/**' ':!**/node_modules/**'
```

Docs/task cleanup only; no backend/frontend build is required because no runtime source changes are intended.


## 2026-04-30 Verification Results

- Context correction: `task.py validate` initially failed because `init-context` auto-injected missing `.claude/commands/trellis/*.md` paths; replaced them with existing `.agents/skills/*/SKILL.md` paths.
- `& 'C:\Users\phpxi\miniconda3\python.exe' .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-remove-easysdd-migrate-to-trellis` — passed; all implement/check/debug context files valid.
- `& 'C:\Users\phpxi\miniconda3\python.exe' .\.trellis\scripts\task.py validate .\.trellis\tasks\archive\2026-04\04-30-mainline-convergence-audit` — passed; all implement/check/debug context files valid.
- `Test-Path .\easysdd` — returned `False`; `git status --short -- easysdd` shows the two legacy tracked files as deleted.
- `git grep -n -I -e easysdd -e EasySDD -e SDD -- ':!easysdd/**' ':!.trellis/tmp/**' ':!**/node_modules/**'` — no tracked text references outside the deleted path.
- Text-reference scan over `docs/`, `.trellis/`, `.agents/`, `.codex/`, and `.claude/` excluding `.trellis/tmp`, `node_modules`, this migration task, and `.trellis/.current-task` — no remaining references.
- Backend/frontend build/test not run because this was a docs/task cleanup with no runtime source changes.

## 2026-05-02 Review Results

- `python .\.trellis\scripts\task.py validate .\.trellis\tasks\04-30-remove-easysdd-migrate-to-trellis` — passed; implement/check/debug context files valid.
- `python .\.trellis\scripts\task.py validate .\.trellis\tasks\archive\2026-04\04-30-mainline-convergence-audit` — passed; implement/check/debug context files valid.
- `Test-Path .\easysdd` — returned `False`; the legacy project directory is absent.
- `git -c safe.directory=D:/work/ai- grep -n -I -e 'easysdd/' -e 'EasySDD' -e 'SDD' -- ':!easysdd/**' ':!.trellis/tmp/**' ':!**/node_modules/**' ':!.trellis/tasks/04-30-remove-easysdd-migrate-to-trellis/**' ':!.trellis/workspace/**' ':!.claude/settings.json'` — returned no matches; remaining mentions are limited to expected migration/audit/journal/tooling history, not active workflow references to the removed directory.
- `git -c safe.directory=D:/work/ai- diff --name-only HEAD` showed unrelated uncommitted work in image-asset/NPC/public-welfare files; no product runtime changes were made for this review.
- Backend/frontend build/test still not run because this remains a docs/task cleanup with no runtime source changes.
