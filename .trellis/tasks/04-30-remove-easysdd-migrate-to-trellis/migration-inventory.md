# easysdd migration inventory — 2026-04-30

## Summary

The project no longer uses the legacy `easysdd/` workflow. Before deleting it, the remaining tracked project-specific notes were copied into Trellis task artifacts.

## Files migrated

| Source | Destination | Migration decision |
|---|---|---|
| `easysdd/compound/2026-04-30-explore-fablemap-reality-audit.md` | `.trellis/tasks/archive/2026-04/04-30-mainline-convergence-audit/reality-audit.md` | Keep as mainline audit evidence. |
| `easysdd/issues/2026-04-28-homepage-serves-stale-dist/homepage-serves-stale-dist-fix-note.md` | `.trellis/tasks/04-30-remove-easysdd-migrate-to-trellis/homepage-serves-stale-dist-fix-note.md` | Keep as historical fix evidence in this cleanup task. |

## References updated

- `docs/changes/2026-04-21-framework-refactor-priority.md` no longer points readers to the removed directory.
- `.trellis/tasks/archive/2026-04/04-28-04-28-project-directory-cleanup/prd.md` no longer treats the removed workflow directory as an active reference source.

## Removed

- `easysdd/` after the migrated files above were written.

## Out of scope

- User-level or globally installed skills outside this repository.
- Product code, schema, API behavior, image assets, and generated test/browser output.
