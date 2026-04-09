# Map Assets Generation Guide（历史参考）

## 文档定位

This document describes an older workflow for generating map scenes, icon packs, and tile packs for the deprecated self-rendered map pipeline.

That workflow is **no longer a current product priority**.

FableMap’s active direction has shifted to:

> **real base map + place selection + character encounter / place event + chat narrative + writeback / memory**

So this file is preserved only as historical reference for earlier visual asset experimentation.

For current direction, read:

- [`docs/PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md)
- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/CURRENT_TASKS.md`](CURRENT_TASKS.md)
- [`docs/INDEX.md`](INDEX.md)

---

## What this document originally covered

This guide was originally written to support a map-first visual production path:

- generate scene backgrounds for the browser map stage
- generate POI icon sets
- generate reusable road / ground / water tiles
- connect generated art into the old map asset pipeline

At that time, the assumption was that stronger generated map assets would help the product feel more immersive.

---

## Why it is no longer a mainline execution document

This generation workflow has been downgraded for product and engineering reasons.

### 1. Generated map art is not the core experience

The product no longer centers on rendering a custom fantasy map.

The core experience is now:

- selecting a real place on a real base map
- entering a place-driven narrative context
- triggering character encounters and place events
- continuing the experience through chat, writeback, and memory

### 2. Asset generation adds cost without solving the main problem

Even if scene packs, icons, and tiles improve visually, they do not directly provide:

- stronger place interaction loops
- character presence
- event density
- revisitable memory structure
- chat-first storytelling flow

### 3. The old map asset path has been frozen

This guide mainly supported a historical chain around:

- [`scripts/generate_map_assets.py`](../scripts/generate_map_assets.py:1)
- [`frontend/src/mapAssets/manifest.js`](../frontend/src/mapAssets/manifest.js:1)
- [`frontend/src/mapAssets/iconMapping.js`](../frontend/src/mapAssets/iconMapping.js:1)
- [`frontend/src/WorldMap.jsx`](../frontend/src/WorldMap.jsx:1)

That chain is now reference-only, not the main implementation focus.

### 4. AI-generated visuals are too unstable to be the foundation

Map-art generation remains useful for inspiration, but it is not reliable enough to anchor long-term product progress.

The main system value now comes from:

- real place anchoring
- structured state
- eventful encounters
- conversational narrative
- durable memory

---

## What can still be reused from this guide

Although it is no longer a mainline guide, some limited reuse is still reasonable.

### 1. Optional illustration workflows

The generation workflow may still be useful if the team later wants optional assets for:

- place cards
- event cards
- character portraits
- scene capsules
- shareable story visuals

### 2. Prompt organization reference

The pack structure and naming logic may still help organize exploratory art prompts for non-core enhancements.

### 3. Internal tooling reference

If the repository keeps [`scripts/generate_map_assets.py`](../scripts/generate_map_assets.py:1) for archival or occasional experiments, this document can still explain its historical purpose.

---

## Current handling rule

When this document is referenced in the future, apply the following rule:

- acceptable use: optional visual exploration, illustration experiments, archival understanding
- not acceptable use: making generated map assets a prerequisite for current roadmap progress
- not acceptable use: reopening self-rendered map polish as a core engineering track

---

## Historical workflow summary

This guide previously documented:

- hosted image generation via external providers
- local generation via ComfyUI or AUTOMATIC1111
- output of scene, icon, and tile packs
- file organization for old map pack usage

That workflow is preserved only as background context for the older map-assets phase.

---

## One-line conclusion

[`docs/MAP_ASSETS_GENERATION_GUIDE.md`](MAP_ASSETS_GENERATION_GUIDE.md) is now a historical guide for deprecated map-asset generation experiments, not a current execution document.
