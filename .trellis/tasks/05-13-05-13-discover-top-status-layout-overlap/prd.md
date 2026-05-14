# Fix discover top status bar layout overlap

## Goal

Fix the discover light reference top status area where the notification button, world-time card, and user card could visually overlap after the 1536px artboard was scaled down in the browser.

## Requirements

- Keep the owner-approved SoulLink visual direction.
- Do not redesign the page.
- Change only the top status layout behavior needed to prevent overlap.
- Preserve desktop and narrow-desktop usability.

## Acceptance Criteria

- [x] Notification, world-time, and user card do not overlap on `/discover` desktop view.
- [x] Same controls remain non-overlapping on a narrow desktop viewport.
- [x] Frontend build passes.

## Implementation Notes

Changed `SoulLinkTopStatusBar` and `SoulLinkWorldTimeCard` in `frontend/app/components/soul-link-reference-artboards.tsx`:

- replaced fixed pixel grid columns with proportional columns;
- scaled the notification slot relative to its artboard cell;
- added overflow protection/truncation to the top user card and world-time card;
- changed the top user avatar wrapper from fixed pixels to relative height.

## Validation

Passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-top-status-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-top-status-narrow-desktop.png`

Measured overlap areas for world-time ↔ bell ↔ user card were all `0`; no page errors; no horizontal overflow.


## Follow-up: Recommended Echo Panel Height

User reported the light discover right-rail `推荐回响` panel content exceeded its card height. The panel had fixed padding/row height/spacing that did not scale with the 1536px artboard when rendered at narrower widths.

Fix:

- tightened the panel padding/header spacing;
- changed recommended echo row height, text size, favorite count, and icon size to `clamp(...)` values;
- kept the card clipped with `overflow-hidden`.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-recommended-echo-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-recommended-echo-narrow-desktop.png`

Measured `overflowBottom` for the recommended echo rows was `0` on both 1366px desktop and 800px narrow desktop viewports.

## Follow-up: Discover Sort View Controls

User reported the inactive list/map view controls did not respond and asked to remove them or right-align the group.

Fix:

- removed the inactive list and map view controls from the discover sort area;
- kept a non-interactive grid-view indicator only;
- right-aligned the remaining sort label and grid indicator in the result header.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-sort-controls-light-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-sort-controls-light-narrow-desktop.png`

Measured on both 1366px desktop and 800px narrow desktop viewports: one grid indicator, no list/map controls, `rightGap = 0`, and no horizontal overflow.

## Follow-up: World Time Non-clickable Affordance

User reported the chevron on the world-time card looked clickable even though it had no action.

Fix:

- removed the world-time card chevron;
- changed the world-time card from a `button` to a non-interactive `div`;
- set a default cursor so it no longer advertises clickability.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-world-time-no-chevron-light-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-world-time-no-chevron-light-narrow-desktop.png`

Measured on both 1366px desktop and 800px narrow desktop viewports: world-time card tag is `DIV`, only one SVG remains in the card, cursor is `default`, and no horizontal overflow.

## Follow-up: Sidebar Alignment

User reported the left navigation looked shifted to the right.

Root cause:

- sidebar logo used `x = 48` inside a `220` artboard-width panel, leaving much more left margin than right margin;
- nav items used `x = 42, w = 158`, leaving left/right gaps unbalanced.

Fix:

- centered the logo block inside the sidebar panel;
- changed nav item geometry to `x = 24, w = 172` so active pills have balanced left/right gaps;
- made nav labels `nowrap + truncate` so they do not wrap vertically in narrower desktop renderings.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-sidebar-left-align-light-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-sidebar-left-align-light-narrow-desktop-1024.png`

Measured active nav gap delta ≈ `1.03px`, logo gap delta ≈ `1.02px`, no wrapped nav labels, and no horizontal overflow.

## Follow-up: Discover Main Gutter

User reported the text was too close to the left content area boundary after sidebar alignment.

Root cause:

- discover main content started at `x = 226–228` while the sidebar ends at `x = 220`, leaving only about `6–8` artboard pixels of gutter.

Fix:

- moved discover title, quick filters, filter panel, result header, and card grid left edge to `x = 252`;
- preserved right-side rail clearance by reducing affected row/panel widths where needed.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-main-gutter-light-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/discover-main-gutter-light-narrow-desktop-1024.png`
- `D:/work/ai-/artifacts/visual-qa/discover-main-gutter-light-narrow-user-858.png`

