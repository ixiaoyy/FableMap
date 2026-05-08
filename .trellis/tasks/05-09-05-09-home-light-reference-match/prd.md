# Home light theme reference match

## Goal

按照用户提供的 `设计参考/image copy.png`，把首页 light theme 调整为 1:1 明亮二次元地图探索页视觉；`设计参考/1ce73b9c-0a98-4c40-acbe-d79de754dd15.png` 用作拆解参考（背景/角色/UI 组件/边框/按钮/主题色）。

## Scope

- 只改首页 light theme 视觉与对应验证。
- dark theme 保持现有实现，不重做。
- 不新增后端/API/Schema。
- 不把参考图留在 `设计参考/` 或临时路径中被前端引用；必须复制到项目资源目录并保留 sidecar 说明。

## Implementation

- Copied target artboard to `frontend/app/assets/homepage/light/home-light-reference-target.png`.
- Added `home-light-reference-target.prompt.md` source note.
- Added `LightReferenceHome` in `frontend/app/routes/home.tsx`.
- Light theme renders the 1:1 artboard with accessible clickable hotspots for:
  - logo/home
  - nav items
  - search/discover
  - theme toggle back to dark
  - management entry
  - primary CTAs
  - featured area cards derived from real featured tavern IDs when available
- Updated homepage static regression scripts to assert the light-theme reference contract.
- Added Playwright desktop/mobile self-acceptance script.

## Validation

- `node .\frontend\scripts\home-visual-density-test.mjs`
- `node .\frontend\scripts\home-pc-polish-test.mjs`
- `node .\frontend\scripts\homepage-dynamic-entry-test.mjs`
- `node .\frontend\scripts\home-links-test.mjs`
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend run build`
- `node .\frontend\scripts\playwright-home-light-reference-check.mjs`

## Playwright evidence

- Report: `.trellis/tasks/05-09-05-09-home-light-reference-match/artifacts/playwright/report.md`
- Desktop screenshot: `.trellis/tasks/05-09-05-09-home-light-reference-match/artifacts/playwright/home-light-reference-desktop.png`
- Mobile screenshot: `.trellis/tasks/05-09-05-09-home-light-reference-match/artifacts/playwright/home-light-reference-mobile.png`

## Limits / follow-up

- This slice optimizes visual 1:1 matching by using the user-provided artboard as the light-theme surface.
- If later requiring fully componentized responsive reconstruction, split a follow-up task to crop/author individual components and replace the artboard while preserving this visual contract.
