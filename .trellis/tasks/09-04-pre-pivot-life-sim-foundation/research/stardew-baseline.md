# 星露谷基础机制证据表

核对日期：2026-09-04。用途：为“转型前生活模拟基础盘”及其 child 提供规划起点；每个 child 收敛前仍需复查对应页面的当前版本。

## 用户已确认的边界

- 先补齐成熟生活模拟基础系统，再进入镜像岛原创转型；覆盖系统，不追求参考作品的内容数量。
- 浅层无战斗矿洞只作为先行实现切片；用户明确后续必须补齐完整矿洞与战斗，并把它纳入转型前门槛。
- 节庆场景/活动/奖励、恋爱婚姻、博物馆、成就和多人尚未因本次战斗决定自动进入转型前门槛；精确营业日程所需 calendar marker 仍属于日历依赖。
- 逐项参考《星露谷物语》的实际机制；不得由 AI 自行猜测数量、时长、容量、概率、层数或规则。
- 镜像岛不复制参考作品的品牌、文本、角色、地图、UI、美术或音乐；任何机制偏离必须明确列出并取得用户确认。

## 已核实参考事实

### 摆放、建筑与出货

- [Chest](https://stardewvalleywiki.com/Chest)：开局已知配方，50 Wood 制作，36 格；可放在多种地点。非空箱子不能直接拾取；当前版本会尝试从 NPC 路径移到附近合法格。
- [Carpenter's Shop](https://stardewvalleywiki.com/Carpenter%27s_Shop)：农场建筑在购买/移动时由玩家选择位置，完整 footprint 的指示格必须无阻挡；建成后可从同一菜单移动。不是固定 authored 建设点。
- [Shipping](https://stardewvalleywiki.com/Shipping)：出货箱夜间结算，价格与对应商店相同；当天可取回最后一项投入物品。

### 技能与工具

- [Skills](https://stardewvalleywiki.com/Skills)：Farming、Mining、Foraging、Fishing、Combat 均为 0–10 级；普通等级解锁配方并提高对应工具熟练度，5/10 级选择职业。Farming XP 主要来自收获和照料动物，不来自普通锄地/浇水。
- [Tools](https://stardewvalleywiki.com/Tools)：斧、镐、锄、水壶按 Copper→Steel→Gold→Iridium 顺序升级，不能跳级；每级使用 5 个对应金属锭与 Gold，交付后两天完成并需主动取回。

### 矿洞与冶炼

- [The Mines](https://stardewvalleywiki.com/The_Mines)：主矿洞共 120 层，每 5 层记录电梯检查点；普通层在玩家返回入口后重置，矿石类型随深度变化。
- [Copper Bar](https://stardewvalleywiki.com/Copper_Bar)：熔炉以 5 Ore + 1 Coal 处理一份金属锭，并经过游戏内时间。
- “浅层缩减”和“无战斗”只适用于先行 child，不是最终偏离。后续 `full-mine-combat-v1` 必须回到 120 层、敌人、武器、生命值、掉落与 Combat skill 的参考合同；具体内容继续逐项核实。

### 完整矿洞与战斗

- [Health](https://stardewvalleywiki.com/Health)：新游戏最大 HP 为 100；生命归零与 02:00/体力昏倒是两套结算，可能损失更多 Gold 与最多 3 个背包条目。
- [Weapons](https://stardewvalleywiki.com/Weapons) 与 [Combat](https://stardewvalleywiki.com/Combat)：武器不耗体力；普通矿洞以初始剑开局，Combat 为第五条 0–10 技能并拥有独立 5/10 级职业。
- [Adventurer's Guild](https://stardewvalleywiki.com/Adventurer%27s_Guild)：第 5 层后的准入目标、14:00–02:00 服务、随最深层推进的装备库存、讨伐奖励和生命归零物品找回组成完整普通矿洞闭环。

### 四季与农田

- [Getting Started](https://stardewvalleywiki.com/Getting_Started) 与当前 `calendarAt()`：一年四季、每季 28 天；不同季节拥有不同作物与采集内容。
- [Crafting](https://stardewvalleywiki.com/Crafting)：三个洒水器等级每天早晨分别覆盖 4、8、24 格。
- [Scarecrow](https://stardewvalleywiki.com/Scarecrow)：Farming Level 1 解锁，保护约 8 格半径。
- [Fertilizer](https://stardewvalleywiki.com/Fertilizer)：肥料施加于耕地/树木，不是独立 placeable；不同类型影响品质、成长速度或保水，基础品质肥需在种子发芽前施用。
- 冬季内容与普通季节并不对称；本项目不能为了表格整齐自行规定每季相同作物数量。

### 鸡、草料与加工

- [Coop](https://stardewvalleywiki.com/Coop)：基础鸡舍 footprint 6×3、容量 4，建造三天。
- [Chicken](https://stardewvalleywiki.com/Chickens)：连续喂养三夜后成年；成年且前一天已喂养的鸡每天产蛋。
- [Animals](https://stardewvalleywiki.com/Animals)：未喂养不会直接死亡，但会降低心情、停止成长或产出。
- [Silo](https://stardewvalleywiki.com/Silo)：容量 240；有未满筒仓时，普通镰刀每格草 50% 机会存入 1 Hay。
- [Artisan Goods](https://stardewvalleywiki.com/Artisan_Goods)：加工设备一次处理一个 input，并经过游戏内时间产出增值品；设备集合与原料表需在 child 中继续核对。

### 农舍与烹饪

- [Farmhouse](https://stardewvalleywiki.com/Farmhouse)：第一次农舍升级耗时三天，增加厨房与可作为箱子的冰箱。
- [Cooking](https://stardewvalleywiki.com/Cooking)：配方需先学习；厨房从背包、主冰箱和 Mini-Fridge 读取食材。来源包括开局已知、技能、居民友谊邮件、节目和购买；部分食物提供 buff。
- Health 随完整矿洞与战斗 child 加入；菜谱数量、具体来源映射与 buff 保留范围尚未确定。

### 长期社区目标

- [Bundles](https://stardewvalleywiki.com/Bundles)：部分 bundle 是“候选多于所需槽位”的选择式投入；单 bundle 立即奖励，房间完成后兑现社区改善。
- [Community Center](https://stardewvalleywiki.com/Community_Center)：全部完成后的下一合适晴天进入 Town 触发一次重开仪式。镜像岛已在 `town-community-ledger-v1` 中采用这一抽象结构，但内容、名称和表现保持原创。

## 仍需 child 逐项收敛

- 小型 item 的逐类 location allowlist、NPC 路径碰撞以及非空箱移动细节。
- 浅层先行切片的楼层数、模板/生成、重置范围和矿石带映射，以及它如何无损扩展到最终 120 层合同。
- 四季原创作物/采集名单及数量、冬季种植与跨季枯萎规则。
- 乌鸦生成公式、肥料品质概率与 item quality/售价完整合同。
- 鸡的繁殖、野外袭击、大蛋、品质、心情/友谊公式中哪些保留。
- 加工设备集合、配方、处理时间与售价；厨房菜谱、来源和 buff 范围。
