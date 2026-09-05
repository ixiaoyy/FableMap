# 《星露谷物语》日常玩法参考

核对日期：2026-09-02

## 使用边界

- 本记录只提炼公开玩法规则，作为镜像岛已批准日常机制的行为参照。
- 镜像岛不复制品牌、角色、地图、UI、文本、音乐、素材、节庆或剧情。
- 用户最新明确决定与镜像岛现有 GameSession/IndexedDB/Tiled 合同优先；参考游戏不会自动扩大 Spring v1 范围。

## 参考规则与镜像岛采用

| 主题 | 公开参考 | Spring v1 采用 |
|---|---|---|
| 日周期 | [Day Cycle](https://stardewvalleywiki.com/Day_Cycle)：06:00 开始，午夜提示疲惫，02:00 昏倒；屋外昏倒损失 10% Gold、上限 1000，时间昏倒不丢物品 | 采用同类日程、提醒、昏倒与 Gold 处罚；Cottage 内无 Gold 处罚 |
| 体力与晚睡 | [Energy](https://stardewvalleywiki.com/Energy)：工具消耗体力，食物和睡眠恢复；午夜后睡眠恢复逐步降低 | 采用基础体力和单调晚睡恢复；不加入健康、Buff、疾病或技能减耗 |
| 自由耕作 | [Hoes](https://stardewvalleywiki.com/Hoes)、[Crops](https://stardewvalleywiki.com/Crops)：在可耕土壤逐瓦片开垦、播种和浇水 | Farm 由 Tiled 声明 tillable 瓦片，GameSession 按坐标动态保存农田；不限制为固定 8/35 个交互对象 |
| 浇水 | [Watering Cans](https://stardewvalleywiki.com/Watering_Cans)：水壶有容量、需在水源补充，雨天室外作物不需人工浇水 | 采用可见水量、地图水源补充、Lv2 三格浇水与雨天自动浇水 |
| 树木 | [Trees](https://stardewvalleywiki.com/Trees)：砍树留下树桩，野外树在清桩后可重新生长 | 采用树桩与 Farm 外固定点再生；为控制范围，不做树种、自由种树或完整树苗阶段 |
| 送礼 | [Friendship](https://stardewvalleywiki.com/Friendship)：普通居民每人每天一份、每周两份，无全镇总限制 | 采用单居民限制与喜欢/普通/不喜欢；生日、配偶和特殊礼物例外不在本版本 |
| 钓鱼 | [Fishing](https://stardewvalleywiki.com/Fishing)：鱼获受地点、时段、天气影响，并有可失败的操作过程 | 保留条件与失败风险，改用原创“抛竿＋浮漂张力”单输入交互，不复制垂直追鱼条 |

## 明确不随参考游戏进入本版本

- 剧情、镜门伏笔、生日、节庆、公共活动、心事件和月度工程。
- Summer/Fall/Winter、采矿、战斗、畜牧、烹饪、完整技能/职业树。
- 作物/采集/鱼类品质、肥料、洒水器、乌鸦/稻草人。
- 鱼饵、浮标、钓竿等级、鱼类品质和钓鱼技能树。
