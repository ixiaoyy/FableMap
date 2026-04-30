# Quest Reframe to Exploration Checklist

## Goal

把 Quest/任务系统继续收敛为“探索清单/酒馆委托”，避免传统 RPG 化。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-29-ai-creation-sites-research Discord 任务卡映射 / 04-28 Quest 修正
* Status: implemented and self-accepted on 2026-04-30.

## Requirements

* 不做等级、装备、排行、交易奖励。
* 目标绑定 FableMap 主链路：发现、入店、对话、回访、店主确认内容。
* 奖励更偏纪念章、完成记录、回访提示等轻量反馈。
* 继续复用现有前端 helper / route / product chat local state，不新增后端 Quest schema。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation, if any, uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD before moving to review/completed.
* [x] Playwright desktop/mobile visual self-acceptance is recorded before marking complete.

## Existing Code / Docs Inspected

* `docs/WHAT_NOT_TO_BUILD.md`: confirmed no traditional RPG quests, combat, levels/equipment, rankings, token billing, or visitor social loops.
* `docs/PRODUCT_BRIEF.md` and `docs/FABLEMAP_TAVERN_PLATFORM.md`: mainline remains real-coordinate tavern discovery, owner-authored content, NPC dialogue, memory/writeback, and revisit feedback.
* `frontend/app/lib/quest-guide.js` and `frontend/app/routes/quests.tsx`: existing platform guide route and route copy.
* `frontend/app/product/tavernPlayModes.js`, `TavernChatRoom.jsx`, `tavernMiniGames.js`, `tavernTemplates.js`: existing product-parity quest/guild wording, local progress, prompts, and owner templates.
* `.trellis/spec/frontend/component-guidelines.md`, `state-management.md`, `type-safety.md`, `quality-guidelines.md`, and `.trellis/spec/guides/code-reuse-thinking-guide.md`.

## Implementation Notes

* Reframed `/quests` from “探索任务板” to “探索清单”:
  * route eyebrow now uses `Checklist`;
  * global nav label is `清单`;
  * mobile first-screen guide explains no levels/equipment/ranking;
  * route boundary copy says no persistent checklist schema, no tradeable rewards, no rankings.
* Reframed `frontend/app/lib/quest-guide.js` helper copy:
  * guide items now talk about recording, memorial text, and revisit hints;
  * `statusLabel` uses `可记录`; `rewardText` is text memorial / revisit hint, not tradeable reward.
* Reframed product chat “guild quest” surface while preserving existing function/storage names for compatibility:
  * visible panel is now “探索清单 / 酒馆委托”;
  * progress is completion points, recorded items, and text memorial/revisit hints;
  * buttons are `领取清单`, `记录完成`, `提委托草稿`;
  * prompts explicitly require owner confirmation for submitted委托草稿.
* Reframed owner templates and mini-game copy:
  * `adventurer-guild-counter` now surfaces as `街角探索清单台`;
  * `community-quest-board` now surfaces as `社区探索小清单`;
  * default text avoids old “冒险工会 / 声望 / 身份奖励 / 任务板” framing.
* Added helper fallbacks `getQuestRecordLabel` / `getQuestReturnHint` so old custom `identityReward` / `treatment` payloads still display safely without schema change.
* No backend/API/schema changes were made.

## Verification

* `node .\frontend\scripts\play-modes-test.mjs; node .\frontend\scripts\quest-guide-test.mjs; node .\frontend\scripts\mini-games-test.mjs` — passed.
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* `npm --prefix .\frontend test` — passed, including `play-modes-test: ok` and `quest-guide-test: ok`.

## Playwright Visual Self-Acceptance

* Dev server: `.\node_modules\.bin\react-router.cmd dev --host 127.0.0.1 --port 5182` from `frontend/`.
* Command: `$env:QUEST_CHECKLIST_URL='http://127.0.0.1:5182/quests'; node .\.trellis\tmp\playwright-mainline\quest-checklist-visual-acceptance.cjs` — passed.
* Script: `.trellis/tmp/playwright-mainline/quest-checklist-visual-acceptance.cjs`.
* Evidence:
  * `.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-desktop.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-mobile.png`
  * `.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-visual-acceptance-report.json`
* Checked: desktop route, mobile checklist guide, absence of old quest-board title, no RPG reward/ranking/billing copy, and no horizontal overflow.

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment.
* No backend/API/schema change; no persistent Quest/checklist model added.

## Completion

Completed on 2026-04-30 with focused regression tests, frontend typecheck/build/test, and Playwright desktop/mobile visual self-acceptance passing.