Measured left gutter between sidebar and discover main title/filter/result/card content: `28.47px` at 1366px, `21.34px` at 1024px, and `17.88px` at 858px; no horizontal overflow.

## Follow-up: Discover Card Entry Links

User reported clicking discover cards did not enter a tavern.

Root cause:

- before the `/api/v1/taverns` list request returned, the desktop board rendered design fallback cards;
- those fallback cards had no tavern id, so their link target resolved back to `/discover`.

Fix:

- added an `isLoading` state from the route into the SoulLink discover board;
- while loading, fallback cards render as non-clickable disabled cards instead of links;
- the result header now shows `加载中` during initial loading;
- after real tavern data arrives, cards render as links to `/tavern/{id}` and can enter normally.

Additional validation passed on 2026-05-13:

```powershell
npm --prefix .\frontend run build
```

Playwright interaction sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-card-loading-not-clickable.png`
- `D:/work/ai-/artifacts/visual-qa/discover-card-enterable-loaded.png`

Measured initial card state: `DIV`, no `href`, `data-soul-link-discover-card-state="loading"`, result header `探索结果 加载中`.
Measured loaded card state: `A`, `href="/tavern/pw_after_school_hero_supply"`, `data-soul-link-discover-card-state="enterable"`, and clicking navigated to `/tavern/pw_after_school_hero_supply`.

## Follow-up: Right Rail Entry Links and Favorites

User reported the right-rail `推荐回响` / `探索足迹` rows could not enter taverns, and the heart icons could not be favorited.

Root cause:

- during initial tavern-list loading, right-rail rows were built from fallback cards without real tavern ids, so their targets resolved to `/discover`;
- right-rail hearts were static icons/spans without click state.

Fix:

- passed route loading state into the discover right rail;
- while the tavern list is loading, right-rail rows render as disabled loading entries with no links;
- after real tavern data arrives, right-rail row text/image areas link to `/tavern/{id}`;
- added local persistent favorite state for right-rail hearts; clicking a heart does not navigate, and toggles the heart to red/filled.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright interaction sanity:

- `D:/work/ai-/artifacts/visual-qa/discover-right-rail-loading-disabled.png`
- `D:/work/ai-/artifacts/visual-qa/discover-right-rail-favorites-red.png`

Measured initial right-rail state: recommended/footprint rows `loading`, no right-rail entry links.
Measured loaded state: recommended and footprint links start with `/tavern/`; clicking recommended/footprint favorite buttons keeps URL at `/discover`, sets `aria-pressed="true"`, and adds red filled heart; clicking the recommended row link navigates to `/tavern/pw_after_school_hero_supply`.

## Follow-up: Home Recommended Coordinate Entry Links

User reported the homepage `为你推荐的坐标` cards also did not respond or felt extremely slow.

Root cause:

- the homepage tavern-list request is slow enough that the board first renders fallback design cards;
- those fallback cards had no real tavern id but were still rendered as links, so their target resolved to `/discover` instead of a tavern detail route.

Fix:

- added a homepage loading state and passed it into the SoulLink home board;
- while the tavern list is loading, homepage fallback coordinate cards render as disabled `DIV` cards with no `href` and visible `加载中` / `正在同步坐标…` copy;
- after real tavern data arrives, the same card positions render as links to `/tavern/{id}`;
- applied the same behavior to the mobile homepage list.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright interaction sanity:

- `D:/work/ai-/artifacts/visual-qa/home-card-loading-not-clickable-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/home-card-enterable-loaded-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/home-card-loading-not-clickable-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/home-card-enterable-loaded-narrow.png`

Measured desktop initial card: `DIV`, no `href`, `data-soul-link-home-card-state="loading"`.
Measured desktop loaded card: `A`, `href="/tavern/pw_third_shelf_observatory"`, `data-soul-link-home-card-state="enterable"`, clicking navigated to `/tavern/pw_third_shelf_observatory` in `565ms`.
Measured narrow initial card: `DIV`, no `href`, `data-soul-link-home-card-state="loading"`.
Measured narrow loaded card: `A`, `href="/tavern/pw_third_shelf_observatory"`, `data-soul-link-home-card-state="enterable"`, clicking navigated to `/tavern/pw_third_shelf_observatory` in `511ms`.

## Follow-up: Restrict Light Theme to Designed Pages

User reported `/tavern/pw_lantern_helpdesk` looked poor after inheriting the light theme, because only the homepage and discover/search page have designed light variants.

Fix:

- limited the root light-theme class to `/` and `/discover`;
- non-designed ProductShell pages, including `/tavern/{id}`, now force the effective theme back to dark even if the saved user preference is light;
- removed the ProductShell theme toggle so non-designed pages do not advertise a light mode.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright theme sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-light-theme-forced-dark-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/tavern-light-theme-forced-dark-narrow.png`

