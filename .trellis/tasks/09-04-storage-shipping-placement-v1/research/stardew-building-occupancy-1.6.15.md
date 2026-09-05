# Stardew placement occupancy reference

核对日期：2026-09-04。当前 Wiki 基准为 1.6.15；细粒度耕地行为使用公开 1.6 反编译代码与 Wiki 交叉验证，1.6.9-1.6.15 版本记录未列出相关变化，但不冒充官方 1.6.15 源码证明。

来源：[Carpenter's Shop - Farm Buildings](https://stardewvalleywiki.com/Carpenter%27s_Shop#Farm_Buildings)、[GameLocation](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley/GameLocation.cs)、[HoeDirt](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley.TerrainFeatures/HoeDirt.cs)、[Grass](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley.TerrainFeatures/Grass.cs)、[Tree](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley.TerrainFeatures/Tree.cs)、[Object](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley/Object.cs)、[Chest](https://github.com/Dannode36/StardewValleyDecompiled/blob/main/Stardew%20Valley/StardewValley.Objects/Chest.cs)。

## Carpenter building footprint

| state | resolution |
| --- | --- |
| Empty HoeDirt, dry/watered/fertilized | `clear-on-place`; remove dirt, water state and fertilizer |
| HoeDirt with seed/crop, including dead or regrow state | `blocked` at every growth stage |
| Wild tree seed/stage 0 | `clear-on-place` |
| Wild tree stage 1+ | `blocked` |
| Harvestable Grass terrain feature | `clear-on-place` |
| Debris weed, stone or twig | `blocked` |
| Standard Flooring/Path | `clear-on-place` |
| Farm animal or cat/dog | initially obstructed, then `relocate-on-place` when placement is confirmed |
| Player | `blocked` |

标准原作建筑会清除路径；自定义建筑数据存在 `AllowsFlooringUnderneath` 例外，本任务的普通出货箱按标准行为处理。

## Ordinary chest placement

| state | resolution |
| --- | --- |
| Empty HoeDirt, dry/watered/fertilized | `free`; dirt and state remain under the chest |
| HoeDirt with any seed/crop stage | `blocked` |
| Standard Flooring/Path | `free`; flooring remains under the chest |

普通箱沿用 object placement，只加入 world object；不能复用 Carpenter building 的清除动作。
