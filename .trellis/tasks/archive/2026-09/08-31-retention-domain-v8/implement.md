# 首周留存 Domain v8：执行计划

1. 搜索并冻结所有 `GAME_STATE_VERSION`、`SAVE_FORMAT_VERSION`、24-slot decoder、calendarAt、talk-to-npc 和 dialogue lookup 消费者。
2. 新增 requests/progression/relationship/dialogue 的窄定义与系统，所有方法/helper 添加方法级注释。
3. 扩展 GameState v8 create/clone/decode/reconcile；新增唯一 v7 migration，保持 v1–v6 现有迁移链。
4. 扩展 SaveRepository v8 decoder，更新 released fixtures 与未来版本失败断言。
5. 实现 upgrade commands、24→32、900g+15 wood Lv2 和原子失败结果。
6. 实现 facing-aware 最多三格浇水并保持 Lv1/旧调用单格语义。
7. 实现八条 deterministic DailyRequest、Day2 初始化、睡眠刷新、对应 NPC 一次性提交与奖励上限。
8. 把 dialogue definitions 移到 domain，接入稳定 variant IDs、三日 history、stage acknowledgement 和 closed event IDs。
9. 把当前 gameplay calendar 切到无上限 Day N/spring-content，删除 Spring28 睡眠阻塞。
10. 更新现有 life-loop/town 窄合同，新增 v7→v8、upgrade、request、dialogue history、Day28→29 断言；不扩大 E2E 矩阵。
11. 运行 `test:life-loop`、`test:town-population`、typecheck；生产文件通过后立即精确暂存，避免并行任务污染。

风险：`game-state.ts` decoder 不能接受同 version 可选字段；inventory capacity 与数组长度必须一处校验；对话 UI 迁移先保持现有内容等价；Day N 临时合同不得偷偷承诺 Summer。

## Validation record — 2026-09-01

- `5ba02128 feat: add retention gameplay state v8`：26 files，单次 v7→v8，未增加数据库或 migration。
- `test:life-loop` 14/14：v1–v7→v8、current decode 幂等、unknown request/event/capacity mismatch 失败、24→32、900g+15 wood、Lv2 三格浇水、Day2 委托、Day4 250 点、三日对话 ID 去重、两心事件 once-only、Day28→29。
- `test:town-population` 9/9；typecheck、build:client 通过，保留既有 >500 kB bundle warning。
- Domain 保存和选择稳定 dialogue ID；client 继续拥有中文 presentation text。该分层避免把文本写入存档，同时保持候选/历史/优先级只有一个 domain owner。
- Seed Keeper 两心事件在 shop 状态时强制使用完整 Dialogue modal，不被 Shop welcome 截成第一句。
- 当前 gameplay crop/shop/forage 使用 `playableCalendarAt` 的无上限 spring-content；未来四季 `calendarAt` 仅保留为未启用日历工具。
