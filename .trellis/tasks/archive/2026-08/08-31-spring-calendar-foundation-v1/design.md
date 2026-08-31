# 春季玩法与日历底座 v1：技术设计

## 1. Calendar ownership

- 新建 `domain/calendar/game-calendar.ts`，拥有 `Season`、`Weekday`、28天季长与纯 `calendarAt(absoluteDay)`。
- `GameState.day` 继续是唯一持久日期源；year/season/dayOfSeason/weekday 全部按绝对 Day 推导，不写入 save。
- Spring 1 Year 1=Monday；每28天换季、每112天换年。纯函数支持任意安全正整数 Day。
- GameSession sleep 在当前可玩边界 Spring 28 返回 `season-content-limit`，不结算作物、不增加 day；夏季任务完成后只移除该 runtime gate。

```typescript
type Season = "spring" | "summer" | "fall" | "winter";
type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface GameCalendarDate {
  readonly absoluteDay: number;
  readonly year: number;
  readonly season: Season;
  readonly dayOfSeason: number;
  readonly weekday: Weekday;
}
```

## 2. Crop and economy catalog

- 新建 `domain/farming/crops.ts`，成为 seed→crop、允许季节、growthDays、买入/卖出价格的唯一 owner。
- Item catalog 增加小白菜/花椰菜的 seed/crop，以及野花/春笋；工具和现有 stable ID 不变。
- FarmTile v7 把固定 `cropId: turnip|""` 泛化为 CropId，并把旧 `growthStage` 明确迁移为 `growthDays`；视觉 stage 由 progress/growthDays 投影，不把 frame 写入 domain。
- FarmingSystem 根据 crop definition 校验季节、消费种子、累积 watered sleep；成熟时背包原子加入对应 crop。
- ShopSystem/commands/ShopPanel 泛化为当前季节 seed 列表与可出售 crop/forage 列表，仍保持 quantity=1 的窄原子命令。

## 3. Spring forage

- 扩展 Tiled outdoor catalog，新增可选 `ForageSpawns` object layer；只在 Farm/Town/Foothills/Lakeshore放置 stable candidate IDs 和 forage item ID。
- `ForageSystem` 以 `absoluteDay + stable ID` 的固定整数 hash 决定当日出现集合；同一存档/日期刷新结果相同，不依赖 `Math.random()`。
- GameState v7 保存 `{ day, collectedIds }`；day 不同则 collected 集合视为空。候选位置继续属于 Tiled，save 不保存坐标。
- 空手点击近距离 forage 执行 typed command；背包满不收集、不标记，成功后原子入包并记录 ID。
- EntityFactory 使用已登记 VectoRaith atlas frame 显示野花/春笋，不新增图片文件。

## 4. Save v7 migration

- `GAME_STATE_VERSION`/`SAVE_FORMAT_VERSION` 升为7；新增 forage daily state，并泛化 FarmTile crop/progress。
- v6 decoder 完整验证旧字段后：turnip crop 原样映射，`growthStage→growthDays`，forage state 设为当前 day + empty IDs。
- v1–v5 继续沿既有显式迁移链直接产出合法 v7；不恢复任何 retired localStorage 字段。
- IndexedDB DB/store/owner/slot 与 v2 backup 行为不变，不增加数据库 migration。

## 5. Calendar UI

- LifeHud 使用 calendar projection 显示 `第1年 · 春 1日 · 周一 · 06:00`，日期区域为 button。
- 新建 `CalendarPanel.vue`：7列×4行、当前日高亮、过去日弱化、28日季末标识；event slots 为 typed empty projection，不伪造生日/节日。
- calendarOpen 属于 game-store transient modal；纳入 `isWorldInputLocked()`，Escape/关闭恢复 world focus，不写入 save。
- CSS 延续现有木框/纸张像素 UI，并覆盖宽屏、640px、窄手机和200% zoom。

## 6. Media and open-source decision

- 本阶段仍只使用已发布的春季 terrain 与现有 crops/details 图集；夏秋冬 terrain 归档仅登记为后续候选，不提前发布或运行。
- 调研的现实日期/日历 UI 库与 Foundry 日历模块不适合四季28天的 GameSession 领域规则；采用零依赖纯函数，退出成本为单文件删除。

## 7. Rollback boundaries

- 日历、crop catalog、forage、save migration、Vue panel 分层提交；若 forage 地图点视觉未通过，可保留 calendar/crops 并单独撤回 forage maps/system。
- 不修改 PostgreSQL、Prisma、Keycloak、服务端或现有 map region/exit stable IDs。
