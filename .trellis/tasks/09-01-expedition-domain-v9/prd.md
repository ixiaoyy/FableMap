# 远征 Domain v9

> **已否决（2026-09-04）**：本子任务随镜门远征方向一并淘汰，只保留历史证据；不得启动或把 Cargo、敌人、捕获等设计迁入新主线。

## Goal

实现 v8→v9 家园灵兽进度、runtime ExpeditionRun、Cargo 原子提交/丢弃与 closed enemy/event/capture 规则。

## Requirements

- StoredGame/GameState 从 v8 升为 v9，新增 `expeditionHomeProgress.companionIds`；v8 迁移为空列表，未知/重复 companion ID 明确失败。
- `ExpeditionRunState`、HP、Cargo、敌人、事件选择、候选灵兽全部 runtime-only，不进入 StoredGame/IndexedDB。
- Start 前保存 Lakeshore 镜门前 home checkpoint；failure、abandon、刷新保持 Home Inventory/Gold/关系/委托字节等价。
- Cargo 使用 closed expedition item IDs；loot 只写 run，成功 extract 才一次性合并 Home Inventory。
- 容量不足返回 `cargo-capacity` 且零 mutation；玩家丢弃 Cargo 后重试，禁止部分提交或覆盖物品。
- 首只灵兽仅在 run 内满足低血量后必定 capture；成功 extract 后一次写入 durable companion ID，失败/刷新不保留。
- 一个 closed 三选一 event reducer 只改当局规则/收益，不保存、不建设 DSL。
- 两敌人只定义 closed kind/HP/damage/cue 合同；移动、动画和地图表现留给 client 子任务。
- 不新增数据库、服务端、ECS、随机地图、装备、技能树、捕获概率或宠物养成。

## Acceptance Criteria

- [ ] v1–v8 均能确定性迁移到 v9；current v9 round-trip 幂等，未来/损坏/未知 companion 明确失败。
- [ ] start/failure/abandon/refresh 边界不改变 durable home state。
- [ ] Cargo loot、discard、容量不足和成功 extract 遵守全有或全无，重复 extract 不重复结算。
- [ ] capture 只有低血量合法目标成功，且只有撤离后 durable；失败 run 不保留。
- [ ] 三 choice 与两 enemy kind 均为 closed contract，不出现通用框架。
- [ ] `test:life-loop`、`test:town-population`、typecheck 通过；无数据库或媒体改动。

## Out of Scope

- Phaser scene、TMJ、敌人寻路/动画/碰撞、远征 HUD 与镜门入口。
- 家园灵兽表现、音频、素材发布和真人 3～5 局验收。
