# 实施计划

## Gate 0 — prerequisites and research

1. 记录用户于 2026-08-25 对 `docs/checkpoints/farm-showcase-v1/manual-acceptance.md` 的完整通过确认。
2. 记录 TypeScript calendar/economy/state-machine 开源候选评估；本轮拒绝 XState、date-fns 与 Dinero.js，保持最小纯 TypeScript domain。
3. 冻结 Farm Showcase、Town 美术、Tauri/Steam、NPC 日程和天气等 out-of-scope。

## Domain and save v3

4. 更新 Item IDs/definitions：单一 `turnip-seed`、`turnip`；搜索所有 alien placeholder consumer 后统一迁移。
5. GameState 升级 v3：day、gold、FarmTile day-growth 字段；更新 create/clone/decode/reconcile。
6. 实现 `Day N` projection 与原子睡觉 day settlement；替换 FarmingSystem wall-clock `readyAt/tick`，不实现 Season/Clock。
7. 实现 v2→v3 migration，覆盖 inventory、FarmTile、day/gold；保留损坏/future failure behavior。
8. 实现固定单商品 ShopSystem，复用 InventorySystem 完整容量/原子 consume/add。
9. 扩展 typed commands/result feedback：sleep、buy-item、sell-item；GameSession critical save 仍只有一个 owner。

## Map and client projection

10. 用 Tiled 给 Cottage 增加唯一 stable `cottage-bed` interaction，保持其他 object IDs 与 Collision。
11. 扩展集中 Tiled decoder/InteractionDefinition closed kind，不在 WorldScene 读取 raw properties。
12. WorldScene E 输入接入 bed sleep 与 Seed Keeper shop open；不增加 NPC 日程或新 Town 内容。
13. 新增 Vue ShopPanel 与 day/gold HUD projection；价格和交易规则不进入 Vue，面板打开期间锁定 Phaser 世界输入。
14. 更新 FarmPlot visual projection 支持 0–3 growth stage，继续只消费 snapshot。

## Verification and review

15. 运行针对 v2→v3 幂等 migration、day、sleep settlement、watered growth、buy/sell 原子性的窄确定性检查。
16. 运行 `npm --prefix .\apps\mirror-island run typecheck` 与 `build:client`；不扩建大测试矩阵。
17. 真实浏览器完成：买种子 → Farm 种/浇 → Cottage 睡三次 → 收获 → Seed Shop 出售 → 再买 → 刷新继续。
18. 核对 Git 图片二进制新增为零、无数据库 migration、无 Tauri/Steam/Town 美术变更。

## Rollback points

- Gate 0 未通过：不写代码。
- Domain/save v3 未通过 migration review：不接 UI/TMJ。
- Client loop 未通过：保留 v3 reader 和原记录，使用 forward-fix；禁止降级覆盖。

## Start gate

用户已提供 Farm Showcase 真实人工验收通过结果，并于 2026-08-25 明确要求“下一步现在就执行 Stardew Life Loop 第一批”；PRD/design/implement 对齐最新合同后允许运行 `task.py start`。
