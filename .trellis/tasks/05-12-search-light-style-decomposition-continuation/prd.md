# Search light style decomposition continuation

## Goal

继续重构 `/discover` light 搜索页样式，在上一轮“真实 DOM 文字 + 局部图片”的基础上，进一步拆解图片与文字层：图片资源只承担 1:1 缩略图/封面/装饰，不承载正文、按钮或可交互文本。

## Requirements

- 目标页面：`/discover` light 版本（`SoulLinkDiscoverReference variant="light"` / light search surface）。
- 保持 dark/black 版本和后端/API/schema 不变。
- 不恢复整页或大块页面截图切片；继续避免 `discover-light/main*.png`、`discover-light/right-rail*.png`、`discover-light/sidebar*.png` 作为主体渲染。
- 将 light 搜索页中仍像“图文合成”的卡片/面板拆成真实 DOM 文案 + 独立图片槽。
- 图片资源只要求项目内可引用、比例 1:1；内容可先用已有项目图片或简单占位替代，后续再替换正式素材。
- 保持搜索、筛选、清空、进入 tavern、创建 CTA、主题切换等现有交互。
- 保持移动/窄屏可用；不引入新 UI 框架、状态库、地图依赖。

## Acceptance Criteria

- [x] light 搜索页卡片/右栏的图片与文字结构分离：文字、标签、按钮是 DOM，不嵌在图片中。
- [x] light 搜索页使用的新增/替代图片均为项目内资源，尺寸为 1:1。
- [x] 没有新增 `.codex/generated_images` 或临时目录运行时引用。
- [x] focused SoulLink/discover 脚本测试通过或记录无关失败。
- [x] `npm --prefix .\frontend run build` 通过。
- [x] Playwright 自验收桌面 + 窄屏截图/报告写入本任务 evidence。

## Boundaries

Allowed files:

- `frontend/app/components/soul-link-reference-artboards.tsx`
- `frontend/app/routes/discover.tsx`（仅当 light discover preview / asset wiring 需要）
- `frontend/app/assets/...` 或 `frontend/public/assets/...` 中的 light 搜索页局部图片占位资源
- `frontend/scripts/*discover*` / `*soul-link*` focused test（仅当断言需要同步）
- 本任务目录下 evidence / playwright 脚本 / notes

Do not change:

- Backend, API payloads, database/schema, owner/visitor权限语义。
- Dark/black 搜索页切片与既有交互。
- 平台级 token、访客社交、传统地图/路线规划等 `WHAT_NOT_TO_BUILD.md` 禁止方向。

## Validation Plan

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
npm --prefix .\frontend run build
# focused Playwright desktop + narrow self-acceptance; save report/screenshots to this task evidence/
```


## Implementation Notes

- Added eight temporary 512×512 project-local light discover image slots under `frontend/app/assets/soul-link-05-10/discover-light/cards/card-*-square.png`.
- Updated light discover cards, timeline thumbnails, filter hint, right-rail footprints, and create CTA to use square image resources while keeping copy/buttons/labels as DOM text.
- Removed the light discover page background bitmap dependency from the search surface; the page background is now CSS gradients while home light remains unchanged.
- Moved the card tag out of the image overlay into the card copy layer and added DOM markers for text/image separation.
- Updated `manifest.json` and README with source/processing notes for the temporary square placeholders.
- Synced focused tests with current asset dimensions and the current shared sidebar implementation.

## Validation Evidence

Passed:

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
node -e "... list discover-light *-square.png dimensions ..."  # all 512x512
npm --prefix .\frontend run build
node .\.trellis\tasks\05-12-search-light-style-decomposition-continuation\playwright-discover-light-style-check.mjs
```

Playwright evidence:

- Report: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-check.md`
- Desktop screenshot: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-desktop.png`
- Mobile screenshot: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-mobile.png`

Known unrelated validation failure:

```powershell
npm --prefix .\frontend test
# Fails at frontend/scripts/mini-games-test.mjs:12 with AssertionError: 9 !== 6.
# This matches the pre-existing failure recorded by the previous search-light task and is unrelated to touched files.
```

Grill-Me verdict: PASS — see .trellis/tasks/05-12-search-light-style-decomposition-continuation/grill-me-verdict.md.


## Continuation Notes (second pass)

- Split the light discover sidebar invite CTA: `active="discover"` + light variant no longer uses the baked invite-card image; it now uses a 1:1 square decorative image plus DOM copy/button.
- Normalized light discover signal feed thumbnails and online entity avatars through `DISCOVER_LIGHT_CARD_IMAGES`, so visible route-provided covers/avatars no longer bypass the 1:1 image-slot rule.
- Replaced the light notification bell bitmap with the Lucide `Bell` icon so the light discover surface no longer exposes a non-1:1 bell image.
- Strengthened Playwright to assert every visible `img` inside the light discover artboard is 1:1, not only the explicitly marked card images.

## Updated Validation Evidence (second pass)

Passed:

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
node -e "... list discover-light *-square.png dimensions ..."  # all 512x512
npm --prefix .\frontend run build
node .\.trellis\tasks\05-12-search-light-style-decomposition-continuation\playwright-discover-light-style-check.mjs
```

