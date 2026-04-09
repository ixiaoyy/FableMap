# Map Assets Plan（历史参考）

## 文档定位

This document records an older exploration path where FableMap tried to improve the product primarily through generated map asset packs, scene textures, icon systems, and tile consistency.

That direction is **no longer part of the current product mainline**.

Current priority has shifted to:

> **real base map + place selection + character encounter / place event + chat narrative + writeback / memory**

So this file is kept only as a historical reference for prior visual experiments around the old self-rendered map pipeline.

For current direction, read:

- [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md)
- [`docs/INDEX.md`](INDEX.md)

---

## What this document originally tried to solve

Earlier, the project attempted to make the browser map stage feel more coherent by introducing themed visual packs:

- scene backgrounds
- POI icon sets
- road / ground / water tiles
- vibe-aligned palettes

At that stage, the assumption was that improving the map’s visual language could strengthen immersion.

---

## Why it is no longer a mainline document

This plan was deprioritized for structural reasons:

1. **Map rendering is no longer the product center**
   - The main experience is no longer “look at a fantasy-translated map.”
   - The main experience is entering a place, meeting characters, triggering events, and continuing story memory.

2. **Asset production does not solve the core product problem**
   - Better icons and tiles do not create stronger character systems, place events, or revisitable narrative loops.
   - Visual polish without place-driven experience only increases implementation cost.

3. **The old rendering path has been frozen as reference**
   - [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx:1)
   - [`frontend/src/worldMap/renderers.js`](../frontend/src/worldMap/renderers.js:1)
   - [`frontend/src/worldMap/geometry.js`](../frontend/src/worldMap/geometry.js:1)
   - [`frontend/src/mapAssets/manifest.js`](../frontend/src/mapAssets/manifest.js:1)
   - [`frontend/src/mapAssets/iconMapping.js`](../frontend/src/mapAssets/iconMapping.js:1)

4. **AI-generated map visuals are not a reliable product foundation**
   - They are difficult to stabilize.
   - They do not provide durable world memory.
   - They do not improve the chat-first, story-first experience enough to justify the complexity.

---

## What can still be reused from this document

This document may still provide reference value for limited enhancement work.

### 1. Mood references

The pack mood definitions may still inspire:

- place detail card illustration styles
- event card moods
- character encounter visual tone
- shareable story card palettes

### 2. Naming conventions for non-core art experiments

If the team later generates optional art for:

- scene capsules
- story cards
- place thumbnails
- event illustrations

then the old pack naming logic can still be reused as an internal organization aid.

### 3. Fallback enhancement layer ideas

These assets may remain useful only as optional, non-blocking enhancement materials, never as the core runtime dependency.

---

## Historical pack definitions

The following pack ideas are preserved only for archival reference.

### Pack A — Dream-Glade Night

- Palette: deep violet / indigo base, cyan-magenta glow, warm gold highlights, soft blue water accents
- Intended feeling: nocturne synth-fantasy, dreamy city-night overlay
- Previously imagined usage: self-rendered night map scenes, POI icons, seamless tiles

### Pack B — Pastoral Storybook

- Palette: soft mint / teal water, warm terracotta roofs, cream paper UI, higher warmth
- Intended feeling: daylight cozy storybook village
- Previously imagined usage: self-rendered healing-mode map scenes, POI icons, seamless tiles

These are no longer implementation targets for the current roadmap.

---

## Current handling rule

If this file is referenced in future work, apply the following rule:

- acceptable use: optional art reference, inspiration board, historical context
- not acceptable use: reopening map-pack production as a main engineering milestone
- not acceptable use: making generated tiles / icons / scenes a prerequisite for product progress

---

## One-line conclusion

[`docs/MAP_ASSETS_PLAN.md`](MAP_ASSETS_PLAN.md) is now a historical note about old map-asset thinking, not a current execution document.