Measured with saved `fablemap-theme=light`: `/discover` keeps `data-theme="light"`; `/tavern/pw_lantern_helpdesk` has no `.light`, has `.dark`, `data-theme="dark"`, `--theme-bg: #030512`, zero ProductShell theme-toggle buttons, and no horizontal overflow on desktop or narrow viewport.

## Follow-up: Remove Tavern Chat Assist Sidecar

User reported the tavern page `聊天辅助` module felt useless and occupied space in the chat flow.

Fix:

- removed the `聊天辅助` detail section from the tavern chat workbench secondary tools;
- removed its dedicated scene recap, starter prompt, and social-memory debug sidecar code;
- kept `更多空间功能` and `桌边小玩法` folded below the main chat.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-chat-assist-removed-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/tavern-chat-assist-removed-narrow.png`

Measured on `/tavern/pw_lantern_helpdesk`: `聊天辅助`, `当前场景`, and `可以这样开口` text are absent; secondary folded tools now contain only `更多空间功能` and `桌边小玩法`; theme remains dark; desktop and narrow overflowX are `0`.

## Follow-up: Move Engagement Summary to Visitor Center

User reported the `空间纪念币与礼物` panel should not live inside a single tavern, because it is a visitor-level asset summary and belongs in the visitor personal center.

Fix:

- removed `TavernEngagementPanel` from the tavern route `更多空间功能` public panel;
- added `游客资产汇总` to the visitor personal center page, aggregating visitor engagement across synced taverns;
- added `/home-me` route alias for existing navigation links that already point to the personal center;
- kept per-NPC/per-space gift actions out of the tavern chat sidecar surface.

Additional validation on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

The first build attempt after adding the alias failed with duplicate route id because two routes pointed to the same route module. It was fixed by adding `frontend/app/routes/home-me-alias.tsx`, then the build passed.

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-engagement-removed-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/home-me-visitor-engagement-summary-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/home-me-visitor-engagement-summary-narrow.png`

Measured on `/tavern/pw_lantern_helpdesk`: `空间纪念币与礼物` is absent; `更多空间功能` remains; theme is dark; overflowX is `0`.
Measured on `/home-me`: `游客资产汇总`, `个人中心的全局视图`, `总余额`, and `礼物券` are visible; desktop and narrow overflowX are `0`.

## Follow-up: Keep Only Invite and Feedback in Tavern Secondary Tools

User clarified that inside the tavern secondary area only invitation and private feedback should remain; all other cards should be removed.

Fix:

