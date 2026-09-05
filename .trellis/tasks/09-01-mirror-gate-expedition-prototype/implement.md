# 镜门远征 Prototype：实施拆分草案

> **已否决（2026-09-04）**：历史只读，不得启动或换名执行。

## Recommended Child Tasks

1. `expedition-domain-v9`
   - v8→v9 home progress、runtime ExpeditionRun、Cargo commit/discard、敌人/事件/capture closed reducers。
   - 验证 migration、Home Inventory 字节等价、容量不足、重复 extraction、刷新 discard。
2. `expedition-fixed-map-client`
   - 一张固定 TMJ、A/B/撤离点、Lakeshore 镜门入口、两敌人表现、输入/动作/HUD。
   - 不建设随机地图、ECS、装备或通用 AI。
3. `expedition-capture-event-integration`
   - 首只灵兽、run-only 灵契、三选一事件、高价值宝箱、家园可见投影。
   - 不建设概率、属性、养成、遗物库或农场自动化。
4. `expedition-human-gate`
   - 3～5 局、5–8 分钟、风险犹豫、撤离理解、刷新/失败、手机/键盘/console 和 checkpoint。

## Implementation Order

1. 用户评审本 PRD/design 并明确批准实施。
2. 开源素材与许可研究；确认地图/敌人/灵兽的正式来源和 CDN 方案。
3. 创建并评审一次 v9 schema/migration 影响说明；不直接手写 migration 文件。
4. 先完成纯 domain run/cargo/extraction/capture/event 合同，再接 Phaser。
5. 制作一张固定地图与两敌人表现；区域 A 先成立，再开放 B。
6. 接入 Day7 镜门、结算丢弃 UI、家园首只灵兽投影。
7. 运行最小 typecheck/build/窄合同，发布媒体并执行真人 3～5 局 gate。

## Minimum Verification

- v8→v9、unknown companion、未来 version、home checkpoint 与 refresh discard。
- Home Inventory 在 failure/abandon 逐字节等价；成功 extract 恰好提交一次。
- Cargo capacity 不足不会部分写入；丢弃后可重试。
- 近战/远程、精英复用、capture threshold、三 choice closed reducer。
- Day1–6 仍是预告；Day7+ 才可进入；回家/刷新/继续状态正确。
- typecheck、client build、Git 媒体二进制为零；真人 3～5 局反馈。

## Stop Conditions

- 为实现 MVP 需要第二套 ECS、通用事件 DSL、装备/技能树、随机地图或服务端状态时，退回计划重切范围。
- 3～5 局没有出现风险犹豫或重开意愿时，不增加内容数量，优先重做 A/B 收益与撤离决策。
