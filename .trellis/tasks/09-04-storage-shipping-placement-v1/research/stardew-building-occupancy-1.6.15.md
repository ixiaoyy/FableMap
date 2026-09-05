# Stardew placement occupancy reference

初次核对日期：2026-09-04；固定快照复核日期：2026-09-06。目标机制为已批准的 PC 1.6.15；细粒度耕地行为使用 Wiki 与第三方反编译快照交叉检查。该快照的 AssemblyInfo 自报 `1.6.8.24119`，不是官方 1.6.15 源码或本次实机验证；未找到建筑 footprint 清除矩阵的明确后续改动记录，不代表已经证明逐行相同。

来源：[Carpenter's Shop revision 193964](https://stardewvalleywiki.com/mediawiki/index.php?title=Carpenter%27s_Shop&oldid=193964#Farm_Buildings)、[GameLocation](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs)、[HoeDirt](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.TerrainFeatures/HoeDirt.cs#L449-L456)、[Grass](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.TerrainFeatures/Grass.cs#L110-L113)、[Tree](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.TerrainFeatures/Tree.cs#L743-L749)、[Object](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/Object.cs)、[Chest](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.Objects/Chest.cs)。

固定 commit 为 `5225ef409e42a6159a82cf81200bf6eb315c9961`，GitHub API 核验时间为 2026-09-06，commit 时间 `2024-10-22T09:50:51Z`。该 repo 与推箱研究引用的 `cct177/StardewValleyDecompiled_1.6.8` 返回同一 commit，属于同一证据来源。版本、推箱参数和 source blob 标识见 [stardew-storage-1.6.15.md](stardew-storage-1.6.15.md#code-level-movement-evidence)。研究只归纳行为，不作为可复制的开源实现依赖，不将这些第三方源码纳入产品。

本次核验的 Git blob SHA-1：`GameLocation.cs = ac1eb4670255371af7ea9743d151bdb7e5e03713`、`HoeDirt.cs = 54ea043851f09e6824ed60e224a7aa27cf732d31`、`Grass.cs = 068bcb6469f761c5793a84d2da9ce176af4696f1`、`Tree.cs = 6f525fa8ec33813eefd30fcfbd5123473108bb78`、`Object.cs = 944c520b54d658fd67825e7e9664eeace37e5913`、`Chest.cs = da06150cad4dd7076a98b4a0d1401339bc876293`。

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

精确调用证据：`GameLocation.isBuildable` 在 [L16842-L16877](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L16842-L16877) 调用地点放置判断；`CanItemBePlacedHere` 在 [L7103-L7133](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L7103-L7133) 显式拒绝带 crop 的 HoeDirt。既有建筑移动与新建分别在 [L16487-L16498](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L16487-L16498) 与 [L16668-L16678](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L16668-L16678) 清除覆盖的 terrain feature，仅保留明确允许铺地的例外。

## Ordinary chest placement

| state | resolution |
| --- | --- |
| Empty HoeDirt, dry/watered/fertilized | `free`; dirt and state remain under the chest |
| HoeDirt with any seed/crop stage | `blocked` |
| Standard Flooring/Path | `free`; flooring remains under the chest |

普通箱沿用 object placement，只加入 world object；不能复用 Carpenter building 的清除动作。

## Regeneration boundary

放置时合法并不足以保证跨日仍合法；固定资源恢复和每日 forage 投影也必须排除玩家物件/建筑 footprint。证据和镜像岛固定点适配见 [resource-regeneration-occupancy.md](resource-regeneration-occupancy.md)。1.6.9 版本记录明确修复过 weed/stone 覆盖铺路，不能把以上建筑放置证据扩大解释为“所有资源生成分支在 1.6.8–1.6.15 都未变化”。
