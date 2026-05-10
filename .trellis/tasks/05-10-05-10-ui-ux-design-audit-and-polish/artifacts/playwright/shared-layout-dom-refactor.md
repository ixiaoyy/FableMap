# Shared layout DOM refactor

Date: 2026-05-10

## Scope

Home and discover SoulLink reference surfaces now use the light layout as the single source of truth:

- Runtime light and black artboards both mount on a 1536×1024 layout canvas.
- `SoulLinkSidebar` is the one shared visible left navigation DOM for home and discover.
- `SHARED_SIDEBAR_NAV_ITEMS` is the single menu data source; pages only pass the active item (`home` / `discover`).
- `SoulLinkUserCluster` is the shared top-right account module for home and discover.
- `SoulLinkNotificationBell`, `SoulLinkUserAvatar`, and `SoulLinkUserIdentity` split icon, avatar image, and real text instead of relying on baked pixels.
- `SoulLinkFeedPanel`, `SoulLinkFeedItemRow`, and `SoulLinkDailyQuotePanel` split the right-rail feed/quote modules into reusable, prop-driven components.
- `SoulLinkOnlineEntitiesPanel`, `SoulLinkOnlineEntityRow`, and `SoulLinkOnlineStatus` split the “在线的灵魂 / Live Entities” module into reusable, prop-driven rows with real avatar, name, location, and status text.
- `SoulLinkRecentMemoriesPanel`, `SoulLinkGuidePanel`, and `SoulLinkWorldStatsPanel` split the lower homepage cards into editable data modules. Recent memories use real thumbnail images and text; guide cards use real text plus SVG/image visuals; world stats use real values and labels.
- Home route passes editable `worldPulseItems` and `dailyQuote` from runtime homepage data.
- Home route passes editable `onlineEntities` from tavern characters, with project portrait fallbacks only when real avatar fields are empty.
- Home route passes editable `recentMemories`, `guideCards`, and `worldStats` instead of relying on baked lower-card pixels.
- Discover route passes editable `sideFeedItems` from filtered tavern results.
- Discover route passes editable `onlineEntities` from filtered tavern characters, so the search/discover page uses the same online-souls component instead of a page-specific baked card.
- Runtime material images now use higher-definition sources:
  - SoulLink artboard slices have generated `*-2x.png` siblings and render with `srcSet`.
  - Tavern atmosphere covers resolve to `/place-atmosphere-hd/*.png` at 1024×576.
  - NPC fallback/avatar catalog imports `frontend/app/assets/npc-style-cast/portraits-hd/*.png` at 512×512, with reference-only prompt sidecars for provenance.
  - Secondary route hero imports that reused SoulLink art now point at the 2x sources.
- `HOME_LAYOUT` owns shared home search, hero button positions, and card links.
- `DISCOVER_LAYOUT` owns shared discover search, filter controls, card links, and create link.
- Light / black differences are limited to artboard image material, visual masks, and theme color classes.

## Regression checks

Passed:

- `node .\frontend\scripts\soul-link-reference-artboards-test.mjs`
- `node .\frontend\scripts\home-visual-density-test.mjs`
- `node .\frontend\scripts\discover-view-mode-test.mjs`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`
- `npm --prefix .\frontend run typecheck`
- `npm --prefix .\frontend run test:soul-link-reference-ux`

Screenshots/report refreshed in this directory via `soul-link-reference-check.md`.
