# 镜像岛下一步开发计划

整理日期：2026-09-06。当前分支：`codex/storage-shipping-v1`，基于本地 `main` / `16e7ee1`。仓储 child 已按用户最新决定单独启动，v13 实现进入验证与验收阶段；其余 child 仍是规划，部署与真人验收分别记录。

用户随后要求优化界面与素材，本轮在同一分支完善农场 HUD、背包与制作布局、中文可读性、响应式画布和普通箱切片。仍沿用既有许可证明确的图集，不新增素材包、玩法或存档版本；验证与遗留人工验收见 [CURRENT_STATE](CURRENT_STATE.md)。

## 要做成什么

做一款有镜像岛自身角色、地图和东方田园气质的星露谷式单人生活游戏。先让玩家每天有事做、产出有用途、经营有成长，再扩展内容。核心循环是：

**起床安排一天 → 种田 / 采集 / 钓鱼 / 采矿 → 留材料或出货 → 用收益改善农场、工具和生活 → 睡眠结算 → 带着新目标进入次日。**

沿用已评审的《星露谷物语》1.6.15 十系统参考范围。普通主矿洞与战斗在计划内；节庆玩法、婚恋、博物馆、多人等仍未进入本轮。完整机制与最小内容量分别管理，不把阶段切片写成永久删减。精确范围由[基础盘父 PRD](../.trellis/tasks/09-04-pre-pivot-life-sim-foundation/prd.md)和各 child PRD 拥有。

## 代码盘点与差距

“已实现”只表示当前代码存在；历史验收与本次验证见 [CURRENT_STATE](CURRENT_STATE.md)。

| 能力 | 当前代码 | 下一步价值 |
|---|---|---|
| 世界与日常 | 12 个区域、时间、体力、睡眠、晴雨风、八名 NPC 日程 | 复用现有世界承载系统，优先补真实用途 |
| 种田与资源 | 六种春作、自由耕地、补水、树木再生、野采、地表采石和除草 | 让资源用于仓储、工具和农场建设 |
| 钓鱼与关系 | 基础钓鱼、交谈、送礼、委托、家园宠物 | 为技能、加工与长期目标提供已有产出 |
| 背包与制作 | v13 已接入 12/24/36 格、12 格活动行、999 堆叠、整理、制作页与普通箱 | 验收投入材料、制作、摆放和跨日存物完整路线 |
| 经济 | 商店即时买卖、分档背包升级、共享出货队列、隔夜报告、墨子出货箱建筑服务 | 验收一次结算、失败重试、刷新恢复与农场投资 |
| 成长与矿洞 | 无技能经验；采矿只有地表石块 | 技能 → 矿石 / 冶炼 / 工具 → 完整矿洞战斗 |
| 季节与生产 | 日历函数支持四季，当前玩法始终使用春季内容 | 真实四季后接自动化、鸡舍草料、加工和厨房 |
| 持久化 | GameState / StoredGame 均为 v13，新增世界物件、掉落、宠物位置、出货队列与报告 | 验收同版本原子保存、严格解码、错误反馈与继续游戏 |

关键代码：[`GameSession.ts`](../apps/mirror-island/domain/session/GameSession.ts)、[`game-state.ts`](../apps/mirror-island/domain/state/game-state.ts)、[`InventorySystem.ts`](../apps/mirror-island/domain/inventory/InventorySystem.ts)、[`recipes/definitions.ts`](../apps/mirror-island/domain/recipes/definitions.ts)、[`game-calendar.ts`](../apps/mirror-island/domain/calendar/game-calendar.ts)、[`BackpackPanel.vue`](../apps/mirror-island/client/src/ui/inventory/BackpackPanel.vue)。

## 已有成果的验收尾项

