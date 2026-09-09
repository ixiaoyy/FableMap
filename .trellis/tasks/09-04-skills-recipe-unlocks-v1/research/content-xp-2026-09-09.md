# 技能经验与现有内容对照

核对日期：2026-09-09。代码基线：本地 `196ba6df`，Godot 封套 2 / 状态 14。本轮只研究、规划，不改变游戏规则或存档。

## 证据范围

- 当前实现来自 `apps/mirror-island/godot/`；下文代码路径均相对此目录。
- 原作资料使用官方网站导航所指向的 Stardew Valley Wiki。网页为本日读取的维护页面，并非取得了 1.6.15 的完整数据快照或运行验证；版本敏感分支明确保留复核项。
- [Foraging 的 History](https://stardewvalleywiki.com/Foraging#History) 明确记录 1.6.12 将普通树 / 树桩经验从 12 / 1 改为 14 / 2。不得把早期攻略数值用于 1.6.15。当前表与版本历史一致，但尚未用原作 1.6.15 实测。
- 原作机制资料只用于自行实现规则，不从网页复制美术、叙事文本或完整数据包。

## 六种作物逐项对照

当前数值来自 `data/rules.json` 的 `crops`、`items` 和 `prices`。普通品质、不含职业和增益；种子目标价指 Pierre 商店，不混用 Joja 或旅行货车。

| 当前 ID | 当前生长 / 复收天数；种价 / 售价 | 参考或替换建议 | 原作生长 / 复收；种价 / 售价；收获 XP；食用体力 | 结论与依赖 |
|---|---|---|---|---|
| `turnip` | 3；20 / 35 | 防风草 `parsnip` | 4；20 / 35；8；25 | 替换建议，不能仅因售价相同就称现有萝卜已对齐；当前食用恢复 12 |
| `bok-choy` | 春季 5；45 / 80 | 原作小白菜为秋作；春季位置建议以后用羽衣甘蓝 `kale` | 小白菜：秋季 4；收获 14 XP；羽衣甘蓝：春季 6；70 / 110；17；50 | 非同物种改名。小白菜留到四季内容批次，羽衣甘蓝需镰刀收获入口 |
| `cauliflower` | 8；80 / 170 | 保留花椰菜身份 | 12；80 / 175；23；75 | 可先对齐基础数据；当前恢复 24，巨型作物 / 品质仍未实现 |
| `green-pea` | 7 / 3；70 / 48 | 青豆 `green-bean` | 10 / 3；60 / 40；9；25 | 替换建议；原作架子作物不能穿行，当前只改变生长天数不足以对齐 |
| `spring-potato` | 5；50 / 72 | 土豆 `potato` | 6；50 / 80；14；25 | 当前一次最多 3 个，由同一 roll 的 55 / 15 阈值决定；原作额外产出与每日运气有关，概率 / 截断须再核对 |
| `rapeseed-flower` | 6；35 / 68 | 蓝爵士 `blue-jazz` | 7；30 / 50；10；45 | 替换建议，不宣称油菜花就是蓝爵士；颜色 / 蜂蜜与美术另有依赖 |

每行事实来源：

- [防风草](https://stardewvalleywiki.com/Parsnip)、[防风草种子](https://stardewvalleywiki.com/Parsnip_Seeds)。
- [小白菜](https://stardewvalleywiki.com/Bok_Choy)、[羽衣甘蓝](https://stardewvalleywiki.com/Kale)、[羽衣甘蓝种子](https://stardewvalleywiki.com/Kale_Seeds)。
- [花椰菜](https://stardewvalleywiki.com/Cauliflower)、[花椰菜种子](https://stardewvalleywiki.com/Cauliflower_Seeds)。
- [青豆](https://stardewvalleywiki.com/Green_Bean)、[豆苗](https://stardewvalleywiki.com/Bean_Starter)。
- [土豆](https://stardewvalleywiki.com/Potato)、[土豆种子](https://stardewvalleywiki.com/Potato_Seeds)。
- [蓝爵士](https://stardewvalleywiki.com/Blue_Jazz)、[爵士种子](https://stardewvalleywiki.com/Jazz_Seeds)。

经验授予单位是一次成功收获，不按土豆等额外产物数量乘算；再生作物每次收获都授予。品质不增加种植 XP。锄地、播种、浇水不泛化为种植 XP。依据：[Farming / Experience Points](https://stardewvalleywiki.com/Farming#Experience_Points)。当前收获入口为 `domain/resource_rules.gd:60`，入包成功后才改变地块；未来 XP 应与这次候选修改一起提交。

## 采集与矿点逐项对照

| 当前来源 / 入口 | 当前行为 | 参考 XP 与时点 | 接入限制 |
|---|---|---|---|
| 普通 `tree`，`resource_rules.gd:120` | 一次斧击 standing → stump，得木材 3 | 砍倒普通树的最后一击给采集 14 | 可识别事件，但当前击数、树种、掉落与生长未完整对齐；不能每挥一次给 14 |
| 普通树桩，同上 | stump → cleared，得木材 1 | 清普通树桩给采集 2 | 不套用大型树桩 / 大木头的 25 |
| `fallen-branch`，`resource_rules.gd:91` | 空手拾取，得木材 1，记入 dailyForage | 原作 Twig 由工具砍断，采集 1 | 当前动作不等价；先改为真实 Twig 交互，再接经验，不能按普通野采给 7 |
| `spring-wildflower` | 地面点击拾取 1 | 普通地面野采一般给采集 7 | 只有原作身份及来源确定后采用；自定义野花尚未映射 |
| `bamboo-shoot` | 地面点击拾取 1 | 无本轮已证实的同名映射 | 不能擅自当成春葱；春葱属于 3 XP 特例。建议后续改为明确的春季原作采集物 |
| 普通 `weed` | 镰刀最多处理 3 个，可能得纤维 | 普通清草不作为当前技能 XP 来源 | 不混用绿雨大草等特殊来源 |
| 普通 `stone` | 一次镐击清除，得石头 1 | 矿洞外普通石头：基础采矿 1 | 当前无煤掉落，可按无额外掉落分支规划；需保留矿洞内外区别 |
| 铜 / 铁 / 金 / 铱矿点 | 当前不存在 | 采矿 5 / 12 / 18 / 50，破坏矿点时给 | 归浅层 / 完整矿洞批次，不由获得矿石的通用入包方法发 XP |

依据：[Foraging / Experience Points](https://stardewvalleywiki.com/Foraging#Experience_Points)、[Mining / Experience Points](https://stardewvalleywiki.com/Mining#Experience_Points)。采集经验与采矿经验不能按 `shippingCategory` 推导。拾回自己丢出的物品、箱子转移、购买和出货不是这些劳动事件。

矿洞外掉煤有 1 或 6 XP 分支；矿洞内普通石头自身可能为 0，特殊灰石与宝石另有规则。本轮未核定所有额外掉落分支，不把地表 1 XP 写成全局 `stone` 规则。

## 六种鱼与所需字段

当前鱼表只含 `itemId/minMinute/maxMinute/minCast/pull` 及部分天气。`fishing_rules.gd:83` 的 `_eligible()` 不按钓位水域和季节筛鱼；`pull` 控制现有张力变化，不是原作 `difficulty`。

| 当前鱼 | 当前窗口 / 限制；pull | 后续原作候选，仅供替换规划 | 候选普通品质 XP / 难度 | 必须改变的条件 |
|---|---|---|---|---|
| `lake-carp` | 06:00–02:00；8 | Carp | 8 / 15 | 山湖春夏秋；其他原作地点可能全年，不能所有钓位共池 |
| `silver-minnow` | 06:00–12:00，抛竿 ≥15；12 | Chub | 14 / 35 | 山湖 / 森林河流，全天全年，无现有早晨限制 |
| `rain-loach` | 06:00–02:00，雨，抛竿 ≥20；14 | Shad | 18 / 45 | 河流，09:00–02:00，春夏秋雨天 |
| `wind-dace` | 09:00–20:00，风，抛竿 ≥35；17 | Smallmouth Bass | 12 / 28 | 镇河 / 森林池塘，春秋全天，不要求风 |
| `dusk-perch` | 17:00–02:00，抛竿 ≥45；20 | Bream | 14 / 35 | 河流，18:00–02:00，全年 |
| `jade-bream` | 06:00–02:00，抛竿 ≥75；24 | Largemouth Bass | 19 / 50 | 山湖等，06:00–19:00，全年 |

这些是拟定的首批鱼池候选，不是生物学同义映射，也不是原作完整鱼池。依据：[Carp](https://stardewvalleywiki.com/Carp)、[Chub](https://stardewvalleywiki.com/Chub)、[Shad](https://stardewvalleywiki.com/Shad)、[Smallmouth Bass](https://stardewvalleywiki.com/Smallmouth_Bass)、[Bream](https://stardewvalleywiki.com/Bream)、[Largemouth Bass](https://stardewvalleywiki.com/Largemouth_Bass)。未核定实际地图水域、鱼池权重、季节和距离算法前，不批准这些候选进入生产。

鱼获经验先算 `floor((原始品质 + 1) * 3 + 难度 / 3)`，品质取 0/1/2/4；依次乘宝箱 2.2、完美 2.4、传奇 5，每步截断。完美导致的品质提升不回填经验公式。依据：[Fishing / Experience Points](https://stardewvalleywiki.com/Fishing#Experience_Points)。当前既无原始品质、宝箱、完美、传奇字段，也没有可证明这些结果的小游戏，所以不能硬填 false/0 后宣称已复刻。

鱼获的真实候选提交路径在 `domain/game_session.gd:197`，独立于普通 `dispatch()` 的工具成功分支。后续必须在该路径合并鱼获和 XP；仅在 dispatch 成功消息后补经验会漏掉钓鱼。

## 等级、耗能、奖励的合同

依据：[Skills](https://stardewvalleywiki.com/Skills)。累计阈值为 100、380、770、1300、2150、3300、4800、6900、10000、15000。达到阈值即升级并提高对应工具熟练度；配方和职业在夜间升级流程确认后生效，当日已出货物不获得新职业加成。

工具对应：种植 → 锄头 / 水壶；采集 → 斧；采矿 → 镐；钓鱼 → 竿。每级降低 0.1 体力。当前 Lv2 水壶按格扣费仍是 S0 中间规则，不能将每格减耗误作原作蓄力减耗；挥空、疲劳、临时等级另列后续。

当前制作由 `domain/storage_rules.gd:128` 检查 `knownByDefault`，UI 在 `ui/game_ui.gd:518` 遍历全部配方；必须一起改为实际解锁状态。现有两条配方不能支撑四技能升级奖励，木斧制作仍是占位。种植 1 级的稻草人 / 肥料、采集 1 级的春季种子 / 野外小吃、采矿 1 级的樱桃炸弹等均需实际消费系统，不能只解锁按钮。

## 推荐实施顺序与未闭合项

1. S1-A：先对齐防风草、花椰菜的身份和基础数值，范围见 `../design.md`。这是建议的下一次代码批次，本轮未获实施授权。
2. S1-B：其余春作、明确的春季野采、Twig、树木和地表矿点逐项对齐；先解决架子碰撞、镰刀收获、土豆概率 / 运气等契约，再批准对应小批次。
3. S1-C：钓鱼内容、小游戏及品质结果；上述候选需结合地图水域研究，不自动把湖岸视为河流。
4. S2：接入已核定劳动来源的 XP、即时等级和熟练度，同时补首批真实奖励及夜间可恢复流程。可以分技能验收，但未接入技能不能当成完成，不设虚构等级上限来绕开 5/10 级职业。
5. S3：随动物、加工、矿洞、烹饪等真实系统完成其配方与职业收益；全量四技能 / Combat 接入合同最终闭合，书籍、精通及完整原作内容仍列阶段总表。

尚未完成：1.6.15 精确数据 / 特殊分支运行核验、全量鱼与作物清单、四技能每级完整奖励及职业效果矩阵。本文覆盖现有内容及直接依赖，不能称全量原作对照已经完成。
