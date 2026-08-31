# 实施计划

1. 增加纯 calendar module 与 Day 1/28/29/112/113 合同，接入 sleep Spring 28 内容门禁。
2. 升级 v7 GameState/StoredGame，完成 v6 通用 crop progress 与 daily forage 迁移。
3. 建立 crop catalog、六个 seed/crop item、春季季节校验与多商品 ShopSystem/UI。
4. 为三种春季作物登记现有 VectoRaith growth/mature frames，并泛化 FarmPlot projection。
5. 在四张户外地图增加 ForageSpawns，实施确定性每日出现、空手采集、背包满和出售。
6. 精修 LifeHud 日期与 CalendarPanel，接入 modal lock、Escape、焦点和响应式。
7. 同步 `.trellis/spec`、PRODUCT_BRIEF、WHAT_NOT_TO_BUILD、TOWN_ROADMAP、素材记录/manifest（仅当新增运行时对象确实需要）。
8. 最小检查：calendar/farming/save/Town 窄合同、typecheck、client build；不跑数据库、身份或全量 E2E。
