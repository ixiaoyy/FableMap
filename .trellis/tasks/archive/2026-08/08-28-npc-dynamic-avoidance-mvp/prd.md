# NPC 动态避让 MVP

## Goal

阻止日程移动和环境巡逻中的 NPC 穿过玩家或其他居民，并让短暂阻挡后的恢复行为稳定可理解，同时继续由 GameSession 下的 `NpcMotionRuntime` 唯一拥有位置和路线。

## Background

- 玩家移动已经使用当前 `NpcRuntimeSpawn` 脚底碰撞，因此玩家不能主动穿过 dialogue NPC。
- NPC walking 当前只消费静态 Collision 路线，不检查 `state.player` 或其他 NPC 的实时位置，会从玩家/居民身上穿过。
- EasyStar adapter 当前只接受静态 Collision grid；GameSession tick 能提供玩家当前 region/x/y，runtime 已拥有全部 NPC projection。
- 浩南与祥子已有持续巡逻，四个日程时段切换也会同时移动多名居民，动态占位不应进入 Tiled、GameState 或 StoredGame。

## Confirmed Requirements

- GameSession/runtime 是动态避让唯一 owner；Phaser 不暂停、推开或重新规划 NPC。
- NPC 每次 walking 推进前检查玩家和同区域其他 NPC 的脚底占位。
- 发现阻挡立即停止；同一阻挡累计 600ms 后尝试把动态占位 tile 加入 EasyStar 临时避让点并重新规划。
- 无旁路时持续等待并每 600ms 限频重试；目标清空后沿原路线或新路线恢复，永不穿人兜底。
- 不允许 NPC 推动玩家、瞬移穿越、写入存档坐标或修改静态 Collision。
- 阻挡与绕行状态只在会话内存在；刷新、继续和睡觉按当前 schedule 重建。
- schedule walking 与浩南/祥子 patrol 使用同一避让机制。
- 玩家移动、NPC 点击/击打、商店与渲染继续消费同一个 runtime projection。
- 不新增依赖、图片、地图、数据库、migration、服务端或 UI 面板。
- 每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] NPC 下一步会碰到玩家时停下，不穿透、不推动玩家；玩家让开后继续。
- [x] 可绕行空间存在时，持续阻挡后 NPC 能重新规划并从旁路通过。
- [x] NPC 之间不会重叠；同一帧竞争位置时使用稳定 identity 顺序得到确定结果。
- [x] 狭窄通道无可用旁路时 NPC 保持等待，目标清空后恢复，不瞬移或丢失 schedule/activity target。
- [x] pause、刷新、继续、睡觉和时段切换保持现有 runtime/persistence 合同。
- [x] 路线图、code-spec、一个窄 Town 合同、类型检查和客户端构建同步完成。

## Out of Scope

- 玩家推挤、NPC 穿人兜底、愤怒气泡、语音、拥堵 UI 或 NavMesh/群体 AI。
- 大规模 crowd steering、速度匹配、队列系统、交通规则或持久 NPC 路线。
- 修改地图 Collision、巡逻点、日程 anchor 或存档版本。