- removed creator-conversion, special tavern type, and neighborhood rumor cards from the tavern route public panel;
- renamed the folded section to `邀请与反馈`;
- removed the separate `桌边小玩法` folded section from the tavern chat workbench secondary tools.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-invite-feedback-only-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/tavern-invite-feedback-only-narrow.png`

Measured on `/tavern/pw_lantern_helpdesk`: the secondary area title is `邀请与反馈`; `邀请链接` and `给店主的私密反馈` are present; creator-conversion, neighborhood rumor, mini-game, special type, and coin panels are absent; detail section count is `1`; desktop and narrow overflowX are `0`.


## Follow-up: Visitor-Facing Copy Audit

User reported the folded helper descriptions sounded like implementation notes rather than visitor-facing product copy, and asked for a broader project check.

Fix:

- rewrote the mobile ProductShell guide copy to avoid `主线`, `面板`, `折叠`, and other implementation terms;
- rewrote the tavern secondary area copy around invitation and private feedback so it reads as visitor actions, not internal capability packaging;
- rewrote the `/home-me` personal center from compatibility/parameter language into a visitor asset and return-entry page;
- removed visible schema/API/payload/owner-only wording from create, guide, notification, relationship, territory, engagement, and related owner-facing helper panels where it could surface as product copy;
- kept code identifiers and hidden URL parameter names unchanged where they are required for routing/API behavior.

Additional validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright copy/visual sanity:

- `D:/work/ai-/artifacts/visual-qa/copy-audit-report.json`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-tavern-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-tavern-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-home-me-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-home-me-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-create-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-create-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-quests-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-quests-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-notifications-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-notifications-narrow.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-tavern-manage-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/copy-audit-tavern-manage-narrow.png`

Measured pages: `/tavern/pw_lantern_helpdesk`, `/home-me`, `/create`, `/quests`, `/notifications`, and `/tavern/pw_lantern_helpdesk/manage?owner_id=system_public_welfare` on desktop and narrow viewports. The audit checked the highlighted bad terms plus common implementation terms (`owner_id`, `user_id`, `place_type=home`, `layout_style`, `Schema`, `API / WebSocket`, `owner-only`, `Owner ID`, `WebSocket`, `接口`, `生命周期`, `调试`, `Mobile first-screen`, etc.) against visible page text. Result: `failures: []`, `pageErrors: []`.


## Follow-up: Remove Tavern Doorway / First-Minute Guide Panels

User asked what the large `先在门口听一句，再和 NPC 开口` area was for and noted it felt useless.

Original purpose:

- it attempted to provide a first-minute onboarding ritual before chat;
- it duplicated the tavern description, NPC welcome message, and composer prompt suggestions;
- it occupied the visitor's first screen without being necessary for actual chat entry.

Fix:

- removed the `TavernDoorwayRitual` first-screen block from the tavern workbench;
- removed the secondary `游客第一分钟 / Why here` suggestion card below chat;
- removed the now-unused first-minute guide import and doorway helper functions from the workbench;
- kept the direct chat layout, NPC list, welcome message, composer chips, password gate, and invite/feedback section.

Validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-doorway-removed-report.json`
- `D:/work/ai-/artifacts/visual-qa/tavern-doorway-removed-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/tavern-doorway-removed-narrow.png`

Measured on `/tavern/pw_lantern_helpdesk`: `data-tavern-doorway-ritual` count `0`, `data-first-minute-guide="tavern-workbench"` count `0`, chat grid count `1`, invite/feedback section count `1`, desktop and narrow overflowX `0`, and no page errors.


## Follow-up: Remove Visitor Composer Rule/Identity Controls

User reported the `对话意图` chips and `发言身份` editor looked like rules/configuration and should not appear to visitors. Visitors should just talk directly.

Fix:

- removed the `对话意图` chip panel from the tavern chat composer;
- removed the `发言身份` details editor from the composer;
- removed the now-unused conversation-intent state, helper calls, and extra context injection from the workbench send path;
- kept direct public/private chat, @NPC mention targeting, NPC list, and invite/feedback.

Validation passed on 2026-05-14:

```powershell
npm --prefix .\frontend run build
```

Playwright visual sanity:

- `D:/work/ai-/artifacts/visual-qa/tavern-composer-rules-removed-report.json`
- `D:/work/ai-/artifacts/visual-qa/tavern-composer-rules-removed-desktop.png`
- `D:/work/ai-/artifacts/visual-qa/tavern-composer-rules-removed-narrow.png`

Measured on `/tavern/pw_lantern_helpdesk`: `data-conversation-intent-chips` count `0`, `data-visitor-identity-settings` count `0`, composer textarea count `1`, desktop and narrow overflowX `0`, and no page errors.

## Follow-up: tavern welcome copy simplified

- Date: 2026-05-14
- User issue: the virtual shopkeeper's first visible message sounded like onboarding/configuration logic and exposed task/plot guidance that should stay behind the scene.
- Change: simplified generated host guide text to `欢迎来到{空间名}。`, removed adjacent visible `@NPC`/public-channel teaching copy in the current workbench, and kept the legacy chat room parity path aligned.
- Verification:
  - `npm --prefix .\frontend run build` passed.
  - `node artifacts/visual-qa/tavern-welcome-copy-simplified.cjs` passed for desktop and narrow viewports.
  - Report: `artifacts/visual-qa/tavern-welcome-copy-simplified-report.json`.
  - Screenshots: `artifacts/visual-qa/tavern-welcome-copy-simplified-desktop.png`, `artifacts/visual-qa/tavern-welcome-copy-simplified-narrow.png`.


## Follow-up: tavern chat rule intro removed

- Date: 2026-05-14
- User issue: the chat area still looked like a rules/tutorial surface; the public-channel introduction and first-minute guidance felt too templated.
- Change: replaced the large public-chat intro card with a compact title row, kept the greeting itself as normal chat, removed visible keyboard/@NPC/task/plot guidance from the current workbench, and softened the legacy chat-room input hints.
- Verification:
  - `npm --prefix .\frontend run build` passed.
  - `node artifacts/visual-qa/tavern-chat-rules-removed.cjs` passed for desktop and narrow viewports.
  - Report: `artifacts/visual-qa/tavern-chat-rules-removed-report.json`.
  - Screenshots: `artifacts/visual-qa/tavern-chat-rules-removed-desktop.png`, `artifacts/visual-qa/tavern-chat-rules-removed-narrow.png`.


## Follow-up: tavern visitor shell direct chat only

- Date: 2026-05-14
- User issue: visitor chat still exposed rule/design/onboarding scaffolding instead of letting visitors directly chat.
- Change: removed the hero description, status/coordinate/LLM chips, public-channel teaching copy, duplicate NPC seat gallery, NPC description blurbs, and folded tool description from the visitor chat shell.
- Verification:
  - `npm --prefix .\frontend run build` passed.
  - `node artifacts/visual-qa/tavern-direct-chat-only.cjs` passed against both `http://127.0.0.1:8950` and `http://127.0.0.1:5173` for desktop and narrow viewports.
  - Report: `artifacts/visual-qa/tavern-direct-chat-only-report.json`.
  - Screenshots: `artifacts/visual-qa/tavern-direct-chat-only-backend-desktop.png`, `artifacts/visual-qa/tavern-direct-chat-only-backend-narrow.png`, `artifacts/visual-qa/tavern-direct-chat-only-frontend-desktop.png`, `artifacts/visual-qa/tavern-direct-chat-only-frontend-narrow.png`.


## Follow-up: NPC click opens private room

- Date: 2026-05-14
- User issue: clicking an NPC should not create a public `@` mention or point-name target; it should enter a private two-person chat room where the NPC reacts as if greeted.
- Change: NPC list clicks now switch to private chat, clear composer text, seed the selected NPC's entrance reaction only in that private room when empty, and no longer show/set public target banners or inserted `@` text. Legacy chat room parity path now seeds private entrance reactions too.
- Verification:
  - `npm --prefix .\frontend run build` passed.
  - `node artifacts/visual-qa/tavern-private-npc-entry.cjs` passed against both `http://127.0.0.1:8950` and `http://127.0.0.1:5173` for desktop and narrow viewports.
  - Report: `artifacts/visual-qa/tavern-private-npc-entry-report.json`.
  - Screenshots: `artifacts/visual-qa/tavern-private-npc-entry-backend-desktop.png`, `artifacts/visual-qa/tavern-private-npc-entry-backend-narrow.png`, `artifacts/visual-qa/tavern-private-npc-entry-frontend-desktop.png`, `artifacts/visual-qa/tavern-private-npc-entry-frontend-narrow.png`.
