# PRD: Quest checklist persistence boundary

## Problem
探索清单/Quest 路由当前明确写着 MVP，仅用前端估算，不持久化。它可以作为引导页，但如果作为“任务/清单”出现在产品里，用户会期待进度可保存，当前实现容易被认为是 demo。

## Evidence
- `frontend/app/routes/quests.tsx:75`：`本 MVP 只根据现有空间列表做前端引导与进度估算；不新增持久化清单 Schema...`
- `docs/WHAT_NOT_TO_BUILD.md` 明确禁止传统游戏化战斗/等级/排行榜方向，因此不能用竞技化任务系统解决。

## Goal
明确 Quest 的产品边界：
1. 如果作为“探索引导”，改文案/信息架构，避免承诺持久进度；
2. 如果作为“访客清单”，增加非竞技、非奖励化的持久化进度。

## Non-goals
- 不做排行榜、等级、装备、可交易奖励。
- 不把探索做成传统游戏任务系统。

## Acceptance Criteria
- [ ] 产品命名和文案不再让用户误解为有未实现的任务系统。
- [ ] 若实现持久化：每个 visitor 的清单进度可保存/恢复，并有后端测试。
- [ ] 若保持前端引导：路由中移除“进度估算”式伪状态，明确为“探索指南”。
- [ ] 不新增违反 `WHAT_NOT_TO_BUILD` 的排名、奖励、社交竞争。
- [ ] 前端空状态与导航入口与实际能力一致。

## Suggested files
- `frontend/app/routes/quests.tsx`
- `frontend/app/lib/quest-guide.js`
- `docs/WHAT_NOT_TO_BUILD.md`

## Implementation decision (2026-05-07)

本轮选择路径 1：将 `/quests` 明确降级为“探索指南”，不实现访客清单持久化。

原因：

- 该页面原先只基于当前公开空间列表做前端估算，如果继续称为“清单/进度”，容易让用户误解为有已保存的个人任务系统。
- `docs/WHAT_NOT_TO_BUILD.md` 明确排除传统 RPG 任务、等级、装备、排名方向；本轮避免新增后端 Schema 与奖励/排行语义。
- 真正需要持久化访客清单时，应另开后端/API/权限任务，定义非竞技、非奖励化的 visitor scope。

## Acceptance tracking

- [x] 产品命名和文案不再让用户误解为有未实现的任务系统：`/quests` 与全局导航改为“探索指南/指南”。
- [x] 若保持前端引导：路由中移除“进度估算”式伪状态，改为当前可参考线索与下一步建议。
- [x] 不新增违反 `WHAT_NOT_TO_BUILD` 的排名、奖励、社交竞争。
- [x] 前端空状态与导航入口与实际能力一致：无可用空间时只显示建议，不显示完成/进行中状态。
- [x] 访客清单持久化未实现；这是本轮明确 deferred scope。

## Verification (2026-05-07)

- `node .\frontend\scripts\quest-guide-test.mjs`
- `node .\frontend\scripts\mobile-single-mainline-test.mjs`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- Playwright self-acceptance screenshots:
  - `.trellis/tasks/05-06-quest-checklist-persistence/artifacts/playwright/desktop-quests-guide.png`
  - `.trellis/tasks/05-06-quest-checklist-persistence/artifacts/playwright/mobile-quests-guide.png`
