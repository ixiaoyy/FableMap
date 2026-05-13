# Search discover shared light/black template decomposition

> Archived compact summary. Verbose historical PRD/brainstorm content was removed to reduce AI context noise.

- Status: done
- Created: 2026-05-12
- Completed: 2026-05-12
- Scope: 继续拆解 /discover 搜索页图片与文字层；Light / Black 共用一套 DOM/CSS 模板，运行时只保留共享 1:1 图片素材。
- Notes: Fourth pass completed after user requested black sync: light and black discover now share one real-DOM/CSS template and one shared discover/cards/ 1:1 material set; black main/right-rail/sidebar screenshots were moved out of runtime assets to task legacy-ui-slices. Focused tests, build, and Playwright light+black desktop/mobile pass; full npm test still stops at the pre-existing mini-games-test 9 !== 6 failure.

## Context policy
- Use current product docs/spec files as source of truth; do not load removed historical brainstorm detail unless restored from git history.
