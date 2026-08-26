# Life Loop v1 Checkpoint

## Status

- 名称：`Life Loop v1 Checkpoint`
- 本地完整真人验收：通过（2026-08-25）
- 生产 main commit：`7414986a71508f438ecda1c94da29562327a0f06`
- 最终生产验收基线：`37c51953f426febbbe49506a30a6527ecabfaf91`（包含已通过的 Town Gate C）
- GitHub Actions run：`32827316974`，成功
- 公网健康：通过；首页、Life Loop/v2 backup bundle、Cottage bed、VectoRaith atlas 与 OIDC 均正常
- 全新账号生产验收：通过（用户于 2026-08-26 确认）
- 已有 v2 存档账号生产验收：通过（用户于 2026-08-26 确认）
- Tag：`life-loop-v1`，指向包含本验收记录的最终已验证 main checkpoint

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

- Life Loop implementation：`673cc6d2`
- Local manual acceptance：`06a0668a`
- Release safety / v2 backup：source `e797a4d7`，main `7414986a`

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

本 checkpoint 与 tag 完成后，只允许创建 Expedition Prototype 的 PRD/design。原型边界以 `docs/PRODUCT_BRIEF.md` 的固定约束为准，不得直接扩建系统。
