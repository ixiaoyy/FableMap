---
name: brainstorm
description: "Collaborative requirements discovery session optimized for AI coding workflows. Creates task directories, seeds PRDs, runs codebase research, proposes concrete implementation approaches with trade-offs, and converges on MVP scope through structured Q&A. Use when requirements are unclear, multiple implementation paths exist, trade-offs need evaluation, or a complex feature needs scoping before development."
---

# Brainstorm

Use only when requirements are unclear or the implementation path has real trade-offs.

## Output

Create/update one concise `.trellis/tasks/<task>/prd.md` with:

- goal;
- in scope / out of scope;
- affected files/layers;
- chosen approach;
- validation plan;
- open questions.

## Process

1. Restate the goal in 1-3 bullets.
2. Inspect only relevant code/docs.
3. Propose 1-3 viable approaches with trade-offs.
4. Recommend the smallest MVP.
5. Ask only blocking questions; otherwise proceed with reasonable assumptions.

## Keep it small

- Do not write long research dumps.
- Do not store screenshots/raw scans in task folders.
- Move durable lessons to focused spec files, not giant PRDs.
- Completed brainstorm tasks should be compact summaries.
