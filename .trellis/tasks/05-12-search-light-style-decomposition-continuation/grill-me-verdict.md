# Grill-Me Verdict — Search light style decomposition continuation

## 2026-05-12 user challenge: asset-folder audit

Verdict before correction: FAIL

Source of truth:
- User challenge on 2026-05-12: judging only the split assets, loose `main.png`, `right-rail.png`, and `sidebar.png` screenshot-like files in `discover-light/` are not an acceptable product asset structure.
- Light search asset decomposition requirement: usable product assets should be atomic 1:1 materials; full layout screenshots must not be presented as split materials.

Evidence before correction:
- `frontend/app/assets/soul-link-05-10/discover-light/` exposed loose full-page/column PNGs next to the square materials:
  - `main.png`, `main-2x.png`
  - `right-rail.png`, `right-rail-2x.png`
  - `sidebar.png`, `sidebar-2x.png`

Problem:
1. [P1] The directory structure mixed reference screenshots and product materials, making the asset split look like screenshot slicing rather than production-ready atomic resources. The previous PASS was too generous.

Correction:
- Moved all usable 1:1 product placeholders to `frontend/app/assets/soul-link-05-10/discover-light/cards/`.
- Moved old full-screen/column screenshots to `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-light/`.
- Added a test that fails if loose PNGs are reintroduced at `discover-light/` root.

Verdict after correction: PASS for asset-folder separation; final artwork quality is still intentionally temporary.

---

Verdict: PASS

Source of truth:
- User request on 2026-05-12: continue refactoring the light search page style; split images and text; image assets only need to be 1:1 and can be temporary placeholders.
- `.trellis/tasks/05-12-search-light-style-decomposition-continuation/prd.md` scope/boundaries.
- `.trellis/spec/frontend/image-asset-guidelines.md` and `.trellis/spec/frontend/quality-guidelines.md`.