Full test still has the unrelated pre-existing failure:

```powershell
npm --prefix .\frontend test
# fails at frontend/scripts/mini-games-test.mjs:12 with AssertionError: 9 !== 6
```


## Continuation Notes (third pass — asset split correction)

- Corrected the previous asset-folder mistake: Light Discover no longer keeps `main.png`, `right-rail.png`, `sidebar.png`, or `*-2x.png` screenshot slices anywhere under `frontend/app/assets/soul-link-05-10/discover-light/`.
- `frontend/app/assets/soul-link-05-10/discover-light/` now contains only `cards/`.
- Legacy screenshot slices were moved out of frontend runtime assets to `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-light/` for audit only.
- Replaced runtime imports in `frontend/app/routes/create.tsx` and `frontend/app/features/tavern-layout-showcase/index.tsx` that had reused light discover screenshot slices; they now use atomic card materials.
- Strengthened `frontend/scripts/soul-link-reference-artboards-test.mjs` so it fails if Light Discover screenshot slices or a `reference/` folder reappear under runtime assets, or if frontend app source imports legacy light discover screenshots.

## Continuation Notes (fourth pass — no shared icon bitmaps in light discover)

- Replaced remaining visible light-discover shared bitmap icons with SVG/CSS/DOM:
  - desktop sidebar logo: `UserCutImage(lightPlaneIcon)` -> Lucide `Send` inside CSS badge
  - desktop result-card visit marker: `UserCutImage(lightPinIcon)` -> Lucide `MapPin`
  - desktop user avatar: imported image -> DOM initial badge for light variant
  - panel header pulse icon: `UserCutImage(lightPulseIcon)` -> inline SVG bars
  - mobile header compass icon: `UserCutImage(lightCompassIcon)` -> Lucide `Compass`
- Strengthened Playwright: every visible image inside the light discover artboard must be 1:1 and come from hashed `card-*.png` atomic card materials, not shared UI screenshot/icon assets.

Validation after fourth pass:

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
node -e "... list discover-light/cards dimensions ..."  # all 512x512
npm --prefix .\frontend run build
node .\.trellis\tasks\05-12-search-light-style-decomposition-continuation\playwright-discover-light-style-check.mjs
npm --prefix .\frontend test  # still fails at pre-existing mini-games-test.mjs:12, 9 !== 6
git diff --check
```

## Continuation Notes (fifth pass — typography/readability upgrade)

- Increased Light Discover typography hierarchy after Playwright visual review:
  - desktop title/search/sidebar/filter/timeline/result cards/right rail/feed/online list text sizes increased;
  - mobile header/search/timeline/result-card text sizes increased;
  - kept DOM/CSS layout and 8-card atomic image rule intact.
- Evidence report: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-typography-upgrade.md`.
- Before screenshots:
  - `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-typography-before-desktop.png`
  - `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-typography-before-mobile.png`
- After screenshots:
  - `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-typography-after-desktop.png`
  - `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-typography-after-mobile.png`

## 2026-05-12 Black Discover 同步为共享模板

用户追加要求：`black` 搜索页也必须同步拆解，不能继续用整块主图 / 右栏图 / 侧栏图，Light / Black 使用同一套模板。

本轮变更：

- 将 8 张运行时方图从 `frontend/app/assets/soul-link-05-10/discover-light/cards/` 迁移为共享路径 `frontend/app/assets/soul-link-05-10/discover/cards/`。
- `SoulLinkDiscoverReference` 移除 black 专属截图/透明热点分支，Light / Black 均走同一套 `SoulLinkDiscoverSurface`、`SoulLinkDiscoverFilterPanel`、`SoulLinkDiscoverTimeline`、`SoulLinkDiscoverRightRail`、`SoulLinkDiscoverCard` 和移动端模板。
- `DISCOVER_BLACK.slices` 清空；组件不再 import `discover-black/main*.png` 或 `discover-black/right-rail*.png`。
- Black 侧栏邀请卡也改为真实 DOM + 1:1 方图，不再使用整张 invite 图。
- 旧 black 搜索页整图/栏图移出 runtime assets，归档到 `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-black/`。
- 同步更新 `manifest.json`、资源 README、设计问题文档和 focused tests，阻止 `discover-light/`、`discover-black/` 重新回到运行时素材目录。

验证：

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
node -e "const fs=require('fs');const path=require('path');const dir='frontend/app/assets/soul-link-05-10/discover/cards';for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('-square.png')).sort()){const b=fs.readFileSync(path.join(dir,f));const w=b.readUInt32BE(16),h=b.readUInt32BE(20);console.log(f, w+'x'+h); if(w!==512||h!==512) process.exitCode=1;}"
npm --prefix .\frontend run build
node .\.trellis\tasks\05-12-search-light-style-decomposition-continuation\playwright-discover-light-style-check.mjs
```

Playwright 报告：`.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-style-check.md`

截图：

- `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-desktop.png`
- `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-mobile.png`
- `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-black-style-desktop.png`
- `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-black-style-mobile.png`

全量 `npm --prefix .\frontend test` 仍在既有 `frontend/scripts/mini-games-test.mjs:12` 处失败：`9 !== 6`，与本轮搜索页模板/素材拆分无关。
