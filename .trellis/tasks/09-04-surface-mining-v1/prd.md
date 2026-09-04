# 地表采矿与镰刀 v1

## Goal

补齐《星露谷物语》式开局工具组，并提供两个完整但克制的地表资源循环：新游戏自带基础镐与基础镰刀，玩家可在 Farm、Foothills 和 Lakeshore 采石、清除杂草并获得石料或植物纤维，地表资源每日有限补充。

## Background

- 当前地图已登记 7 个 stable stone resource：Farm 1 个、Foothills 4 个、Lakeshore 2 个。
- 地表采矿已在工作区实现：`RockEntity`、`MiningSystem`、石料、开局第四槽基础镐和 Foothills 日结补充已通过最小自动检查，完整真人验收尚未签署。
- 镰刀扩展前的 closed item catalog 没有镰刀或植物纤维，三张地表地图的 `ResourceSpawns` 也没有 grass/weed 候选点，因此本次不能只增加第五个背包图标。
- 已有 `use-item-on-target`、Facing、ActionTimeline、确定性 `stableHash()`、资源投影和植被音效链可复用。
- 用户确认首版仍只扩展地表玩法，暂不开放 Foothills 矿口；开发阶段不迁移或兼容此前本地玩法存档。

## Requirements

### R1 — 基础工具与物品

- closed item catalog 包含基础镐、基础镰刀、石料与植物纤维；新游戏把基础镐和基础镰刀固定放入第四、第五个起始背包槽，默认仍为空手。
- 两件工具均为永久工具且堆叠上限 1；石料与植物纤维为可堆叠资源，堆叠上限 99，并可按低价值资源出售。
- 工具和资源必须在 Hotbar、背包、手持与反馈中可辨识；优先复用已登记原图，缺少清晰帧时使用源码定义的原创 16×16 小图形，不新增图片二进制。

### R2 — 采石规则

- 只有玩家背包持有并选中基础镐时，才能对 42px 内、当前区域、phase=`standing` 的 stone resource 生效。
- 每个普通石块一次有效 impact 清除，消耗 2 点体力并原子增加 1 份石料；ActionTimeline 的 windup/recovery 不重复调用规则。
- 背包无法完整接收石料、体力不足、距离过远、目标不存在、目标已清除或工具错误时，不清除石块、不扣体力、不增加物品。
- 成功采石播放既有 stone SFX、短震动与碎屑反馈；错误工具可以保留轻微敲击反馈，但不得播放成功碎裂或掉落。

### R3 — 地表石块生命周期

- 7 个现有 stone resource 全部可采；不新增任意坐标或程序生成石块。
- Farm 与 Lakeshore 的石块清除后永久保持 cleared，形成可见的整理结果。
- 每次成功睡眠进入新一天时，Foothills 从四个固定 stone resource 中对 cleared 候选按 `worldSeed + 新 absolute day + stable entity ID` 确定性排序，恢复最多两个为 standing。
- 已 standing 的 Foothills 石块不占“最多两个恢复”名额；同一新日重复结算、刷新或继续游戏不能改变恢复结果。

### R4 — 状态与边界

- domain 拥有 stone/weed phase、体力、掉落和再生；Tiled 只拥有候选点，Phaser/Vue 只发送 typed command 并渲染 snapshot。
- 本子任务采用 current v12 本地 save 形态并从全新游戏验收；不增加旧版 decoder、migration、backup、回填或补发工具路径。
- 不连接服务端、PostgreSQL、Keycloak 或论坛，也不修改 SQL schema/migration。

### R5 — 镰刀除草规则

- 在 Farm、Foothills、Lakeshore 分别登记 6、5、4 个 stable weed resource；新游戏全部为 standing，固定点不得落在 Collision、水面、出口、门口或 NPC 日程落点。
- 只有玩家背包持有并选中基础镰刀时，才能以当前 Facing 对 42px 内的前方杂草生效；一次挥割按距离和 stable ID 选择最多三个 standing weed，不由客户端决定命中或掉落。
- 镰刀不消耗体力；每株清除的杂草按 `worldSeed + absolute day + stable entity ID` 固定判定 50% 获得 1 植物纤维，刷新或重试不得重抽。
- 命中的全部杂草与本次纤维总量作为一个原子动作：背包不能完整接收时不清除任何杂草；零纤维结果仍可成功清除。
- Farm 的 standing weed 阻止对应格耕作；已耕种格永不参与杂草恢复。每天进入新日后，Farm、Foothills、Lakeshore 分别最多恢复 1、2、1 个 cleared weed，按稳定 hash 排序且同日幂等。

### R6 — 镰刀表现与输入

- 鼠标/触摸点击杂草会先面向目标，键盘 C/触摸动作键使用当前 Facing；两条路径共用一次 ActionTimeline impact 和同一个 domain command。
- 成功挥割播放一次短弧线、叶片碎屑与既有植被音效，并在动画结束后投影 cleared；错误工具只能给轻微提示，不产生成功碎屑、资源或保存。
- 切图、连续输入、Scene teardown 与刷新不能残留挥割 tween、杂草影像或重复 mutation。

## Acceptance Criteria

- [x] 全新游戏第四个背包槽为基础镐，Hotbar/背包/手持图形可辨识且没有新增 Git 图片二进制。
- [x] 七个现有石块均可用镐一次清除并得到 1 石料、扣 2 体力；所有失败分支保持背包、体力与石块 phase 原子不变。
- [x] Farm/Lakeshore cleared 状态在 current save 刷新后保持；Foothills 每次日结最多恢复两个 cleared 点且同日结果确定。
- [x] 成功采石只有一次 domain mutation、一次 stone cue 和一次成功表现；连续输入、切图或 Scene teardown 不残留动作或石块影像。
- [x] 全新游戏第五个背包槽为基础镰刀；三张地图恰有 6/5/4 个 stable weed，图标、手持和世界杂草清晰可辨且不新增媒体二进制。
- [x] 一次镰刀挥割最多清除三个前方杂草、不扣体力；每株的 50% 植物纤维结果固定，错误工具、距离、方向和背包满均保持原子不变。
- [x] 每日 weed 恢复遵守 Farm/Foothills/Lakeshore 最多 1/2/1、跳过耕种格且同日幂等；current v12 刷新/继续后保持，v1–v11 明确 unsupported。
- [x] 采石与除草均只有一次 domain mutation、一次对应 cue 和一次成功表现；连续输入、切图或 Scene teardown 不残留动作或资源影像。
- [ ] 类型检查、相关采集/日结合同和客户端构建通过；真人可用键盘、鼠标、触摸与 200% zoom 完成采石、挥割、刷新和次日资源恢复。

## Out of Scope

- 矿洞、地下地图、楼层、梯子、电梯或程序生成。
- 铜铁金等矿石、煤、宝石、晶洞、冶炼、熔炉、炸弹或矿物收藏。
- 敌人、生命值、战斗、采矿技能、镐升级、蓄力或大石障碍。
- 干草、筒仓、动物、草地蔓延、混合种子、镰刀战斗、镰刀收获作物或镰刀升级。
- 新地图、第三方运行时依赖、数据库和旧玩法存档兼容。
