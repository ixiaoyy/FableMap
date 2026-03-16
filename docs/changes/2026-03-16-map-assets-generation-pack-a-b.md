# Task Claim: Map Assets Generation (Pack A & B)

**Date**: 2026-03-16
**Claimed by**: Claude Code
**Status**: In Progress

## Scope
Generate two cohesive asset packs (Pack A: Dream-Glade Night, Pack B: Pastoral Storybook) with:
- 2 Scene images (1024×1024 each)
- 12 Icon images (256×256, transparent, 6 per pack)
- 12 Tile images (256×256, seamless, 6 per pack)

**Total**: 26 images

## Reference
See `docs/MAP_ASSETS_PLAN.md` for detailed prompts, palettes, and specifications.

## Output Path
```
fablemap/demo_assets/new_map_assets/
├── pack_a/
│   ├── scene_01.png
│   ├── icons/
│   │   ├── quest.png
│   │   ├── shop.png
│   │   ├── boss.png
│   │   ├── home.png
│   │   ├── echo.png
│   │   └── event.png
│   └── tiles/
│       ├── road_01.png
│       ├── road_02.png
│       ├── ground_01.png
│       ├── ground_02.png
│       ├── water_01.png
│       └── magic_01.png
└── pack_b/
    ├── scene_01.png
    ├── icons/
    │   ├── quest.png
    │   ├── shop.png
    │   ├── boss.png
    │   ├── home.png
    │   ├── echo.png
    │   └── event.png
    └── tiles/
        ├── road_01.png
        ├── road_02.png
        ├── ground_01.png
        ├── ground_02.png
        ├── water_01.png
        └── garden_01.png
```

## Implementation Plan
1. Create directory structure
2. Generate Pack A assets (scenes, icons, tiles)
3. Generate Pack B assets (scenes, icons, tiles)
4. Verify asset consistency and quality
5. Commit generated assets

## Notes
- Using Claude API for image generation
- Maintaining consistent scale and icon language across both packs
- Icon ring thickness: ~8% of diameter
- Icons should read at 64–96 px when scaled down
