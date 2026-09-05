# Resource regeneration and player-object occupancy

核对日期：2026-09-06。此次真实读取公开 Wiki、GitHub commit/tree API 与 commit 固定的第三方反编译文件，也检查当前镜像岛资源 owner。未运行 Stardew 或镜像岛玩法测试，未连接数据库，未下载源码到产品或引入第三方实现。

## Verified references and limits

统一代码快照：`5225ef409e42a6159a82cf81200bf6eb315c9961`，commit 时间 `2024-10-22T09:50:51Z`；[AssemblyInfo](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/Properties/AssemblyInfo.cs#L12-L16) 自报 `1.6.8.24119`。两个既有研究 repo 是同一快照，不当作独立验证。目标 PC 1.6.15 的细节需要区分 Wiki 证据、1.6.8 代码直接证据与本项目适配。

| Subject | Verified behavior and evidence |
| --- | --- |
| Chest and weed spreading | [Weeds revision 186921](https://stardewvalleywiki.com/mediawiki/index.php?title=Weeds&oldid=186921#Spawning_and_Spreading) 明确箱子和栅栏不被蔓延杂草摧毁，箱子、草、树、建筑会阻止蔓延。快照 [GameLocation L15132-L15146](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L15132-L15146) 在可能替换已有物件前显式跳过 Chest。 |
| New weed/stone candidates | [GameLocation L15043-L15089](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L15043-L15089) 区分空地新生与已有杂草蔓延，空地新生通过放置判断；[L7168-L7171](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L7168-L7171) 与 [L7232-L7240](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L7232-L7240) 覆盖 objects 和 buildings。不能把全部蔓延逻辑简化成“永远不能替换任何玩家物件”；普通 crafted object 存在被破坏分支。 |
| Fixed non-Farm trees | [GameLocation L5008-L5033](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L5008-L5033) 对地图 Paths 声明的非农场树逐日尝试回长；目标必须无 furniture、terrain feature、object 和 building。存在箱或建筑时不会覆盖它。 |
| Forage and artifact candidates | [GameLocation L14961-L14987](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L14961-L14987) 的随机物件候选经过可放置/无占用检查。这支持生成前检查占用的原则，不证明镜像岛每日固定 hash 或数量是原作规则。 |
| Special large stumps | [GameLocation L5100-L5128](https://github.com/Dannode36/StardewValleyDecompiled/blob/5225ef409e42a6159a82cf81200bf6eb315c9961/Stardew%20Valley/StardewValley/GameLocation.cs#L5100-L5128) 的 `Stumps` 地图属性会再生大型树桩并移除覆盖的 objects。它不是普通非农场树回长，也不是当前镜像岛普通树的剩余树桩状态；本任务不实现该特殊资源。 |
| Version difference | [Version History revision 192874, 1.6.9](https://stardewvalleywiki.com/mediawiki/index.php?title=Version_History&oldid=192874#1.6.9) 明确记录修复 weed/stone debris 在部分情况下覆盖已放置路径。不能声称 1.6.8–1.6.15 的全部资源生成完全相同。 |

[Trees revision 193892](https://stardewvalleywiki.com/mediawiki/index.php?title=Trees&oldid=193892#Growth_Cycle) 描述非农场既有树随机回长及农场树种只能落在空格。Wiki 所列回长概率与所读旧快照的路径树随机门槛并不一致；本次不裁定 PC 1.6.15 的精确概率，不据此改镜像岛已批准的七天确定性回长。

## Mirror Island integration before this child

- `domain/gathering/GatheringSystem.ts::settleDay`：非 Farm cleared 树在既有 `regrowOnDay` 到期后直接恢复；当前缺少世界物件占用检查。Farm 树清除后不恢复，保持不变。
- `domain/mining/MiningSystem.ts::settleDay`：只恢复 Foothills cleared 固定石点，稳定 hash 排序后每日最多两个；Farm/Lakeshore 石点永久 cleared。当前未过滤世界物件。
- `domain/gathering/WeedCuttingSystem.ts::settleDay`：Farm/Foothills/Lakeshore 每天最多恢复 1/2/1 个固定 cleared 点，仅已耕 Farm tile 被排除；需补玩家物件/建筑占用。
- `domain/gathering/ForageSystem.ts::activeSpawns`：野花、春笋和落枝按季节、日期、天气和固定 hash 投影，只有已耕农田排除。它没有独立“复活”事件，但也可能每天投影到箱体下方，必须采用同一 footprint 排除。

## Adopted fixed-point adaptation

以下保持当前项目已批准的固定点、产量、再生日期、每日上限、hash 和 current-save 可靠性，只补摆放引入的无重叠约束。它是镜像岛固定点实现的适配，不能标成 Stardew 的逐项原样复刻。

1. 世界对象/建筑的稳定 identity 和 footprint 是跨日占用事实源。资源刷新只查询这些事实，不清除、移动或推动箱子，不产生箱内掉落，不扣费。
2. 石块/杂草：在稳定排序和每日上限截取之前排除受占点；其他合格固定点照常填充当天上限。受占点保持 cleared，未来日结重新参与候选；当天无位置就少恢复，不累计欠额，不增加新 spawn，也不在移箱时即时补刷。即使零恢复，当天 refresh marker 仍提交，保持同日幂等。
3. 非农场普通树：只有已到原 `regrowOnDay` 且原点未被世界对象/建筑占用时恢复。受占时保持 cleared 和原到期日；位置释放后的下一次日结再检查，不重新等待七天，也不为了回长推走箱子。保留清除 Farm 树后永久 cleared 的现有规则。
4. Forage：保持当前纯派生合同，仅从 `activeSpawns` 排除被物件 footprint 占用的点；占用不会写入“已采集”列表或赠送补偿。若当天 hash 仍命中、尚未采集，移走物件后可以再次变为可见；这是现有纯投影合同的结果，不声称原作也会在同日重新生成。
5. 放置/移动与刷新都读取同一 candidate 世界对象状态；刷新后保存失败仍重试同一日结 candidate，不能重新选点。落点验证反向拒绝当前 standing 资源和有效 forage，避免放置时把现有资源隐藏。
6. 通过一个无副作用的 world-object footprint predicate/共享占用数据层复用规则。不要让 `WorldOccupancySystem` 查询 forage 后，`ForageSystem` 又调用完整 occupancy resolver，形成递归或互相依赖。
7. 地表资源再生不按实时玩家/NPC/宠物瞬时位置改变已批准的每日随机候选；角色位置冲突由新日出生/运动和既有资源碰撞合同处理。若以后扩大到动态生物破坏、铺路、特殊大树桩或施工区域，另立明确 owner，不从本适配外推。

## Implementation follow-through, 2026-09-06

本轮协作实施后再次只读核查：四个现有 owner 已接入 `domain/world/world-object-state.ts::worldObjectCoversTile`。树在原到期检查之后、变为 standing 之前跳过受占点并保留 `regrowOnDay`；石/杂草在排序截取前过滤；forage 在派生候选入口过滤。以上属于代码核查结果，不代表已完成人工跨日玩法验收。

## Verification boundary

人工路线至少覆盖：清除山麓石/树或杂草后原位放箱，跨日箱内物品仍在且资源不重叠；移箱后符合原规则的后续日结可恢复；全部可刷点被占时不超额/不清箱；Farm 出货箱的两个 footprint 格都阻止刷草；forage 占位过滤与移箱可见性；失败日结重试与刷新继续。自动验证按当前 AGENTS 选择最小 typecheck/build，不为该适配另建测试矩阵。
