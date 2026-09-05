# NPC 动态避让 MVP：技术设计

## Ownership and flow

```text
WorldScene.update
  -> GameSession.tick(now, paused)
  -> NpcMotionRuntime.advance(elapsed, state.player)
  -> stable entityId ordered substeps
     -> propose walking position
     -> player + latest NPC footprints
        |- clear: accept position
        `- overlap: wait -> 600ms -> replan with temporary avoided tiles
  -> existing NpcRuntimeSpawn projection
     |- render/click/hit
     `- player collision
```

动态阻挡只影响 walking。idle 活动计时和跨区域 transfer 保持既有逻辑；schedule transition 与 patrol 共用同一 WalkingNpcMotion，因此自动获得同一避让行为。

## Shared feet contract

`domain/world/regions.ts` 集中导出玩家与 NPC 脚底半宽/半高以及 AABB overlap helper：

```typescript
const PLAYER_FEET_HALF_WIDTH = 5;
const PLAYER_FEET_HALF_HEIGHT = 4;
const NPC_FEET_HALF_WIDTH = 5;
const NPC_FEET_HALF_HEIGHT = 3;

function worldFeetOverlap(...): boolean;
```

WorldCatalog 的玩家→NPC 碰撞和 NpcMotionRuntime 的 NPC→玩家/NPC 避让共用该合同，避免两个系统的脚底尺寸漂移。

## Bounded walking and ordering

- `NpcMotionRuntime.advance` 接受可选 `NpcAvoidancePosition { regionId, x, y }`；生产始终由 GameSession 传入 `state.player`，纯 runtime 测试可显式省略玩家。
- 既有最大 1000ms delta 再拆成至多 50ms 的 avoidance substeps；48px/s 时每步最多 2.4px，避免长帧从占位体一侧跳到另一侧。
- 每个 substep 按 stable `entityId` 排序。已处理 NPC 使用本步新位置，未处理 NPC 使用本步初始位置；两个 NPC 竞争同一位置时固定顺序者先行，另一人等待。
- 所有同区域 NPC 都是动态障碍，包括 shop NPC；这只约束 NPC 移动，不改变玩家对已发布 shop keeper 的 legacy 碰撞规则。

## Waiting and replanning

WalkingNpcMotion 新增 `blockedMs`：

- proposed position 与任一动态脚底重叠或进入同一 Collision tile → 丢弃该步位移、累加 blockedMs，并把 projection motion 标为 `waiting`；tile reservation 让重规划从障碍 tile 外开始，避免 actor 尚未脚底重叠却已共享寻路格。
- blockedMs < 600 → 保持原路径等待。
- blockedMs >= 600 → 使用当前位置、原 target 和全部同区动态点重新调用 `findNpcPath`；无论成功失败都把计时归零，避免逐帧 A*。
- 新路线存在 → 下一 substep 开始沿新 waypoints 行走。
- 无路线 → 保留原 target/waypoints，继续等待；障碍移开后原路径可立即恢复。
- 玩家位于目标 tile 时该 tile 也必须避让，禁止把 destination 特判为可穿透。

`NpcMotionKind` 增加 `waiting`，仅用于表现停止步幅；interaction/activity/identity 均不变化。

## Pathfinder extension

`findNpcPath(collision, start, end, avoidedPoints=[])` 把每个动态 world point 转为 EasyStar `avoidAdditionalPoint`。avoidance 只存在于本次同步查询，不修改 `CollisionGrid`，不缓存玩家位置，也不进入地图。

## Compatibility and rollback

- StoredGame v4、GameState、IndexedDB、Tiled、图片、服务端和依赖均不变化。
- 玩家长期堵住单格通道时 NPC 可长期等待，这是明确产品规则，不使用穿人或传送解锁。
- 回滚只涉及 feet helper、pathfinder 可选参数、NpcMotionRuntime avoidance state、GameSession tick 接线和窄合同。
