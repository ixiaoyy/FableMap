# Stardew storage, shipping and building placement reference

核对日期：2026-09-04。参考稳定版：1.6.15。只记录当前 Wiki 可证事实；没有完整说明的分支明确保留未知。

## Chest

来源：[Chest](https://stardewvalleywiki.com/Chest)、[Crafting](https://stardewvalleywiki.com/Crafting#Crafted_goods_outside_the_farm)。

- 开局掌握配方，50 Wood 制作，不可出售。
- 容量 36 slots，每个相同物品 stack 最多 999；箱内物品不腐坏。
- 可放在许多农场外地点；普通矿洞内不可放。Wiki 没有给出完整 location allowlist。
- 空箱可用任意工具敲击或连续空手敲击收回。
- 非空箱不能直接收回；斧、镐或锄连续/持续敲击会尝试将其向玩家面对方向移动，目标非法时调用有界深度优先搜索寻找其他合法格。搜索只走四向，每层先随机排序，再把偏好方向置首、反方向置次；它不保证全局最近。
- 玩家推动找不到合法格时，移动函数返回失败且调用方不销毁箱子，箱子与内容保持原位。
- 1.6 中 NPC 路径撞到箱子会调用同一搜索；搜索失败时 NPC 路径调用方销毁箱体、把非空内容作为世界掉落生成在原位置附近，箱体本身不掉落。其他普通 crafted goods 仍可能被摧毁。
- 上述终局和搜索算法的精确代码证据来自公开的 1.6.8 反编译；1.6.15 Wiki 与 1.6.9–1.6.15 版本记录没有显示该行为变更，因此作为高可信 1.6.15 推断记录，不能冒充 1.6.15 源码直接确证。

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

- [Chest.cs `HandleChestHit` / `TryMoveToSafePosition`（公开 1.6.8 反编译）](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/main/Stardew%20Valley/StardewValley.Objects/Chest.cs#L332-L535)：玩家调用忽略失败返回；搜索是有界、四向、带随机顺序的深度优先搜索。
- [GameLocation.cs `checkDestroyItem`（公开 1.6.8 反编译）](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/main/Stardew%20Valley/StardewValley/GameLocation.cs#L10978-L11008)：NPC 推动失败后调用销毁并掉落内容。
- [Chest.cs `destroyAndDropContents`（公开 1.6.8 反编译）](https://github.com/cct177/StardewValleyDecompiled_1.6.8/blob/main/Stardew%20Valley/StardewValley.Objects/Chest.cs#L566-L596)：逐项生成掉落并清空容器，普通箱体不作为掉落返回。
- Wiki Talk 编辑者把范围描述为最多三格，但代码递归计数可检查到更远候选，口径存在差异；实现要求复刻算法，不把三格或最近合法格写成硬合同。
