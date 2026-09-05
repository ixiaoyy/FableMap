# 技能与配方解锁 v1

## Goal

先为已有种田、采集、钓鱼和采矿建立可恢复的经验等级、配方解锁、熟练度与 5/10 级职业选择，并建立可由后续战斗 child 接入第五条 Combat skill 的同一合同。

## Background

- 当前成功劳动会改变物品、资源或农田，但 GameState 没有 skill XP/level，制作 catalog 也只有一个木斧配方。
- 当前体力成本固定；参考作品的对应技能会同时解锁配方并提高相关工具熟练度，因此两条效果都要进入 child 设计，不能只保留方便实现的一半。

## Requirements

- 本 child 先交付 farming、foraging、fishing、mining 四条已有劳动技能，每条使用 0–10 级；后续 `full-mine-combat-v1` 以同一 schema 接入第五条 Combat，不另建成长系统。child 必须先建立精确 action→XP 表：Farming 主要来自收获与照料动物，不把锄地/浇水泛化为 XP；Foraging 来自地面采集与砍树；Fishing 来自成功捕获；Mining 来自破坏石块/矿点。
- 等级与累计 XP 写入 current save；同一 impact、重试、刷新、失败动作或表现动画不能重复授予。
- 普通等级解锁对应配方；5级与10级分别提供两段式职业选择，名称与收益必须原创，但结构和分支依赖按参考机制规划。
- 等级提高对应工具熟练度/体力效率；内部精度、显示取整和现有整数 stamina 的改造必须在 design 中明确，不能凭感觉改公式。
- XP 达阈值后的 level/熟练度按参考时点立即生效；新配方提示与 5/10 级职业选择在睡眠保存成功后的升级界面生效。两个时点必须分开验证，不能全部推迟或全部即时。

## Acceptance Criteria

- [ ] 精确 action→XP 表与参考一致：收获/照料、采集/砍树、成功捕鱼、破坏石块/矿点分别只增加对应 XP；失败、锄地/浇水、错误工具和重放保持不变。
- [ ] 等级、XP 与已解锁配方在 current save 刷新/继续后保持，日结失败不提前展示或写入升级。
- [ ] 等级配方、熟练度与 5/10 级职业选择均由 domain/current save 持有，不由 Day 或 Vue 硬编码。

## Reference Facts

- [Skills](https://stardewvalleywiki.com/Skills)：五类技能均为 0–10 级；本 child 先覆盖当前可玩的四类，Combat 在后续完整矿洞 child 交付。各技能有精确 XP 来源和工具熟练度，普通等级解锁配方，5级与10级选择职业。

## Out of Scope

- 本 child 内的 Combat（已由 `full-mine-combat-v1` 承接）、Luck、专精重置、技能书、Mastery 与参考作品以外的复杂数值加成。
