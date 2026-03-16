# Map Assets Plan (Two Packs)

## Scope
Produce two cohesive asset packs with consistent scale, icon language, and glow treatment. Each pack includes:
- **Scene** (1024×1024)
- **Icons** (6 pcs, 256×256, transparent background)
- **Tiles** (6 pcs, 256×256, seamless or near-seamless)

Reference cues: dreamy night-map overlays and soft storybook day scenes. See existing references under [参考图片/ChatGPT Image 2026年3月14日 20_13_44.png](参考图片/ChatGPT Image 2026年3月14日 20_13_44.png), [参考图片/ChatGPT Image 2026年3月14日 21_20_09.png](参考图片/ChatGPT Image 2026年3月14日 21_20_09.png), [参考图片/ChatGPT Image 2026年3月14日 21_24_26.png](参考图片/ChatGPT Image 2026年3月14日 21_24_26.png), [参考图片/ChatGPT Image 2026年3月14日 21_26_48.png](参考图片/ChatGPT Image 2026年3月14日 21_26_48.png).

---

## Pack A — Dream-Glade Night (Nocturne Synth-Fantasy)
**Palette**: deep violet/indigo base, cyan/magenta glow, warm gold highlights, soft blue river.

### A1) Scene (1024×1024)
**Filename**: `pack_a/scene_01.png`
**Prompt** (English):
> isometric fantasy night city map, deep violet and indigo atmosphere, glowing river ribbon, grid-like roads, soft star particles, floating luminous POI rings, small cozy buildings and trees, dreamy magical glow, painterly vector hybrid, soft linework, high detail, no text

### A2) Icons (256×256, transparent)
**Naming**: `pack_a/icons/quest.png`, `shop.png`, `boss.png`, `home.png`, `echo.png`, `event.png`
**Prompt template** (apply per icon):
> glowing circular UI icon token, {icon_symbol}, neon cyan-magenta halo, soft bloom, subtle sparkles, dark transparent background, painterly vector hybrid, crisp silhouette, no text
**Symbols**:
- quest: scroll or exclamation star
- shop: small house/storefront
- boss: horned mask
- home: cozy house
- echo: crystal or droplet
- event: lantern or flame

### A3) Tiles (256×256, seamless)
**Naming**: `pack_a/tiles/road_01.png`, `road_02.png`, `ground_01.png`, `ground_02.png`, `water_01.png`, `magic_01.png`
**Prompt template**:
> seamless tile, {tile_subject}, nocturne palette, subtle glow edges, painterly vector hybrid, soft texture, no text
**Subjects**:
- road_01: dark cobblestone with faint cyan seams
- road_02: smooth slate path with violet edge glow
- ground_01: dark grass with small flowers/sparks
- ground_02: forest floor with scattered leaves
- water_01: deep blue river with shimmering particles
- magic_01: circular magic sigil tile with faint runes

---

## Pack B — Pastoral Storybook (Daylight Cozy)
**Palette**: soft mint/teal water, warm terracotta roofs, cream parchment UI, high-chroma accents.

### B1) Scene (1024×1024)
**Filename**: `pack_b/scene_01.png`
**Prompt** (English):
> isometric pastel storybook village map, sunny meadow with winding paths, bright river, stone bridges, cozy cottages with red roofs, flowers and bushes, warm ambient light, floating POI bubbles, painterly vector hybrid, soft linework, high detail, no text

### B2) Icons (256×256, transparent)
**Naming**: `pack_b/icons/quest.png`, `shop.png`, `boss.png`, `home.png`, `echo.png`, `event.png`
**Prompt template**:
> glowing circular UI icon token, {icon_symbol}, warm orange-gold rim, soft pastel glow, subtle sparkles, transparent background, painterly vector hybrid, crisp silhouette, no text
**Symbols**:
- quest: book or letter
- shop: market stall
- boss: crown or shield
- home: cottage
- echo: water droplet
- event: speech bubble or bell

### B3) Tiles (256×256, seamless)
**Naming**: `pack_b/tiles/road_01.png`, `road_02.png`, `ground_01.png`, `ground_02.png`, `water_01.png`, `garden_01.png`
**Prompt template**:
> seamless tile, {tile_subject}, pastel storybook palette, soft texture, painterly vector hybrid, no text
**Subjects**:
- road_01: warm stone path
- road_02: light brick path with flower edges
- ground_01: lush green grass with tiny flowers
- ground_02: meadow soil with pebbles
- water_01: turquoise river with soft highlights
- garden_01: patterned flower bed patch

---

## Notes
- Keep icon ring thickness consistent (~8% of icon diameter) across both packs.
- Maintain consistent scale between scene assets and icons (icons should read at 64–96 px).
- Use subtle particle overlays to unify the magic theme across both packs.

Planned output path (if/when generating assets):
- `fablemap/demo_assets/new_map_assets/pack_a/...`
- `fablemap/demo_assets/new_map_assets/pack_b/...`
