# Stardew storage, shipping and building placement reference

初次核对日期：2026-09-04；推箱源码快照与版本复核日期：2026-09-06。机制目标仍为本任务批准的 PC 1.6.15；本次实际读取的第三方反编译快照自报版本为 1.6.8.24119，不是官方 1.6.15 源码或实机测试。没有完整说明的分支明确保留未知。

## Chest

来源：[Chest](https://stardewvalleywiki.com/Chest)、[Crafting](https://stardewvalleywiki.com/Crafting#Crafted_goods_outside_the_farm)。

- 开局掌握配方，50 Wood 制作，不可出售。
- 容量 36 slots，每个相同物品 stack 最多 999；箱内物品不腐坏。
- 可放在许多农场外地点；普通矿洞内不可放。Wiki 没有给出完整 location allowlist。
- 空箱可用任意工具敲击或连续空手敲击收回。
- 非空箱不能直接收回；斧、镐或锄连续/持续敲击会按玩家面对方向优先寻找合法格。每个搜索节点先检查全部四邻候选，失败后才按另一轮随机顺序作有界深度优先搜索；两轮均把偏好方向置首、反方向置次，不保证全局最近。精确参数见下文。
- 玩家推动找不到合法格时，移动函数返回失败且调用方不销毁箱子，箱子与内容保持原位。
- 1.6 中 NPC 路径撞到箱子会调用同一搜索；搜索失败时 NPC 路径调用方销毁箱体、把非空内容作为世界掉落生成在原位置附近，箱体本身不掉落。其他普通 crafted goods 仍可能被摧毁。
- 上述终局和搜索算法的精确代码证据来自下述固定的 1.6.8 反编译快照；本次读取 [Chest revision 186909](https://stardewvalleywiki.com/mediawiki/index.php?title=Chest&oldid=186909) 与 [Version History revision 192874](https://stardewvalleywiki.com/mediawiki/index.php?title=Version_History&oldid=192874) 的 1.6.9–1.6.15 条目，未找到明确更改这一搜索或玩家/NPC 失败终局的记录。它仍是 1.6.15 机制推断；版本记录未提及不等于证明代码完全未变。

## Shipping bin

来源：[Shipping](https://stardewvalleywiki.com/Shipping)、[The Farm](https://stardewvalleywiki.com/The_Farm#Shipping_Box)、[Gold](https://stardewvalleywiki.com/Gold)。

- 每张 Farm 开局自带一个出货箱，默认在农舍右侧；普通出货箱 footprint 为 2×1。
- 一次可投入一个物品或整组 stack。
- 同一天可取回最后一次投入的完整物品/stack；再投入后，更早内容不可取回。
- 睡眠后夜间结算，Gold 次日到账；结算页列出各物品收入与总收入，价格与相应商店相同。
- 不能以 Shipping Collection 反推出货资格。可商店出售也不必然可出货；资格需要独立数据字段/闭集。
- 默认箱可通过 Carpenter service 移动。只有另有一个普通出货箱时才能拆除；Mini-Shipping Bin 不满足保底条件。
- 额外普通出货箱为 250g + 150 Wood，可在 Farm 任意合法 footprint 即时建成。

## Farm-building placement

来源：[Carpenter's Shop](https://stardewvalleywiki.com/Carpenter%27s_Shop#Farm_Buildings)。

- 新建/移动都由玩家选择 footprint；全部指示格无阻挡才显示合法。
- 石头、树枝、杂草和玩家物件阻挡；树种、铺地/道路、蚯蚓点不阻挡，但建筑落下时会被清除。
- 动物/宠物显示阻挡；确认放置时会被移开。
- 建成建筑可在 Carpenter menu 即时免费移动，内部内容随建筑整体移动且无需清空。
- 初始建筑也可移动，包括默认出货箱；姜岛农舍/出货箱是明确例外，与镜像岛当前地图无关。

## Current-project conflicts requiring decisions

- Stardew inventory 为初始 12、扩为 24/36，Hotbar 12；镜像岛此前为初始 24、扩为 32，Hotbar 8。用户已确认在本 child 校正为 12→24→36 与 12-slot Hotbar。
- Stardew 普通物品 stack 999；镜像岛此前资源/作物/鱼通常 stack 99。用户已确认统一改为普通物品 999、工具 1。
- Stardew 只有夜间保存；镜像岛已有关键动作即时保存与原子 overnight candidate。该差异属于已建立的可靠性合同，不能为了表面复刻而移除。
- Stardew 由 Robin 提供建筑服务；镜像岛路线图已明确墨子是西街木匠并承接农场建筑服务，因此 identity 采用墨子。用户已确认服务完整映射 Robin 的营业、雨天、离柜、施工与特殊日日程，不沿用墨子当前周日休息规则；详见 `stardew-carpenter-schedule-1.6.15.md`。

## Code-level movement evidence

- GitHub API 在 2026-09-06 返回的 [固定 commit](https://github.com/cct177/StardewValleyDecompiled_1.6.8/commit/5225ef409e42a6159a82cf81200bf6eb315c9961) 为 `5225ef409e42a6159a82cf81200bf6eb315c9961`，commit 时间 `2024-10-22T09:50:51Z`。`cct177/StardewValleyDecompiled_1.6.8` 与既有占用研究引用的 `Dannode36/StardewValleyDecompiled` 都返回同一个 commit，不能计作两份独立源码证据。
- [AssemblyInfo.cs](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/Properties/AssemblyInfo.cs#L12-L16) 的文件/程序集版本为 `1.6.8.24119`。仓库名或 README 的泛称不能把它升级为 1.6.15 证明。
- [Chest.cs `HandleChestHit` / `TryMoveToSafePosition`](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.Objects/Chest.cs#L332-L535)：玩家调用忽略失败返回。Git blob SHA-1：`da06150cad4dd7076a98b4a0d1401339bc876293`。
- [GameLocation.cs `checkDestroyItem`](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L10978-L11008)：NPC 无参数调用推动；失败后掉内容并移除箱体。Git blob SHA-1：`ac1eb4670255371af7ea9743d151bdb7e5e03713`。
- [Chest.cs `destroyAndDropContents`](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley.Objects/Chest.cs#L566-L596)：逐项生成掉落并清空容器，普通箱体不作为掉落返回。
- [Utility.cs `Shuffle`](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/Utility.cs#L1587-L1596)：从剩余长度倒序选择交换项的 Fisher–Yates shuffle。Git blob SHA-1：`b10c7adf936a55a90e753764ee1d602eaa7333d6`。

### Original implementation parameters

以下是对固定快照行为的文字归纳，用于独立实现；不把第三方源文件、函数体或代码改写副本加入产品。

1. 搜索从箱子原格、`depth = 0` 开始；原始四向顺序为东、西、北、南。
2. 每个节点先对四向做一次 Fisher–Yates 随机排序，再把偏好方向置第一、反方向置第二，其余两方向保持本轮随机相对顺序。依序检查全部四个相邻格是否通过箱体和地点的放置规则；首个合法格即成功。
3. 四个候选都不能落箱时，在当前四向列表上再随机排序一次并重新应用同一偏好。仅当 `depth < 3` 时，依序检查中间格的地图通行性并递归进入；下一层深度加一，偏好方向不变。没有 visited set。
4. `depth = 3` 仍执行邻格落箱检查，但不继续递归。因此搜索可检查距起点最多四次正交步进的候选；这不是全图最短路径、三格半径或 BFS。不要把上限误写为“所有三格内可放位置”。
5. 方向映射为 `0 = 北、1 = 东、2 = 南、3 = 西`。玩家传 facing。NPC 调用不传参数，但此快照的 nullable switch 将空值落到南方向；所以 NPC 不继承玩家 facing，却仍有“南、北、其余两向随机”的优先级。1.6.15 是否保留这个空参数细节缺乏直接源码/实机证明。
6. 原始中间格检查使用地图通行性，不要求中间格可放箱；箱子可越过其他物件到达合法落点。落点必须完整通过项目统一占用规则。镜像岛使用自己的 tile 尺度和地图通行 owner，不照搬原作 64 px 常量或反编译中的坐标表达式。
7. 玩家失败不改变箱体、颜色和内容；NPC 失败销毁箱体并掉出所有非空 stack。镜像岛沿用已批准的稳定掉落 identity、完整拾取和关键保存合同。搜索随机序列只在候选事务中推进，保存失败重试同一候选；没有依据声称与原作共享 PRNG 种子或逐次随机数序列。

资源点被箱体/建筑占用后的次日行为另见 [resource-regeneration-occupancy.md](resource-regeneration-occupancy.md)。
