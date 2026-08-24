# Stardew Core 单人本地规则迁移

## Goal

将已封存的 Phaser/Colyseus 采集、背包、制作和种田规则迁为本地 GameSession + IndexedDB 单人架构，保留身份与后端基础设施但移出实时游戏循环。

## Background

- 多人技术切片已在远端分支 `codex/phaser-colyseus-main` 封存，build-only CI run `32682628879` 通过，tag `phaser-colyseus-checkpoint-2026-08-24` 精确指向 `e708e468...`；没有部署生产。
- 当前分支从该 checkpoint 加 Trellis 归档元数据创建，现成 Item/Recipe、Inventory、Gathering、Crafting、Farming、Hotbar 和 Phaser 表现具有迁移价值。
- 产品主线改为单人 Stardew Core。Colyseus 多人、双账号、断网重连和共享资源并发不再是近期交付门槛。
- Keycloak、论坛 SSO、Prisma、PostgreSQL、Docker/Nginx/CDN 继续保留；后端未来负责登录、云存档、成就和排行榜，但不参与角色移动、采集、制作或农田实时循环。
- 首张正式地图固定为“玩家农场向右连接小镇，北侧预留山地/矿区，南侧连接河流/湖泊”；本任务不实现地图，只保证单人规则架构能承载下一阶段。

## Requirements

### 单人运行时边界

- 活跃游戏调用链固定为 `Phaser/Vue -> GameSession -> pure domain systems -> SaveRepository`；不得通过 Colyseus、WebSocket、matchmaking 或服务端 tick 执行玩法。
- `GameSession` 是当前本地存档的唯一状态 owner，负责新游戏、继续游戏、命令执行、状态 projection、保存调度和恢复。
- Inventory、Gathering、Crafting、Farming 迁为纯 TypeScript domain logic；不得依赖 Phaser、Vue、Colyseus Schema、Prisma、IndexedDB 或浏览器全局。
- Phaser 只负责输入和世界表现；Vue 只负责新游戏/继续游戏、Hotbar、制作与反馈；二者通过 GameSession 的类型化命令和只读 snapshot 协作。
- 移除客户端对 `@colyseus/sdk` 和 state patch 的 gameplay 依赖；单人玩法在不启动 Colyseus/game server 的情况下可完整运行。

### 本地保存

- 定义 `SaveRepository` 接口，至少支持 `has/load/save/delete` 一个本地槽位；domain 不知道 IndexedDB 实现。
- 浏览器 adapter 使用原生 IndexedDB Promise/事务薄层，数据库名与 object store 固定并带版本号；不采用 localStorage 保存玩法状态。
- 保存内容包含 schema version、更新时间、玩家位置、背包、资源节点和农田状态；读取必须验证结构并拒绝损坏/未来版本，不能静默复活旧字段。
- Keycloak token、论坛 ticket、密码和 service secret 永不进入 IndexedDB。存档 owner 使用调用方提供的稳定非 token key；多账号不能误读同一槽。
- 采集、制作、农田转换和显式退出后保存；高频移动只更新内存，通过有界 debounce 保存，不逐帧写 IndexedDB。

### 现有规则迁移

- 保留 24 格背包、前 8 格 Hotbar、跨槽堆叠、原子消耗和木斧配方。
- 保留树木采集为 `树 -> +3 木材`，但单人状态不再保留 multiplayer revision/并发协议字段，除非它们仍用于本地幂等。
- 保留一格农田 `untilled -> tilled -> growing -> mature -> tilled` 状态机和锄头、种子、浇水壶、收获物。
- 现有 Colyseus `WorldRoom`、网络 intent decoder、Schema projection 和 server persistence 只作为 checkpoint 参考；迁移完成后不在单人 active graph 中。

### 第一批可玩闭环

- 页面提供最小“新游戏”和“继续游戏”入口；没有有效存档时继续按钮不可用。
- 新游戏创建本地 GameSession 和初始背包，玩家可完成砍树、获得木材、制作木斧、锄地、播种、浇水、生长和收获。
- 退出或刷新后，“继续游戏”从 IndexedDB 恢复相同的背包、树木和农田状态。
- 第一批允许继续使用代码绘制的玩家、树和农田；Tiled、正式 Sprite、农场/小镇地图属于下一批。

### 后续固定里程碑

- 第二批：Tiled、玩家 Sprite/动画、碰撞、树石水面、建筑入口、镜头和“玩家农场 + 小镇”两个区域。
- 第三批：时间、昼夜、睡觉、按天生长、金币、种子商店、基础对话和 3 个 NPC。
- 《聊斋》是未来书库中的一本书；书屋、异闻和故事世界不进入 Stardew Core 当前阶段。

### 验证范围

- 默认只运行 TypeScript、client build 和必要模块导入/配置检查；不新增大规模自动测试矩阵。
- IndexedDB 新游戏/保存/继续、采集制作种田闭环和刷新恢复由人工浏览器验收。
- 不连接任何数据库、不新增 migration、不部署生产。

## Acceptance Criteria

- [x] 活跃 client graph 不导入 `@colyseus/sdk`，本地玩法不需要 game server、WebSocket 或 matchmaking。
- [x] GameSession 通过类型化命令唯一修改纯 TypeScript domain state，并发布只读 snapshot 给 Phaser/Vue。
- [x] Inventory/Gathering/Crafting/Farming 不导入 Phaser、Vue、Colyseus、Prisma 或浏览器 API。
- [x] 原生 IndexedDB SaveRepository 使用版本化 store，保存内容不含 token、ticket、密码或 secret。
- [x] 新游戏能完成“砍树 -> 木材 -> 木斧 -> 锄地 -> 播种 -> 浇水 -> 成熟 -> 收获”。
- [ ] 有效存档时继续游戏可用；刷新后恢复背包、树木和农田，损坏/未来版本存档得到明确失败而不回退。
- [x] Keycloak/论坛 SSO 与 Prisma/PostgreSQL 代码保留，但不进入本地 gameplay mutation 调用链。
- [x] 无新 migration、无数据库连接、无生产部署。
- [x] 最小 TypeScript 和 client build 通过；server 仅在身份/SSO adapter 改动时做必要构建检查。

## Out of Scope

- Tiled 地图、农场、小镇、山地/矿区、河流/湖泊和正式美术。
- 时间、昼夜、睡觉、Day+1、金币、商店、NPC、对话和日程。
- Colyseus 多人、好友参观、双人模式、联机副本和完整断线重连验收。
- 枪械、科技树、怪物战斗、NPC 招募、复杂剧情、大地图和云存档。
- 书屋异闻、《乔女》《画皮》《聂小倩》或任何《聊斋》故事内容。
