# brainstorm: embedded story mini-games and game workshop tavern

> Archived compact summary. Verbose historical PRD/brainstorm content was removed to reduce AI context noise.

- Status: completed
- Created: 2026-05-07
- Completed: 2026-05-12
- Scope: Embedded story mini-games and game workshop brainstorm parent closure
- Notes: 已在 PRD 确认：本轮只走轻量版方案D优先（空间能力聚合枢纽 + 通用链路），不做行业级深流程判定；次序为 D1/D2 -> A1/A2 -> B1/C1。已拆解为 3 个可执行子任务：space-capability-hub-mvp、story-microgame-template-mvp、game-workshop-curated-oss-minigames。 Closed as brainstorm complete: PRD captures approved priority order and follow-up split. Related lightweight mini-game/gameplay template tests now pass in the current frontend suite.

## Deferred / not done
- Additional game workshop/OSS embedding beyond the existing curated slice remains future scoped work.

## Validation record
- node .\frontend\scripts\mini-games-test.mjs PASS (current session)
- node .\frontend\scripts\gameplay-test.mjs PASS (current session)
- npm --prefix .\frontend test PASS (current session)
- npm --prefix .\frontend run build PASS (current session)

## Context policy
- Use current product docs/spec files as source of truth; do not load removed historical brainstorm detail unless restored from git history.
