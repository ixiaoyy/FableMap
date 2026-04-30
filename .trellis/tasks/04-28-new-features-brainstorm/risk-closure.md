# Risk Closure: 04-28 New Features Brainstorm

Date: 2026-04-30

## Current Trellis State

`py -3 .trellis/scripts/task.py list` shows:

- `04-28-new-features-brainstorm/ (completed) [13/13 done]`
- All 13 parent children are present and completed.

## Not Done / Risk Register

| Item | Status | Decision / Mitigation |
|---|---|---|
| Git commit not created | Open by design | Do **not** commit automatically from this workspace: `git status --short` shows many unrelated pre-existing and parallel changes outside this parent task. A safe commit requires a separate review/staging pass that only stages confirmed files for this bundle. |
| Two parent children were missing from active `.trellis/tasks/` | Mitigated | Rehydrated completed records into exact parent-referenced IDs: `04-29-04-29-owner-dashboard-presentational-mvp` and `04-30-create-tavern-step-wizard-mvp`. Each child records `meta.rehydrated_from_archive` pointing to the archive source. Parent now lists `13/13 done`. |
| Archive duplicates remain | Accepted / intentional | Archive copies were **not deleted** to avoid destructive cleanup and preserve historical trace. Active copies are the parent-tracking records; archive copies are provenance. If desired, create a later Trellis cleanup task to normalize archive policy. |
| `.trellis/tmp/` Playwright harness/evidence files are uncommitted | Accepted as evidence | The visual acceptance rule requires screenshots/reports. Evidence paths are recorded in parent and child task metadata. Scratch Python helper scripts in `.trellis/tmp/` are not source; they can be cleaned in a separate cleanup pass if the team wants a smaller working tree. |
| No backend/API/schema migration | Not a risk; explicitly out of scope | This parent closure intentionally avoided backend/API/schema changes. Feature slices reused existing frontend/service boundaries and documented when no persistent model was added. |
| No platform billing/social/RPG loops | Mitigated by tests/copy checks | Regression tests and Playwright checks assert no token billing, rankings, public social wall, combat/level/equipment framing, or auto-published AI content in the touched surfaces. |
| Browser dev-server WebSocket console noise during Playwright | Mitigated | Reran `/owner` and `/create` Playwright checks from a fresh dev server. Final reports show `consoleSignals: []`, `requestFailures: []`, and no horizontal overflow. |

## Commit Safety Recommendation

If/when a commit is requested, do it as a separate explicit step:

1. Review `git status --short` and separate unrelated work.
2. Stage only files belonging to this parent bundle and its child tasks.
3. Re-run at least:
   - `npm --prefix .\frontend run typecheck`
   - `npm --prefix .\frontend run build`
   - `npm --prefix .\frontend test`
4. Commit with a scoped message such as:
   - `feat(frontend): complete new feature brainstorm bundle`

Until that staging review happens, “no git commit” is the safer state.

## Final Risk State

No remaining functional acceptance blocker for `04-28-new-features-brainstorm`.

Remaining operational risk is only repository hygiene / commit staging in a dirty workspace, which is intentionally deferred to a separate explicit commit-prep step.
