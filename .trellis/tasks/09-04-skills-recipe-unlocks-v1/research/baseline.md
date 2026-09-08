# 技能前置研究

本文件的代码差异描述记录 S0 实施前状态；当前实现与验证以 [S0 验证记录](../verification-s0.md) 为准。

核对日期：2026-09-08。下列网页是当日可访问的维护页面，不伪称已经取得 1.6.15 的完整源码或固定历史快照。实施时需继续核对版本相关分支。

## 已确认的参考事实

- 技能总经验阈值依次为 100、380、770、1300、2150、3300、4800、6900、10000、15000。等级与熟练度立即生效，配方和职业奖励在夜间升级界面处理；职业价格加成不能追溯到当日已投入的出货。基础工具每级节省 0.1 体力，必须保留小数；基础浇水耗能 2，抛竿耗能 8。见 [Skills](https://stardewvalleywiki.com/Skills)。
- 开局最大体力为 270；睡眠恢复受晚睡与疲劳影响，正常情况下不应因晚睡把仍较高的现有体力强行降低。升级后的次日有恢复特例。疲劳、负体力和昏倒是需要后续完整接入的分支。见 [Energy](https://stardewvalleywiki.com/Energy)。
- 防风草需要 4 天生长，基础收获经验为 8；花椰菜需要 12 天、基础售价 175、收获经验 23。当前萝卜和花椰菜数据不能直接当作已经对齐。见 [Parsnip](https://stardewvalleywiki.com/Parsnip)、[Cauliflower](https://stardewvalleywiki.com/Cauliflower)。
- 原作基础水壶容量 40，铜/钢/金/铱为 55/70/85/100；当前项目的 20/40 两档不是这一合同。见 [Watering Cans](https://stardewvalleywiki.com/Watering_Cans)。
- Farming 主要来自收获和动物照料，不能给锄地和浇水普遍加 XP；Foraging、Fishing、Mining 各有具体来源，当前自定义内容需要先建立对应关系。见 [Farming](https://stardewvalleywiki.com/Farming)、[Foraging](https://stardewvalleywiki.com/Foraging)、[Fishing](https://stardewvalleywiki.com/Fishing)、[Mining](https://stardewvalleywiki.com/Mining)。

## 当前调用链与问题

- `game_session.gd` 先复制候选，再调用资源或钓鱼规则，保存成功后发布。经验必须在同一候选内结算，不能由动画、UI 或成功消息另外补发。
- `resource_rules.gd` 把浇水水量和体力都按可浇格数扣除；引入熟练度时不能继续把两者混为同一预算。
- `fishing_rules.gd` 的鱼只有自定义 `pull`，没有原作捕获难度、品质、完美捕获等数据，不能随意代入原作经验公式。
- `save_codec.gd` 拒绝小数体力，`game_session.gd` 的食用和晚睡恢复把体力转换成整数；只修改耗能公式会在保存或恢复时丢失精度。
- 现有配方包括默认木斧和普通箱。大量技能奖励所需的设备、肥料、鱼饵与烹饪系统尚未形成真实消费路径。

结论：先完成体力精度和当前可达基础规则的前置批次；技能任务的经验、配方、职业最终范围不删减。新角色/作物/鱼种映射和依赖系统要继续补齐，不能用虚假的解锁界面代替完成。
