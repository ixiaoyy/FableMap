# 春季玩法与日历底座 v1

## Goal

把当前无限递增的 `Day N` 扩展为可长期承载春夏秋冬的游戏日历，并把春季从“只有一种萝卜的三日循环”完善为有作物选择、时间规划和季节边界的第一段完整生活内容。

## Background

- 当前 GameState v6 只持久化绝对 `day` 与 `minuteOfDay`；睡觉执行 `day + 1` 并回到06:00。
- 当前只有萝卜种子/萝卜，一种固定三次浇水成长，Seed Shop 只有单商品买卖。
- 正式运行只登记 VectoRaith 春季 terrain；本地官方归档已有夏/秋/冬 terrain、冬季 buildings、四季 modular details，以及春夏秋 crop sheets。
- 《星露谷》采用春夏秋冬四季、每季28天，季末处理不适季作物；本项目参考这一节奏，但不复制节日、技能或完整经济数值。
- 检索到的 TypeScript calendar 包主要服务现实日期 UI 或 FoundryVTT，体积和抽象都高于当前四季规则；本任务采用现有 GameSession/纯 domain 薄层，不新增日历依赖。

## Requirements

### Calendar foundation

- 固定四季顺序 `spring → summer → fall → winter`，每季28天，四季后进入下一年。
- 保留现有绝对 `day` 作为唯一持久时间源；`year/season/dayOfSeason/weekday` 由纯 `calendarAt(day)` 推导，避免冗余字段漂移。
- Year 1 Spring 1 固定为星期一；星期只用于 HUD 与未来营业/生日基础，本批不改变 NPC schedule。
- 睡觉仍是唯一推进日期的玩法入口；暂停、现实时间、刷新等待和24:00冻结均不能跨日。
- `calendarAt(day)` 和日期推进纯规则完整支持四季/年份；当前 GameSession 在 Spring 28 日结时返回明确内容边界，不写入 Summer 1，待夏季玩法完成后解除。
- LifeHud 显示年份、季节、日期、星期和当前时间；桌面/移动端保持可读。
- 点击日期区域打开28天月历面板：星期一至星期日七列、当前日高亮、过去日弱化、Spring 28 标记季末；预留事件槽但不显示未实现节日/生日。
- 月历面板属于 transient UI，打开时统一暂停世界时间/输入，Escape 或关闭后恢复，不进入存档。

### Spring gameplay

- 建立单一 crop catalog，固定提供三种单次收获春季作物：萝卜（3次有效浇水，种子20g/出售35g）、小白菜（5次，45g/80g）、花椰菜（8次，80g/170g）。
- Seed Shop 根据当前季节展示可购买种子；春季不再只有单商品。
- 播种 command 根据 seed → crop definition 校验季节与背包，FarmingSystem 不硬编码萝卜。
- FarmTile 保存通用 crop ID 与成长进度；不同作物均由浇水+睡觉推进，不使用 wall-clock。
- 春季作物在季节边界按统一规则处理；肥料、品质、连续收获、巨型作物和温室继续延期。
- 视觉继续直接使用已登记/评审的 VectoRaith crop sheet frame，不提交图片二进制。

### Spring forage

- 新增野花与春笋两种春季采集物，复用现有 VectoRaith 图集帧并进入通用 item catalog。
- Farm、Town、Foothills、Lakeshore 增加固定候选采集点；每个绝对 Day 以确定性规则选出当日出现点，不使用随机运行时种子。
- 玩家近距离点击采集，物品加入背包后该点当天耗尽；背包满时保持在地图上。
- v7 保存当日已采集 stable point ID，刷新/继续不复活；睡觉进入下一天后自然生成新一批。
- 野花与春笋可出售；送礼、委托和食谱用途继续由后续任务接入。

### Compatibility

- 日历本身由绝对 day 推导，不需要单独保存 year/season/dayOfSeason。
- 多作物与每日采集通用状态使用一次 StoredGame v6→v7 升级；旧 v6 萝卜进度、好感、角色外观和位置必须完整迁移。
- 不连接数据库，不创建 Prisma migration，不增加账号或服务端日历。

## Acceptance Criteria

- [x] Day 1/28/29/112/113 正确解析为 Year、Season、日序和星期，睡觉只推进一天。
- [ ] HUD 在宽屏、手机和200% zoom下清晰显示春季日期与时间。
- [ ] 28天月历面板可通过键盘、鼠标和触屏打开/关闭，modal 锁与焦点恢复正确。
- [x] 春季至少三种作物形成明显不同的投入、成长周期和出售回报。
- [x] 商店只展示当前季节允许的种子，错误季节播种不扣物品、不改变农田。
- [x] 春季野花/春笋每天确定性刷新，采集、背包满、刷新恢复和次日重生正确。
- [x] 浇水、日结、成熟、收获、背包满和买卖保持原子性。
- [x] v6 存档迁移后现有萝卜和其他进度不丢失，当前版本重复解码幂等。
- [x] 无新数据库、账号、图片二进制或大规模测试矩阵。

## Out of Scope

- 天气、雨天自动浇水、节日、生日、工作日营业变化和 NPC 季节日程。
- 作物品质、肥料、体力、技能、稻草人、虫害、温室和食谱。
- 一次性完成夏秋冬的完整作物、采集物、节日与居民内容。

## Deferred Task

- NPC 送礼 MVP 已完成初步 PRD，但按用户最新决定暂缓，待春季/日历底座稳定后恢复。
