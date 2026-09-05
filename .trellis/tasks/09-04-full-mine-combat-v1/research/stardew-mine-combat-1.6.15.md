# Stardew mine and combat reference

核对日期：2026-09-04。参考稳定版：PC 1.6.15。来源：[The Mines](https://stardewvalleywiki.com/The_Mines)、[Health](https://stardewvalleywiki.com/Health)、[Weapons](https://stardewvalleywiki.com/Weapons)、[Combat Mechanics](https://stardewvalleywiki.com/Combat/Mechanics)、[Monsters](https://stardewvalleywiki.com/Monsters)、[Monster Loot](https://stardewvalleywiki.com/Monster_Loot)、[Combat](https://stardewvalleywiki.com/Combat)、[Skills](https://stardewvalleywiki.com/Skills)、[Quests](https://stardewvalleywiki.com/Quests)、[Adventurer's Guild](https://stardewvalleywiki.com/Adventurer%27s_Guild)。

## Main mine

- 矿洞在春季第 1–4 日封闭，第 5 日开放。
- 普通矿洞为 120 层，环境段为 1–40、41–80、81–120。
- 每 5 层解锁永久电梯；每 10 层通常是无怪、一次性领取且不重置的奖励层。
- 破坏石头与击杀怪物都可能生成下行梯；感染层必须清怪。
- 回到 0 层会立即重置临时楼层状态；最深层、电梯和已领取奖励保持。生命归零不再清除电梯进度。
- 1.6.4 起玩家下楼后有 1 秒无敌时间。
- 首次进入矿洞由 Marlon 赠送 Rusty Sword；镜像岛需要映射这一功能，但不复制角色或文本。

## Health and defeat

- 新游戏最大生命值为 100；危险区域始终显示血条，其他地点只在生命未满时显示。
- 食物、睡眠与 Spa 可恢复生命；镜像岛若尚无 Spa，不能凭空删掉参考恢复来源，需在实现前确认等价地点或阶段依赖。
- Combat 每个普通等级增加 5 HP，5/10 级本身不增加；Fighter 增加 15 HP，Defender 再增加 25 HP。
- 生命归零与体力/02:00 昏倒是不同结算：损失当前金币 5%–25%，上限 15,000g，且最多丢失 3 个背包条目。普通工具次日寄回，钓竿与武器不自动寄回；公会可付费找回其中一个条目或一个完整堆叠。
- 原作对金币损失百分比和物品选择有随机/条件细节；实现前必须继续核对算法，不能只在区间内自行抽值。

## Weapons, monsters and drops

- 武器攻击不消耗体力，也不进入铁匠农具升级链。Rusty Sword 基准为 2–5 伤害、2% 基础暴击率。
- 完整普通矿洞包含剑、匕首、棍棒和弹弓四类武器，各有不同普通/特殊攻击；斧、镐、镰刀也能造成少量伤害，斧/镐耗体力，镰刀不耗体力。
- 怪物按楼层段配置，不能使用全层统一随机池：绿色史莱姆贯穿；1–29、31–39、41–79、81–119 各有原作对应怪物集合。
- 每种怪物拥有独立 Combat XP 与掉落表；物品掉落和“生成下行梯”是两套结果，不能合并成公共抽奖袋。

## Combat skill

- Combat 与其他技能一样为 0–10 级；累计 XP 阈值为 `100 / 380 / 770 / 1300 / 2150 / 3300 / 4800 / 6900 / 10000 / 15000`。
- 击杀时等级立即增长；升级页、配方与职业效果在睡眠结算后生效。Combat 不提供工具熟练度。
- Level 5：Fighter 为所有攻击 ×1.10 并 +15 HP；Scout 为基础暴击概率 ×1.5，不是增加 50 个百分点。
- Level 10：Fighter 分为 Brute（伤害再 ×1.15）或 Defender（+25 HP）；Scout 分为 Acrobat（特殊攻击冷却减半）或 Desperado（暴击伤害再 ×2）。镜像岛可使用自己的职业名称，但分支依赖与数值必须保持。

## Adventurer's Guild

- 到达矿洞 5 层后的次晨收到 Initiation；击杀 10 只史莱姆后开放公会。
- 每日 14:00–02:00 营业，节庆关闭。
- 公会销售武器、鞋与戒指，库存随最深矿层推进；收购武器、鞋、戒指与 Monster Loot。
- 公会承担怪物讨伐目标/奖励和生命归零后的单件物品找回，因此是“完整参考”普通矿洞闭环的一部分，不是可永久删掉的装饰地点。

## Explicit later systems

危险矿洞、骷髅洞穴、火山地牢、锻造/附魔、饰品精通和混合奖励模式不属于普通 120 层矿洞本身；本 child 不因“完整普通矿洞”自动纳入这些独立后期系统。