- 地表采矿与镰刀在 `15a7b61` 提交并进入本地 main。补齐三张地表地图、再生节奏、键鼠 / 真实触摸 / 200% zoom 的真人反馈后归档；不重复提交已有代码。
- 小屋、图标、种田动作和两处商店精修已经提交并进入本地 main。保留真人审美 / 手感待反馈，只按具体反馈窄修。
- 早期盘点的缺失依赖问题已通过恢复现有 lockfile 对应依赖解决。本轮 `typecheck` 与 `build:client` 已通过；已用浏览器检查新建、背包换槽保存及刷新恢复、制作缺料与数量入口，桌面/手机截图无横向溢出。完整出货、建筑、NPC 与 200% zoom 路线仍待验收，具体证据记录在实施清单。
- 用户最新决定已授权单独启动仓储 child；此前地表工具与美术的待反馈项继续保留，不因新任务启动而记为通过。
- 本次未核验发布流水线或生产页面；“已合入 main”“已部署”“真人通过”分开记录。

## 当前实施与验收：农场仓储与出货 v1

复用已有[任务 PRD](../.trellis/tasks/09-04-storage-shipping-placement-v1/prd.md)、[技术设计](../.trellis/tasks/09-04-storage-shipping-placement-v1/design.md)和[实施清单](../.trellis/tasks/09-04-storage-shipping-placement-v1/implement.md)。三份文档已记录用户确认，当前任务为 `in_progress`，开发上下文已指向该 child；不创建重复规划或并行启动后续系统。

目标体验：**砍树得木材 → 打开制作页做箱子 → 自选合法位置摆放 → 整理保留材料 → 把当日产出投入出货箱 → 睡觉看到收入 → 次日继续经营。**

| 内部顺序 | 交付 | 完成标志 |
|---|---|---|
| 1. 背包 | 12 格 Hotbar、12→24→36 背包、普通堆叠 999；换位 / 拆分 / 整理与升级 | 工具保持原槽位，各输入入口可完成操作 |
| 2. 制作 | 暂停式制作页、普通箱配方、缺料 / 数量 / 放入背包 | 满包、取消、重复操作不丢材料或产物 |
| 3. 摆放基础 | Placeable / Buildable、对象 ID、宠物 domain 位置、统一占用事实 | 摆放、移动、NPC 路径和日结资源再生无状态冲突 |
| 4. 储物箱 | 36 槽、颜色、存取 / 整理 / 回收 / 推动及必要的持久掉落 | 箱子位置与内容跨地图、跨日、刷新一致 |
| 5. 出货 | 初始出货箱、投入 / 最后一笔撤回、共享队列、分类隔夜报告 | 只结算一次；失败可重试，刷新保留待确认报告 |
| 6. 木匠服务 | 墨子柜台、既定营业规则、追加出货箱 / 移动 / 拆除 | 服务与实际位置一致，始终保留至少一个箱 |

六项已接入本分支的领域和客户端代码。表中完成标志是待执行的验收标准，不代表浏览器、真人或 IndexedDB 完整路线已通过；最终按完整 PRD 收尾，不把内部批次宣布为整个阶段完成。

本轮已收敛两项技术准备并落实到代码：

- `GatheringSystem`、`MiningSystem`、`WeedCuttingSystem` 和 `ForageSystem` 已按世界物件 footprint 过滤被占用资源候选点；树木保留原恢复日并延后重试，石块 / 杂草不累积被阻挡名额，野采保留原确定性。没有改变原有数量、周期或随机函数，具体边界见[资源再生与占用研究](../.trellis/tasks/09-04-storage-shipping-placement-v1/research/resource-regeneration-occupancy.md)。
- 推箱实现依据的公开快照已固定到 `5225ef409e42a6159a82cf81200bf6eb315c9961`，实际程序集为 `1.6.8.24119`；研究明确保留对 1.6.15 的推断边界，代码自行实现有界搜索，不复制上游源码。

已有[参考机制记录](../.trellis/tasks/09-04-storage-shipping-placement-v1/research/stardew-storage-1.6.15.md)已在本轮实施时补充固定来源与机制核验；[开源交互评估](../.trellis/tasks/09-04-storage-shipping-placement-v1/research/open-source-inventory-ui.md)继续记录窄集成与最小项目薄层的取舍。不提前实现四季、肥料、施工等仅在合同中预留的后续系统。

## 后续阶段顺序