Evidence:
- `frontend/app/components/soul-link-reference-artboards.tsx:233` defines `DISCOVER_LIGHT_CARD_IMAGES` with project-local square assets.
- `frontend/app/components/soul-link-reference-artboards.tsx:1592` renders card cover image with `data-soul-link-discover-square-image="512x512"`.
- `frontend/app/components/soul-link-reference-artboards.tsx:1594` renders card copy in a separate DOM layer via `data-soul-link-discover-card-copy="real-text-layer"`.
- `frontend/app/components/soul-link-reference-artboards.tsx:2012`, `2042`, `2118`, `2137`, `2248`, `2266` use square-image markers for hint/timeline/right-rail/mobile image slots.
- All eight `frontend/app/assets/soul-link-05-10/discover-light/cards/card-*-square.png` files are `512x512` with hashes recorded in `frontend/app/assets/soul-link-05-10/manifest.json`.
- Playwright report: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-light-style-check.md` (desktop 1536×1024 and mobile 390×844 PASS).
- Build passed: `npm --prefix .\frontend run build`.

Problems:
1. [P2] Full `npm --prefix .\frontend test` still stops at `frontend/scripts/mini-games-test.mjs:12` (`9 !== 6`). This is pre-existing and unrelated to the changed search-light files, but it still blocks claiming the full frontend suite is green.
2. [P3] Placeholder visual content is intentionally temporary; the square files satisfy aspect ratio and project-path rules, not final art quality.

Questions / decisions needed:
- Later replacement pass should decide final light-search artwork direction and replace the `card-*-square.png` placeholders in place or with a versioned set.

Smallest safe next step:
- If continuing visual fidelity work, replace only the square placeholder assets and keep current DOM/text separation markers/tests intact.


## Second-pass update

Verdict: PASS

Additional evidence:
- `frontend/app/components/soul-link-reference-artboards.tsx` now renders light discover sidebar invite as `data-soul-link-sidebar-invite="real-dom"` with `data-soul-link-sidebar-invite-copy="real-text"`.
- Light discover feed and online entity images are normalized by `withDiscoverLightSquareFeedImages(...)` and `withDiscoverLightSquareOnlineImages(...)`.
- `playwright-discover-light-style-check.mjs` now asserts every visible image in the light discover artboard is 1:1.
- Fresh Playwright desktop/mobile pass completed after the second-pass changes.

Remaining limitation:
- This is a light discover runtime decomposition. The old full-screen reference assets were moved out of `frontend/app/assets/` entirely and archived under `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-light/`.


## 2026-05-12 third-pass correction: runtime asset directory must not contain UI screenshots

Verdict before correction: FAIL

Source of truth:
- User challenge: filters/lists/navigation must be DOM/CSS; no product should ship a filter/list/nav as a pasted screenshot.
- Light search decomposition contract: image assets are atomic 1:1 visual slots only; UI structure and text are real DOM.

Evidence before correction:
- Even after moving loose files into `discover-light/reference/`, the old `main/right-rail/sidebar` screenshots still lived under `frontend/app/assets/...`, and two runtime modules still imported light discover screenshot slices:
  - `frontend/app/routes/create.tsx`
  - `frontend/app/features/tavern-layout-showcase/index.tsx`

Problems:
1. [P1] Keeping full UI screenshots under frontend runtime assets still makes the decomposition look like screenshot slicing, not product asset decomposition.
2. [P1] Reusing a search-page screenshot as another route's visual background is not acceptable runtime asset hygiene.

Correction:
- `frontend/app/assets/soul-link-05-10/discover-light/` now contains only `cards/`.
- Old screenshot slices are archived outside runtime assets under `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-light/`.
- Runtime imports now use `discover-light/cards/card-*.png` atom materials instead of light search screenshots.
- Focused test now blocks `discover-light/reference`, `discover-light/main*`, `discover-light/right-rail*`, and `discover-light/sidebar*` from frontend app source and runtime asset folders.

Verdict after correction: PASS for the specific asset hygiene contract; final illustration quality remains placeholder-level by instruction.

## 2026-05-12 fourth-pass correction: visible light discover images restricted to atomic card materials

Verdict before correction: FAIL

Evidence before correction:
- After removing screenshot slices, Playwright source enforcement exposed one remaining visible shared icon bitmap on mobile: `/assets/icon-compass-glow-*.png`.
- Desktop still had light-variant shared bitmap icons for logo, pin marker, pulse header, and user avatar treatment.

Correction:
- Converted those visible light-discover decorative icons/avatars to Lucide SVG, inline SVG, or DOM initial badge.
- Updated Playwright to fail unless every visible image in the light discover artboard comes from hashed `card-*.png` atomic materials.

Verdict after correction: PASS for runtime light discover visible-image discipline.

## Fourth grill after black-template sync

Verdict: PASS for the specific black-sync request.

Evidence:

- `frontend/app/components/soul-link-reference-artboards.tsx` no longer imports `discover-black/main*.png` or `discover-black/right-rail*.png`; `DISCOVER_BLACK.slices` is empty.
- `SoulLinkDiscoverReference` no longer has a black-only screenshot/overlay fallback branch; Light / Black share the same real DOM/CSS discover template and card/image normalization.
- Runtime discover assets now live under `frontend/app/assets/soul-link-05-10/discover/cards/` only; `frontend/app/assets/soul-link-05-10/discover-light/` and `discover-black/` are absent.
- Old black full/column screenshots are archived under `.trellis/tasks/05-12-search-light-style-decomposition-continuation/legacy-ui-slices/discover-black/` for audit only.
- Playwright report covers Light + Black, desktop + mobile: `.trellis/tasks/05-12-search-light-style-decomposition-continuation/evidence/discover-style-check.md`.

Remaining acceptance risk:

- The 8 square images are still placeholder content. They satisfy the 1:1 runtime contract but are not final product art.
- Full `npm --prefix .\frontend test` still fails at the pre-existing `mini-games-test.mjs` count assertion (`9 !== 6`).
