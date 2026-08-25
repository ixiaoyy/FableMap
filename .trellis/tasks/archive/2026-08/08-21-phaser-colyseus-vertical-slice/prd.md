# Phaser Colyseus 纵向切片迁移

## Supersession

用户于 2026-08-24 将产品主线改为单人 Stardew Core。本任务不再要求双账号、断网重连或生产部署验收；完成边界收缩为：现有五个实现 commit 保持可构建，通过一次不含 deploy job 的 CI/Docker image build，然后以 `phaser-colyseus-checkpoint-2026-08-24` 封存。后续从该 checkpoint 新建单人分支，Colyseus 代码只作为未来多人参考。

## Goal

在保留镜像岛现有 Keycloak、论坛 SSO、PostgreSQL/Prisma 合同、CDN 和部署体系的前提下，以 Phaser 4.2.1 + Vue 3 + TypeScript + Vite 重建浏览器客户端，以 Colyseus 建立服务端权威共享世界，并交付“两人在线、采集、背包、制作、一种作物、刷新与断线重连恢复”的首个可玩纵向切片。

## Background

- 可恢复 RPGJS 检查点已固定为分支 `codex/welcome-npc-house-building`、commit `e6646bcd31c324627445f06b6be1108244c67ccb`、tag `rpgjs-checkpoint-2026-08-21`；新主线从 `origin/main@44d69cb4` 创建，检查点不是其祖先。
- RPGJS 线上版本已经打通登录、WebSocket、地图流、PostgreSQL 和部署，但可见内容仍是 32×32 技术样板；不继续双线开发。
- 开源迁移采用“干净官方骨架 + 规则级移植”，固定参考 Phaser 官方 Vue TS 模板 `2fe6c3e...`、Cabacos `79e423d...`、Rick Survival `ea9738c...`。
- Cabacos 用于物品、背包、Hotbar、种田、输入和 Tiled 模式；Rick Survival 仅在首个纵向切片完成后参考战斗、对象池、掉落和波次，不进入本任务首批实现。
- 当前九表 Prisma 基线已经包含玩家、背包、世界格、区块和存档。本阶段不新增 migration、不连接数据库；持久化先经过接口和进程内实现，数据库接入另行评审。

## Requirements

### 技术栈与工程边界

- 客户端固定 `phaser@4.2.1`，纵向切片完成前不升级；使用 Vue 3、TypeScript 和 Vite，直接依赖锁定确切版本。
- 服务端固定采用 Colyseus 权威 Room；客户端 SDK、Schema 和 server package 使用互相兼容的固定版本，不引用漂移 tag/branch。
- `apps/mirror-island/` 保持唯一应用目录，首阶段使用一个根 npm package，代码边界为 `client/`、`server/`、`shared/`，不预先引入 monorepo/workspace 编排。
- `shared/` 只拥有消息、Schema、物品、配方、常量和纯规则；不得导入 Vue、Phaser、Prisma 或浏览器 API。
- Phaser 只拥有地图、角色/资源表现、输入采集、插值和特效；Vue 只拥有 Hotbar、背包、制作和状态 UI；两者不各自复制权威玩法状态。

### 权威多人合同

- 客户端只发送意图：移动轴、交互目标、使用槽位、制作配方和农田动作；不得发送最终位置、背包数量、作物阶段或资源掉落结果。
- Colyseus Room 按固定 server tick 验证并计算位置、距离、碰撞、资源状态、背包、制作和农田转换，再通过 state patch 同步客户端。
- 移动第一阶段只做 `Client Input -> Server Tick -> State Sync -> Client Interpolation`；不做 rollback、客户端预测、ECS 或分布式房间。
- 两名玩家同时采集同一棵树时，服务端必须先原子性把资源节点转为不可采集，再给唯一成功者结算；同一资源不得重复掉落。
- 断线后玩家实体从其他客户端的在线状态中移除；允许期内重连或重新加入时，根据 account ID 恢复进程内保存的位置、背包和农田状态。

### 身份、实时状态与持久化

