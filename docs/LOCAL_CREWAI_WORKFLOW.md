# Local Multi-Agent Workflow with CrewAI

## Why this exists

This project already has strong domain orchestration in [`fablemap/orchestrator/`](../fablemap/orchestrator/), but daily development can still become chaotic when work is handed to isolated agents without a shared manager, state flow, or boundary rules.

This workflow adds a **local manager-driven coordination layer**:

- use one objective as input
- generate one bounded workflow plan
- keep four fixed roles
- run one slice at a time
- treat `CrewAI` as the outer coordination layer, not as a replacement for project business logic

## Fixed roles

The local scaffold in [`fablemap/crew_orchestrator.py`](../fablemap/crew_orchestrator.py) defines four stable roles:

1. `Manager`
   - turns a raw objective into a bounded slice
   - assigns ownership
   - defines validation and boundaries
2. `Builder`
   - implements the approved slice only
3. `Tester`
   - runs focused verification for the approved slice
4. `Documenter`
   - syncs tasklist, claim, and change records with reality

## Status flow

Recommended status flow:

- `planned`
- `claimed`
- `in_progress`
- `blocked`
- `done`

This aligns with [`docs/AI_SHARED_TASKLIST.md`](AI_SHARED_TASKLIST.md) and should remain the single source of truth for active work selection.

## CLI entrypoints

New CLI commands are available through [`fablemap/cli.py`](../fablemap/cli.py):

- `python -m fablemap crew-plan --objective "..."`
- `python -m fablemap crew-run --objective "..."`

Examples:

```bash
python -m fablemap crew-plan --objective "Add a manager-driven flow for local AI task coordination"
python -m fablemap crew-run --objective "Add a manager-driven flow for local AI task coordination"
```

By default it writes to:

- `artifacts/crew-plan/workflow-plan.json`
- `artifacts/crew-plan/workflow-plan.md`

You can choose another output directory:

```bash
python -m fablemap crew-plan --objective "Prepare map asset acceptance workflow" --output-dir artifacts/map-assets-plan
```

## What gets generated

[`fablemap/crew_orchestrator.py`](../fablemap/crew_orchestrator.py) generates:

- a JSON workflow plan for machine-readable coordination
- a Markdown workflow plan for human review
- a `CrewAI` availability summary

The generated plan includes:

- objective
- manager notes
- fixed roles
- task flow
- validation checkpoints
- dependency order

## Current behavior

Right now this scaffold is intentionally conservative:

- [`python -m fablemap crew-plan`](../fablemap/__main__.py:1) writes plan artifacts
- [`python -m fablemap crew-run`](../fablemap/__main__.py:1) returns a manager-controlled execution summary
- `--live` on `crew-run` validates that live `CrewAI` prerequisites are present before real execution is attempted
- it **does not** replace [`fablemap/orchestrator/ai_engine.py`](../fablemap/orchestrator/ai_engine.py)
- it **does not** let agents modify the repo without a manager-defined slice

Instead, it gives you a clean coordination contract first.

If [`crewai`](../requirements.txt) is importable, the scaffold reports that `CrewAI` is available. If not, the workflow plan still works as the manager-controlled source of truth.

## Recommended operating procedure

1. Pick one task from [`docs/AI_SHARED_TASKLIST.md`](AI_SHARED_TASKLIST.md)
2. Write one clear objective sentence
3. Generate a plan with [`python -m fablemap crew-plan`](../fablemap/__main__.py:1)
4. Let `Manager` confirm boundaries before implementation
5. Let `Builder` execute only the approved slice
6. Let `Tester` verify only against explicit acceptance checks
7. Let `Documenter` sync task records after validation

## Installation note

[`requirements.txt`](../requirements.txt) now includes `crewai`, so local installation can be done with:

```bash
python -m pip install -r requirements.txt
```

Because `CrewAI` pulls a large dependency tree on Windows, the installation can take a while. After installation, verify it with:

```bash
python -m pip show crewai
python -c "import crewai; print(crewai.__version__)"
```

To check local runtime readiness without executing a live crew yet, run:

```bash
python -m fablemap crew-run --objective "Validate local manager workflow"
python -m fablemap crew-run --objective "Validate local manager workflow" --live
```

The `--live` variant is expected to fail until a provider such as `OPENAI_API_KEY` or `MODEL` is configured.

## Next recommended step

After this scaffold is stable, the next iteration should add one of these:

1. a real `CrewAI` runtime adapter with model/tool configuration
2. a task source reader that pulls the next objective from [`docs/AI_SHARED_TASKLIST.md`](AI_SHARED_TASKLIST.md)
3. a validation runner that maps plan tasks to focused test commands
