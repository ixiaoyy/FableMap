# NPC 日程移动 MVP

## Goal

让现有八名 Town NPC 在日程时段切换时呈现可见、可碰撞的移动：同一区域沿 Collision 网格走向新 anchor，跨区域完成短暂离场/到场淡入淡出，同时继续由本地 GameSession 统一拥有玩法位置，不把瞬时坐标写入存档。

## Background

- 当前 `minuteOfDay` 在 `06:00–24:00` 内按 10 分钟推进，NPC 由 morning/day/evening/night 四段 Tiled anchor 投影。
- `WorldScene`、玩家移动碰撞和 `ShopSystem` 当前都按 `minuteOfDay` 直接读取终点 anchor，因此时段切换会瞬移。
- `docs/TOWN_ROADMAP.md` 的 T1 首项要求同区域短路径走动，第二项要求跨区域进出场提示。
- 用户已确认本轮只做移动 MVP；动态避让、环境动作、工作日/休息日和特殊日程继续留在路线图。

## Requirements

### Runtime ownership

- GameSession 下的 domain runtime 是 NPC 瞬时位置、移动阶段和透明度的唯一 owner。
- WorldScene 渲染/点击/击打、玩家碰撞和 ShopSystem 必须读取同一 runtime projection，不得各自按时钟重新计算位置。
- NPC runtime 只在会话内存在；`GameState`、StoredGame v4、IndexedDB schema 和保存版本保持不变。
- 新游戏、继续游戏和睡觉日结必须把 runtime 重置到当前日程 anchor，不回放离线期间的路线。

### Movement and transfer

- 同一区域 anchor 变化时，使用固定版本的 EasyStar.js 在该区域 Tiled Collision 网格上计算四方向短路径。
- NPC 以固定像素速度沿路径连续移动；路径终点必须精确落在 Tiled anchor，而不是永久停在 tile 中心。
- 无可用路径时使用同区域淡出/淡入兜底，不让 NPC 卡在中间或改变日程合同。
- 跨区域不进行连续寻路：先在旧区域淡出，再在新区域淡入。
- 对话、商店、睡觉确认、动作和区域过渡暂停游戏时钟时，NPC runtime 同步暂停，恢复后不补算后台时间。

### Interaction and collision

- 玩家碰撞使用 NPC 当前脚下位置；NPC 在离场/到场切换点只能属于一个区域。
- NPC 移动或淡入淡出期间可保持普通对话身份，但不得在走向柜台或离开柜台途中开启 ShopPanel。
- NPC 到达营业 anchor 后恢复 schedule 定义的 `shop` interaction；其他终点保持 `dialogue`。
- 本轮路径只避让静态 Collision，不实现玩家/NPC 动态重规划；现有 anchor 分离验证继续防止终点重叠。

### Dependency and boundaries

- 锁定 npm 实际发布的 `easystarjs@0.4.4`，在 domain 中只保留 Collision grid → world points 的薄适配，并登记开源采用记录。
- 不新增图片、地图二进制、数据库连接、migration、服务端逻辑、天气、好感或新 NPC。
- 每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] 同一区域 NPC 在时段切换后沿可通行路径连续走到目标 anchor，画面、点击、击打和玩家碰撞使用同一实时坐标。
- [x] 跨区域 NPC 在旧区域淡出、在新区域淡入，任一时刻只投影到一个区域。
- [x] 无路径时安全执行淡出/淡入兜底；暂停期间位置不推进，恢复后无时间跳跃。
- [x] 华强移动期间不能交易，到达 day 柜台后可以交易，离柜移动开始后立即关闭交易资格。
- [x] 新建、续玩、睡觉及保存恢复不持久化或回放 NPC 中途位置；StoredGame 继续为 v4。
- [x] `easystarjs@0.4.4` 被精确锁定并写入 `OPEN_SOURCE_ADOPTION.md`。
- [x] 一个针对性 Town runtime 合同检查、类型检查和客户端构建通过；不运行数据库、身份或全量 E2E。

## Out of Scope

- 玩家和 NPC 动态避让、路径重规划、拥堵解算或跨地图连续寻路。
- NPC 行走序列帧、门动画、环境动作、工作日/休息日和特殊天气/节日日程。
- 好感、送礼、卧室权限、关系事件或新增存档字段。
