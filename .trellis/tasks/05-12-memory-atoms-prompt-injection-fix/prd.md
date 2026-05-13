# fix: memory atoms not injected into LLM prompt

> Compact archive for a completed Trellis task. Historical implementation details were removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-12
- Completed: 2026-05-12
- Scope: backend/src/fablemap_api/application/services/runtime.py; backend/src/fablemap_api/core/prompt_builder.py
- Notes: 已完成：v1 runtime 在 LLM prompt 构建前按 memory_policy 加载可见 MemoryAtom，过滤私密/owner-only 记忆后传入 PromptBuildConfig.memory_atoms；已补回归测试。

## Context policy
- Prefer current docs/specs/code over this archived task. Restore old details from git history only on explicit request.
