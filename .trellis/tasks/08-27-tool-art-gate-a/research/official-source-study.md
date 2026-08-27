# Tool art official source study

## Local archive

| Need | Local evidence | Result |
|---|---|---|
| Farmer walk | `Original/16x16/Sprites/$farmer.png`, 48×128, 3059 bytes | 已采用；只有四方向走路/站立 |
| Hoe/plowing action | `Original/16x16/Sprites/!$farmer_plowing.png`, 96×128, 3467 bytes | 可验证；四方向、每方向三帧、人物与锄头合成 |
| Axe/chopping action | Farming Sim v1.08 Sprites 中无对应文件 | 缺失 |
| Watering action | Farming Sim v1.08 Sprites 中无对应文件 | 缺失 |
| Tool/item icons | 原包与当前 details sheet 无独立工具图标；Hotbar 当前为汉字 | 缺失 |

## Official VectoRaith sources

### Farming Sim Asset Pack v1.08

- Official page: `https://vectoraith.itch.io/farming-sim-asset-pack`
- Official v1.08 devlog: `https://vectoraith.itch.io/farming-sim-asset-pack/devlog/1563685/farming-sim-asset-pack-update-v108`
- Page lists farmer walking and plowing; devlog specifically says v1.08 added the farmer plowing sprite.
- No official page claim was found for farmer chopping/axe or watering animations in this pack.
- License shown on the official page permits free/commercial project use and modification, and forbids ownership claims or redistribution/resale/sub-licensing of asset files or derivatives as-is.

### 16×16 RPG Farming Sim Icon Pack

- Official page: `https://vectoraith.itch.io/16x16-farming-sim-icon-pack`
- Version/status: v1.00, paid download, minimum $4.
- Contents: 271 16×16 icons including farming tools, seed bags, crops, materials, ores, forages, animal and supermarket products, and fish.
- Same author and 16×16 base as the current world assets; strongest existing candidate for Hotbar icons and visible held-tool overlays.
- License permits free/commercial project use and modification, and forbids ownership claims, redistribution/resale/sub-licensing as-is, NFT use, and AI learning.
- Not present in the current local artifacts; purchase/download must be performed by the user through itch.io.

## Current recommendation

1. Use the official plowing sheet unchanged for the hoe action prototype.
2. The user declined paid assets; keep the 16×16 Farming Sim Icon Pack as research-only and do not make it a build/runtime dependency.
3. Search allowlisted free sources for axe/watering icons and actions. If none fit, custom work is limited to the missing tool visuals; do not redraw the existing plowing action or reusable crop/material frames.
4. Keep all candidate PNGs ignored/local until visual acceptance and a separate CDN/runtime approval.
