# NPC 早晚生活动作 v1：技术设计

## Activity Registry

- 将 `npc-activities.ts` 从 day-only 数组扩为 identity → phase → definition 的单一 registry。
- 每个 definition 保存 `kind` 与 `regionId`；只有现有 day patrol 继续拥有 `routeSpawnIds`。
- `npcActivityAt(catalog, npcId, minute)` 复用 `schedulePhaseAt()` 查当前 phase，不复制时段边界。

```typescript
type NpcActivitySchedule = Readonly<Record<NpcSchedulePhase, NpcActivityDefinition>>;
const NPC_ACTIVITY_SCHEDULES: Readonly<Record<string, NpcActivitySchedule>>;
```

## Runtime

- `NpcMotionRuntime.createActivityState()` 保持唯一启动点；schedule transition 的 walking/transfer 阶段 activity 为 null，抵达后使用 arrivalActivity。
- stationary activities 使用空 route，只推进现有 400ms 两相 cadence；day patrol 保留 2400ms dwell 和既有路线。
- 家庭共同动作不增加 pair/group owner；同一 phase transition 同时 reset 两人的 `cycleElapsedMs=0`，自然获得同步节奏。

## Presentation

- 扩展 `NpcActivityKind` 与 `npcActivityVisual()`，新增可复用的 `stock`、`close`、`prepare`、`tea`、`record`、`sew`、`rope-check`。
- 标记采用“备、收、茶、记、缝、绳”等克制单字；身体只做 1px 位移/轻角度变化，不新增图片或 Phaser gameplay tween。

## Validation

- `validateNpcActivities()` 对 morning/day/evening/night 四个代表分钟分别验证：八个 identity 完整、activity region 等于该 phase schedule region。
- 只有 route activity 校验首点等于 schedule anchor、点位未阻挡和闭环可达；stationary activity 不要求额外 Tiled point。
- 未知 identity 返回 null；registry 多余/缺失 identity 或 phase 启动失败。

## Compatibility

- GameState/StoredGame/IndexedDB 零变化；刷新、继续和睡觉仍从当前 minute 的 schedule anchor 重建 transient activity。
- Dialogue、friendship、ShopSystem 和 click distance 继续消费同一 `NpcRuntimeSpawn`，不复制活动状态。