| 顺序 | 现有任务 | 玩家闭环 / 前置条件 |
|---|---|---|
| 1（当前） | [仓储与出货](../.trellis/tasks/09-04-storage-shipping-placement-v1/prd.md) | 工作区已接入整理、制作、存物、隔夜赚钱与摆放；完成本轮验收 |
| 2 | [技能与配方](../.trellis/tasks/09-04-skills-recipe-unlocks-v1/prd.md) | 四类既有劳动带来成长与选择；战斗技能随第 4 阶段接入 |
| 3 | [浅层矿洞 / 冶炼 / 工具](../.trellis/tasks/09-04-shallow-mine-smelting-tools-v1/prd.md) | 获得矿石、冶炼并升级；先建立楼层与保存基础 |
| 4 | [完整矿洞与战斗](../.trellis/tasks/09-04-full-mine-combat-v1/prd.md) | 120 层、生命、武器、敌人、掉落、战斗技能与公会；复用第 3 阶段 |
| 5 | [四季](../.trellis/tasks/09-04-four-seasons-minimum-v1/prd.md) | 季节影响种植、采集、天气与营业，含必要日历标记 |
| 6 | [农田自动化](../.trellis/tasks/09-04-farm-automation-v1/prd.md) | 金属、技能与摆放支持洒水器、稻草人、肥料 |
| 7 | [鸡舍与草料](../.trellis/tasks/09-04-chicken-hay-loop-v1/prd.md) | 建设、照料、饲料与产蛋，依赖摆放、日结和四季 |
| 8 | [基础加工](../.trellis/tasks/09-04-basic-processing-v1/prd.md) | 农产 / 动物产物投入设备，等待后增值 |
| 9 | [厨房与烹饪](../.trellis/tasks/09-04-kitchen-cooking-v1/prd.md) | 农舍升级、厨房 / 冰箱、已学配方与餐食 |
| 10 | [小镇共建簿](../.trellis/tasks/09-04-town-community-ledger-v1/prd.md) | 日常产出投入三个项目，兑现设施与社区变化 |

后续多数 child 仍是规划骨架，矿洞还有规则和内容映射开放项，不能视为全部可直接实施。一次只启动一个 child，不为未收敛阶段承诺固定工期。共建簿现有需求仍围绕春季产出，到第十阶段需与前序真实产出重新对账；现在不擅改其数值或奖励。十阶段完成后按父 PRD 做原创转型准备度审查。

## 验收与执行

- 默认自动验证采用本 child 的 `typecheck`、`build:client` 和 `git diff --check`；不将全量历史测试或新测试矩阵作为门槛。
- 真人从新开发档走完制作、摆箱、存取、跨日、出货、升级和木匠服务；覆盖满包、非法位置、再生占用、NPC 推箱、保存失败 / 重试与刷新恢复。
- 桌面键鼠、手机触摸、200% zoom 覆盖当前阶段关键路线，维持无账号、无身份请求、清档风险说明和焦点规则。
- 稳定复现的真实高风险缺陷优先窄修；有防复发价值才补单个低成本检查，允许按影响删减旧测试。
- 新生产代码 / 配置验证后按 AGENTS 暂存；文档、测试、截图和诊断产物不自动暂存。提交、部署、真人通过与归档各记事实。

## 项目入口

| 位置 | 职责 |
|---|---|
| README / docs/INDEX | 仓库入口 |
| docs/CURRENT_STATE | 当前代码、提交、验证和验收事实 |
| 本计划 / docs/TOWN_ROADMAP | 近期执行顺序 / 长期功能细目与延期项 |
| docs/PRODUCT_BRIEF / WHAT_NOT_TO_BUILD | 产品目标与范围边界 |
| .trellis/tasks/09-04-pre-pivot-life-sim-foundation | 父任务及十个 child，精确机制以 child 为准 |
| apps/mirror-island/domain | 规则、GameSession、存档合同 |
| apps/mirror-island/client | Phaser、Vue、输入与 IndexedDB adapter |
| apps/mirror-island/server、prisma 与 deploy | 保留的后端与运维，独立于本地玩法 |
| archive / checkpoint / journal | 历史证据，不覆盖现行合同 |

被否决的镜门任务保留历史记录，从可执行计划排除；论坛 SSO 是独立运维尾项。本轮只实施单独批准的仓储 child，未移动历史目录、删除业务或素材、连接数据库、提交或部署。
