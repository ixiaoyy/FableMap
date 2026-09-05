# Life Loop v1 Checkpoint

> 历史基线：本 checkpoint 保留发布时的账号与 v2/v3 存档验收证据。当前公开入口为无账号本地试玩，当前 save schema 为 v7；判断现状请先读取 `docs/CURRENT_STATE.md`。

## Status

- 名称：`Life Loop v1 Checkpoint`
- 本地完整真人验收：通过（2026-08-25）
- 原生产部署 commit：`7414986a71508f438ecda1c94da29562327a0f06`；历史重写后等价 commit：`55360a6ccf746fbbcd35a28f7ac15818122d8d1b`
- 原最终生产验收基线：`37c51953f426febbbe49506a30a6527ecabfaf91`；历史重写后等价 commit：`4ec3e152bfb3d3326a62d25dd3dd8c1309561a58`（包含已通过的 Town Gate C）
- 原部署 GitHub Actions run：`32827316974`，成功；该 run 保留 rewrite 前 head SHA 作为历史事实
- 公网健康：通过；首页、Life Loop/v2 backup bundle、Cottage bed、VectoRaith atlas 与 OIDC 均正常
- 全新账号生产验收：通过（用户于 2026-08-26 确认）
- 已有 v2 存档账号生产验收：通过（用户于 2026-08-26 确认）
- Rewritten Tag：`life-loop-v1`，tag object `6c226896d256f843628bc5cb3269666aba22aec7`，指向 `cc4b6ff5fad37df0ebde500de1549b795f4b9087`
- 当前生产 main：`83410ca5ba5414f10d0d95ed6ea5cd57cc3fa95f`，已包含后续 Town Population MVP

> 本 checkpoint 只表示第一个生活日循环达到可发布状态，不代表 Town 美术、Expedition、灵兽、战斗、肉鸽、塔防或东方志怪内容完成。

## Frozen scope

- GameState / StoredGame v3：`day`、`gold`、按天作物阶段。
- 初始 Day 1 / 100g，无赠送种子。
- Cottage `cottage-bed` 睡觉与一次原子日结。
- 萝卜需要三次“当日浇水 + 睡觉”成熟。
- Seed Keeper：20g 买 1 粒萝卜种子，35g 卖 1 个萝卜。
- Vue ShopPanel 打开期间锁定世界输入。
- GameSession → SaveRepository → IndexedDB 边界不变。

## Source commits

- Life Loop implementation（rewritten main）：`1d1ca3e2`
- Local manual acceptance（rewritten main）：`77144831`
- Release safety / v2 backup（rewritten main）：`55360a6c`；原 feature/main SHA `e797a4d7` / `7414986a` 不再由公开 refs 保留

## v2 migration safety


```text
existing owner:slot v2
        ↓ decode + GameSession reconcile
validated v3 save request
        ↓ one IndexedDB readwrite transaction
owner:slot:backup:v2  ← exact original v2, write once
owner:slot            ← validated v3
```

- 任一步失败，transaction 不提交，主记录仍为 v2。
- 已有 backup 不覆盖；v3 普通保存与全新账号不创建 backup。
- backup 不作为可继续游戏 slot，不进入 GameState/Vue。
- 显式删除 owner/slot 时同时删除主记录与 backup。

## Verification

- 自动与本地证据在发布前全部重新生成。
- 生产双场景清单见 [production-acceptance.md](production-acceptance.md)。
- 截图与原始 IndexedDB payload 不进入 Git，不记录 subject/token。

## Next gate

本 checkpoint、Town Gate A/B/C 与 Town Population MVP 均已完成。用户最新决定是继续完善 Stardew/Town，当前下一产品门为 `Town Functionality MVP` 的独立规划；Expedition、战斗与灵兽继续暂停，不得直接扩建系统。