- Keycloak 继续负责浏览器会话；访问令牌只保存在 `keycloak-js` 内存，通过同源 TLS 的 Colyseus 加入流程交给 `onAuth`，不进入 URL、localStorage、sessionStorage、Cookie 或日志。
- 复用现有 issuer/audience/RS256/subject 验证规则，把 RPGJS socket adapter 替换为 Colyseus auth adapter；失败不降级游客。
- Colyseus memory 是实时状态来源；不得因移动或每个 tick 写 PostgreSQL。
- 定义独立 persistence interface，支持加载玩家、保存玩家 checkpoint 和保存世界 checkpoint；本阶段使用 in-memory 实现，不连接数据库。
- 刷新、关页和短暂断线恢复以同一服务进程内 checkpoint 为验收边界；服务进程重启后的数据库恢复不属于本阶段。
- 如果现有 Schema 不足，不得把未评审结构偷偷塞进 JSONB 或创建 migration；停止在接口边界并单独提交结构评审。

### 开源迁移合同

- 迁移以规则为单位，不复制 Cabacos 目录：`ItemDefinition -> shared`、`InventorySystem -> server`、`Inventory/Hotbar -> Vue projection`、`Farming transitions -> shared/server`、`Tiled/player/input -> client rendering`。
- Cabacos 的 `SaveService`、客户端权威状态、Phaser Canvas UI、现成地图和仓库素材禁止直接采用。
- Cabacos 仓库声明 MIT 但 LICENSE copyright holder 与项目作者不一致；获得澄清前不大段逐行复制，只做固定提交可追溯的行为级清洁移植。
- Rick Survival 的 Snowpack/Electron、Rick and Morty 名称、素材、音乐和重复武器/怪物薄类禁止采用。
- 第三方像素素材仍从作者官方固定来源进入 `game/media/v1` manifest；不从候选游戏仓库复制图片二进制。

### 首个纵向切片

- 两个不同 Keycloak subject 能加入同一 WorldRoom、互相可见并看到服务端权威移动。
- 地图至少包含一棵可采集树和一块可耕种区域；第一阶段允许简单审核地图，不以美术精修为门槛。
- 合法采集树木后服务端背包获得木材，Vue Hotbar 收到 projection 更新；客户端不能伪造木材。
- 玩家能用木材制作一把斧头；配方和消耗由服务端验证并一次性结算。
- 玩家能完成一格农田的锄地、播种、浇水、生长和收获；状态转换由服务端执行。
- 刷新页面后恢复进程内位置、背包和农田；B 关页/断线时 A 看见 B 离线，B 重进后恢复同一状态。

### 验证范围

- 自动检查只保留 TypeScript、模块导入、配置解析和必要的 client/server build；不建立大规模 unit、integration、E2E 或数据库测试矩阵。
- 权威并发、双账号、刷新、断线、重连、视觉和操作闭环使用人工浏览器验收。
- 不主动连接任何数据库；数据库检查或接入必须获得新的明确授权。

## Acceptance Criteria

- [ ] 依赖锁定包含 `phaser@4.2.1`，客户端、服务端和 shared 边界可独立辨认且无 RPGJS 活跃入口。
- [ ] `shared` 定义类型化消息、权威状态、物品和配方；客户端不能提交最终位置、库存数量或作物状态。
- [ ] 两个不同账号进入同一 room 后互相可见，移动由 server tick 结算并由客户端插值显示。
- [ ] 两人同时砍同一棵树只能成功结算一次，树状态和唯一一份掉落对所有客户端一致。
- [ ] 木材进入服务端背包后 Vue Hotbar 更新；制作斧头由服务端验证材料并原子扣除/添加。
- [ ] 一格农田能完成锄地、播种、浇水、生长、收获，所有转换由服务端权威执行。
- [ ] 页面刷新后位置、背包和农田在同一服务进程内恢复。
- [ ] B 断网或关页后 A 看见 B 离线；B 重进后恢复位置、背包和农田状态。
- [ ] Keycloak/论坛 SSO、token 不落盘合同、CDN 和部署边界不被破坏。
- [ ] 未新增 migration、未连接数据库、未把临时结构塞入未评审 JSONB。
- [ ] 最小 TypeScript、客户端构建和服务端构建通过；玩法正确性由人工双账号反馈验收。

## Out of Scope

- 枪械、怪物、波次、伤害、掉落、NPC、招募、NPC 工作、科技树、基地权限和入侵。
- 角色创建、美术精修、完整 512×512 世界、程序化地图、地牢、Boss 和第二星球。
- 客户端预测、rollback、分布式 room、ECS、排行榜、好友、交易和市场。
- PostgreSQL 实际 checkpoint、服务进程重启恢复、新表/字段/migration。
- 整仓 Fork Cabacos/Rick Survival 或直接分发其未审核素材。
