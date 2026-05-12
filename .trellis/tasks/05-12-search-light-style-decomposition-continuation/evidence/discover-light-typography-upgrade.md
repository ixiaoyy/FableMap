# Discover light typography upgrade check

Source of truth: user request on 2026-05-12 — overall typography felt too small; use Playwright for a visual upgrade.

## Before screenshots

- Desktop: `D:\work\ai-\.trellis\tasks\05-12-search-light-style-decomposition-continuation\evidence\discover-light-typography-before-desktop.png`
- Mobile: `D:\work\ai-\.trellis\tasks\05-12-search-light-style-decomposition-continuation\evidence\discover-light-typography-before-mobile.png`

## After screenshots

- Desktop: `D:\work\ai-\.trellis\tasks\05-12-search-light-style-decomposition-continuation\evidence\discover-light-typography-after-desktop.png`
- Mobile: `D:\work\ai-\.trellis\tasks\05-12-search-light-style-decomposition-continuation\evidence\discover-light-typography-after-mobile.png`

## Upgrade summary

- Increased Light Discover page title and section titles.
- Increased search input text.
- Increased sidebar navigation and invite CTA text.
- Increased filter chip, filter panel, timeline, result-card, right-rail, feed, and online-list text sizes.
- Increased mobile header, search input, timeline, and result card typography.
- Kept the 8 atomic card-image rule intact; Playwright still requires visible light discover images to come from `card-*.png` assets only.

## Validation

Passed:

```powershell
node .\frontend\scripts\soul-link-reference-artboards-test.mjs
node .\frontend\scripts\discover-view-mode-test.mjs
npm --prefix .\frontend run build
node .\.trellis\tasks\05-12-search-light-style-decomposition-continuation\playwright-discover-light-style-check.mjs
git diff --check
```

Known unrelated failure:

```powershell
npm --prefix .\frontend test
# frontend/scripts/mini-games-test.mjs:12 => AssertionError: 9 !== 6
```

## Grill-Me verdict

Verdict: PASS with caveat.

Evidence:
- Fresh Playwright desktop/mobile screenshots were captured after the typography changes.
- The focused Playwright check passed and still enforces no non-card visible bitmap inside Light Discover.

Caveat:
- This is a typography/readability pass, not final visual art replacement. The 8 card images remain temporary placeholders.
