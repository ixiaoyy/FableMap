# 技能任务设计：先处理体力前置

## 2026-09-09 研究后的下一批设计

### S2-B 稻草人配方与保护

依据：[Scarecrow](https://stardewvalleywiki.com/Scarecrow)、[Animals / Crows](https://stardewvalleywiki.com/Animals#Crows)、[Coal](https://stardewvalleywiki.com/Coal)、[Crop data](https://stardewvalleywiki.com/Modding:Crop_data)。每16株一个机会 / 上限4 / 30% / 最多10次、249格保护与种价均已核对。生长阶段由六种作物的前两阶段天数确定；当前地形池为已存在的耕地与未清除树木，草地和地板尚未建模，不伪造要素。

新增窄 `crop_protection.gd` 处理隔夜判定。使用固定引擎内置随机数生成器，以现有世界哈希 / 日期设种子；循环严格有界，失败重试保存原候选。保护范围以格距平方小于81表示，整数格合计249；多个保护对象按当前持久对象顺序选择首个并计数。

状态新增 `knownRecipes`；报告新增 `recipeUnlocks` 与 `crows`（lost数组记录tileId/cropId，scared计数）。报告确认前只显示待学配方，确认候选成功后进入 knownRecipes。reportedLevel 继续只代表等级展示，不能替代配方状态。新封套8 / 状态20，旧开发档保留但拒绝。

世界对象新增 `scarecrow` 和 `scaredCount`，复用摆放预检 / 占用与递增 ID；库存添加 `coal/scarecrow`。买煤验证工具架柜台距离和金币；09:00–16:00 限制新进入，已在屋内不硬停交易，不复用水壶 Day3 门槛。新增材料 / 物件暂用现有原生 pixels 图标机制做本地占位，没有采纳或上传新图片文件，正式美术仍待制作 / 发布。

生产影响限 Godot 内容、领域、codec 与当前 UI / 场景；不新增依赖、数据库或第二套状态。测试与文档不自动暂存；不提交 / 推送 / 部署。

### S2-A 经验与熟练度

新增窄领域 `skill_rules.gd`，拥有三条技能的等级表、工具对应和等级计算。`skills` 固定为 farming/foraging/mining，每项为整数 `xp`、`level`、`reportedLevel`；`level` 必须与累计经验阈值一致，`reportedLevel` 为上次日结已记录等级，范围 0..level。钓鱼和战斗待真实入口核实后接入同一结构，不填无消费字段。

收获和资源破坏在同一成功候选中更新经验，工具扣费使用动作前等级；不从库存 add、界面消息或动画授予。水壶每格预算与实际扣费共用当前单格成本，仍保留已有 Lv2 中间规则。源规则：[Skills](https://stardewvalleywiki.com/Skills)、[Farming](https://stardewvalleywiki.com/Farming)、[Foraging](https://stardewvalleywiki.com/Foraging)、[Mining](https://stardewvalleywiki.com/Mining)。

日结将三个技能的等级差写入现有持久出货报告 `skillUpgrades`（每项 skill/from/to，最多三项），再更新 reportedLevel；若有升级，按 [Energy / Leveling Up](https://stardewvalleywiki.com/Energy#Leveling_Up) 恢复 270 体力。报告继续通过原确认命令清除，不另建保存链。UI 增加只读技能页和日结升级文字；不虚构配方 / 职业选项。

codec 严格核对技能 ID、累计经验、等级一致性、日结报告的唯一技能及 from/to。当前版本升级为封套 7 / 状态 19；回退必须同时恢复技能字段、耗能消费与日结，旧开发档不迁移。本批不实现职业、配方、钓鱼 XP、精通或每日运气，这些仍为后续交付要求。

### S1-D 土豆基础产出

核对资料：[Potato 的 References](https://stardewvalleywiki.com/Potato#References)、[Crop data](https://stardewvalleywiki.com/Modding:Crop_data)。前者说明额外产出反复判定 0.2，后者给出土豆 `ExtraHarvestChance=0.2` 及字段的几何分布定义；内容示例标注 1.6.8，尚未用原作 1.6.15 运行核验。每日运气额外翻倍规则未接入，不对其公式作猜测。

数据修改落在 `rules.json`、`media.json` 和有相关文本的 `dialogues.json`，codec 提升至封套 6 / 状态 18；旧档仍保留但拒绝。资源规则采用当前稳定哈希作为均匀随机源，以世界种子、播种日、地块 ID 和收获序号确定同一结果。用几何分布的反函数一次计算额外数量，避免未设上限的随机循环；不增加人为的 3 个上限。随机源沿用项目实现，不声称能复现原作同一 seed 的每个结果。

`harvest_amount(state, tile, crop)` 返回完整产出，先计算再由既有库存完整预检；只有入包成功才更新地块。对 `extraHarvestChance=0` 的作物仍返回 1。新增字段只由实际收获入口消费，删除旧 `yieldKind` 分支。回退同时恢复 ID、数据、算法和版本，不撤销 S1-A/B。

S1-B 三种作物已接入，用户已批准临时镰刀规则；见 [三种春作与交互方案](research/s1b-interactions.md) 和 [阶段记录](verification-s1b.md)。下文 S1-A 保留为历史批次合同，该批使用 5 / 17；S2-A 为 7 / 19，最新 S2-B 为 8 / 20，真人验收与原作校准待完成。

本节不覆盖下方 S0 历史合同。用户于 2026-09-09 明确批准 S1-A，现已完成代码接入和本地检查 / 导出，真人验收待反馈。结果见 [S1-A 验证记录](verification-s1a.md)。

### S1-A：两种基础作物

选择防风草与花椰菜，是因为它们可复用当前单次、空手收获路径，不依赖架子碰撞、镰刀收获、运气或钓鱼小游戏。全量范围继续按 [研究结论](research/content-xp-2026-09-09.md) 的 S1-B / S1-C / S2 / S3 推进。

本批使用 `parsnip` / `parsnip-seed` 替换 `turnip` / `turnip-seed`；保留 `cauliflower` / `cauliflower-seed`。不保留运行时 alias，也不在加载时把旧物品偷偷转换成新物品。

| 文件（相对 `apps/mirror-island/godot/`） | 拟改内容与调用影响 |
|---|---|
| `data/rules.json` | `initial.version`、`initial.inventory`、`items`、`crops`、`prices`、`requests`、`giftPreferences` 及其他实际 ID 引用；防风草 4 天 / 20 / 35 / 25，花椰菜 12 天 / 80 / 175 / 75 |
| `data/dialogues.json` | 仅同步受影响的萝卜名称及天数说明，保留自定义 NPC 的现有对话链；不声称已对齐原作 NPC 偏好 |
| `data/media.json` | 道具、详情和各主题 `farmCrops` 中的语义键同步；保持已登记 URL、帧和对象内容，标记临时外观，不新增二进制 |
| `persistence/save_codec.gd` | 提升当前开发档版本，避免对旧作物生长状态静默应用新定义 |
| `tools/validate_energy.gd`、`tools/validate_migration.gd` | 仅在检查确实消费旧 ID / 食用恢复 / 版本时定向更新；历史 fixture 不整批重生成，不扩建测试矩阵 |

消费路径：`GameSession._ready()` 加载内容 → `FarmResourceRules.farm/settle_crops()`、`GameSession._shop()` / 食用、`FarmSocialRules`、`FarmStorageRules` → 既有候选验证与保存 → snapshot → 界面和地图。源码当前足以数据驱动这两种作物，不预设要重写这些领域方法。

改名必须枚举所有运行内容引用，不能只替换商店标签。初始种子数量、开局金币、其他四种作物、现有自定义 NPC 偏好数值不随本批调整；这些仍是完整复刻待核对项。原作生长阶段外观、品质、季节枯萎、巨型作物和技能奖励也不算本批已交付。

### 存档与回退

S1-A 已使用封套 3 / 状态 15，取代 S0 的 2 / 14。内容变化改变了旧档中 `cropId` 与 `growthDays` 的解释，旧版本不能继续通过。

只接受新的完整初始状态及同版本恢复，不添加迁移和自动重置；不连接数据库，不改变 Web IndexedDB / Windows 原子文件仓库实现。验收使用隔离开发档。实际玩家槽的原内容必须保留，不以测试便利为由新建覆盖。

回退时一并恢复本批内容定义、ID 引用与 codec 版本；新版本档由旧版本明确拒绝，不能只回退版本号后继续解释新内容。不撤销 S0 或其他既有改动。

### 后续技能状态的设计方向（未批准实施）

保持 GameSession 拥有唯一状态，新增窄的 `domain/skill_rules.gd` 负责有实际调用方的经验与等级计算。先复用既有内容字典、候选副本、验证器和仓库，不引入通用事件总线、独立存储或新依赖；本轮不新增通用工程能力。

- 经验来源由成功劳动入口显式给出，普通物品入包函数、UI 消息和动画不发经验。
- 建议 `skills` 按已接入技能保存 `xp`、`level`、夜间已处理等级及实际职业。XP 是有上限的非负整数，等级必须与阈值一致；经验上限须结合未来精通规则核定，不擅自截断在 15000。第五条 Combat 用同一结构在真实入口出现时接入。
- 一次动作先按动作前等级扣体力，成功改变资源后增加 XP；保存后发布新等级，下一次动作使用新熟练度。整次候选失败不改变经验；重试写原候选，不再触发劳动。
- 同一天越过多个等级时保留每个待处理等级；重复升级确认必须无副作用。具体字段、计数上限与顺序在该批批准前落定，不预建持久化历史事件日志。
- 夜间待确认奖励必须写入状态，不能只存在于当前瞬态 `day_summary`。日结候选先按旧职业结算当日收入，再持久化升级待办；用户确认后在新候选中写入配方 / 职业并移除对应待办。失败保留待办，重开继续同一确认步骤。
- 现有 `unacknowledgedShippingReport` 与后续升级待办共同控制日结期间的移动 / 命令锁。界面只是投影，不能独立发放配方或绕开选择。
- `storage_rules.gd:128` 的制作校验与 `game_ui.gd:518` 的配方列表共同消费实际解锁状态。职业价格、生长、产出等效果必须检查真实消费者；奖励设备未可用时不得把技能全量交付标为完成。

后续 schema、原作各等级奖励表和相关系统依赖尚未收敛，不能据本节直接开始 S2。

---

状态：2026-09-08 用户确认 S0 后进入实施，体力前置已接入；整个技能任务仍未完成。实际验证见 verification-s0.md。

## S0：已确认的实施范围

1. 统一当前基础最大体力、工具耗能及恢复计算的规则来源，去除 UI、食用、日结与存档校验中的重复常量。
2. 允许并完整保存小数体力，界面只负责显示取整，不能把取整结果写回状态。
3. 对齐当前可达的基础锄地、砍树、采石、单格浇水和抛竿耗能；浇水水量与耗能分开计算。
4. 修正当前可达的正常睡眠/晚睡恢复，使其使用统一体力上限与精度，避免降低仍较高的睡前余量。
5. 同步 HUD、食用入口和隔夜报告；保持关键候选只保存一次、失败重试同一候选。

这是技能系统的前置批次，不是完整技能或完整体力系统。疲劳/负体力、昏倒、星之果实、临时加成、技能升级恢复特例及合作恢复等仍要继续实现，不能因 S0 完成而移出第一阶段。

## 文件与调用链

`game_session.gd` → 体力规则 → `resource_rules.gd` / `fishing_rules.gd` → 候选保存 → `save_codec.gd` → `game_ui.gd`。

预计生产范围为新增 `godot/domain/energy_rules.gd`，以及 `game_session.gd`、`resource_rules.gd`、`fishing_rules.gd`、`godot/data/rules.json`、`godot/persistence/save_codec.gd`、`godot/ui/game_ui.gd`。体力上限与基准耗能由一个规则来源提供，UI 不再硬编码 100；仅增加实际调用需要的方法，不预建无调用方职业或加成框架。

现有水壶 Lv2 的区域作用、容量和升级方式属于独立对齐缺口，S0 不把它自动等同铜级；其具体耗能与水量偏差须在编码前列明，不能宣称完整水壶机制已复刻。

本批约定并采用：保留 Lv2 最多三格和原容量，每个实际浇水格扣 1 水、2 体力，可浇数量取地块、水量和体力预算的最小值。这个中间规则不等于原作铜级蓄力；无效或余额不足操作仍不扣费，负体力与失败挥空耗能后续再对齐。

## 存档边界

体力数值合同变化需要提升开发存档版本并同步完整初始状态和校验。不迁移、覆盖或清理旧开发存档；旧版本继续明确拒绝，验收使用新的隔离开发档。无需数据库或 SQL migration。

本批采用封套 2、状态 14。`rules.json` 的 `sourceVersion: 13` 仍记录旧迁移来源，不作为当前状态版本；存储位置名称保持原样，只升级内容合同。

## 后续技能批次

在内容映射和前置规则明确后接入 XP/等级与即时熟练度，再接日结升级记录、真实配方和职业效果。分批是实施顺序，不缩减父 PRD 的最终要求；不为尚未可用的生产系统展示可点击的假解锁。

## 验证与回退

后台验证小数体力往返、相应动作的一次扣费、失败不扣费、不同水量/体力预算、晚睡恢复及 HUD 数值。仅定向更新因已批准规则变化而失效的基线期望，不重新生成全部期望来掩盖回归。最后执行 Godot 检查及相关本地导出。

回退必须同时恢复规则、初始状态和校验版本，不对玩家存档做回填；已接入的工具素材、动作与界面优化不回退。
