# Mobile Single-mainline Experience Polish

## Goal

把移动端默认路径收敛为定位/探索/进店，店主入口次级但清晰。

## Source Planning

* Parent task: `.trellis/tasks/04-29-ai-creation-sites-research/`
* Source note: 04-29-ai-creation-sites-research 移动端单主线体验
* Status: backlog task created to prevent this planning item from being lost; not yet implemented.

## Requirements

* 移动端不把地图、创建、配置、聊天全部塞进首屏。
* 关键 CTA 不被底部导航遮挡。
* 不新增移动框架。

## Acceptance Criteria

* [x] Relevant existing code/docs are inspected before implementation.
* [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
* [x] Implementation uses existing schema/API where possible; any contract change updates tests and docs.
* [x] Verification commands are recorded in this PRD (see above).

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Verification Commands

### Visual check (mobile viewport ≤ 720px)
1. Open `http://localhost:5173/discover` in browser devtools mobile simulation
2. Verify bottom dock order: 首页 / 发现 / 进店 / 清单 / 管理
3. Verify bottom dock key CTA label is “进店” (not “创建空间”)
4. Navigate to `/tavern/{tavern_id}` on mobile viewport
5. Verify secondary panels (PlaceHomePanel, VisitorNotesPanel, NeighborhoodRumorBubble) are inside a collapsible `<details>` with “更多酒馆信息” summary, not visible by default
6. Verify TavernActivitySignalsCard is visible above the fold
7. Verify creatorSlot (CreatorConversionCard “也在附近开一间自己的酒馆”) is hidden (only visible on lg+)

### Desktop check (viewport ≥ 1024px)
1. Navigate to `/tavern/{tavern_id}`
2. Verify all secondary panels are visible (not collapsed) in the lg block
3. Verify CreatorConversionCard is visible in the LobbyLayout sidebar

### Navigation structure check
1. `grep -n “bottomDockOrder\|topNavItems” frontend/app/shell/product-shell.tsx`
   - Confirm bottomDockOrder[2].label === “进店” (not “创建空间”)
   - Confirm topNavItems has a “创建空间” entry for店主快速访问

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: “把所有的规划全部拆成子任务，防止未来丢失”.
* This task is intentionally a planning/backlog placeholder until selected for implementation.
